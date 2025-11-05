import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../components/ui/dialog';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { toast } from '../hooks/use-toast';
import { LogOut, Plus, TrendingUp, Eye, ShoppingBag, Edit2, Trash2, User, BookOpen, Upload, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [merchantAccount, setMerchantAccount] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showEditDealDialog, setShowEditDealDialog] = useState(false);
  const [showDealSelector, setShowDealSelector] = useState(false);
  const [showDeleteSelector, setShowDeleteSelector] = useState(false);
  const [editingDeal, setEditingDeal] = useState(null);
  const [profileData, setProfileData] = useState({});
  const [dealFormData, setDealFormData] = useState({});
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([]);
  const [removeImageIndices, setRemoveImageIndices] = useState([]);

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (!event.target.closest('.relative')) {
        setShowDealSelector(false);
        setShowDeleteSelector(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('merchant_token');
    const accountData = localStorage.getItem('merchant_account');
    
    if (!token || !accountData) {
      navigate('/merchant/signin');
      return;
    }

    const account = JSON.parse(accountData);
    setMerchantAccount(account);
    setProfileData({
      phone: account.phone || '',
      website: account.website || '',
      description: account.description || '',
      founderStory: account.founderStory || ''
    });
    fetchDeals();
  }, [navigate]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('merchant_token');
      
      const response = await axios.get(`${API}/merchant/deals`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('merchant_token');
        localStorage.removeItem('merchant_account');
        navigate('/merchant/signin');
      } else {
        toast({ title: 'Error', description: 'Failed to load your deals.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleProfileUpdate = async () => {
    try {
      const token = localStorage.getItem('merchant_token');
      await axios.patch(`${API}/merchant/profile`, profileData, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      // Update localStorage
      const updatedAccount = { ...merchantAccount, ...profileData };
      localStorage.setItem('merchant_account', JSON.stringify(updatedAccount));
      setMerchantAccount(updatedAccount);

      toast({ title: 'Success!', description: 'Profile updated successfully.' });
      setShowProfileDialog(false);
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update profile.', variant: 'destructive' });
    }
  };

  const openEditDeal = (deal) => {
    setEditingDeal(deal);
    setDealFormData({
      brandName: deal.brandName,
      tagline: deal.tagline,
      description: deal.description,
      discount: deal.discount,
      category: deal.category,
      externalUrl: deal.externalUrl
    });
    setMainImage(null);
    setMainImagePreview(deal.imageUrl);
    setAdditionalImages([]);
    setAdditionalImagePreviews(deal.additionalImages || []);
    setRemoveImageIndices([]);
    setShowEditDealDialog(true);
  };

  const handleEditDeal = async () => {
    try {
      const token = localStorage.getItem('merchant_token');
      const formData = new FormData();
      
      Object.keys(dealFormData).forEach(key => {
        formData.append(key, dealFormData[key]);
      });
      
      if (mainImage) formData.append('mainImage', mainImage);
      if (removeImageIndices.length > 0) {
        formData.append('removeImageIndices', removeImageIndices.join(','));
      }
      additionalImages.forEach(img => {
        if (img) formData.append('additionalImages', img);
      });

      await axios.put(`${API}/merchant/deals/${editingDeal.id}`, formData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({ title: 'Success!', description: 'Deal updated successfully.' });
      setShowEditDealDialog(false);
      fetchDeals();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to update deal.', variant: 'destructive' });
    }
  };

  const handleDeleteDeal = async (dealId) => {
    if (!window.confirm('Are you sure you want to delete this deal? This action cannot be undone.')) {
      return;
    }

    try {
      const token = localStorage.getItem('merchant_token');
      await axios.delete(`${API}/merchant/deals/${dealId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      toast({ title: 'Success!', description: 'Deal deleted successfully.' });
      fetchDeals();
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to delete deal.', variant: 'destructive' });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('merchant_account');
    navigate('/merchant/signin');
  };

  const stats = {
    total: deals.length,
    approved: deals.filter(d => d.status === 'approved').length,
    pending: deals.filter(d => d.status === 'pending').length,
    rejected: deals.filter(d => d.status === 'rejected').length,
    totalClicks: deals.reduce((sum, d) => sum + (d.clicks || 0), 0),
    totalSaves: deals.reduce((sum, d) => sum + (d.saves || 0), 0)
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-lg" style={{ color: '#666' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      <header className="py-6 px-6 border-b" style={{ backgroundColor: '#111', borderColor: 'rgba(250, 250, 250, 0.1)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FAFAFA' }}>
              {merchantAccount?.businessName}
            </h1>
            <p className="text-sm" style={{ color: '#FAFAFA', opacity: 0.7 }}>{merchantAccount?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => setShowProfileDialog(true)} variant="outline" style={{ borderColor: '#FAFAFA', color: '#FAFAFA' }}>
              <User className="mr-2 h-4 w-4" />
              Profile & Story
            </Button>
            
            {/* Edit Deal Dropdown */}
            {deals.length > 0 && (
              <div className="relative">
                <Button 
                  onClick={() => setShowDealSelector(!showDealSelector)} 
                  variant="outline" 
                  style={{ borderColor: '#FAFAFA', color: '#FAFAFA' }}
                >
                  <Edit2 className="mr-2 h-4 w-4" />
                  Edit Deal
                </Button>
                {showDealSelector && (
                  <div className="absolute top-full mt-2 right-0 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs font-semibold px-2 py-1 text-gray-500">Select a deal to edit:</p>
                      {deals.map(deal => (
                        <button
                          key={deal.id}
                          onClick={() => {
                            openEditDeal(deal);
                            setShowDealSelector(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 rounded flex items-center gap-3"
                        >
                          <img 
                            src={`${BACKEND_URL}${deal.imageUrl}`} 
                            alt={deal.brandName}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{deal.brandName}</p>
                            <p className="text-xs text-gray-500 truncate">{deal.discount}</p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded ${
                            deal.status === 'approved' ? 'bg-green-100 text-green-700' :
                            deal.status === 'pending' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-red-100 text-red-700'
                          }`}>
                            {deal.status}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            {/* Delete Deal Dropdown */}
            {deals.length > 0 && (
              <div className="relative">
                <Button 
                  onClick={() => setShowDeleteSelector(!showDeleteSelector)} 
                  variant="outline" 
                  style={{ borderColor: '#ef4444', color: '#ef4444' }}
                >
                  <Trash2 className="mr-2 h-4 w-4" />
                  Delete Deal
                </Button>
                {showDeleteSelector && (
                  <div className="absolute top-full mt-2 right-0 w-72 bg-white rounded-lg shadow-xl border border-gray-200 z-50 max-h-96 overflow-y-auto">
                    <div className="p-2">
                      <p className="text-xs font-semibold px-2 py-1 text-gray-500">Select a deal to delete:</p>
                      {deals.map(deal => (
                        <button
                          key={deal.id}
                          onClick={() => {
                            handleDeleteDeal(deal.id);
                            setShowDeleteSelector(false);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-red-50 rounded flex items-center gap-3"
                        >
                          <img 
                            src={`${BACKEND_URL}${deal.imageUrl}`} 
                            alt={deal.brandName}
                            className="w-10 h-10 object-cover rounded"
                            onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">{deal.brandName}</p>
                            <p className="text-xs text-gray-500 truncate">{deal.discount}</p>
                          </div>
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <Button onClick={() => navigate('/merchant/submit')} style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}>
              <Plus className="mr-2 h-4 w-4" />
              New Deal
            </Button>
            <Button onClick={handleLogout} variant="ghost" style={{ color: '#FAFAFA' }}>
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <Card className="p-6" style={{ backgroundColor: '#FFF', border: '2px solid #e5e5e5' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Total Deals</p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                  {stats.total}
                </p>
              </div>
              <ShoppingBag className="h-8 w-8" style={{ color: '#3A7BD5' }} />
            </div>
          </Card>
          <Card className="p-6" style={{ backgroundColor: '#FFF', border: '2px solid #e5e5e5' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Approved</p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#22c55e' }}>
                  {stats.approved}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(34, 197, 94, 0.1)' }}>
                <TrendingUp className="h-6 w-6" style={{ color: '#22c55e' }} />
              </div>
            </div>
          </Card>
          <Card className="p-6" style={{ backgroundColor: '#FFF', border: '2px solid #e5e5e5' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Total Clicks</p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#3A7BD5' }}>
                  {stats.totalClicks}
                </p>
              </div>
              <Eye className="h-8 w-8" style={{ color: '#3A7BD5' }} />
            </div>
          </Card>
          <Card className="p-6" style={{ backgroundColor: '#FFF', border: '2px solid #e5e5e5' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Total Saves</p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FF4F81' }}>
                  {stats.totalSaves}
                </p>
              </div>
              <BookOpen className="h-8 w-8" style={{ color: '#FF4F81' }} />
            </div>
          </Card>
        </div>

        <Card className="p-6" style={{ backgroundColor: '#FFF', border: '2px solid #e5e5e5' }}>
          <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
            Your Deals
          </h2>
          {deals.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4" style={{ color: '#e5e5e5' }} />
              <p className="text-lg mb-4" style={{ color: '#666' }}>No deals yet</p>
              <Button onClick={() => navigate('/merchant/submit')} style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}>
                <Plus className="mr-2 h-4 w-4" />
                Submit Your First Deal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {deals.map(deal => (
                <div key={deal.id} className="p-4 rounded-lg border flex items-start gap-4" style={{ borderColor: '#e5e5e5', backgroundColor: '#FAFAFA' }}>
                  <img src={`${BACKEND_URL}${deal.imageUrl}`} alt={deal.brandName} className="w-24 h-24 object-cover rounded-lg" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'} />
                  <div className="flex-1">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                          {deal.brandName}
                        </h3>
                        <p className="text-sm mb-2" style={{ color: '#666' }}>{deal.tagline}</p>
                        <Badge style={{
                          backgroundColor: deal.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                                         deal.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                          color: deal.status === 'approved' ? '#22c55e' :
                                deal.status === 'pending' ? '#eab308' : '#ef4444'
                        }}>
                          {deal.status}
                        </Badge>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => openEditDeal(deal)} title="Edit deal">
                          <Edit2 className="h-4 w-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          onClick={() => handleDeleteDeal(deal.id)}
                          title="Delete deal"
                          style={{ borderColor: '#ef4444', color: '#ef4444' }}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    <p className="text-sm mt-2 line-clamp-2" style={{ color: '#444' }}>{deal.description}</p>
                    <div className="flex gap-4 mt-2 text-xs" style={{ color: '#666' }}>
                      <span>Discount: {deal.discount}</span>
                      <span>Category: {deal.category}</span>
                      <span>{deal.clicks || 0} clicks</span>
                      <span>{deal.saves || 0} saves</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      {/* Profile & Story Dialog */}
      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#FAFAFA' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>Profile & Founder Story</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div>
              <Label>Phone</Label>
              <Input value={profileData.phone} onChange={(e) => setProfileData({...profileData, phone: e.target.value})} placeholder="+1234567890" />
            </div>
            <div>
              <Label>Website</Label>
              <Input value={profileData.website} onChange={(e) => setProfileData({...profileData, website: e.target.value})} placeholder="https://yourwebsite.com" />
            </div>
            <div>
              <Label>Business Description</Label>
              <Textarea value={profileData.description} onChange={(e) => setProfileData({...profileData, description: e.target.value})} rows={3} placeholder="Brief description of your business" />
            </div>
            <div>
              <Label className="flex items-center gap-2"><BookOpen className="h-4 w-4" /> Founder Story (Sticky)</Label>
              <p className="text-xs mb-2" style={{ color: '#666' }}>This story will appear on all your deals. Share your journey, mission, or what makes your brand unique.</p>
              <Textarea value={profileData.founderStory} onChange={(e) => setProfileData({...profileData, founderStory: e.target.value})} rows={6} placeholder="Tell shoppers your story..." />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleProfileUpdate} className="flex-1" style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}>Save Changes</Button>
              <Button onClick={() => setShowProfileDialog(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Edit Deal Dialog */}
      <Dialog open={showEditDealDialog} onOpenChange={setShowEditDealDialog}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" style={{ backgroundColor: '#FAFAFA' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>Edit Deal</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div><Label>Brand Name</Label><Input value={dealFormData.brandName} onChange={(e) => setDealFormData({...dealFormData, brandName: e.target.value})} /></div>
            <div><Label>Tagline</Label><Input value={dealFormData.tagline} onChange={(e) => setDealFormData({...dealFormData, tagline: e.target.value})} /></div>
            <div><Label>Description</Label><Textarea value={dealFormData.description} onChange={(e) => setDealFormData({...dealFormData, description: e.target.value})} rows={4} /></div>
            <div><Label>Discount</Label><Input value={dealFormData.discount} onChange={(e) => setDealFormData({...dealFormData, discount: e.target.value})} placeholder="e.g., 30% OFF" /></div>
            <div><Label>Category</Label><select value={dealFormData.category} onChange={(e) => setDealFormData({...dealFormData, category: e.target.value})} className="w-full p-2 border rounded-lg">{ ['Home', 'Style', 'Tech', 'Beauty', 'Food', 'Accessories', 'Health'].map(cat => <option key={cat} value={cat}>{cat}</option>)}</select></div>
            <div><Label>Store URL</Label><Input value={dealFormData.externalUrl} onChange={(e) => setDealFormData({...dealFormData, externalUrl: e.target.value})} /></div>
            <div>
              <Label>Main Image</Label>
              {mainImagePreview && <img src={`${BACKEND_URL}${mainImagePreview}`} alt="Main" className="w-full h-48 object-cover rounded-lg mb-2" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'} />}
              <Input type="file" accept="image/*" onChange={(e) => { setMainImage(e.target.files[0]); setMainImagePreview(URL.createObjectURL(e.target.files[0])); }} />
            </div>
            <div>
              <Label>Additional Images (max 4)</Label>
              <div className="grid grid-cols-4 gap-2 mb-2">
                {additionalImagePreviews.map((img, i) => (
                  <div key={i} className="relative">
                    <img src={`${BACKEND_URL}${img}`} alt={`Additional ${i}`} className="w-full h-24 object-cover rounded-lg" onError={(e) => e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80'} />
                    <button onClick={() => { setRemoveImageIndices([...removeImageIndices, i]); setAdditionalImagePreviews(additionalImagePreviews.filter((_, idx) => idx !== i)); }} className="absolute top-1 right-1 p-1 rounded-full" style={{ backgroundColor: 'rgba(239, 68, 68, 0.9)' }}><X className="h-3 w-3" style={{ color: '#FFF' }} /></button>
                  </div>
                ))}
              </div>
              <Input type="file" accept="image/*" multiple onChange={(e) => { const files = Array.from(e.target.files); setAdditionalImages([...additionalImages, ...files]); setAdditionalImagePreviews([...additionalImagePreviews, ...files.map(f => URL.createObjectURL(f))]); }} />
            </div>
            <div className="flex gap-3 pt-4">
              <Button onClick={handleEditDeal} className="flex-1" style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}>Save Changes</Button>
              <Button onClick={() => setShowEditDealDialog(false)} variant="outline">Cancel</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MerchantDashboard;