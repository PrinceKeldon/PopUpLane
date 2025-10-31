import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Textarea } from '../components/ui/textarea';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MerchantRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    businessName: '',
    contactName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    website: '',
    description: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation
    if (!formData.businessName || !formData.contactName || !formData.email || !formData.password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all required fields.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({
        title: 'Password Mismatch',
        description: 'Passwords do not match.',
        variant: 'destructive'
      });
      return;
    }

    if (formData.password.length < 8) {
      toast({
        title: 'Weak Password',
        description: 'Password must be at least 8 characters.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const submitData = { ...formData };
      delete submitData.confirmPassword;

      const response = await axios.post(`${API}/merchant/register`, submitData);
      
      toast({
        title: 'Success!',
        description: response.data.message || 'Account created! Pending admin approval.',
      });

      // Navigate to sign in page after 2 seconds
      setTimeout(() => {
        navigate('/merchant/signin');
      }, 2000);

    } catch (error) {
      console.error('Registration error:', error);
      const message = error.response?.data?.detail || 'Registration failed. Please try again.';
      toast({
        title: 'Registration Failed',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
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
      <div className="max-w-3xl mx-auto px-6 py-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 123, 213, 0.2)' }}>
            <UserPlus className="h-8 w-8" style={{ color: '#3A7BD5' }} />
          </div>
          <h2 className="text-4xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
            Create Merchant Account
          </h2>
          <p className="text-lg" style={{ color: '#666' }}>
            Register to list your brand on PopUp Lane
          </p>
        </div>

        <Card className="p-8" style={{ backgroundColor: '#FAFAFA', border: '2px solid #e5e5e5' }}>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Name */}
            <div>
              <Label htmlFor="businessName" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Business Name *
              </Label>
              <Input
                id="businessName"
                name="businessName"
                value={formData.businessName}
                onChange={handleChange}
                placeholder="e.g., Luna Ceramics"
                className="mt-2"
                required
              />
            </div>

            {/* Contact Name */}
            <div>
              <Label htmlFor="contactName" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Contact Person Name *
              </Label>
              <Input
                id="contactName"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                placeholder="Your full name"
                className="mt-2"
                required
              />
            </div>

            {/* Email */}
            <div>
              <Label htmlFor="email" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Email Address *
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@business.com"
                className="mt-2"
                required
              />
            </div>

            {/* Password */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="password" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                  Password *
                </Label>
                <Input
                  id="password"
                  name="password"
                  type="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Min 8 characters"
                  className="mt-2"
                  required
                />
                <p className="text-xs mt-1" style={{ color: '#666' }}>Must be 8+ chars with 1 uppercase and 1 number</p>
              </div>
              <div>
                <Label htmlFor="confirmPassword" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                  Confirm Password *
                </Label>
                <Input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Re-enter password"
                  className="mt-2"
                  required
                />
              </div>
            </div>

            {/* Phone */}
            <div>
              <Label htmlFor="phone" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Phone Number
              </Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+1 234 567 8900"
                className="mt-2"
              />
            </div>

            {/* Website */}
            <div>
              <Label htmlFor="website" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Business Website
              </Label>
              <Input
                id="website"
                name="website"
                type="url"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourbusiness.com"
                className="mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Business Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Tell us about your business..."
                className="mt-2"
                rows={4}
              />
            </div>

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full py-6 text-lg transition-all duration-300 hover:scale-105"
                style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </Button>
              <p className="text-sm text-center mt-4" style={{ color: '#666' }}>
                Your account will be reviewed by our team within 24 hours
              </p>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#666' }}>
              Already have an account?{' '}
              <button
                onClick={() => navigate('/merchant/signin')}
                className="font-semibold"
                style={{ color: '#3A7BD5' }}
              >
                Sign in here
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MerchantRegister;
