/**
 * WooFarm - Crop Data Definitions
 * All crop types available in the game with growth, pricing, and season info.
 */
window.CROP_DATA = {

  // ── Spring Crops ──────────────────────────────────────────────────────

  turnip: {
    id: 'turnip',
    name: 'Turnip',
    emoji: '🥬',
    seasons: ['spring'],
    seedPrice: 50,
    sellPrice: 80,
    growthStages: 4,
    growthTime: 6,
    waterNeeded: true,
    description: 'A quick-growing root vegetable. Perfect for new farmers.',
    category: 'vegetable',
    exp: 8
  },

  potato: {
    id: 'potato',
    name: 'Potato',
    emoji: '🥔',
    seasons: ['spring'],
    seedPrice: 80,
    sellPrice: 130,
    growthStages: 4,
    growthTime: 8,
    waterNeeded: true,
    description: 'A hearty tuber that thrives in cool spring soil.',
    category: 'vegetable',
    exp: 12
  },

  strawberry: {
    id: 'strawberry',
    name: 'Strawberry',
    emoji: '🍓',
    seasons: ['spring'],
    seedPrice: 120,
    sellPrice: 200,
    growthStages: 4,
    growthTime: 10,
    waterNeeded: true,
    description: 'Sweet red berries beloved by everyone in the village.',
    category: 'fruit',
    exp: 18
  },

  tulip: {
    id: 'tulip',
    name: 'Tulip',
    emoji: '🌷',
    seasons: ['spring'],
    seedPrice: 40,
    sellPrice: 70,
    growthStages: 4,
    growthTime: 5,
    waterNeeded: true,
    description: 'A colorful flower that brightens any farm.',
    category: 'flower',
    exp: 6
  },

  cauliflower: {
    id: 'cauliflower',
    name: 'Cauliflower',
    emoji: '🥦',
    seasons: ['spring'],
    seedPrice: 100,
    sellPrice: 170,
    growthStages: 4,
    growthTime: 12,
    waterNeeded: true,
    description: 'A prized spring vegetable that takes patience to grow.',
    category: 'vegetable',
    exp: 16
  },

  // ── Summer Crops ──────────────────────────────────────────────────────

  tomato: {
    id: 'tomato',
    name: 'Tomato',
    emoji: '🍅',
    seasons: ['summer'],
    seedPrice: 60,
    sellPrice: 100,
    growthStages: 4,
    growthTime: 7,
    waterNeeded: true,
    description: 'Juicy red fruit that loves the summer sun.',
    category: 'fruit',
    exp: 10
  },

  corn: {
    id: 'corn',
    name: 'Corn',
    emoji: '🌽',
    seasons: ['summer'],
    seedPrice: 100,
    sellPrice: 180,
    growthStages: 4,
    growthTime: 11,
    waterNeeded: true,
    description: 'Tall golden stalks that sway in the summer breeze.',
    category: 'grain',
    exp: 15
  },

  melon: {
    id: 'melon',
    name: 'Melon',
    emoji: '🍈',
    seasons: ['summer'],
    seedPrice: 150,
    sellPrice: 300,
    growthStages: 4,
    growthTime: 14,
    waterNeeded: true,
    description: 'A premium summer fruit. Takes time but worth the wait.',
    category: 'fruit',
    exp: 24
  },

  sunflower: {
    id: 'sunflower',
    name: 'Sunflower',
    emoji: '🌻',
    seasons: ['summer'],
    seedPrice: 80,
    sellPrice: 140,
    growthStages: 4,
    growthTime: 9,
    waterNeeded: true,
    description: 'A towering golden bloom that follows the sun.',
    category: 'flower',
    exp: 12
  },

  blueberry: {
    id: 'blueberry',
    name: 'Blueberry',
    emoji: '🫐',
    seasons: ['summer'],
    seedPrice: 90,
    sellPrice: 160,
    growthStages: 4,
    growthTime: 10,
    waterNeeded: true,
    description: 'Tiny but packed with flavor. A summer staple.',
    category: 'fruit',
    exp: 14
  },

  // ── Fall Crops ────────────────────────────────────────────────────────

  pumpkin: {
    id: 'pumpkin',
    name: 'Pumpkin',
    emoji: '🎃',
    seasons: ['fall'],
    seedPrice: 120,
    sellPrice: 250,
    growthStages: 4,
    growthTime: 13,
    waterNeeded: true,
    description: 'The king of fall. Grows large and sells for a fortune.',
    category: 'vegetable',
    exp: 22
  },

  carrot: {
    id: 'carrot',
    name: 'Carrot',
    emoji: '🥕',
    seasons: ['fall'],
    seedPrice: 40,
    sellPrice: 65,
    growthStages: 4,
    growthTime: 5,
    waterNeeded: true,
    description: 'A crunchy orange root vegetable. Quick and reliable.',
    category: 'vegetable',
    exp: 6
  },

  grape: {
    id: 'grape',
    name: 'Grape',
    emoji: '🍇',
    seasons: ['fall'],
    seedPrice: 100,
    sellPrice: 190,
    growthStages: 4,
    growthTime: 11,
    waterNeeded: true,
    description: 'Lush purple clusters perfect for wine or eating fresh.',
    category: 'fruit',
    exp: 16
  },

  eggplant: {
    id: 'eggplant',
    name: 'Eggplant',
    emoji: '🍆',
    seasons: ['fall'],
    seedPrice: 70,
    sellPrice: 120,
    growthStages: 4,
    growthTime: 8,
    waterNeeded: true,
    description: 'A glossy purple vegetable with a mild, earthy taste.',
    category: 'vegetable',
    exp: 10
  },

  sweet_potato: {
    id: 'sweet_potato',
    name: 'Sweet Potato',
    emoji: '🍠',
    seasons: ['fall'],
    seedPrice: 60,
    sellPrice: 100,
    growthStages: 4,
    growthTime: 7,
    waterNeeded: true,
    description: 'A sweet and starchy root that thrives in autumn.',
    category: 'vegetable',
    exp: 9
  },

  // ── Winter Crops ──────────────────────────────────────────────────────

  winter_radish: {
    id: 'winter_radish',
    name: 'Winter Radish',
    emoji: '🫒',
    seasons: ['winter'],
    seedPrice: 80,
    sellPrice: 130,
    growthStages: 4,
    growthTime: 10,
    waterNeeded: false,
    description: 'A hardy radish that can survive the cold. Needs no water in snow.',
    category: 'vegetable',
    exp: 14
  },

  holly: {
    id: 'holly',
    name: 'Holly',
    emoji: '❄️',
    seasons: ['winter'],
    seedPrice: 60,
    sellPrice: 100,
    growthStages: 4,
    growthTime: 8,
    waterNeeded: false,
    description: 'A festive winter plant with bright red berries.',
    category: 'flower',
    exp: 10
  },

  // ── All-Season Crops ──────────────────────────────────────────────────

  wheat: {
    id: 'wheat',
    name: 'Wheat',
    emoji: '🌾',
    seasons: ['spring', 'summer', 'fall', 'winter'],
    seedPrice: 30,
    sellPrice: 50,
    growthStages: 4,
    growthTime: 6,
    waterNeeded: true,
    description: 'A versatile grain that grows year-round. A farmer\'s staple.',
    category: 'grain',
    exp: 5
  }
};
