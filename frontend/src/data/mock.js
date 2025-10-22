// Mock data for PopUp Lane MVP

export const MOCK_MERCHANTS = [
  {
    id: '1',
    brandName: 'Luna Ceramics',
    tagline: 'Handcrafted pottery for mindful living',
    description: 'Sustainable, handmade ceramic pieces crafted with love',
    discount: '30% OFF',
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?w=800&q=80',
    externalUrl: 'https://example.com/luna-ceramics',
    badges: ['Emerging', 'Sustainable'],
    saves: 245,
    clicks: 1203,
    status: 'approved'
  },
  {
    id: '2',
    brandName: 'Bloom & Thread',
    tagline: 'Organic cotton apparel',
    description: 'Ethically made clothing from organic materials',
    discount: '25% OFF',
    category: 'Style',
    imageUrl: 'https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&q=80',
    externalUrl: 'https://example.com/bloom-thread',
    badges: ['Sustainable', 'Boutique'],
    saves: 189,
    clicks: 892,
    status: 'approved'
  },
  {
    id: '3',
    brandName: 'Artisan Coffee Co',
    tagline: 'Small-batch roasted perfection',
    description: 'Ethically sourced coffee beans roasted in small batches',
    discount: '20% OFF',
    category: 'Food',
    imageUrl: 'https://images.unsplash.com/photo-1559056199-641a0ac8b55e?w=800&q=80',
    externalUrl: 'https://example.com/artisan-coffee',
    badges: ['Emerging', 'Limited'],
    saves: 312,
    clicks: 1456,
    status: 'approved'
  },
  {
    id: '4',
    brandName: 'Echo Electronics',
    tagline: 'Minimalist tech accessories',
    description: 'Premium cables and accessories designed for longevity',
    discount: '35% OFF',
    category: 'Tech',
    imageUrl: 'https://images.unsplash.com/photo-1625948515291-69613efd103f?w=800&q=80',
    externalUrl: 'https://example.com/echo-electronics',
    badges: ['Tech', 'Trending'],
    saves: 421,
    clicks: 2104,
    status: 'approved'
  },
  {
    id: '5',
    brandName: 'Wild Botanics',
    tagline: 'Plant-based skincare essentials',
    description: 'Clean beauty products made from botanical ingredients',
    discount: '40% OFF',
    category: 'Beauty',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=800&q=80',
    externalUrl: 'https://example.com/wild-botanics',
    badges: ['Beauty', 'Sustainable'],
    saves: 567,
    clicks: 2789,
    status: 'approved'
  },
  {
    id: '6',
    brandName: 'Studio Light',
    tagline: 'Handmade candles & home scents',
    description: 'Soy wax candles with essential oils',
    discount: '25% OFF',
    category: 'Home',
    imageUrl: 'https://images.unsplash.com/photo-1602874801006-94c6e414b7ae?w=800&q=80',
    externalUrl: 'https://example.com/studio-light',
    badges: ['Emerging', 'Boutique'],
    saves: 198,
    clicks: 945,
    status: 'approved'
  },
  {
    id: '7',
    brandName: 'Leather & Stitch',
    tagline: 'Handcrafted leather goods',
    description: 'Timeless leather bags and wallets made to last',
    discount: '30% OFF',
    category: 'Accessories',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=800&q=80',
    externalUrl: 'https://example.com/leather-stitch',
    badges: ['Boutique', 'Trending'],
    saves: 334,
    clicks: 1678,
    status: 'approved'
  },
  {
    id: '8',
    brandName: 'Peak Nutrition',
    tagline: 'Organic wellness supplements',
    description: 'Plant-based supplements for active lifestyles',
    discount: '20% OFF',
    category: 'Health',
    imageUrl: 'https://images.unsplash.com/photo-1526947425960-945c6e72858f?w=800&q=80',
    externalUrl: 'https://example.com/peak-nutrition',
    badges: ['Health', 'Sustainable'],
    saves: 276,
    clicks: 1342,
    status: 'approved'
  }
];

export const MOCK_SHOPPERS = [
  {
    id: '1',
    email: 'shopper1@example.com',
    signedUpAt: '2024-11-10T10:30:00Z',
    source: 'hero_cta'
  },
  {
    id: '2',
    email: 'shopper2@example.com',
    signedUpAt: '2024-11-11T14:22:00Z',
    source: 'newsletter_section'
  }
];

export const CATEGORIES = [
  'All',
  'Home',
  'Style',
  'Tech',
  'Beauty',
  'Food',
  'Accessories',
  'Health'
];

export const LANE_CONFIG = {
  openDate: '2025-11-19T00:00:00Z',
  closeDate: '2025-11-30T23:59:59Z',
  status: 'coming_soon', // 'coming_soon', 'open', 'closed'
  seasonName: 'Black Friday 2025',
  merchantSpotLimit: 50
};