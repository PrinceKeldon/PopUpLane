import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { ArrowLeft, Heart } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

const ShopperRegister = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '' });
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password) {
      toast({ title: 'Missing Information', description: 'Please fill in all fields.', variant: 'destructive' });
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      toast({ title: 'Password Mismatch', description: 'Passwords do not match.', variant: 'destructive' });
      return;
    }

    setIsLoading(true);

    try {
      const submitData = { name: formData.name, email: formData.email, password: formData.password };
      await axios.post(`${API}/shopper/register`, submitData);
      
      toast({ title: 'Success!', description: 'Account created! Signing you in...' });
      
      // Auto login
      const loginResponse = await axios.post(`${API}/shopper/login`, { email: formData.email, password: formData.password });
      localStorage.setItem('shopper_token', loginResponse.data.token);
      localStorage.setItem('shopper_account', JSON.stringify(loginResponse.data.shopperAccount));
      
      navigate('/');
    } catch (error) {
      const message = error.response?.data?.detail || 'Registration failed.';
      toast({ title: 'Registration Failed', description: message, variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#111' }}>
      <div className="w-full max-w-md px-6">
        <div className="mb-8">
          <Button variant="ghost" onClick={() => navigate('/')} style={{ color: '#FAFAFA' }} className="mb-4">
            <ArrowLeft className="mr-2 h-4 w-4" />Back to Home
          </Button>
        </div>

        <Card className="p-8" style={{ backgroundColor: '#FAFAFA' }}>
          <div className="text-center mb-8">
            <div className="w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(255, 79, 129, 0.2)' }}>
              <Heart className="h-8 w-8" style={{ color: '#FF4F81' }} />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>Join PopUp Lane</h2>
            <p style={{ color: '#666' }}>Start saving and sharing your favorite finds</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="name">Name</Label>
              <Input id="name" name="name" value={formData.name} onChange={handleChange} required className="mt-2" placeholder="Your name" />
            </div>
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" value={formData.email} onChange={handleChange} required className="mt-2" placeholder="your@email.com" />
            </div>
            <div>
              <Label htmlFor="password">Password</Label>
              <Input id="password" name="password" type="password" value={formData.password} onChange={handleChange} required className="mt-2" placeholder="Min 6 characters" />
            </div>
            <div>
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" value={formData.confirmPassword} onChange={handleChange} required className="mt-2" placeholder="Re-enter password" />
            </div>
            <Button type="submit" disabled={isLoading} className="w-full py-6" style={{ backgroundColor: '#FF4F81', color: '#FAFAFA' }}>
              {isLoading ? 'Creating Account...' : 'Create Account'}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm" style={{ color: '#666' }}>
              Already have an account? <button onClick={() => navigate('/shopper/signin')} className="font-semibold" style={{ color: '#FF4F81' }}>Sign in</button>
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default ShopperRegister;
