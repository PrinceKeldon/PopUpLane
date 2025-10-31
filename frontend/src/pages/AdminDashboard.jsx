import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from '../hooks/use-toast';
import { merchantsAPI, adminAPI } from '../api/client';
import { LogOut, Check, X, Users, ShoppingBag, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [merchants, setMerchants] = useState([]);
  const [merchantAccounts, setMerchantAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState('deals'); // 'deals' or 'accounts'
  const [activeTab, setActiveTab] = useState('pending');

  useEffect(() => {
    // Check if admin is logged in
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
      return;
    }

    fetchData();
  }, [navigate]);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch dashboard stats
      const statsResponse = await adminAPI.getDashboard();
      setStats(statsResponse.data);

      // Fetch all merchants (need to get all statuses separately and combine)
      const [pendingRes, approvedRes, rejectedRes] = await Promise.all([
        merchantsAPI.getAll({ status: 'pending' }),
        merchantsAPI.getAll({ status: 'approved' }),
        merchantsAPI.getAll({ status: 'rejected' })
      ]);
      
      const allMerchants = [
        ...pendingRes.data,
        ...approvedRes.data,
        ...rejectedRes.data
      ];
      setMerchants(allMerchants);

      // Fetch merchant accounts
      const accountsResponse = await axios.get(`${BACKEND_URL}/api/admin/merchant-accounts`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('admin_token')}`
        }
      });
      setMerchantAccounts(accountsResponse.data);

    } catch (error) {
      console.error('Error fetching data:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('admin_token');
        navigate('/admin/login');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load dashboard data.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (merchantId, newStatus) => {
    try {
      await merchantsAPI.updateStatus(merchantId, newStatus);
      
      toast({
        title: 'Success!',
        description: `Merchant ${newStatus === 'approved' ? 'approved' : 'rejected'} successfully.`,
      });

      // Refresh data
      fetchData();

    } catch (error) {
      console.error('Error updating status:', error);
      toast({
        title: 'Error',
        description: 'Failed to update merchant status.',
        variant: 'destructive'
      });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const filteredMerchants = merchants.filter(m => {
    if (activeTab === 'all') return true;
    return m.status === activeTab;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-lg" style={{ color: '#666' }}>Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <header className="py-6 px-6 border-b" style={{ backgroundColor: '#111', borderColor: 'rgba(250, 250, 250, 0.1)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FAFAFA' }}>
            PopUp Lane Admin
          </h1>
          <Button 
            variant="ghost" 
            onClick={handleLogout}
            style={{ color: '#FAFAFA' }}
          >
            <LogOut className="mr-2 h-4 w-4" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
            <Card className="p-6" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>Total Merchants</p>
                  <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                    {stats.merchants.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 123, 213, 0.1)' }}>
                  <ShoppingBag className="h-6 w-6" style={{ color: '#3A7BD5' }} />
                </div>
              </div>
              <div className="mt-4 flex gap-4 text-xs">
                <span style={{ color: '#666' }}>Approved: {stats.merchants.approved}</span>
                <span style={{ color: '#666' }}>Pending: {stats.merchants.pending}</span>
              </div>
            </Card>

            <Card className="p-6" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>Subscribers</p>
                  <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                    {stats.shoppers.total}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 79, 129, 0.1)' }}>
                  <Users className="h-6 w-6" style={{ color: '#FF4F81' }} />
                </div>
              </div>
            </Card>

            <Card className="p-6" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm mb-1" style={{ color: '#666' }}>Lane Status</p>
                  <p className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                    {stats.laneStatus.replace('_', ' ').toUpperCase()}
                  </p>
                </div>
                <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 123, 213, 0.1)' }}>
                  <TrendingUp className="h-6 w-6" style={{ color: '#3A7BD5' }} />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Merchants Table */}
        <Card className="p-6" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
          <div className="mb-6">
            <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
              Merchant Management
            </h2>
            
            {/* Tabs */}
            <div className="flex gap-2">
              {['pending', 'approved', 'rejected', 'all'].map(tab => (
                <Button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  variant={activeTab === tab ? 'default' : 'outline'}
                  style={{
                    backgroundColor: activeTab === tab ? '#3A7BD5' : 'transparent',
                    color: activeTab === tab ? '#FAFAFA' : '#111',
                    borderColor: '#e5e5e5'
                  }}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {tab !== 'all' && stats && (
                    <span className="ml-2">({stats.merchants[tab] || 0})</span>
                  )}
                </Button>
              ))}
            </div>
          </div>

          {/* Merchants List */}
          <div className="space-y-4">
            {filteredMerchants.length === 0 ? (
              <p className="text-center py-8" style={{ color: '#666' }}>
                No merchants found in this category.
              </p>
            ) : (
              filteredMerchants.map(merchant => (
                <div
                  key={merchant.id}
                  className="p-4 rounded-lg border flex items-start justify-between"
                  style={{ borderColor: '#e5e5e5', backgroundColor: '#FFF' }}
                >
                  <div className="flex gap-4 flex-1">
                    <img
                      src={merchant.imageUrl}
                      alt={merchant.brandName}
                      className="w-24 h-24 object-cover rounded-lg"
                    />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="text-lg font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                          {merchant.brandName}
                        </h3>
                        <Badge
                          style={{
                            backgroundColor: 
                              merchant.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                              merchant.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' :
                              'rgba(239, 68, 68, 0.1)',
                            color:
                              merchant.status === 'approved' ? '#22c55e' :
                              merchant.status === 'pending' ? '#eab308' :
                              '#ef4444'
                          }}
                        >
                          {merchant.status}
                        </Badge>
                      </div>
                      <p className="text-sm mb-1" style={{ color: '#666' }}>{merchant.tagline}</p>
                      <p className="text-sm mb-2" style={{ color: '#666' }}>{merchant.description}</p>
                      <div className="flex gap-4 text-xs" style={{ color: '#999' }}>
                        <span>Category: {merchant.category}</span>
                        <span>Discount: {merchant.discount}</span>
                        <span>Clicks: {merchant.clicks}</span>
                        <span>Saves: {merchant.saves}</span>
                      </div>
                      <p className="text-xs mt-2" style={{ color: '#999' }}>
                        Email: {merchant.email}
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  {merchant.status === 'pending' && (
                    <div className="flex gap-2 ml-4">
                      <Button
                        size="sm"
                        onClick={() => handleStatusUpdate(merchant.id, 'approved')}
                        style={{ backgroundColor: '#22c55e', color: '#FFF' }}
                      >
                        <Check className="h-4 w-4 mr-1" />
                        Approve
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStatusUpdate(merchant.id, 'rejected')}
                        style={{ borderColor: '#ef4444', color: '#ef4444' }}
                      >
                        <X className="h-4 w-4 mr-1" />
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
