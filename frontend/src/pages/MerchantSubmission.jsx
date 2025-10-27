import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { merchantsAPI } from '../api/client';
import { ArrowLeft, Sparkles, Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const MerchantSubmission = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    brandName: '',
    tagline: '',
    description: '',
    discount: '',
    category: 'Home',
    imageUrl: '',
    additionalImages: ['', '', '', ''],
    externalUrl: '',
    email: '',
    story: ''
  });

  const categories = ['Home', 'Style', 'Tech', 'Beauty', 'Food', 'Accessories', 'Health'];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAdditionalImageChange = (index, value) => {
    const newImages = [...formData.additionalImages];
    newImages[index] = value;
    setFormData(prev => ({ ...prev, additionalImages: newImages }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.brandName || !formData.tagline || !formData.description || !formData.discount || !formData.imageUrl || !formData.externalUrl || !formData.email) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Filter out empty additional images
      const cleanedData = {
        ...formData,
        additionalImages: formData.additionalImages.filter(img => img.trim() !== '')
      };

      const response = await merchantsAPI.create(cleanedData);

      toast({
        title: 'Success!',
        description: response.data.message || 'Your submission has been received!',
      });

      // Reset form
      setFormData({
        brandName: '',
        tagline: '',
        description: '',
        discount: '',
        category: 'Home',
        imageUrl: '',
        additionalImages: ['', '', '', ''],
        externalUrl: '',
        email: '',
        story: ''
      });

      // Navigate back to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#FAFAFA' }}>
      {/* Header */}
      <header className="py-6 px-6 border-b" style={{ backgroundColor: '#111', borderColor: 'rgba(250, 250, 250, 0.1)' }}>
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            style={{ color: '#FAFAFA' }}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
          <h1 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FAFAFA' }}>
            PopUp Lane
          </h1>
        </div>
      </header>

      {/* Form */}
      <div className="max-w-4xl mx-auto px-6 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
            List Your Brand on PopUp Lane
          </h2>
          <p className="text-lg" style={{ color: '#666' }}>
            Get discovered by thousands of conscious shoppers this Black Friday
          </p>
        </div>

        <Card className="p-8" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Brand Name */}
            <div>
              <Label htmlFor="brandName" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Brand Name *
              </Label>
              <Input
                id="brandName"
                name="brandName"
                value={formData.brandName}
                onChange={handleChange}
                placeholder="e.g., Luna Ceramics"
                className="mt-2"
                required
              />
            </div>

            {/* Tagline */}
            <div>
              <Label htmlFor="tagline" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Tagline *
              </Label>
              <Input
                id="tagline"
                name="tagline"
                value={formData.tagline}
                onChange={handleChange}
                placeholder="e.g., Handcrafted pottery for mindful living"
                className="mt-2"
                required
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Description *
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell shoppers what makes your brand special..."
                className="mt-2"
                rows={3}
                required
              />
            </div>

            {/* Discount */}
            <div>
              <Label htmlFor="discount" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Black Friday Discount *
              </Label>
              <Input
                id="discount"
                name="discount"
                value={formData.discount}
                onChange={handleChange}
                placeholder="e.g., 30% OFF or Buy 1 Get 1 Free"
                className="mt-2"
                required
              />
            </div>

            {/* Category */}
            <div>
              <Label htmlFor="category" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Category *
              </Label>
              <select
                id="category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="w-full mt-2 px-3 py-2 border rounded-md"
                style={{ borderColor: '#e5e5e5' }}
                required
              >
                {categories.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Main Image URL */}
            <div>
              <Label htmlFor="imageUrl" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Main Product Image URL *
              </Label>
              <Input
                id="imageUrl"
                name="imageUrl"
                value={formData.imageUrl}
                onChange={handleChange}
                placeholder="https://example.com/product-image.jpg"
                className="mt-2"
                type="url"
                required
              />
              <p className="text-xs mt-1" style={{ color: '#666' }}>Provide a direct URL to your product image</p>
            </div>

            {/* Additional Images */}
            <div>
              <Label className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Additional Images (Optional, up to 4)
              </Label>
              <div className="space-y-2 mt-2">
                {formData.additionalImages.map((img, index) => (
                  <Input
                    key={index}
                    value={img}
                    onChange={(e) => handleAdditionalImageChange(index, e.target.value)}
                    placeholder={`Image ${index + 2} URL`}
                    type="url"
                  />
                ))}
              </div>
            </div>

            {/* External Store URL */}
            <div>
              <Label htmlFor="externalUrl" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Your Store URL *
              </Label>
              <Input
                id="externalUrl"
                name="externalUrl"
                value={formData.externalUrl}
                onChange={handleChange}
                placeholder="https://yourstore.com"
                className="mt-2"
                type="url"
                required
              />
              <p className="text-xs mt-1" style={{ color: '#666' }}>Where should shoppers go to purchase?</p>
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Contact Email *
              </Label>
              <Input
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="hello@yourbrand.com"
                className="mt-2"
                type="email"
                required
              />
            </div>

            {/* Brand Story */}
            <div>
              <Label htmlFor="story" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Your Brand Story (Optional)
              </Label>
              <Textarea
                id="story"
                name="story"
                value={formData.story}
                onChange={handleChange}
                placeholder="Share your journey, mission, or what makes your brand unique..."
                className="mt-2"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-6 text-lg transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit for Review'}
                <Sparkles className="ml-2 h-5 w-5" />
              </Button>
              <p className="text-sm text-center mt-4" style={{ color: '#666' }}>
                We'll review your submission and notify you via email within 24 hours
              </p>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};

export default MerchantSubmission;
