import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { LogOut, Heart, Share2, Mail, Instagram, Twitter, Facebook, ExternalLink } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import MerchantCard from '../components/MerchantCard';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MyFinds = () => {
  const navigate = useNavigate();
  const [shopperAccount, setShopperAccount] = useState(null);
  const [finds, setFinds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('shopper_token');
    const accountData = localStorage.getItem('shopper_account');
    
    if (!token || !accountData) {
      navigate('/shopper/signin');
      return;
    }

    setShopperAccount(JSON.parse(accountData));
    fetchFinds();
  }, [navigate]);

  const fetchFinds = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('shopper_token');
      
      const response = await axios.get(`${API}/shopper/finds`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      setFinds(response.data);
    } catch (error) {
      console.error('Error fetching finds:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('shopper_token');
        localStorage.removeItem('shopper_account');
        navigate('/shopper/signin');
      } else {
        toast({ title: 'Error', description: 'Failed to load your finds.', variant: 'destructive' });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFind = async (merchantId) => {
    try {
      const token = localStorage.getItem('shopper_token');
      await axios.delete(`${API}/shopper/finds/${merchantId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      setFinds(prev => prev.filter(f => f.id !== merchantId));
      toast({ title: 'Removed', description: 'Removed from your finds.' });
    } catch (error) {
      toast({ title: 'Error', description: 'Failed to remove find.', variant: 'destructive' });
    }
  };

  const handleShareAll = () => {
    const findsText = finds.map(f => `${f.brandName} - ${f.discount}\n${window.location.origin}`).join('\n\n');
    const shareUrl = `mailto:?subject=Check out my PopUp Lane finds!&body=${encodeURIComponent(findsText)}`;
    window.location.href = shareUrl;
  };

  const handleLogout = () => {
    localStorage.removeItem('shopper_token');
    localStorage.removeItem('shopper_account');
    navigate('/');
  };

  const handleVisit = (merchant) => {
    const url = new URL(merchant.externalUrl);
    url.searchParams.append('utm_source', 'popuplane');
    url.searchParams.append('utm_medium', 'finds');
    window.open(url.toString(), '_blank');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#FAFAFA' }}>
        <p className="text-lg" style={{ color: '#666' }}>Loading your finds...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <header className="py-6 px-6 border-b" style={{ backgroundColor: '#111', borderColor: 'rgba(250, 250, 250, 0.1)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FAFAFA' }}>
              My Finds
            </h1>
            <p className="text-sm" style={{ color: '#FAFAFA', opacity: 0.7 }}>{shopperAccount?.name}</p>
          </div>
          <div className="flex gap-3">
            <Button onClick={() => navigate('/')} variant="ghost" style={{ color: '#FAFAFA' }}>
              Browse More
            </Button>
            <Button onClick={handleLogout} variant="ghost" style={{ color: '#FAFAFA' }}>
              <LogOut className="mr-2 h-4 w-4" />Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
              Your Saved Finds
            </h2>
            <p className="text-lg" style={{ color: '#666' }}>
              {finds.length} {finds.length === 1 ? 'find' : 'finds'} saved
            </p>
          </div>
          
          {finds.length > 0 && (
            <Button onClick={handleShareAll} style={{ backgroundColor: '#FF4F81', color: '#FAFAFA' }}>
              <Mail className="mr-2 h-4 w-4" />
              Email All Finds
            </Button>
          )}
        </div>

        {finds.length === 0 ? (
          <Card className="p-12 text-center" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
            <Heart className="h-16 w-16 mx-auto mb-4" style={{ color: '#e5e5e5' }} />
            <h3 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
              No finds yet
            </h3>
            <p className="text-lg mb-6" style={{ color: '#666' }}>
              Start exploring and save your favorite brands!
            </p>
            <Button onClick={() => navigate('/')} style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}>
              Explore PopUp Lane
            </Button>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {finds.map(merchant => (
              <MerchantCard
                key={merchant.id}
                merchant={merchant}
                onVisit={handleVisit}
                onSave={() => handleRemoveFind(merchant.id)}
                isSaved={true}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyFinds;
