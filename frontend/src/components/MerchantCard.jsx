import React, { useState } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { ExternalLink, Bookmark, ChevronLeft, ChevronRight, Share2, Instagram, Twitter, Facebook, Mail, Copy, X } from 'lucide-react';
import { toast } from '../hooks/use-toast';

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;

const MerchantCard = ({ merchant, onVisit, onSave, isSaved }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showShareDialog, setShowShareDialog] = useState(false);
  const [showStoryDialog, setShowStoryDialog] = useState(false);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  
  // Helper function to get full image URL
  const getImageUrl = (path) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${BACKEND_URL}${path}`;
  };
  
  const allImages = [
    getImageUrl(merchant.imageUrl), 
    ...(merchant.additionalImages || []).map(img => getImageUrl(img))
  ];
  
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
    <>
    <Card 
      className="merchant-card overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer" 
      style={{ 
        background: 'linear-gradient(135deg, #8B1538 0%, #A91D3A 50%, #C73659 100%)',
        border: '1px solid rgba(139, 21, 56, 0.3)',
        boxShadow: '0 4px 6px rgba(139, 21, 56, 0.2)'
      }}
      onClick={() => setShowDetailsDialog(true)}
    >
      {/* Main Image with Navigation */}
      <div className="relative h-64 overflow-hidden group">
        <img 
          src={allImages[currentImageIndex]} 
          alt={`${merchant.brandName} - Image ${currentImageIndex + 1}`}
          className="w-full h-full object-cover transition-transform duration-500"
          loading="lazy"
          onError={(e) => {
            console.error('Image failed to load:', allImages[currentImageIndex]);
            e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
          }}
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
              onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(0); }}
              className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300"
              style={{
                border: currentImageIndex === 0 ? '2px solid #3A7BD5' : '2px solid transparent',
                opacity: currentImageIndex === 0 ? 1 : 0.6
              }}
            >
              <img 
                src={getImageUrl(merchant.imageUrl)}
                alt={`${merchant.brandName} main`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                }}
              />
            </button>
            {merchant.additionalImages.map((img, index) => (
              <button
                key={index}
                onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index + 1); }}
                className="flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden transition-all duration-300 hover:opacity-100"
                style={{
                  border: currentImageIndex === index + 1 ? '2px solid #3A7BD5' : '2px solid transparent',
                  opacity: currentImageIndex === index + 1 ? 1 : 0.6
                }}
              >
                <img 
                  src={getImageUrl(img)}
                  alt={`${merchant.brandName} ${index + 2}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                  }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="p-6 pt-4">
        <div className="mb-3">
          <h3 className="text-xl font-bold mb-1" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#FFF5F7' }}>
            {merchant.brandName}
          </h3>
          <p className="text-sm" style={{ color: '#FFE4EC' }}>
            {merchant.tagline}
          </p>
        </div>

        <p className="text-sm mb-4 line-clamp-2" style={{ color: '#FFF0F3' }}>
          {merchant.description}
        </p>

        {/* Badges */}
        <div className="flex flex-wrap gap-2 mb-4">
          {merchant.badges.map((badge, index) => (
            <Badge 
              key={index} 
              variant="secondary"
              className="text-xs"
              style={{ 
                backgroundColor: 'rgba(255, 255, 255, 0.2)', 
                color: '#FFF', 
                border: '1px solid rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(10px)'
              }}
            >
              {badge}
            </Badge>
          ))}
        </div>

        {/* Actions */}
        <div className="flex gap-2">
          <Button 
            onClick={(e) => { e.stopPropagation(); onVisit(merchant); }}
            className="flex-1 transition-all duration-300"
            style={{ backgroundColor: '#FFD700', color: '#8B1538', fontWeight: 'bold' }}
          >
            Visit Store
            <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
          <Button 
            onClick={(e) => { e.stopPropagation(); onSave(merchant); }}
            variant="outline"
            size="icon"
            className="transition-all duration-300"
            style={{ 
              borderColor: isSaved ? '#FFD700' : 'rgba(255, 255, 255, 0.3)', 
              color: isSaved ? '#FFD700' : '#FFF', 
              backgroundColor: isSaved ? 'rgba(255, 215, 0, 0.2)' : 'rgba(255, 255, 255, 0.1)' 
            }}
          >
            <Bookmark className="h-4 w-4" fill={isSaved ? '#FFD700' : 'none'} />
          </Button>
          <Button 
            onClick={(e) => { e.stopPropagation(); setShowShareDialog(true); }}
            variant="outline"
            size="icon"
            className="transition-all duration-300"
            style={{ 
              borderColor: 'rgba(255, 255, 255, 0.3)', 
              color: '#FFF',
              backgroundColor: 'rgba(255, 255, 255, 0.1)'
            }}
          >
            <Share2 className="h-4 w-4" />
          </Button>
        </div>

        {/* Story Link */}
        {merchant.story && (
          <div className="mt-3">
            <button
              onClick={(e) => { e.stopPropagation(); setShowStoryDialog(true); }}
              className="text-sm underline transition-colors duration-300"
              style={{ color: '#FFD700' }}
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

      {/* Share Dialog */}
      <Dialog open={showShareDialog} onOpenChange={setShowShareDialog}>
        <DialogContent style={{ backgroundColor: '#FAFAFA' }}>
          <DialogHeader>
            <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
              Share {merchant.brandName}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-3 mt-4">
            <Button onClick={handleShareInstagram} className="w-full justify-start" variant="outline">
              <Instagram className="mr-3 h-5 w-5" style={{ color: '#E4405F' }} />
              Share on Instagram
            </Button>
            <Button onClick={handleShareTwitter} className="w-full justify-start" variant="outline">
              <Twitter className="mr-3 h-5 w-5" style={{ color: '#1DA1F2' }} />
              Share on Twitter
            </Button>
            <Button onClick={handleShareFacebook} className="w-full justify-start" variant="outline">
              <Facebook className="mr-3 h-5 w-5" style={{ color: '#4267B2' }} />
              Share on Facebook
            </Button>
            <Button onClick={handleShareEmail} className="w-full justify-start" variant="outline">
              <Mail className="mr-3 h-5 w-5" style={{ color: '#666' }} />
              Share via Email
            </Button>
            <Button onClick={handleCopyLink} className="w-full justify-start" variant="outline">
              <Copy className="mr-3 h-5 w-5" style={{ color: '#666' }} />
              Copy Link
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Story Dialog */}
      {merchant.story && (
        <Dialog open={showStoryDialog} onOpenChange={setShowStoryDialog}>
          <DialogContent style={{ backgroundColor: '#FAFAFA', maxWidth: '600px' }}>
            <DialogHeader>
              <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                {merchant.brandName} - Our Story
              </DialogTitle>
            </DialogHeader>
            <div className="mt-4">
              <img 
                src={getImageUrl(merchant.imageUrl)} 
                alt={merchant.brandName} 
                className="w-full h-48 object-cover rounded-lg mb-4" 
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                }}
              />
              <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#444' }}>
                {merchant.story}
              </p>
            </div>
          </DialogContent>
        </Dialog>
      )}

      {/* Details Dialog - Full merchant info */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent 
          className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col" 
          style={{ backgroundColor: '#FAFAFA' }}
        >
          <DialogHeader className="flex-shrink-0">
            <DialogTitle style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111', fontSize: '24px' }}>
              {merchant.brandName}
            </DialogTitle>
          </DialogHeader>
          
          <div className="overflow-y-auto flex-1 pr-4 -mr-4" style={{ scrollbarWidth: 'thin' }}>
            {/* Image Gallery */}
            <div className="relative h-96 mb-6 rounded-lg overflow-hidden">
              <img 
                src={allImages[currentImageIndex]} 
                alt={`${merchant.brandName} - Image ${currentImageIndex + 1}`}
                className="w-full h-full object-cover"
                onError={(e) => {
                  e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                }}
              />
              
              {/* Discount Badge */}
              <div className="absolute top-4 right-4 px-6 py-3 rounded-full font-bold text-lg" style={{ backgroundColor: '#FF4F81', color: '#FAFAFA' }}>
                {merchant.discount}
              </div>

              {/* Navigation */}
              {allImages.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); handlePrevImage(e); }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 p-3 rounded-full"
                    style={{ backgroundColor: 'rgba(17, 17, 17, 0.7)' }}
                  >
                    <ChevronLeft className="h-6 w-6" style={{ color: '#FAFAFA' }} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleNextImage(e); }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 p-3 rounded-full"
                    style={{ backgroundColor: 'rgba(17, 17, 17, 0.7)' }}
                  >
                    <ChevronRight className="h-6 w-6" style={{ color: '#FAFAFA' }} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Gallery */}
            {allImages.length > 1 && (
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {allImages.map((img, index) => (
                  <button
                    key={index}
                    onClick={(e) => { e.stopPropagation(); setCurrentImageIndex(index); }}
                    className="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden"
                    style={{
                      border: currentImageIndex === index ? '3px solid #3A7BD5' : '2px solid #e5e5e5',
                      opacity: currentImageIndex === index ? 1 : 0.6
                    }}
                  >
                    <img 
                      src={img}
                      alt={`Thumbnail ${index + 1}`}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.target.src = 'https://images.unsplash.com/photo-1557821552-17105176677c?w=800&q=80';
                      }}
                    />
                  </button>
                ))}
              </div>
            )}

            {/* Tagline */}
            <p className="text-lg mb-4" style={{ color: '#666', fontStyle: 'italic' }}>
              {merchant.tagline}
            </p>

            {/* Badges */}
            <div className="flex flex-wrap gap-2 mb-6">
              {merchant.badges.map((badge, index) => (
                <Badge 
                  key={index} 
                  variant="secondary"
                  style={{ backgroundColor: 'rgba(58, 123, 213, 0.1)', color: '#3A7BD5', border: '1px solid rgba(58, 123, 213, 0.2)' }}
                >
                  {badge}
                </Badge>
              ))}
            </div>

            {/* Description */}
            <div className="mb-6">
              <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                About This Deal
              </h3>
              <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#444' }}>
                {merchant.description}
              </p>
            </div>

            {/* Story */}
            {merchant.story && (
              <div className="mb-6">
                <h3 className="text-lg font-bold mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif', color: '#111' }}>
                  Our Story
                </h3>
                <p className="text-base leading-relaxed whitespace-pre-wrap" style={{ color: '#444' }}>
                  {merchant.story}
                </p>
              </div>
            )}

            {/* Stats */}
            <div className="flex gap-6 mb-6 p-4 rounded-lg" style={{ backgroundColor: '#f5f5f5' }}>
              <div>
                <span className="text-sm" style={{ color: '#666' }}>Saves: </span>
                <span className="font-bold" style={{ color: '#111' }}>{merchant.saves}</span>
              </div>
              <div>
                <span className="text-sm" style={{ color: '#666' }}>Clicks: </span>
                <span className="font-bold" style={{ color: '#111' }}>{merchant.clicks}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3 sticky bottom-0 bg-white/95 backdrop-blur-sm py-4 border-t" style={{ borderColor: '#e5e5e5' }}>
              <Button 
                onClick={(e) => { e.stopPropagation(); onVisit(merchant); setShowDetailsDialog(false); }}
                className="flex-1"
                size="lg"
                style={{ backgroundColor: '#3A7BD5', color: '#FAFAFA' }}
              >
                Visit Store
                <ExternalLink className="ml-2 h-5 w-5" />
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); onSave(merchant); }}
                variant="outline"
                size="lg"
                style={{ 
                  borderColor: isSaved ? '#FF4F81' : '#e5e5e5', 
                  color: isSaved ? '#FF4F81' : '#666', 
                  backgroundColor: isSaved ? 'rgba(255, 79, 129, 0.1)' : 'transparent' 
                }}
              >
                <Bookmark className="h-5 w-5 mr-2" fill={isSaved ? '#FF4F81' : 'none'} />
                {isSaved ? 'Saved' : 'Save'}
              </Button>
              <Button 
                onClick={(e) => { e.stopPropagation(); setShowShareDialog(true); }}
                variant="outline"
                size="lg"
                style={{ borderColor: '#e5e5e5', color: '#666' }}
              >
                <Share2 className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

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
    </>
  );
};

export default MerchantCard;