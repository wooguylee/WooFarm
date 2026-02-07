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
    price: 20,
    category: 'fence',
    size: { w: 1, h: 1 },
    description: 'A simple wooden fence post. Keeps things tidy.',
    unlockLevel: 1,
    effects: null
  },
  stone_fence: {
    id: 'stone_fence',
    name: 'Stone Fence',
    emoji: '🧱',
    price: 50,
    category: 'fence',
    size: { w: 1, h: 1 },
    description: 'A sturdy stone fence. Built to last.',
    unlockLevel: 5,
    effects: null
  },

  // ── Paths ─────────────────────────────────────────────────────────────

  dirt_path: {
    id: 'dirt_path',
    name: 'Dirt Path',
    emoji: '🟫',
    price: 5,
    category: 'path',
    size: { w: 1, h: 1 },
    description: 'A worn dirt path. Cheap and functional.',
    unlockLevel: 1,
    effects: null
  },
  stone_path: {
    id: 'stone_path',
    name: 'Stone Path',
    emoji: '⬜',
    price: 15,
    category: 'path',
    size: { w: 1, h: 1 },
    description: 'A neatly laid stone path for your farm.',
    unlockLevel: 3,
    effects: null
  },

  // ── Nature ────────────────────────────────────────────────────────────

  flower_bed: {
    id: 'flower_bed',
    name: 'Flower Bed',
    emoji: '🌸',
    price: 80,
    category: 'nature',
    size: { w: 2, h: 1 },
    description: 'A colorful bed of flowers. Bees love it.',
    unlockLevel: 3,
    effects: { happiness_boost: 2 }
  },
  pond: {
    id: 'pond',
    name: 'Pond',
    emoji: '💧',
    price: 500,
    category: 'nature',
    size: { w: 3, h: 3 },
    description: 'A tranquil pond. Animals nearby are happier.',
    unlockLevel: 8,
    effects: { happiness_boost: 5 }
  },
  fruit_tree: {
    id: 'fruit_tree',
    name: 'Fruit Tree',
    emoji: '🌳',
    price: 300,
    category: 'nature',
    size: { w: 2, h: 2 },
    description: 'A fruit-bearing tree. Produces seasonal fruit over time.',
    unlockLevel: 7,
    effects: { passive_income: 10 }
  },
  oak_tree: {
    id: 'oak_tree',
    name: 'Oak Tree',
    emoji: '🌲',
    price: 150,
    category: 'nature',
    size: { w: 2, h: 2 },
    description: 'A mighty oak tree that provides shade.',
    unlockLevel: 4,
    effects: null
  },
  pine_tree: {
    id: 'pine_tree',
    name: 'Pine Tree',
    emoji: '🎄',
    price: 120,
    category: 'nature',
    size: { w: 2, h: 2 },
    description: 'An evergreen pine. Looks great in winter.',
    unlockLevel: 4,
    effects: null
  },
  flower_pot: {
    id: 'flower_pot',
    name: 'Flower Pot',
    emoji: '🪴',
    price: 40,
    category: 'nature',
    size: { w: 1, h: 1 },
    description: 'A small potted plant. Adds charm to any corner.',
    unlockLevel: 2,
    effects: null
  },

  // ── Furniture & Objects ───────────────────────────────────────────────

  bench: {
    id: 'bench',
    name: 'Bench',
    emoji: '🪑',
    price: 100,
    category: 'furniture',
    size: { w: 2, h: 1 },
    description: 'A wooden bench. Sit down and admire your farm.',
    unlockLevel: 3,
    effects: null
  },
  lamppost: {
    id: 'lamppost',
    name: 'Lamppost',
    emoji: '🏮',
    price: 120,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'Lights up the farm at night. Warm and inviting.',
    unlockLevel: 5,
    effects: null
  },
  mailbox: {
    id: 'mailbox',
    name: 'Mailbox',
    emoji: '📫',
    price: 60,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'Check daily for letters and special offers.',
    unlockLevel: 1,
    effects: null
  },
  signpost: {
    id: 'signpost',
    name: 'Signpost',
    emoji: '🪧',
    price: 30,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'A wooden sign. Customize it with your own message.',
    unlockLevel: 1,
    effects: null
  },
  garden_gnome: {
    id: 'garden_gnome',
    name: 'Garden Gnome',
    emoji: '🧙',
    price: 200,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'A jolly gnome that watches over your garden. Slightly magical.',
    unlockLevel: 6,
    effects: { luck: 0.05 }
  },
  birdbath: {
    id: 'birdbath',
    name: 'Birdbath',
    emoji: '🐦',
    price: 90,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'Attracts songbirds to your farm.',
    unlockLevel: 4,
    effects: { happiness_boost: 1 }
  },
  hay_bale: {
    id: 'hay_bale',
    name: 'Hay Bale',
    emoji: '🟨',
    price: 25,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'A bale of hay. Rustic decoration or animal bedding.',
    unlockLevel: 2,
    effects: null
  },
  stone_lantern: {
    id: 'stone_lantern',
    name: 'Stone Lantern',
    emoji: '🏯',
    price: 180,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'An elegant stone lantern. Adds a zen atmosphere.',
    unlockLevel: 8,
    effects: null
  },
  flag: {
    id: 'flag',
    name: 'Flag',
    emoji: '🚩',
    price: 40,
    category: 'furniture',
    size: { w: 1, h: 1 },
    description: 'A colorful flag to mark your territory.',
    unlockLevel: 2,
    effects: null
  },

  // ── Buildings & Structures ────────────────────────────────────────────

  windmill: {
    id: 'windmill',
    name: 'Windmill',
    emoji: '🏗️',
    price: 2000,
    category: 'building',
    size: { w: 3, h: 3 },
    description: 'A grand windmill. Grinds grain and boosts crop value by 10%.',
    unlockLevel: 10,
    effects: { sell_bonus: 0.1 }
  },
  scarecrow: {
    id: 'scarecrow',
    name: 'Scarecrow',
    emoji: '🎃',
    price: 150,
    category: 'building',
    size: { w: 1, h: 1 },
    description: 'Protects nearby crops from crows and pests.',
    unlockLevel: 3,
    effects: { pest_protection: 1.0 }
  },
  greenhouse: {
    id: 'greenhouse',
    name: 'Greenhouse',
    emoji: '🏠',
    price: 5000,
    category: 'building',
    size: { w: 4, h: 4 },
    description: 'Grow any crop regardless of season inside the greenhouse.',
    unlockLevel: 15,
    effects: { season_override: 1.0 }
  },
  well: {
    id: 'well',
    name: 'Well',
    emoji: '🪣',
    price: 1500,
    category: 'building',
    size: { w: 2, h: 2 },
    description: 'Automatically waters adjacent crops each morning.',
    unlockLevel: 8,
    effects: { auto_water: 3 }
  },
  barn_upgrade: {
    id: 'barn_upgrade',
    name: 'Barn Upgrade',
    emoji: '🏚️',
    price: 3000,
    category: 'building',
    size: { w: 4, h: 3 },
    description: 'Expands animal capacity and improves happiness retention.',
    unlockLevel: 12,
    effects: { animal_capacity: 4 }
  },
  silo: {
    id: 'silo',
    name: 'Silo',
    emoji: '🏛️',
    price: 2500,
    category: 'building',
    size: { w: 2, h: 2 },
    description: 'Stores extra feed and grain. Reduces feed costs by 15%.',
    unlockLevel: 10,
    effects: { feed_discount: 0.15 }
  },
  beehive: {
    id: 'beehive',
    name: 'Beehive',
    emoji: '🐝',
    price: 800,
    category: 'building',
    size: { w: 1, h: 1 },
    description: 'Houses bees that produce honey and speed up nearby flower growth.',
    unlockLevel: 7,
    effects: { growth_speed: 0.1 }
  },
  archway: {
    id: 'archway',
    name: 'Archway',
    emoji: '🏛️',
    price: 400,
    category: 'building',
    size: { w: 2, h: 1 },
    description: 'A decorative archway. Perfect farm entrance.',
    unlockLevel: 6,
    effects: null
  },
  bridge: {
    id: 'bridge',
    name: 'Bridge',
    emoji: '🌉',
    price: 600,
    category: 'building',
    size: { w: 3, h: 1 },
    description: 'A wooden bridge to cross streams or connect farm areas.',
    unlockLevel: 7,
    effects: null
  },

  // ── Vehicles & Equipment ──────────────────────────────────────────────

  wagon: {
    id: 'wagon',
    name: 'Wagon',
    emoji: '🛒',
    price: 500,
    category: 'furniture',
    size: { w: 2, h: 1 },
    description: 'A rustic wagon. Increases inventory capacity by 10 slots.',
    unlockLevel: 6,
    effects: { inventory_bonus: 10 }
