// Species catalog. Render params are shared by the phone (SVG) and the Mac (Canvas).
// shape: round | pointed | heart | long | ruffle | cup | trumpet | spike | ball
export const FLOWERS = [
  { id: 'rose', name: 'Rose', emoji: '🌹', shape: 'round', petals: 5, layers: 3, color: '#e8325a', color2: '#ff7d98', center: '#b0183d', meaning: 'love' },
  { id: 'tulip', name: 'Tulip', emoji: '🌷', shape: 'cup', petals: 3, layers: 1, color: '#ff5f8f', color2: '#ffb3c9', center: '#ff5f8f', meaning: 'perfect love' },
  { id: 'lily', name: 'Lily', emoji: '🪷', shape: 'trumpet', petals: 6, layers: 1, color: '#ffffff', color2: '#ffc6d9', center: '#e9a23b', meaning: 'devotion' },
  { id: 'carnation', name: 'Carnation', emoji: '💮', shape: 'ruffle', petals: 9, layers: 3, color: '#ff6f91', color2: '#ffd1dc', center: '#ff6f91', meaning: 'admiration' },
  { id: 'sunflower', name: 'Sunflower', emoji: '🌻', shape: 'long', petals: 18, layers: 1, color: '#ffc21a', color2: '#ffe27a', center: '#6b3d1e', meaning: 'adoration' },
  { id: 'daisy', name: 'Daisy', emoji: '🌼', shape: 'long', petals: 14, layers: 1, color: '#ffffff', color2: '#fff3d6', center: '#ffcc33', meaning: 'innocence' },
  { id: 'orchid', name: 'Orchid', emoji: '🌸', shape: 'pointed', petals: 5, layers: 1, color: '#c56be8', color2: '#f1c7ff', center: '#7e2aa8', meaning: 'luxury' },
  { id: 'lavender', name: 'Lavender', emoji: '💜', shape: 'spike', petals: 14, layers: 1, color: '#9b7be6', color2: '#c9b6ff', center: '#9b7be6', meaning: 'calm' },
  { id: 'peony', name: 'Peony', emoji: '🌸', shape: 'round', petals: 7, layers: 4, color: '#ff8fb1', color2: '#ffd6e3', center: '#ffb1c8', meaning: 'romance' },
  { id: 'cherry', name: 'Cherry Blossom', emoji: '🌸', shape: 'heart', petals: 5, layers: 1, color: '#ffc0d3', color2: '#fff0f5', center: '#e2456f', meaning: 'new beginnings' },
  { id: 'lotus', name: 'Lotus', emoji: '🪷', shape: 'pointed', petals: 8, layers: 2, color: '#ff9ec0', color2: '#fff0f6', center: '#ffd45e', meaning: 'purity' },
  { id: 'hibiscus', name: 'Hibiscus', emoji: '🌺', shape: 'round', petals: 5, layers: 1, color: '#ff3d5e', color2: '#ff9a6b', center: '#8a0f2c', meaning: 'delicate beauty' },
  { id: 'marigold', name: 'Marigold', emoji: '🏵️', shape: 'ruffle', petals: 12, layers: 3, color: '#ff9a1f', color2: '#ffd36b', center: '#d96a00', meaning: 'warmth' },
  { id: 'daffodil', name: 'Daffodil', emoji: '🌼', shape: 'trumpet', petals: 6, layers: 1, color: '#ffe14d', color2: '#fff3a8', center: '#ff9f1c', meaning: 'new joy' },
  { id: 'jasmine', name: 'Jasmine', emoji: '🤍', shape: 'pointed', petals: 5, layers: 1, color: '#ffffff', color2: '#f4fff0', center: '#f1e7a6', meaning: 'sweetness' },
  { id: 'poppy', name: 'Poppy', emoji: '🌺', shape: 'round', petals: 4, layers: 1, color: '#ff4b2b', color2: '#ff8a5c', center: '#1d1d2b', meaning: 'remembrance' },
  { id: 'iris', name: 'Iris', emoji: '💙', shape: 'pointed', petals: 6, layers: 1, color: '#5b6cff', color2: '#b7c0ff', center: '#ffd23f', meaning: 'hope' },
  { id: 'hydrangea', name: 'Hydrangea', emoji: '💐', shape: 'ball', petals: 22, layers: 1, color: '#7fb2ff', color2: '#c7a6ff', center: '#7fb2ff', meaning: 'gratitude' },
  { id: 'dahlia', name: 'Dahlia', emoji: '🏵️', shape: 'pointed', petals: 12, layers: 3, color: '#d6336c', color2: '#ff9ab8', center: '#ffd23f', meaning: 'forever yours' },
  { id: 'camellia', name: 'Camellia', emoji: '🌹', shape: 'round', petals: 8, layers: 3, color: '#f0567a', color2: '#ffc2d1', center: '#ffd23f', meaning: 'longing' },
  { id: 'forgetmenot', name: 'Forget-me-not', emoji: '💠', shape: 'round', petals: 5, layers: 1, color: '#6ec6ff', color2: '#bfe6ff', center: '#ffe066', meaning: "don't forget me" },
  { id: 'gerbera', name: 'Gerbera', emoji: '🌼', shape: 'long', petals: 22, layers: 2, color: '#ff6b4a', color2: '#ffb199', center: '#5a2d16', meaning: 'cheerfulness' },
  { id: 'magnolia', name: 'Magnolia', emoji: '🤍', shape: 'cup', petals: 3, layers: 1, color: '#fff2f6', color2: '#f7a8c4', center: '#fff2f6', meaning: 'dignity' },
  { id: 'morningglory', name: 'Morning Glory', emoji: '💜', shape: 'trumpet', petals: 5, layers: 1, color: '#7a5cff', color2: '#e0d8ff', center: '#fff7c2', meaning: 'affection' },
];

export const byId = Object.fromEntries(FLOWERS.map((f) => [f.id, f]));
