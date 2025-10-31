import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ExternalLink, Bookmark, ChevronLeft, ChevronRight, Share2, Instagram, Twitter, Facebook, Mail, Copy } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const MerchantCard = ({ merchant, onVisit, onSave, isSaved }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const allImages = [merchant.imageUrl, ...(merchant.additionalImages || [])];
  
  const shareUrl = typeof window !== 'undefined' ? `${window.location.origin}?merchant=${merchant.id}` : '';
  const shareText = `Check out ${merchant.brandName} - ${merchant.discount} on PopUp Lane!`;

  const handlePrevImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === 0 ? allImages.length - 1 : prev - 1));
  };

  const handleNextImage = (e) => {
    e.stopPropagation();
    setCurrentImageIndex((prev) => (prev === allImages.length - 1 ? 0 : prev + 1));
  };

  const handleShareInstagram = () => {
    // Instagram doesn't support direct sharing via URL, copy link instead
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link Copied!', description: 'Share it on Instagram Stories or feed!' });
    setShowShareDialog(false);
  };

  const handleShareTwitter = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    setShowShareDialog(false);
  };

  const handleShareFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`;
    window.open(url, '_blank');
    setShowShareDialog(false);
  };

  const handleShareEmail = () => {
    const subject = `Check out ${merchant.brandName} on PopUp Lane`;
    const body = `${shareText}\n\n${merchant.description}\n\nVisit: ${shareUrl}`;
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    setShowShareDialog(false);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link Copied!', description: 'Share link copied to clipboard' });
    setShowShareDialog(false);
  };

  return (
    <Card className="merchant-card overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{ backgroundColor: '#FAFAFA', border: '1px solid #e5e5e5' }}>
      {/* Main Image with Navigation */}
      <div className="relative h-64 overflow-hidden group">
        <img 
          src={allImages[currentImageIndex]} 
          alt={`${merchant.brandName} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500"
          loading="lazy"
        />
        
        {/* Discount Badge */}
        <div className="absolute top-4 right-4 px-4 py-2 rounded-full font-bold animate-pulse" style={{ backgroundColor: '#FF4F81', color: '#FAFAFA' }}>
          {merchant.discount}
        </div>

        {/* Image Navigation Arrows */}
        {allImages.length > 1 && (
          <>
            <button
              onClick={handlePrevImage}
              className="absolute left-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-full"
              style={{ backgroundColor: 'rgba(17, 17, 17, 0.7)' }}
            >
              <ChevronLeft className="h-5 w-5" style={{ color: '#FAFAFA' }} />
            </button>
            <button
              onClick={handleNextImage}
              className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-all duration-300 p-2 rounded-full"
              style={{ backgroundColor: 'rgba(17, 17, 17, 0.7)' }}
            >
              <ChevronRight className="h-5 w-5" style={{ color: '#FAFAFA' }} />
            </button>
          </>
        )}

        {/* Image Dots Indicator */}
        {allImages.length > 1 && (
          <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
            {allImages.map((_, index) => (
              <button
                key={index}
                onClick={(e) => {
                  e.stopPropagation();
                  setCurrentImageIndex(index);
                }}
                className="w-2 h-2 rounded-full transition-all duration-300"
                style={{
                  backgroundColor: currentImageIndex === index ? '#FF4F81' : 'rgba(250, 250, 250, 0.5)',
                  width: currentImageIndex === index ? '24px' : '8px'
                }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Additional Images Thumbnail Scroll */}
      {merchant.additionalImages && merchant.additionalImages.length > 0 && (
        <div className="px-4 pt-4">
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
            <button
              onClick={() => setCurrentImageIndex(0)}
              className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300"
              style={{
                border: currentImageIndex === 0 ? '2px solid #3A7BD5' : '2px solid transparent',
                opacity: currentImageIndex === 0 ? 1 : 0.6
              }}
            >
              <img 
                src={merchant.imageUrl}
                alt={`${merchant.brandName} main`}
                className="w-full h-full object-cover"
              />
            </button>
            {merchant.additionalImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setCurrentImageIndex(index + 1)}
                className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 hover:opacity-100"
                style={{
                  border: currentImageIndex === index + 1 ? '2px solid #3A7BD5' : '2px solid transparent',
                  opacity: currentImageIndex === index + 1 ? 1 : 0.6
                }}
              >
                <img 
                  src={img}
                  alt={`${merchant.brandName} ${index + 2}`}
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 pt-4">
        <div className="mb-3">
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
            {merchant.brandName}
          </h3>
          <p className="text-sm" style={{ color: '#666' }}>
            {merchant.tagline}
          </p>
        </div>

        <p className="text-sm mb-4 line-clamp-2" style={{ color: '#444' }}>
          {merchant.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {merchant.badges.map((badge, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="text-xs"
              style={{ backgroundColor: 'rgba(58, 123, 213, 0.1)', color: '#3A7BD5', border: '1px solid rgba(58, 123, 213, 0.2)' }}
            >
              {badge}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={() => onVisit(merchant)}
            className="flex-1 transition-all duration-300"
            style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}
          >
            Visit Store
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            onClick={() => onSave(merchant)}
            variant="outline"
            size="icon"
            className="transition-all duration-300"
            style={{ borderColor: isSaved ? '#FF4F81' : '#e5e5e5', color: isSaved ? '#FF4F81' : '#666', backgroundColor: isSaved ? 'rgba(255, 79, 129, 0.1)' : 'transparent' }}
          >
            <Bookmark className="h-4 w-4" fill={isSaved ? '#FF4F81' : 'none'} />
          </Button>
          <Button 
            onClick={() => setShowShareDialog(true)}
            variant="outline"
            size="icon"
            className="transition-all duration-300"
            style={{ borderColor: '#e5e5e5', color: '#666' }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Story Link */}
        {merchant.story && (
          <div className="mt-3">
            <button
              onClick={() => setShowStoryDialog(true)}
              className="text-sm underline transition-colors duration-300"
              style={{ color: '#3A7BD5' }}
            >
              Read the brand story
            </button>
          </div>
        )}

        {/* Stats */}
        <div className="flex gap-4 mt-4 pt-4 border-t" style={{ borderColor: '#e5e5e5' }}>
          <span className="text-xs" style={{ color: '#666' }}>
            {merchant.saves} saves
          </span>
          <span className="text-xs" style={{ color: '#666' }}>
            {merchant.clicks} clicks
          </span>
        </div>
      </div>

      <style jsx>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.8;
          }
        }
        .scrollbar-thin::-webkit-scrollbar {
          height: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-track {
          background: #e5e5e5;
          border-radius: 4px;
        }
        .scrollbar-thin::-webkit-scrollbar-thumb {
          background: #3A7BD5;
          border-radius: 4px;
        }
      `}</style>
    </Card>
  );
};

export default MerchantCard;