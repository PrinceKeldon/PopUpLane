import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ExternalLink, Bookmark } from 'lucide-react';

const MerchantCard = ({ merchant, onVisit, onSave, isSaved }) => {
  return (
    <Card className="merchant-card overflow-hidden transition-all duration-300 hover:scale-105 hover:shadow-xl" style={{ backgroundColor: '#FAFAFA', border: '1px solid #e5e5e5' }}>
      {/* Image */}
      <div className="relative h-64 overflow-hidden">
        <img 
          src={merchant.imageUrl} 
          alt={merchant.brandName}
          className="w-full h-full object-cover transition-transform duration-500 hover:scale-110"
          loading="lazy"
        />
        {/* Discount Badge */}
        <div className="absolute top-4 right-4 px-4 py-2 rounded-full font-bold animate-pulse" style={{ backgroundColor: '#FF4F81', color: '#FAFAFA' }}>
          {merchant.discount}
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
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
        </div>

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
      `}</style>
    </Card>
  );
};

export default MerchantCard;