/**
 * WooFarm - Decoration Data Definitions
 * All placeable decorations with costs, sizes, unlock levels, and bonus effects.
 */
window.DECORATION_DATA = {

  // ── Fences ────────────────────────────────────────────────────────────

  wooden_fence: {
    id: 'wooden_fence',
    name: 'Wooden Fence',
    emoji: '🪵',
    buyPrice: 20,
    category: 'fence',
    size: { w: 1, h: 1 },
    description: 'A simple wooden fence post. Keeps things tidy.',
    unlockLevel: 1,
    effect: null
  },
  stone_fence: {
    id: 'stone_fence',
    name: 'Stone Fence',
    emoji: '🧱',
    buyPrice: 50,
    category: 'fence',
    size: { w: 1, h: 1 },
    description: 'A sturdy stone fence. Built to last.',
    unlockLevel: 5,
    effect: null
  },

  // ── Paths ─────────────────────────────────────────────────────────────

  dirt_path: {
    id: 'dirt_path',
    name: 'Dirt Path',
    emoji: '🟫',
    buyPrice: 5,
    category: 'path',
    size: { w: 1, h: 1 },
    description: 'A worn dirt path. Cheap and functional.',
    unlockLevel: 1,
    effect: null
  },
  stone_path: {
    id: 'stone_path',
    name: 'Stone Path',
    emoji: '⬜',
    buyPrice: 15,
    category: 'path',
    size: { w: 1, h: 1 },
    description: 'A neatly laid stone path for your farm.',
    unlockLevel: 3,
    effect: null
  },

  // ── Nature ────────────────────────────────────────────────────────────

  flower_bed: {
    id: 'flower_bed',
    name: 'Flower Bed',
    emoji: '🌸',
    buyPrice: 80,
    category: 'nature',
    size: { w: 2, h: 1 },
    description: 'A colorful bed of flowers. Bees love it.',
    unlockLevel: 3,
    effect: { type: 'happiness_boost', value: 2 }
  },
  pond: {
    id: 'pond',
    name: 'Pond',
    emoji: '💧',
    buyPrice: 500,
    category: 'nature',
    size: { w: 3, h: 3 },
    description: 'A tranquil pond. Animals nearby are happier.',
    unlockLevel: 8,
    effect: { type: 'happiness_boost', value: 5 }
  },
  fruit_tree: {
    id: 'fruit_tree',
    name: 'Fruit Tree',
    emoji: '🌳',
    buyPrice: 300,
    category: 'nature',
    size: { w: 2, h: 2 },
    description: 'A fruit-bearing tree. Produces seasonal fruit over time.',
    unlockLevel: 7,
    effect: { type: 'passive_income', value: 10 }
  },
  oak_tree: {
    id: 'oak_tree',
    name: 'Oak Tree',
    emoji: '🌲',
    buyPrice: 150,
    category: 'nature',
    size: { w: 2, h: 2 },
    description: 'A mighty oak tree that provides shade.',
    unlockLevel: 4,
    effect: null
  },
  pine_tree: {
    id: 'pine_tree',
    name: 'Pine Tree',
    emoji: '🎄',
    buyPrice: 120,
    category: 'nature',
    size: { w: 2, h: 2 },
    description: 'An evergreen pine. Looks great in winter.',
    unlockLevel: 4,
    effect: null
  },
  flower_pot: {
    id: 'flower_pot',
    name: 'Flower Pot',
    emoji: '🪴',
    buyPrice: 40,
    category: 'nature',
    size: { w: 1, h: 1 },
    description: 'A small potted plant. Adds charm to any corner.',
    unlockLevel: 2,
    effect: null
  },

  // ── Furniture & Objects ───────────────────────────────────────────────

  bench: {
    id: 'bench',
    name: 'Bench',
    emoji: '🪑',
    buyPrice: 100,
    category: 'furniture',
    size: { w: 2, h: 1 },
    description: 'A wooden bench. Sit down and admire your farm.',
    unlockLevel: 3,
    effect: null
  },
  lamppost: {
    id: 'lamppost',
    name: 'Lamppost',
    emoji: '🏮',
    buyPrice: 120,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'Lights up the farm at night. Warm and inviting.',
    unlockLevel: 5,
    effect: null
  },
  mailbox: {
    id: 'mailbox',
    name: 'Mailbox',
    emoji: '📫',
    buyPrice: 60,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'Check daily for letters and special offers.',
    unlockLevel: 1,
    effect: null
  },
  signpost: {
    id: 'signpost',
    name: 'Signpost',
    emoji: '🪧',
    buyPrice: 30,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'A wooden sign. Customize it with your own message.',
    unlockLevel: 1,
    effect: null
  },
  garden_gnome: {
    id: 'garden_gnome',
    name: 'Garden Gnome',
    emoji: '🧙',
    buyPrice: 200,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'A jolly gnome that watches over your garden. Slightly magical.',
    unlockLevel: 6,
    effect: { type: 'luck', value: 0.05 }
  },
  birdbath: {
    id: 'birdbath',
    name: 'Birdbath',
    emoji: '🐦',
    buyPrice: 90,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'Attracts songbirds to your farm.',
    unlockLevel: 4,
    effect: { type: 'happiness_boost', value: 1 }
  },
  hay_bale: {
    id: 'hay_bale',
    name: 'Hay Bale',
    emoji: '🟨',
    buyPrice: 25,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'A bale of hay. Rustic decoration or animal bedding.',
    unlockLevel: 2,
    effect: null
  },
  stone_lantern: {
    id: 'stone_lantern',
    name: 'Stone Lantern',
    emoji: '🏯',
    buyPrice: 180,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'An elegant stone lantern. Adds a zen atmosphere.',
    unlockLevel: 8,
    effect: null
  },
  flag: {
    id: 'flag',
    name: 'Flag',
    emoji: '🚩',
    buyPrice: 40,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'A colorful flag to mark your territory.',
    unlockLevel: 2,
    effect: null
  },

  // ── Buildings & Structures ────────────────────────────────────────────

  windmill: {
    id: 'windmill',
    name: 'Windmill',
    emoji: '🏗️',
    buyPrice: 2000,
    category: 'building',
    size: { w: 3, h: 3 },
    description: 'A grand windmill. Grinds grain and boosts crop value by 10%.',
    unlockLevel: 10,
    effect: { type: 'sell_bonus', value: 0.1 }
  },
  scarecrow: {
    id: 'scarecrow',
    name: 'Scarecrow',
    emoji: '🎃',
    buyPrice: 150,
    category: 'building',
    size: { w: 1, h: 1 },
    description: 'Protects nearby crops from crows and pests.',
    unlockLevel: 3,
    effect: { type: 'pest_protection', value: 1.0 }
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Greenhouse',
    emoji: '🏠',
    buyPrice: 5000,
    category: 'building',
    size: { w: 4, h: 4 },
    description: 'Grow any crop regardless of season inside the greenhouse.',
    unlockLevel: 15,
    effect: { type: 'season_override', value: 1.0 }
  },
  well: {
    id: 'well',
    name: 'Well',
    emoji: '🪣',
    buyPrice: 1500,
    category: 'building',
    size: { w: 2, h: 2 },
    description: 'Automatically waters adjacent crops each morning.',
    unlockLevel: 8,
    effect: { type: 'auto_water', value: 3 }
  },
  barn_upgrade: {
    id: 'barn_upgrade',
    name: 'Barn Upgrade',
    emoji: '🏚️',
    buyPrice: 3000,
    category: 'building',
    size: { w: 4, h: 3 },
    description: 'Expands animal capacity and improves happiness retention.',
    unlockLevel: 12,
    effect: { type: 'animal_capacity', value: 4 }
  },
  silo: {
    id: 'silo',
    name: 'Silo',
    emoji: '🏛️',
    buyPrice: 2500,
    category: 'building',
    size: { w: 2, h: 2 },
    description: 'Stores extra feed and grain. Reduces feed costs by 15%.',
    unlockLevel: 10,
    effect: { type: 'feed_discount', value: 0.15 }
  },
  beehive: {
    id: 'beehive',
    name: 'Beehive',
    emoji: '🐝',
    buyPrice: 800,
    category: 'building',
    size: { w: 1, h: 1 },
    description: 'Houses bees that produce honey and speed up nearby flower growth.',
    unlockLevel: 7,
    effect: { type: 'growth_speed', value: 0.1 }
  },
  archway: {
    id: 'archway',
    name: 'Archway',
    emoji: '🏛️',
    buyPrice: 400,
    category: 'building',
    size: { w: 2, h: 1 },
    description: 'A decorative archway. Perfect farm entrance.',
    unlockLevel: 6,
    effect: null
  },
  bridge: {
    id: 'bridge',
    name: 'Bridge',
    emoji: '🌉',
    buyPrice: 600,
    category: 'building',
    size: { w: 3, h: 1 },
    description: 'A wooden bridge to cross streams or connect farm areas.',
    unlockLevel: 7,
    effect: null
  },

  // ── Vehicles & Equipment ──────────────────────────────────────────────

  wagon: {
    id: 'wagon',
    name: 'Wagon',
    emoji: '🛒',
    buyPrice: 500,
    category: 'furniture',
    size: { w: 2, h: 1 },
    description: 'A rustic wagon. Increases inventory capacity by 10 slots.',
    unlockLevel: 6,
    effect: { type: 'inventory_bonus', value: 10 }
  },
  tractor: {
    id: 'tractor',
    name: 'Tractor',
    emoji: '🚜',
    buyPrice: 8000,
    category: 'building',
    size: { w: 2, h: 2 },
    description: 'A powerful tractor. Tills soil 3x faster in a wide area.',
    unlockLevel: 18,
    effect: { type: 'till_speed', value: 3.0 }
  },
  weather_vane: {
    id: 'weather_vane',
    name: 'Weather Vane',
    emoji: '🌬️',
    buyPrice: 250,
    category: 'building',
    size: { w: 1, h: 1 },
    description: 'Predicts tomorrow\'s weather so you can plan ahead.',
    unlockLevel: 5,
    effect: { type: 'weather_forecast', value: 1 }
  },

  // ── Seasonal Decorations ──────────────────────────────────────────────

  spring_wreath: {
    id: 'spring_wreath',
    name: 'Spring Wreath',
    emoji: '💐',
    buyPrice: 100,
    category: 'seasonal',
    size: { w: 1, h: 1 },
    description: 'A floral wreath celebrating the spring season.',
    unlockLevel: 2,
    effect: { type: 'growth_speed', value: 0.05 }
  },
  summer_banner: {
    id: 'summer_banner',
    name: 'Summer Banner',
    emoji: '☀️',
    buyPrice: 100,
    category: 'seasonal',
    size: { w: 1, h: 1 },
    description: 'A sun-bleached banner for the hot summer months.',
    unlockLevel: 2,
    effect: { type: 'growth_speed', value: 0.05 }
  },
  fall_scarecrow: {
    id: 'fall_scarecrow',
    name: 'Harvest Scarecrow',
    emoji: '🧣',
    buyPrice: 100,
    category: 'seasonal',
    size: { w: 1, h: 1 },
    description: 'A festive scarecrow dressed in autumn colors.',
    unlockLevel: 2,
    effect: { type: 'growth_speed', value: 0.05 }
  },
  winter_snowman: {
    id: 'winter_snowman',
    name: 'Snowman',
    emoji: '⛄',
    buyPrice: 100,
    category: 'seasonal',
    size: { w: 1, h: 1 },
    description: 'A cheerful snowman that brightens cold winter days.',
    unlockLevel: 2,
    effect: { type: 'happiness_boost', value: 3 }
  }
};
