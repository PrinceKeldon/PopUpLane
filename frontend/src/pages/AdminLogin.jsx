import React, { useState } from 'react';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import { Label } from '../components/ui/label';
import { Card } from '../components/ui/card';
import { toast } from '../hooks/use-toast';
import { adminAPI } from '../api/client';
import { Lock, ArrowLeft } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = () => {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!password) {
      toast({
        title: 'Missing Password',
        description: 'Please enter the admin password.',
        variant: 'destructive'
      });
      return;
    }

    setIsLoading(true);

    try {
      const response = await adminAPI.login(password);
      
      // Store token
      localStorage.setItem('admin_token', response.data.token);
      
      toast({
        title: 'Success!',
        description: 'Logged in successfully.',
      });

      // Navigate to admin dashboard
      navigate('/admin/dashboard');

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'Invalid password. Please try again.',
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
              <Lock className="h-8 w-8" style={{ color: '#3A7BD5' }} />
            </div>
            <h2 className="text-3xl font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
              Admin Login
            </h2>
            <p style={{ color: '#666' }}>Enter your password to access the dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <Label htmlFor="password" className="text-base font-semibold mb-2" style={{ color: '#111' }}>
                Password
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter admin password"
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
              {isLoading ? 'Logging in...' : 'Login'}
            </Button>
          </form>

          <p className="text-xs text-center mt-6" style={{ color: '#999' }}>
            Default password: admin123 (change in production)
          </p>
        </Card>
      </div>
    </div>
  );
};

export default AdminLogin;
