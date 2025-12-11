/**
 * Mock Data
 *
 * This lets you develop the frontend without the backend running.
 * Think of it like using plastic food in a restaurant display -
 * it looks real but doesn't require the kitchen to be open.
 */

export const MOCK_MARKETS = [
  {
    id: 1,
    name: "Russo's Italian Market",
    address: "123 Federal Hill, Providence RI",
    type: "Italian Specialty"
  },
  {
    id: 2,
    name: "Atlantic Seafood Co.",
    address: "45 Wharf Street, Newport RI",
    type: "Seafood"
  },
  {
    id: 3,
    name: "Green Valley Organic",
    address: "789 Farm Road, Warwick RI",
    type: "Organic Produce"
  },
  {
    id: 4,
    name: "Bavarian Butcher Shop",
    address: "321 Main St, Cranston RI",
    type: "German Meats"
  },
  {
    id: 5,
    name: "Tokyo Fresh Market",
    address: "567 Hope St, Providence RI",
    type: "Japanese Specialty"
  },
];

export const MOCK_LEADERBOARD = [
  { id: 1, score: 9.2 },
  { id: 5, score: 8.9 },
  { id: 2, score: 8.7 },
  { id: 3, score: 8.4 },
  { id: 4, score: 8.1 },
];

export const MOCK_USER = {
  id: 1,
  username: "foodie_zach",
  email: "zach@example.com",
  email_verified: true,
  role: "user"
};

export const MOCK_FOLLOWING = [
  { id: 2, username: 'chef_maria', displayName: 'Maria Chen' },
  { id: 3, username: 'meat_master', displayName: 'Tom Wilson' },
];

export const MOCK_FOLLOWED_MARKETS = [1, 3];

// Premium color palette for market types
// Using sophisticated, muted tones for an upscale aesthetic
export const MARKET_TYPE_COLORS = {
  'Italian Specialty': {
    bg: '#fef7ed',
    accent: '#c2410c',  // Warm terracotta
  },
  'Seafood': {
    bg: '#f0f9ff',
    accent: '#0369a1',  // Deep ocean blue
  },
  'Organic Produce': {
    bg: '#f0fdf4',
    accent: '#15803d',  // Forest green
  },
  'German Meats': {
    bg: '#fef2f2',
    accent: '#b91c1c',  // Rich burgundy
  },
  'Japanese Specialty': {
    bg: '#fdf4ff',
    accent: '#a21caf',  // Plum purple
  },
  'default': {
    bg: '#f5f5f4',
    accent: '#57534e',  // Warm gray
  },
};

// Placeholder image patterns for market types
// These create beautiful gradient/pattern backgrounds
export const MARKET_IMAGES = {
  'Italian Specialty': 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&h=200&fit=crop',
  'Seafood': 'https://images.unsplash.com/photo-1534604973900-c43ab4c2e0ab?w=400&h=200&fit=crop',
  'Organic Produce': 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=200&fit=crop',
  'German Meats': 'https://images.unsplash.com/photo-1558030006-450675393462?w=400&h=200&fit=crop',
  'Japanese Specialty': 'https://images.unsplash.com/photo-1580822184713-fc5400e7fe10?w=400&h=200&fit=crop',
  'default': 'https://images.unsplash.com/photo-1488459716781-31db52582fe9?w=400&h=200&fit=crop',
};
