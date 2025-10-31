import React, { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Heart, User, LogOut } from 'lucide-react';
import CountdownTimer from './CountdownTimer';
import { LANE_CONFIG } from '../data/mock';
import { useNavigate } from 'react-router-dom';

const MinimalistHero = ({ onGetNotified, onExplore }) => {
  const navigate = useNavigate();
  const [shopperAccount, setShopperAccount] = useState(null);

  useEffect(() => {
    const accountData = localStorage.getItem('shopper_account');
    if (accountData) {
      setShopperAccount(JSON.parse(accountData));
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('shopper_token');
    localStorage.removeItem('shopper_account');
    setShopperAccount(null);
    window.location.reload();
  };

  return (
    <section className="relative w-full h-screen overflow-hidden">
      {/* User Menu */}
      {shopperAccount ? (
        <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
          <Button
            onClick={() => navigate('/my-finds')}
            variant="ghost"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <Heart className="mr-2 h-4 w-4" />
            My Finds
          </Button>
          <Button
            onClick={handleLogout}
            variant="ghost"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      ) : (
        <div className="absolute top-6 right-6 z-30 flex items-center gap-3">
          <Button
            onClick={() => navigate('/shopper/signin')}
            variant="ghost"
            className="text-white hover:text-yellow-400 transition-colors"
          >
            <User className="mr-2 h-4 w-4" />
            Sign In
          </Button>
        </div>
      )}

      {/* Background with gradient overlay */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-900 via-purple-900 to-gray-900"></div>
        {/* Animated gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-700 to-purple-900 opacity-50 animate-pulse"></div>
      </div>

      {/* Content Container */}
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-white px-4 text-center">
        {/* Dominant 3D Title */}
        <div className="mb-8 logo-3d">
          <h1 className="popup-text text-7xl md:text-8xl lg:text-9xl font-black leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            PopUp
          </h1>
          <h1 className="lane-text text-7xl md:text-8xl lg:text-9xl font-black leading-none" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
            Lane
          </h1>
        </div>

        {/* Countdown Timer */}
        <div className="mb-12">
          <p className="text-sm md:text-lg font-light tracking-wide mb-4 uppercase">
            Lane Opens In:
          </p>
          <CountdownTimer targetDate={LANE_CONFIG.openDate} />
        </div>

        {/* Headline */}
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6 animate-fade-in-up" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
          Beat the Black Friday Chaos{' '}
          <span className="text-yellow-400">Discover Real Deals</span> Before the Rush.
        </h1>

        {/* Subheadline */}
        <p className="text-lg md:text-xl lg:text-2xl font-medium mb-10 max-w-3xl animate-fade-in-up delay-200">
          Curated deals from <span className="font-bold text-pink-400">small brands, indie merchants, and creators</span> who don't have big ad budgets – the ones you actually want to find before the noise hits.
        </p>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row gap-4 mb-8 animate-fade-in-up delay-400">
          <Button
            size="lg"
            onClick={onExplore}
            className="bg-yellow-500 hover:bg-yellow-600 text-gray-900 font-bold py-6 px-8 rounded-lg text-lg transition duration-300 ease-in-out shadow-lg transform hover:scale-105"
          >
            <span className="mr-2">✨</span> Explore the Lane
          </Button>
          <Button
            size="lg"
            onClick={onGetNotified}
            className="bg-transparent border-2 border-yellow-500 text-yellow-500 font-bold py-6 px-8 rounded-lg text-lg hover:bg-yellow-500 hover:text-gray-900 transition duration-300 ease-in-out transform hover:scale-105"
          >
            <span className="mr-2">💡</span> Get Notified
          </Button>
        </div>

        {/* Merchant CTA */}
        <div className="text-center animate-fade-in-up delay-500">
          <p className="text-sm mb-3 opacity-70">
            Are you a merchant or creator?
          </p>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => navigate('/merchant/signin')}
            className="text-pink-400 hover:text-pink-300 underline"
          >
            List Your Deal on PopUp Lane
          </Button>
        </div>
      </div>

      {/* Subtle bottom gradient */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-transparent to-transparent pointer-events-none"></div>

      <style jsx>{`
        .logo-3d {
          margin-bottom: 2rem;
        }

        .popup-text {
          background: linear-gradient(145deg, #FFD700 0%, #FFA500 50%, #FF8C00 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 
            2px 2px 0px rgba(255, 215, 0, 0.3),
            4px 4px 0px rgba(255, 165, 0, 0.2),
            6px 6px 0px rgba(255, 140, 0, 0.1),
            0 0 40px rgba(255, 215, 0, 0.4);
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5));
          transform-style: preserve-3d;
          animation: float 3s ease-in-out infinite;
        }

        .lane-text {
          background: linear-gradient(145deg, #FF1493 0%, #FF69B4 50%, #FFB6C1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          text-shadow: 
            2px 2px 0px rgba(255, 20, 147, 0.3),
            4px 4px 0px rgba(255, 105, 180, 0.2),
            6px 6px 0px rgba(255, 182, 193, 0.1),
            0 0 40px rgba(255, 20, 147, 0.4);
          filter: drop-shadow(0 8px 16px rgba(0, 0, 0, 0.5));
          transform-style: preserve-3d;
          animation: float 3s ease-in-out infinite 0.5s;
        }

        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotateX(0deg);
          }
          50% {
            transform: translateY(-10px) rotateX(2deg);
          }
        }

        @keyframes fade-in-up {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.8s ease-out forwards;
        }

        .delay-200 {
          animation-delay: 0.2s;
          opacity: 0;
        }

        .delay-400 {
          animation-delay: 0.4s;
          opacity: 0;
        }

        .delay-500 {
          animation-delay: 0.5s;
          opacity: 0;
        }
      `}</style>
    </section>
  );
};

export default MinimalistHero;
