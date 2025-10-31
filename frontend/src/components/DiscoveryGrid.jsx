import React, { useState, useMemo, useEffect } from 'react';
import { Tabs, TabsList, TabsTrigger } from './ui/tabs';
import MerchantCard from './MerchantCard';
import { CATEGORIES } from '../data/mock';
import { merchantsAPI } from '../api/client';
import { toast } from '../hooks/use-toast';
import axios from 'axios';

const DiscoveryGrid = () => {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [savedMerchants, setSavedMerchants] = useState([]);
  const [merchants, setMerchants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMerchants();
  }, []);

  const fetchMerchants = async () => {
    try {
      setLoading(true);
      const response = await merchantsAPI.getAll();
      setMerchants(response.data);
    } catch (error) {
      console.error('Error fetching merchants:', error);
      toast({
        title: 'Error',
        description: 'Failed to load merchants. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setLoading(false);
    }
  };

  const filteredMerchants = useMemo(() => {
    if (selectedCategory === 'All') {
      return merchants;
    }
    return merchants.filter(m => m.category === selectedCategory);
  }, [selectedCategory, merchants]);

  const handleVisit = async (merchant) => {
    // Track click
    try {
      await merchantsAPI.trackClick(merchant.id);
    } catch (error) {
      console.error('Failed to track click:', error);
    }

    // Open external URL
    const url = new URL(merchant.externalUrl);
    url.searchParams.append('utm_source', 'popuplane');
    url.searchParams.append('utm_medium', 'lane');
    url.searchParams.append('utm_campaign', 'blackfriday2025');
    window.open(url.toString(), '_blank');
  };

  const handleSave = async (merchant) => {
    // Check if shopper is logged in
    const token = localStorage.getItem('shopper_token');
    if (!token) {
      toast({
        title: 'Sign in Required',
        description: 'Please sign in to save finds',
        variant: 'destructive'
      });
      // Redirect to shopper signin
      window.location.href = '/shopper/signin';
      return;
    }

    const isSaved = savedMerchants.includes(merchant.id);
    
    try {
      if (isSaved) {
        // Remove from saves
        await axios.delete(`${process.env.REACT_APP_BACKEND_URL}/api/shopper/finds/${merchant.id}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSavedMerchants(prev => prev.filter(id => id !== merchant.id));
        toast({ title: 'Removed', description: 'Removed from your finds' });
      } else {
        // Add to saves
        await axios.post(`${process.env.REACT_APP_BACKEND_URL}/api/shopper/finds/${merchant.id}`, {}, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        setSavedMerchants(prev => [...prev, merchant.id]);
        toast({ title: 'Saved!', description: 'Added to your finds' });
      }
    } catch (error) {
      console.error('Failed to save:', error);
      toast({
        title: 'Error',
        description: 'Failed to update saves',
        variant: 'destructive'
      });
    }
  };

  if (loading) {
    return (
      <section className="discovery-grid-section py-20 px-6" style={{ backgroundColor: '#FAFAFA' }}>
        <div className="max-w-7xl mx-auto text-center">
          <p className="text-lg" style={{ color: '#666' }}>Loading amazing brands...</p>
        </div>
      </section>
    );
  }

  return (
    <section className="discovery-grid-section py-20 px-6" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="max-w-7xl mx-auto">
        {/* Headline */}
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
            Step into the Lane – Discover What's Really Popping
          </h2>
          <p className="text-lg max-w-3xl mx-auto" style={{ color: '#666' }}>
            Curated deals from <span className="font-semibold" style={{ color: '#FF4F81' }}>small brands, indie merchants, and creators</span> who don't have big ad budgets – the ones you actually want to find.
          </p>
        </div>

        {/* Category Filters */}
        <div className="mb-8 flex justify-center">
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory} className="w-full max-w-4xl">
            <TabsList className="w-full flex flex-wrap justify-center gap-2" style={{ backgroundColor: 'transparent' }}>
              {CATEGORIES.map(category => (
                <TabsTrigger 
                  key={category} 
                  value={category}
                  className="px-6 py-2 rounded-full transition-all duration-300"
                  style={{
                    backgroundColor: selectedCategory === category ? '#3A7BD5' : '#e5e5e5',
                    color: selectedCategory === category ? '#FAFAFA' : '#111',
                    fontFamily: 'Space Grotesk, sans-serif',
                    fontWeight: '600'
                  }}
                >
                  {category}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>

        {/* Grid */}
        {filteredMerchants.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredMerchants.map(merchant => (
              <MerchantCard 
                key={merchant.id}
                merchant={merchant}
                onVisit={handleVisit}
                onSave={handleSave}
                isSaved={savedMerchants.includes(merchant.id)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-lg" style={{ color: '#666' }}>No merchants found in this category yet.</p>
          </div>
        )}

        {/* Body Copy */}
        <div className="text-center mt-12 space-y-4">
          <p className="text-lg" style={{ color: '#666' }}>
            Every listing is hand-picked – no generic deals, no empty ads.
          </p>
          <p className="text-lg font-semibold" style={{ color: '#3A7BD5' }}>
            Shop with purpose – every click supports a real creator or merchant.
          </p>
        </div>
      </div>
    </section>
  );
};

export default DiscoveryGrid;
