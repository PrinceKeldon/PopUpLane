import React from 'react';
import { Button } from './ui/button';
import { ArrowRight, Bell } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { LANE_CONFIG } from '../data/mock';

const Hero = ({ onGetNotified, onExplore }) => {
  return (
    <section className="hero-section relative min-h-screen flex items-center justify-center overflow-hidden" style={{ backgroundColor: '#111' }}>
      {/* Subtle animated background */}
      <div className="absolute inset-0 opacity-20">
        <div className="lane-lights"></div>
      </div>

      <div className="relative z-10 max-w-5xl mx-auto px-6 text-center">
        {/* Tagline */}
        <div className="inline-block mb-6 px-4 py-2 rounded-full" style={{ backgroundColor: 'rgba(58, 123, 213, 0.15)', border: '1px solid rgba(58, 123, 213, 0.3)' }}>
          <span className="text-sm font-semibold" style={{ color: '#3A7BD5', fontFamily: 'Space Grotesk, sans-serif' }}>
            Early Access Edition • {LANE_CONFIG.seasonName}
          </span>
        </div>

        {/* Headline */}
        <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FAFAFA' }}>
          Beat the Black Friday Chaos
        </h1>
        <h2 className="text-3xl md:text-5xl font-semibold mb-8" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#3A7BD5' }}>
          Discover Real Deals Before the Rush
        </h2>

        {/* Subheadline */}
        <p className="text-lg md:text-xl mb-12 max-w-3xl mx-auto leading-relaxed" style={{ color: '#FAFAFA', opacity: 0.9 }}>
          Curated deals from <span className="font-semibold" style={{ color: '#FF4F81' }}>small brands, indie merchants, and creators</span> who don't have big ad budgets – the ones you actually want to find before the noise hits.
        </p>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
          <Button 
            size="lg" 
            onClick={onExplore}
            className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
            style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}
          >
            Explore the Lane
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          <Button 
            size="lg" 
            variant="outline"
            onClick={onGetNotified}
            className="text-lg px-8 py-6 transition-all duration-300 hover:scale-105"
            style={{ borderColor: '#FF4F81', color: '#FF4F81', backgroundColor: 'transparent' }}
          >
            <Bell className="mr-2 h-5 w-5" />
            Get Notified
          </Button>
        </div>

        {/* Countdown Timer */}
        <div className="countdown-container p-8 rounded-2xl" style={{ backgroundColor: 'rgba(250, 250, 250, 0.05)', backdropFilter: 'blur(10px)', border: '1px solid rgba(250, 250, 250, 0.1)' }}>
          <p className="text-sm uppercase tracking-wider mb-4" style={{ color: '#FAFAFA', opacity: 0.7, fontFamily: 'Space Grotesk, sans-serif' }}>
            Lane Opens In
          </p>
          <CountdownTimer targetDate={LANE_CONFIG.openDate} />
        </div>
      </div>

      <style jsx>{`
        .lane-lights {
          width: 100%;
          height: 100%;
          background: linear-gradient(45deg, transparent 30%, rgba(58, 123, 213, 0.1) 50%, transparent 70%);
          animation: moveLights 8s ease-in-out infinite;
        }

        @keyframes moveLights {
          0%, 100% {
            transform: translateX(-50%) translateY(-50%);
          }
          50% {
            transform: translateX(50%) translateY(50%);
          }
        }
      `}</style>
    </section>
  );
};

export default Hero;