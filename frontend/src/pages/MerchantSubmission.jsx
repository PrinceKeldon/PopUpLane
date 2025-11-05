import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { ArrowLeft, Sparkles, Upload, X, LogOut } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MerchantSubmission = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [merchantAccount, setMerchantAccount] = useState(null);
  const [mainImage, setMainImage] = useState(null);
  const [mainImagePreview, setMainImagePreview] = useState(null);
  const [additionalImages, setAdditionalImages] = useState([null, null, null, null]);
  const [additionalImagePreviews, setAdditionalImagePreviews] = useState([null, null, null, null]);
  
  const [formData, setFormData] = useState({
    brandName: '',
    tagline: '',
    description: '',
    discount: '',
    category: 'Home',
    externalUrl: ''
  });

  const categories = ['Home', 'Style', 'Tech', 'Beauty', 'Food', 'Accessories', 'Health'];

  useEffect(() => {
    // Check if merchant is logged in
    const token = localStorage.getItem('merchant_token');
    const accountData = localStorage.getItem('merchant_account');
    
    if (!token || !accountData) {
      toast({
        title: 'Authentication Required',
        description: 'Please sign in to submit a deal.',
        variant: 'destructive'
      });
      navigate('/merchant/signin');
      return;
    }

    setMerchantAccount(JSON.parse(accountData));
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleMainImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image must be less than 5MB',
          variant: 'destructive'
        });
        return;
      }
      setMainImage(file);
      setMainImagePreview(URL.createObjectURL(file));
    }
  };

  const handleAdditionalImageChange = (index, e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: 'File Too Large',
          description: 'Image must be less than 5MB',
          variant: 'destructive'
        });
        return;
      }
      const newImages = [...additionalImages];
      newImages[index] = file;
      setAdditionalImages(newImages);

      const newPreviews = [...additionalImagePreviews];
      newPreviews[index] = URL.createObjectURL(file);
      setAdditionalImagePreviews(newPreviews);
    }
  };

  const removeAdditionalImage = (index) => {
    const newImages = [...additionalImages];
    newImages[index] = null;
    setAdditionalImages(newImages);

    const newPreviews = [...additionalImagePreviews];
    newPreviews[index] = null;
    setAdditionalImagePreviews(newPreviews);
  };

  const handleLogout = () => {
    localStorage.removeItem('merchant_token');
    localStorage.removeItem('merchant_account');
    navigate('/merchant/signin');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.brandName || !formData.tagline || !formData.description || !formData.discount || !mainImage || !formData.externalUrl) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields and upload a main image.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // Create FormData for multipart upload
      const submitData = new FormData();
      submitData.append('brandName', formData.brandName);
      submitData.append('tagline', formData.tagline);
      submitData.append('description', formData.description);
      submitData.append('discount', formData.discount);
      submitData.append('category', formData.category);
      submitData.append('externalUrl', formData.externalUrl);
      
      // Append main image
      submitData.append('mainImage', mainImage);
      
      // Append additional images
      additionalImages.forEach((img) => {
        if (img) {
          submitData.append('additionalImages', img);
        }
      });

      // Get token
      const token = localStorage.getItem('merchant_token');

      const response = await axios.post(`${API}/merchant/deals`, submitData, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'multipart/form-data'
        }
      });

      toast({
        title: 'Success!',
        description: response.data.message || 'Your deal has been submitted!',
      });

      // Reset form
      setFormData({
        brandName: '',
        tagline: '',
        description: '',
        discount: '',
        category: 'Home',
        externalUrl: ''
      });
      setMainImage(null);
      setMainImagePreview(null);
      setAdditionalImages([null, null, null, null]);
      setAdditionalImagePreviews([null, null, null, null]);

      // Navigate back to home after 2 seconds
      setTimeout(() => {
        navigate('/');
      }, 2000);

    } catch (error) {
      console.error('Submission error:', error);
      const message = error.response?.data?.detail || 'Failed to submit. Please try again.';
      toast({
        title: 'Error',
        description: message,
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
            PopUp Lane - {merchantAccount?.businessName}
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

            {/* Main Image Upload */}
            <div>
              <Label htmlFor="mainImage" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Main Product Image *
              </Label>
              <div className="mt-2">
                {mainImagePreview ? (
                  <div className="relative inline-block">
                    <img src={mainImagePreview} alt="Main preview" className="w-64 h-64 object-cover rounded-lg" />
                    <Button
                      type="button"
                      variant="destructive"
                      size="sm"
                      className="absolute top-2 right-2"
                      onClick={() => {
                        setMainImage(null);
                        setMainImagePreview(null);
                      }}
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                ) : (
                  <label 
                    htmlFor="mainImage" 
                    className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                    style={{ borderColor: '#e5e5e5' }}
                  >
                    <Upload className="h-12 w-12 mb-2" style={{ color: '#3A7BD5' }} />
                    <p className="text-sm" style={{ color: '#666' }}>Click to upload main image</p>
                    <p className="text-xs mt-1" style={{ color: '#999' }}>PNG, JPG, WEBP (Max 5MB)</p>
                  </label>
                )}
                <Input
                  id="mainImage"
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  onChange={handleMainImageChange}
                  className="hidden"
                  required={!mainImage}
                />
              </div>
            </div>

            {/* Additional Images Upload */}
            <div>
              <Label className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Additional Images (Optional, up to 4)
              </Label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                {additionalImagePreviews.map((preview, index) => (
                  <div key={index}>
                    {preview ? (
                      <div className="relative">
                        <img src={preview} alt={`Additional ${index + 1}`} className="w-full h-32 object-cover rounded-lg" />
                        <Button
                          type="button"
                          variant="destructive"
                          size="sm"
                          className="absolute top-1 right-1"
                          onClick={() => removeAdditionalImage(index)}
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    ) : (
                      <label 
                        htmlFor={`additionalImage${index}`}
                        className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer hover:bg-gray-50"
                        style={{ borderColor: '#e5e5e5' }}
                      >
                        <Upload className="h-6 w-6 mb-1" style={{ color: '#3A7BD5' }} />
                        <p className="text-xs" style={{ color: '#666' }}>Upload</p>
                      </label>
                    )}
                    <Input
                      id={`additionalImage${index}`}
                      type="file"
                      accept="image/jpeg,image/jpg,image/png,image/webp"
                      onChange={(e) => handleAdditionalImageChange(index, e)}
                      className="hidden"
                    />
                  </div>
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
