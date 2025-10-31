import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { Lock, ArrowLeft, User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const MerchantSignIn = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: 'Missing Information',
        description: 'Please fill in all fields.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await axios.post(`${API}/merchant/login`, formData);
      
      // Store token and merchant data
      localStorage.setItem('merchant_token', response.data.token);
      localStorage.setItem('merchant_account', JSON.stringify(response.data.merchantAccount));
      
      toast({
        title: 'Success!',
        description: 'Logged in successfully.',
      });

      // Navigate to merchant dashboard
      navigate('/merchant/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      const message = error.response?.data?.detail || 'Login failed. Please try again.';
      toast({
        title: 'Login Failed',
        description: message,
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111' }}>
      <div className="w-full max-w-md px-6">
        <div className="mb-8">
          <Button 
            variant="ghost" 
            onClick={() => navigate('/')}
            style={{ color: '#FAFAFA' }}
            className="mb-4"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>
        </div>

        <Card className="p-8" style={{ backgroundColor: '#FAFAFA' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 123, 213, 0.2)' }}>
              <User className="h-8 w-8" style={{ color: '#3A7BD5' }} />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
              Merchant Sign In
            </h2>
            <p style={{ color: '#666' }}>Access your merchant dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="email" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Email
              </Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="your@email.com"
                className="mt-2"
                required
              />
            </div>

            <div>
              <Label htmlFor="password" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Password
              </Label>
              <Input
                id="password"
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                className="mt-2"
                required
              />
            </div>

            <Button
              type="submit"
              disabled={isLoading}
              className="w-full py-6 text-lg transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}
            >
              {isLoading ? 'Signing In...' : 'Sign In'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#666' }}>
              Don't have an account?{' '}
              <button
                onClick={() => navigate('/merchant/register')}
                className="font-semibold"
                style={{ color: '#3A7BD5' }}
              >
                Register here
              </button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default MerchantSignIn;
