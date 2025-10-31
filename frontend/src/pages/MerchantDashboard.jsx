import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Card } from '../components/ui/card';
import { Badge } from '../components/ui/badge';
import { toast } from '../hooks/use-toast';
import { LogOut, Plus, TrendingUp, Eye, ShoppingBag } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MerchantDashboard = () => {
  const navigate = useNavigate();
  const [merchantAccount, setMerchantAccount] = useState(null);
  const [deals, setDeals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if merchant is logged in
    const token = localStorage.getItem('merchant_token');
    const accountData = localStorage.getItem('merchant_account');
    
    if (!token || !accountData) {
      navigate('/merchant/signin');
      return;
    }

    setMerchantAccount(JSON.parse(accountData));
    fetchDeals();
  }, [navigate]);

  const fetchDeals = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('merchant_token');
      
      const response = await axios.get(`${API}/merchant/deals`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      setDeals(response.data);
    } catch (error) {
      console.error('Error fetching deals:', error);
      if (error.response?.status === 401 || error.response?.status === 403) {
        localStorage.removeItem('merchant_token');
        localStorage.removeItem('merchant_account');
        navigate('/merchant/signin');
      } else {
        toast({
          title: 'Error',
          description: 'Failed to load your deals.',
          variant: 'destructive'
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('merchant_account');
    navigate('/merchant/signin');
  };

  // Calculate stats
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
      {/* Header */}
      <header className="py-6 px-6 border-b" style={{ backgroundColor: '#111', borderColor: 'rgba(250, 250, 250, 0.1)' }}>
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FAFAFA' }}>
              {merchantAccount?.businessName}
            </h1>
            <p className="text-sm" style={{ color: '#FAFAFA', opacity: 0.7 }}>{merchantAccount?.email}</p>
          </div>
          <div className="flex gap-3">
            <Button 
              onClick={() => navigate('/merchant/submit')}
              style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}
            >
              <Plus className="mr-2 h-4 w-4" />
              Submit New Deal
            </Button>
            <Button 
              variant="ghost" 
              onClick={handleLogout}
              style={{ color: '#FAFAFA' }}
            >
              <LogOut className="mr-2 h-4 w-4" />
              Logout
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Welcome Message */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
            Welcome back!
          </h2>
          <p className="text-lg" style={{ color: '#666' }}>
            Manage your deals and track performance
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <Card className="p-6" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Total Deals</p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                  {stats.total}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 123, 213, 0.1)' }}>
                <ShoppingBag className="h-6 w-6" style={{ color: '#3A7BD5' }} />
              </div>
            </div>
            <div className="mt-4 flex gap-4 text-xs">
              <span style={{ color: '#22c55e' }}>Approved: {stats.approved}</span>
              <span style={{ color: '#eab308' }}>Pending: {stats.pending}</span>
              <span style={{ color: '#ef4444' }}>Rejected: {stats.rejected}</span>
            </div>
          </Card>

          <Card className="p-6" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Total Clicks</p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                  {stats.totalClicks}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 123, 213, 0.1)' }}>
                <Eye className="h-6 w-6" style={{ color: '#3A7BD5' }} />
              </div>
            </div>
          </Card>

          <Card className="p-6" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm mb-1" style={{ color: '#666' }}>Total Saves</p>
                <p className="text-3xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                  {stats.totalSaves}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 79, 129, 0.1)' }}>
                <TrendingUp className="h-6 w-6" style={{ color: '#FF4F81' }} />
              </div>
            </div>
          </Card>
        </div>

        {/* Deals List */}
        <Card className="p-6" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
          <h3 className="text-2xl font-bold mb-6" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
            Your Deals
          </h3>

          {deals.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBag className="h-16 w-16 mx-auto mb-4" style={{ color: '#e5e5e5' }} />
              <p className="text-lg mb-4" style={{ color: '#666' }}>
                You haven't submitted any deals yet
              </p>
              <Button 
                onClick={() => navigate('/merchant/submit')}
                style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}
              >
                <Plus className="mr-2 h-4 w-4" />
                Submit Your First Deal
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {deals.map(deal => (
                <div
                  key={deal.id}
                  className="p-4 rounded-lg border"
                  style={{ borderColor: '#e5e5e5', backgroundColor: '#FFF' }}
                >
                  <div className="flex gap-4">
                    <img
                      src={`${BACKEND_URL}${deal.imageUrl}`}
                      alt={deal.brandName}
                      className="w-32 h-32 object-cover rounded-lg"
                      onError={(e) => {
                        e.target.src = deal.imageUrl;
                      }}
                    />
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <h4 className="text-xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                            {deal.brandName}
                          </h4>
                          <p className="text-sm" style={{ color: '#666' }}>{deal.tagline}</p>
                        </div>
                        <Badge
                          style={{
                            backgroundColor: 
                              deal.status === 'approved' ? 'rgba(34, 197, 94, 0.1)' :
                              deal.status === 'pending' ? 'rgba(234, 179, 8, 0.1)' :
                              'rgba(239, 68, 68, 0.1)',
                            color:
                              deal.status === 'approved' ? '#22c55e' :
                              deal.status === 'pending' ? '#eab308' :
                              '#ef4444'
                          }}
                        >
                          {deal.status}
                        </Badge>
                      </div>
                      
                      <p className="text-sm mb-3" style={{ color: '#444' }}>{deal.description}</p>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <span style={{ color: '#666' }}>
                          <strong style={{ color: '#FF4F81' }}>{deal.discount}</strong>
                        </span>
                        <span style={{ color: '#666' }}>Category: {deal.category}</span>
                        <span style={{ color: '#666' }}>Clicks: {deal.clicks || 0}</span>
                        <span style={{ color: '#666' }}>Saves: {deal.saves || 0}</span>
                      </div>

                      {deal.status === 'approved' && (
                        <div className="mt-3">
                          <Badge variant="secondary" style={{ backgroundColor: 'rgba(58, 123, 213, 0.1)', color: '#3A7BD5' }}>
                            Live on PopUp Lane
                          </Badge>
                        </div>
                      )}

                      {deal.status === 'pending' && (
                        <div className="mt-3">
                          <p className="text-sm" style={{ color: '#eab308' }}>
                            ⏳ Awaiting admin approval
                          </p>
                        </div>
                      )}

                      {deal.status === 'rejected' && (
                        <div className="mt-3">
                          <p className="text-sm" style={{ color: '#ef4444' }}>
                            ❌ This deal was not approved. Please contact support or submit a new deal.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default MerchantDashboard;
