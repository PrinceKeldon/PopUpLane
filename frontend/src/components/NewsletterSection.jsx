import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Mail, Sparkles } from 'lucide-react';
import { toast } from '../hooks/use-toast';
import { shoppersAPI } from '../api/client';

const NewsletterSection = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !email.includes('@')) {
      toast({
        title: 'Invalid Email',
        description: 'Please enter a valid email address.',
        variant: 'destructive'
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await shoppersAPI.subscribe({ 
        email, 
        source: 'newsletter_section' 
      });
      
      toast({
        title: 'Success!',
        description: response.data.message || 'You\'re on the list! We\'ll notify you when the Lane opens.',
      });
      setEmail('');
    } catch (error) {
      console.error('Newsletter signup error:', error);
      toast({
        title: 'Error',
        description: 'Failed to subscribe. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="newsletter-section py-20 px-6" style={{ backgroundColor: '#111' }}>
      <div className="max-w-3xl mx-auto text-center">
        {/* Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-16 h-16 rounded-full flex items-center justify-center" style={{ backgroundColor: 'rgba(58, 123, 213, 0.2)' }}>
            <Mail className="h-8 w-8" style={{ color: '#3A7BD5' }} />
          </div>
        </div>

        {/* Headline */}
        <h2 className="text-4xl md:text-5xl font-bold mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FAFAFA' }}>
          Don't Miss the Next Drop
        </h2>

        {/* Subheadline */}
        <p className="text-lg mb-8" style={{ color: '#FAFAFA', opacity: 0.8 }}>
          Whether you're a shopper or a merchant, PopUp Lane is your shortcut to discovering and sharing real deals this season.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-xl mx-auto mb-6">
          <Input 
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="flex-1 px-6 py-6 text-lg"
            style={{ backgroundColor: '#FAFAFA', color: '#111', border: 'none' }}
          />
          <Button 
            type="submit"
            size="lg"
            disabled={isSubmitting}
            className="px-8 py-6 text-lg transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}
          >
            {isSubmitting ? 'Subscribing...' : 'Subscribe'}
            <Sparkles className="ml-2 h-5 w-5" />
          </Button>
        </form>

        {/* Support Text */}
        <p className="text-sm" style={{ color: '#FAFAFA', opacity: 0.6 }}>
          No spam. Only indie finds worth discovering.
        </p>
      </div>
    </section>
  );
};

export default NewsletterSection;
