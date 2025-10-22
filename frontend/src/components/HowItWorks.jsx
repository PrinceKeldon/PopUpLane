import React from 'react';
import { Button } from './ui/button';
import { Search, ArrowRight, Mail, Rocket, Sparkles, DollarSign } from 'lucide-react';

const HowItWorks = ({ onShopperCTA, onMerchantCTA }) => {
  const shopperSteps = [
    {
      icon: Search,
      title: 'Browse the Lane',
      description: 'Curated deals from merchants, creators, and small brands.'
    },
    {
      icon: ArrowRight,
      title: 'Click Through to Purchase',
      description: 'Each listing links directly to the store.'
    },
    {
      icon: Mail,
      title: 'Subscribe for Updates',
      description: 'Early access to seasonal drops and limited offers.'
    }
  ];

  const merchantSteps = [
    {
      icon: Rocket,
      title: 'Submit Your Deal in Minutes',
      description: 'No account, no complex setup.'
    },
    {
      icon: Sparkles,
      title: 'Get Featured Fairly',
      description: 'Shown to shoppers actively looking for deals.'
    },
    {
      icon: DollarSign,
      title: 'Drive Traffic That Converts',
      description: 'All sales go directly to you; no ad spend required.'
    }
  ];

  return (
    <section className="how-it-works-section py-20 px-6" style={{ backgroundColor: '#111' }}>
      <div className="max-w-6xl mx-auto">
        {/* Headline */}
        <h2 className="text-4xl md:text-5xl font-bold mb-16 text-center" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FAFAFA' }}>
          PopUp Lane Makes Discovery Fair and Simple
        </h2>

        {/* Two Column Layout */}
        <div className="grid md:grid-cols-2 gap-12">
          {/* For Shoppers */}
          <div className="shopper-column">
            <h3 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#3A7BD5' }}>
              For Shoppers
            </h3>

            <div className="space-y-6 mb-8">
              {shopperSteps.map((step, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-xl transition-all duration-300 hover:translate-x-2" style={{ backgroundColor: 'rgba(58, 123, 213, 0.1)' }}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#3A7BD5' }}>
                      <step.icon className="h-6 w-6" style={{ color: '#FAFAFA' }} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1" style={{ color: '#FAFAFA', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {index + 1}. {step.title}
                    </h4>
                    <p className="text-sm" style={{ color: '#FAFAFA', opacity: 0.8 }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="value-points mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: '#3A7BD5' }} />
                <p style={{ color: '#FAFAFA' }}>Discover independent creators & small brands worldwide</p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: '#3A7BD5' }} />
                <p style={{ color: '#FAFAFA' }}>Access deals <strong>before the crowd</strong></p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: '#3A7BD5' }} />
                <p style={{ color: '#FAFAFA' }}>Shop with impact – every click supports a maker</p>
              </div>
            </div>

            <Button 
              onClick={onShopperCTA}
              size="lg"
              className="w-full transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}
            >
              Explore the Lane
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>

          {/* For Merchants */}
          <div className="merchant-column">
            <h3 className="text-3xl font-bold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FF4F81' }}>
              For Merchants
            </h3>

            <div className="space-y-6 mb-8">
              {merchantSteps.map((step, index) => (
                <div key={index} className="flex gap-4 p-4 rounded-xl transition-all duration-300 hover:translate-x-2" style={{ backgroundColor: 'rgba(255, 79, 129, 0.1)' }}>
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full flex items-center justify-center" style={{ backgroundColor: '#FF4F81' }}>
                      <step.icon className="h-6 w-6" style={{ color: '#FAFAFA' }} />
                    </div>
                  </div>
                  <div>
                    <h4 className="text-lg font-semibold mb-1" style={{ color: '#FAFAFA', fontFamily: 'Space Grotesk, sans-serif' }}>
                      {index + 1}. {step.title}
                    </h4>
                    <p className="text-sm" style={{ color: '#FAFAFA', opacity: 0.8 }}>
                      {step.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="value-points mb-6 space-y-3">
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: '#FF4F81' }} />
                <p style={{ color: '#FAFAFA' }}>Affordable visibility for all budgets</p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: '#FF4F81' }} />
                <p style={{ color: '#FAFAFA' }}>Quick setup – list your deal in 3 minutes</p>
              </div>
              <div className="flex items-start gap-3">
                <Sparkles className="h-5 w-5 flex-shrink-0 mt-1" style={{ color: '#FF4F81' }} />
                <p style={{ color: '#FAFAFA' }}>Fair, community-first platform – no algorithm burying your brand</p>
              </div>
            </div>

            <Button 
              onClick={onMerchantCTA}
              size="lg"
              className="w-full transition-all duration-300 hover:scale-105"
              style={{ backgroundColor: '#FF4F81', color: '#FAFAFA' }}
            >
              List Your Deal Now
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;