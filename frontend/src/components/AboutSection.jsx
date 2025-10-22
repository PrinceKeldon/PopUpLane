import React from 'react';
import { Sparkles, ShoppingBag } from 'lucide-react';

const AboutSection = () => {
  return (
    <section className="about-section py-20 px-6" style={{ backgroundColor: '#FAFAFA' }}>
      <div className="max-w-5xl mx-auto">
        {/* Headline */}
        <h2 className="text-4xl md:text-5xl font-bold mb-8 text-center leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
          Every Black Friday, hidden merchants and small brands get buried.
          <br />
          <span style={{ color: '#FF4F81' }}>We built PopUp Lane to dig them out.</span>
        </h2>

        {/* Body Copy */}
        <div className="prose prose-lg max-w-3xl mx-auto mb-12" style={{ color: '#444' }}>
          <p className="text-lg mb-6 leading-relaxed">
            Every year, Black Friday turns into a shouting match online. Big-box budgets dominate feeds. Algorithms favor the giants. Meanwhile, <strong style={{ color: '#111' }}>small brands, indie merchants, and creators</strong> get lost in the noise.
          </p>
          <p className="text-lg mb-6 leading-relaxed">
            PopUp Lane is the lane where visibility is fair. Where <strong style={{ color: '#111' }}>anyone without a massive ad budget</strong> gets a spotlight. Where shoppers discover deals that are <strong style={{ color: '#111' }}>real, meaningful, and curated with care</strong>.
          </p>
          <p className="text-lg font-semibold" style={{ color: '#3A7BD5' }}>
            This is not a coupon site – it's a street of discovery.
          </p>
        </div>

        {/* Promise Blocks */}
        <div className="grid md:grid-cols-2 gap-8 mb-12">
          {/* For Merchants */}
          <div className="promise-card p-8 rounded-2xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#111', border: '2px solid #3A7BD5' }}>
            <div className="flex items-center mb-4">
              <Sparkles className="h-6 w-6 mr-3" style={{ color: '#3A7BD5' }} />
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FAFAFA' }}>
                Merchants & Creators
              </h3>
            </div>
            <p className="text-lg leading-relaxed" style={{ color: '#FAFAFA', opacity: 0.9 }}>
              Get discovered without a big budget. Submit your deal and join a curated lane seen by thousands of conscious shoppers.
            </p>
          </div>

          {/* For Shoppers */}
          <div className="promise-card p-8 rounded-2xl transition-all duration-300 hover:scale-105" style={{ backgroundColor: '#111', border: '2px solid #FF4F81' }}>
            <div className="flex items-center mb-4">
              <ShoppingBag className="h-6 w-6 mr-3" style={{ color: '#FF4F81' }} />
              <h3 className="text-2xl font-bold" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FAFAFA' }}>
                Shoppers
              </h3>
            </div>
            <p className="text-lg leading-relaxed" style={{ color: '#FAFAFA', opacity: 0.9 }}>
              Find deals that actually matter. Discover <strong>small brands, indie merchants, and creators</strong> hidden in the noise.
            </p>
          </div>
        </div>

        {/* Closing Line */}
        <p className="text-2xl font-semibold text-center italic" style={{ color: '#3A7BD5', fontFamily: 'Space Grotesk, sans-serif' }}>
          This Black Friday, let's make the internet feel fair again.
        </p>
      </div>
    </section>
  );
};

export default AboutSection;