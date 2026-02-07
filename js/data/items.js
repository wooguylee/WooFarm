/**
 * WooFarm - Item Data Definitions
 * Master catalog of all items: seeds, crops, products, tools, and more.
 */
window.ITEM_DATA = {

  // ── Seeds ─────────────────────────────────────────────────────────────

  turnip_seed: {
    id: 'turnip_seed',
    name: 'Turnip Seeds',
    emoji: '🟢',
    type: 'seed',
    buyPrice: 50,
    sellPrice: 10,
    stackable: true,
    maxStack: 99,
    description: 'Spring seeds. Plant these to grow turnips.',
    rarity: 'common'
  },
  potato_seed: {
    id: 'potato_seed',
    name: 'Potato Seeds',
    emoji: '🟤',
    type: 'seed',
    buyPrice: 80,
    sellPrice: 15,
    stackable: true,
    maxStack: 99,
    description: 'Spring seeds. Grows into hearty potatoes.',
    rarity: 'common'
  },
  strawberry_seed: {
    id: 'strawberry_seed',
    name: 'Strawberry Seeds',
    emoji: '🔴',
    type: 'seed',
    buyPrice: 120,
    sellPrice: 25,
    stackable: true,
    maxStack: 99,
    description: 'Spring seeds. Grows sweet strawberries.',
    rarity: 'uncommon'
  },
  tulip_seed: {
    id: 'tulip_seed',
    name: 'Tulip Seeds',
    emoji: '🩷',
    type: 'seed',
    buyPrice: 40,
    sellPrice: 8,
    stackable: true,
    maxStack: 99,
    description: 'Spring seeds. Blooms into a colorful tulip.',
    rarity: 'common'
  },
  cauliflower_seed: {
    id: 'cauliflower_seed',
    name: 'Cauliflower Seeds',
    emoji: '⚪',
    type: 'seed',
    buyPrice: 100,
    sellPrice: 20,
    stackable: true,
    maxStack: 99,
    description: 'Spring seeds. Grows a prized cauliflower head.',
    rarity: 'uncommon'
  },
  tomato_seed: {
    id: 'tomato_seed',
    name: 'Tomato Seeds',
    emoji: '🔴',
    type: 'seed',
    buyPrice: 60,
    sellPrice: 12,
    stackable: true,
    maxStack: 99,
    description: 'Summer seeds. Grows juicy red tomatoes.',
    rarity: 'common'
  },
  corn_seed: {
    id: 'corn_seed',
    name: 'Corn Seeds',
    emoji: '🟡',
    type: 'seed',
    buyPrice: 100,
    sellPrice: 20,
    stackable: true,
    maxStack: 99,
    description: 'Summer seeds. Grows tall golden cornstalks.',
    rarity: 'uncommon'
  },
  melon_seed: {
    id: 'melon_seed',
    name: 'Melon Seeds',
    emoji: '🟢',
    type: 'seed',
    buyPrice: 150,
    sellPrice: 30,
    stackable: true,
    maxStack: 99,
    description: 'Summer seeds. A premium crop worth the wait.',
    rarity: 'rare'
  },
  sunflower_seed: {
    id: 'sunflower_seed',
    name: 'Sunflower Seeds',
    emoji: '🟠',
    type: 'seed',
    buyPrice: 80,
    sellPrice: 15,
    stackable: true,
    maxStack: 99,
    description: 'Summer seeds. Grows a towering golden bloom.',
    rarity: 'common'
  },
  blueberry_seed: {
    id: 'blueberry_seed',
    name: 'Blueberry Seeds',
    emoji: '🔵',
    type: 'seed',
    buyPrice: 90,
    sellPrice: 18,
    stackable: true,
    maxStack: 99,
    description: 'Summer seeds. Tiny berries, big flavor.',
    rarity: 'uncommon'
  },
  pumpkin_seed: {
    id: 'pumpkin_seed',
    name: 'Pumpkin Seeds',
    emoji: '🟠',
    type: 'seed',
    buyPrice: 120,
    sellPrice: 25,
    stackable: true,
    maxStack: 99,
    description: 'Fall seeds. Grows into a massive pumpkin.',
    rarity: 'uncommon'
  },
  carrot_seed: {
    id: 'carrot_seed',
    name: 'Carrot Seeds',
    emoji: '🟠',
    type: 'seed',
    buyPrice: 40,
    sellPrice: 8,
    stackable: true,
    maxStack: 99,
    description: 'Fall seeds. Quick-growing crunchy carrots.',
    rarity: 'common'
  },
  grape_seed: {
    id: 'grape_seed',
    name: 'Grape Seeds',
    emoji: '🟣',
    type: 'seed',
    buyPrice: 100,
    sellPrice: 20,
    stackable: true,
    maxStack: 99,
    description: 'Fall seeds. Grows lush grape clusters.',
    rarity: 'uncommon'
  },
  eggplant_seed: {
    id: 'eggplant_seed',
    name: 'Eggplant Seeds',
    emoji: '🟣',
    type: 'seed',
    buyPrice: 70,
    sellPrice: 14,
    stackable: true,
    maxStack: 99,
    description: 'Fall seeds. Grows glossy purple eggplants.',
    rarity: 'common'
  },
  sweet_potato_seed: {
    id: 'sweet_potato_seed',
    name: 'Sweet Potato Seeds',
    emoji: '🟤',
    type: 'seed',
    buyPrice: 60,
    sellPrice: 12,
    stackable: true,
    maxStack: 99,
    description: 'Fall seeds. A sweet and starchy crop.',
    rarity: 'common'
  },
  winter_radish_seed: {
    id: 'winter_radish_seed',
    name: 'Winter Radish Seeds',
    emoji: '⚪',
    type: 'seed',
    buyPrice: 80,
    sellPrice: 15,
    stackable: true,
    maxStack: 99,
    description: 'Winter seeds. Hardy enough to grow in snow.',
    rarity: 'uncommon'
  },
  holly_seed: {
    id: 'holly_seed',
    name: 'Holly Seeds',
    emoji: '❄️',
    type: 'seed',
    buyPrice: 60,
    sellPrice: 12,
    stackable: true,
    maxStack: 99,
    description: 'Winter seeds. A festive plant with red berries.',
    rarity: 'uncommon'
  },
  wheat_seed: {
    id: 'wheat_seed',
    name: 'Wheat Seeds',
    emoji: '🟡',
    type: 'seed',
    buyPrice: 30,
    sellPrice: 6,
    stackable: true,
    maxStack: 99,
    description: 'All-season seeds. A reliable staple grain.',
    rarity: 'common'
  },

  // ── Harvested Crops ───────────────────────────────────────────────────

  turnip_crop: {
    id: 'turnip_crop',
    name: 'Turnip',
    emoji: '🥬',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 80,
    stackable: true,
    maxStack: 99,
    description: 'A freshly harvested turnip.',
    rarity: 'common'
  },
  potato_crop: {
    id: 'potato_crop',
    name: 'Potato',
    emoji: '🥔',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 130,
    stackable: true,
    maxStack: 99,
    description: 'A hearty potato dug from the earth.',
    rarity: 'common'
  },
  strawberry_crop: {
    id: 'strawberry_crop',
    name: 'Strawberry',
    emoji: '🍓',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 200,
    stackable: true,
    maxStack: 99,
    description: 'Plump, sweet strawberries.',
    rarity: 'uncommon'
  },
  tulip_crop: {
    id: 'tulip_crop',
    name: 'Tulip',
    emoji: '🌷',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 70,
    stackable: true,
    maxStack: 99,
    description: 'A beautiful cut tulip.',
    rarity: 'common'
  },
  cauliflower_crop: {
    id: 'cauliflower_crop',
    name: 'Cauliflower',
    emoji: '🥦',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 170,
    stackable: true,
    maxStack: 99,
    description: 'A large, pristine cauliflower head.',
    rarity: 'uncommon'
  },
  tomato_crop: {
    id: 'tomato_crop',
    name: 'Tomato',
    emoji: '🍅',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 100,
    stackable: true,
    maxStack: 99,
    description: 'A ripe, juicy tomato.',
    rarity: 'common'
  },
  corn_crop: {
    id: 'corn_crop',
    name: 'Corn',
    emoji: '🌽',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 180,
    stackable: true,
    maxStack: 99,
    description: 'A golden ear of corn.',
    rarity: 'uncommon'
  },
  melon_crop: {
    id: 'melon_crop',
    name: 'Melon',
    emoji: '🍈',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 300,
    stackable: true,
    maxStack: 99,
    description: 'A massive, sweet melon.',
    rarity: 'rare'
  },
  sunflower_crop: {
    id: 'sunflower_crop',
    name: 'Sunflower',
    emoji: '🌻',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 140,
    stackable: true,
    maxStack: 99,
    description: 'A vibrant sunflower bloom.',
    rarity: 'common'
  },
  blueberry_crop: {
    id: 'blueberry_crop',
    name: 'Blueberry',
    emoji: '🫐',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 160,
    stackable: true,
    maxStack: 99,
    description: 'A basket of fresh blueberries.',
    rarity: 'uncommon'
  },
  pumpkin_crop: {
    id: 'pumpkin_crop',
    name: 'Pumpkin',
    emoji: '🎃',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 250,
    stackable: true,
    maxStack: 99,
    description: 'A big, round pumpkin.',
    rarity: 'uncommon'
  },
  carrot_crop: {
    id: 'carrot_crop',
    name: 'Carrot',
    emoji: '🥕',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 65,
    stackable: true,
    maxStack: 99,
    description: 'A crunchy orange carrot.',
    rarity: 'common'
  },
  grape_crop: {
    id: 'grape_crop',
    name: 'Grape',
    emoji: '🍇',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 190,
    stackable: true,
    maxStack: 99,
    description: 'A cluster of sweet purple grapes.',
    rarity: 'uncommon'
  },
  eggplant_crop: {
    id: 'eggplant_crop',
    name: 'Eggplant',
    emoji: '🍆',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 120,
    stackable: true,
    maxStack: 99,
    description: 'A shiny, ripe eggplant.',
    rarity: 'common'
  },
  sweet_potato_crop: {
    id: 'sweet_potato_crop',
    name: 'Sweet Potato',
    emoji: '🍠',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 100,
    stackable: true,
    maxStack: 99,
    description: 'A warm, sweet potato fresh from the ground.',
    rarity: 'common'
  },
  winter_radish_crop: {
    id: 'winter_radish_crop',
    name: 'Winter Radish',
    emoji: '🫒',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 130,
    stackable: true,
    maxStack: 99,
    description: 'A crisp radish grown in the cold.',
    rarity: 'uncommon'
  },
  holly_crop: {
    id: 'holly_crop',
    name: 'Holly',
    emoji: '❄️',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 100,
    stackable: true,
    maxStack: 99,
    description: 'A sprig of festive holly.',
    rarity: 'uncommon'
  },
  wheat_crop: {
    id: 'wheat_crop',
    name: 'Wheat',
    emoji: '🌾',
    type: 'crop',
    buyPrice: 0,
    sellPrice: 50,
    stackable: true,
    maxStack: 99,
    description: 'A bundle of golden wheat.',
    rarity: 'common'
  },

  // ── Animal Products ───────────────────────────────────────────────────

  egg: {
    id: 'egg',
    name: 'Egg',
    emoji: '🥚',
    type: 'animal_product',
    buyPrice: 0,
    sellPrice: 30,
    stackable: true,
    maxStack: 99,
    description: 'A fresh chicken egg.',
    rarity: 'common'
  },
  milk: {
    id: 'milk',
    name: 'Milk',
    emoji: '🥛',
    type: 'animal_product',
    buyPrice: 0,
    sellPrice: 100,
    stackable: true,
    maxStack: 99,
    description: 'Rich, creamy cow milk.',
    rarity: 'common'
  },
  wool: {
    id: 'wool',
    name: 'Wool',
    emoji: '🧶',
    type: 'animal_product',
    buyPrice: 0,
    sellPrice: 80,
    stackable: true,
    maxStack: 99,
    description: 'Soft, fluffy sheep wool.',
    rarity: 'common'
  },
  truffle: {
    id: 'truffle',
    name: 'Truffle',
    emoji: '🍄',
    type: 'animal_product',
    buyPrice: 0,
    sellPrice: 200,
    stackable: true,
    maxStack: 99,
    description: 'A rare and valuable truffle found by a pig.',
    rarity: 'rare'
  },
  duck_egg: {
    id: 'duck_egg',
    name: 'Duck Egg',
    emoji: '🥚',
    type: 'animal_product',
    buyPrice: 0,
    sellPrice: 40,
    stackable: true,
    maxStack: 99,
    description: 'A large, rich duck egg.',
    rarity: 'common'
  },
  goat_milk: {
    id: 'goat_milk',
    name: 'Goat Milk',
    emoji: '🥛',
    type: 'animal_product',
    buyPrice: 0,
    sellPrice: 120,
    stackable: true,
    maxStack: 99,
    description: 'Premium goat milk favored by artisan cheesemakers.',
    rarity: 'uncommon'
  },

  // ── Tools ─────────────────────────────────────────────────────────────

  hoe: {
    id: 'hoe',
    name: 'Hoe',
    emoji: '🔨',
    type: 'tool',
    buyPrice: 100,
    sellPrice: 0,
    stackable: false,
    maxStack: 1,
    description: 'Used to till soil for planting crops.',
    rarity: 'common'
  },
  watering_can: {
    id: 'watering_can',
    name: 'Watering Can',
    emoji: '🚿',
    type: 'tool',
    buyPrice: 100,
    sellPrice: 0,
    stackable: false,
    maxStack: 1,
    description: 'Used to water crops so they can grow.',
    rarity: 'common'
  },
  basket: {
    id: 'basket',
    name: 'Basket',
    emoji: '🧺',
    type: 'tool',
    buyPrice: 50,
    sellPrice: 0,
    stackable: false,
    maxStack: 1,
    description: 'Used to harvest ripe crops from the field.',
    rarity: 'common'
  },
  axe: {
    id: 'axe',
    name: 'Axe',
    emoji: '🪓',
    type: 'tool',
    buyPrice: 150,
    sellPrice: 0,
    stackable: false,
    maxStack: 1,
    description: 'Used to chop trees and clear stumps.',
    rarity: 'common'
  },
  pickaxe: {
    id: 'pickaxe',
    name: 'Pickaxe',
    emoji: '⛏️',
    type: 'tool',
    buyPrice: 150,
    sellPrice: 0,
    stackable: false,
    maxStack: 1,
    description: 'Used to break rocks and clear debris.',
    rarity: 'common'
  },

  // ── Feed ──────────────────────────────────────────────────────────────

  chicken_feed: {
    id: 'chicken_feed',
    name: 'Chicken Feed',
    emoji: '🌰',
    type: 'feed',
    buyPrice: 10,
    sellPrice: 2,
    stackable: true,
    maxStack: 99,
    description: 'A day\'s ration for one chicken or duck.',
    rarity: 'common'
  },
  cattle_feed: {
    id: 'cattle_feed',
    name: 'Cattle Feed',
    emoji: '🌿',
    type: 'feed',
    buyPrice: 30,
    sellPrice: 6,
    stackable: true,
    maxStack: 99,
    description: 'A day\'s ration for one cow or goat.',
    rarity: 'common'
  },
  sheep_feed: {
    id: 'sheep_feed',
    name: 'Sheep Feed',
    emoji: '🍃',
    type: 'feed',
    buyPrice: 25,
    sellPrice: 5,
    stackable: true,
    maxStack: 99,
    description: 'A day\'s ration for one sheep.',
    rarity: 'common'
  },
  pig_feed: {
    id: 'pig_feed',
    name: 'Pig Feed',
    emoji: '🥜',
    type: 'feed',
    buyPrice: 40,
    sellPrice: 8,
    stackable: true,
    maxStack: 99,
    description: 'A day\'s ration for one pig.',
    rarity: 'common'
  },
  premium_feed: {
    id: 'premium_feed',
    name: 'Premium Feed',
    emoji: '✨',
    type: 'feed',
    buyPrice: 80,
    sellPrice: 15,
    stackable: true,
    maxStack: 99,
    description: 'High-quality feed. Boosts happiness by 10 extra when used.',
    rarity: 'uncommon'
  },

  // ── Materials ─────────────────────────────────────────────────────────

  wood: {
    id: 'wood',
    name: 'Wood',
    emoji: '🪵',
    type: 'material',
    buyPrice: 20,
    sellPrice: 10,
    stackable: true,
    maxStack: 99,
    description: 'Sturdy lumber used for building and crafting.',
    rarity: 'common'
  },
  stone: {
    id: 'stone',
    name: 'Stone',
    emoji: '🪨',
    type: 'material',
    buyPrice: 25,
    sellPrice: 12,
    stackable: true,
    maxStack: 99,
    description: 'Solid stone used for construction and paths.',
    rarity: 'common'
  },
  iron_ore: {
    id: 'iron_ore',
    name: 'Iron Ore',
    emoji: '⬛',
    type: 'material',
    buyPrice: 60,
    sellPrice: 30,
    stackable: true,
    maxStack: 99,
    description: 'Raw iron ore. Smelt it to upgrade your tools.',
    rarity: 'uncommon'
  },
  copper_ore: {
    id: 'copper_ore',
    name: 'Copper Ore',
    emoji: '🟧',
    type: 'material',
    buyPrice: 40,
    sellPrice: 20,
    stackable: true,
    maxStack: 99,
    description: 'Raw copper ore. The first step to better tools.',
    rarity: 'uncommon'
  },
  gold_ore: {
    id: 'gold_ore',
    name: 'Gold Ore',
    emoji: '🟨',
    type: 'material',
    buyPrice: 150,
    sellPrice: 75,
    stackable: true,
    maxStack: 99,
    description: 'Precious gold ore. Used for the finest tool upgrades.',
    rarity: 'rare'
  },

  // ── Special Items ─────────────────────────────────────────────────────

  fertilizer: {
    id: 'fertilizer',
    name: 'Fertilizer',
    emoji: '💩',
    type: 'material',
    buyPrice: 50,
    sellPrice: 10,
    stackable: true,
    maxStack: 99,
    description: 'Speeds up crop growth by 25% for one stage.',
    rarity: 'common'
  },
  sprinkler: {
    id: 'sprinkler',
    name: 'Sprinkler',
    emoji: '💧',
    type: 'decoration',
    buyPrice: 200,
    sellPrice: 50,
    stackable: true,
    maxStack: 10,
    description: 'Automatically waters adjacent crops each morning.',
    rarity: 'uncommon'
  },
  ancient_seed: {
    id: 'ancient_seed',
    name: 'Ancient Seed',
    emoji: '🌟',
    type: 'seed',
    buyPrice: 0,
    sellPrice: 500,
    stackable: true,
    maxStack: 10,
    description: 'A mysterious seed from a forgotten era. What could it grow?',
    rarity: 'epic'
  },
  golden_egg: {
    id: 'golden_egg',
    name: 'Golden Egg',
    emoji: '🥇',
    type: 'animal_product',
    buyPrice: 0,
    sellPrice: 500,
    stackable: true,
    maxStack: 10,
    description: 'An extraordinarily rare golden egg. A true treasure.',
    rarity: 'epic'
  },
  lucky_clover: {
    id: 'lucky_clover',
    name: 'Lucky Clover',
    emoji: '🍀',
    type: 'material',
    buyPrice: 0,
    sellPrice: 100,
    stackable: true,
    maxStack: 10,
    description: 'A four-leaf clover. Said to bring good fortune to the farm.',
    rarity: 'rare'
  },
  honey: {
    id: 'honey',
    name: 'Honey',
    emoji: '🍯',
    type: 'animal_product',
    buyPrice: 0,
    sellPrice: 90,
    stackable: true,
    maxStack: 99,
    description: 'Sweet golden honey from the beehive.',
    rarity: 'uncommon'
  }
};

/**
 * Tool Upgrade Paths
 * Each tool can be upgraded through 4 tiers, improving efficiency.
 */
window.TOOL_UPGRADES = {
  hoe: [
    { tier: 'basic',  name: 'Basic Hoe',       emoji: '🔨', efficiency: 1.0, cost: 0,    materials: [] },
    { tier: 'copper', name: 'Copper Hoe',       emoji: '🔨', efficiency: 1.5, cost: 500,  materials: [{ item: 'copper_ore', amount: 5 }] },
    { tier: 'iron',   name: 'Iron Hoe',         emoji: '🔨', efficiency: 2.0, cost: 1500, materials: [{ item: 'iron_ore', amount: 5 }] },
    { tier: 'gold',   name: 'Gold Hoe',         emoji: '🔨', efficiency: 3.0, cost: 5000, materials: [{ item: 'gold_ore', amount: 5 }] }
  ],
  watering_can: [
    { tier: 'basic',  name: 'Basic Watering Can',  emoji: '🚿', efficiency: 1.0, cost: 0,    materials: [] },
    { tier: 'copper', name: 'Copper Watering Can',  emoji: '🚿', efficiency: 1.5, cost: 500,  materials: [{ item: 'copper_ore', amount: 5 }] },
    { tier: 'iron',   name: 'Iron Watering Can',    emoji: '🚿', efficiency: 2.0, cost: 1500, materials: [{ item: 'iron_ore', amount: 5 }] },
    { tier: 'gold',   name: 'Gold Watering Can',    emoji: '🚿', efficiency: 3.0, cost: 5000, materials: [{ item: 'gold_ore', amount: 5 }] }
  ],
  basket: [
    { tier: 'basic',  name: 'Basic Basket',     emoji: '🧺', efficiency: 1.0, cost: 0,    materials: [] },
    { tier: 'copper', name: 'Copper Basket',     emoji: '🧺', efficiency: 1.5, cost: 400,  materials: [{ item: 'copper_ore', amount: 3 }] },
    { tier: 'iron',   name: 'Iron Basket',       emoji: '🧺', efficiency: 2.0, cost: 1200, materials: [{ item: 'iron_ore', amount: 3 }] },
    { tier: 'gold',   name: 'Gold Basket',       emoji: '🧺', efficiency: 3.0, cost: 4000, materials: [{ item: 'gold_ore', amount: 3 }] }
  ],
  axe: [
    { tier: 'basic',  name: 'Basic Axe',        emoji: '🪓', efficiency: 1.0, cost: 0,    materials: [] },
    { tier: 'copper', name: 'Copper Axe',        emoji: '🪓', efficiency: 1.5, cost: 600,  materials: [{ item: 'copper_ore', amount: 5 }] },
    { tier: 'iron',   name: 'Iron Axe',          emoji: '🪓', efficiency: 2.0, cost: 1800, materials: [{ item: 'iron_ore', amount: 5 }] },
    { tier: 'gold',   name: 'Gold Axe',          emoji: '🪓', efficiency: 3.0, cost: 6000, materials: [{ item: 'gold_ore', amount: 5 }] }
  ],
  pickaxe: [
    { tier: 'basic',  name: 'Basic Pickaxe',    emoji: '⛏️', efficiency: 1.0, cost: 0,    materials: [] },
    { tier: 'copper', name: 'Copper Pickaxe',    emoji: '⛏️', efficiency: 1.5, cost: 600,  materials: [{ item: 'copper_ore', amount: 5 }] },
    { tier: 'iron',   name: 'Iron Pickaxe',      emoji: '⛏️', efficiency: 2.0, cost: 1800, materials: [{ item: 'iron_ore', amount: 5 }] },
    { tier: 'gold',   name: 'Gold Pickaxe',      emoji: '⛏️', efficiency: 3.0, cost: 6000, materials: [{ item: 'gold_ore', amount: 5 }] }
  ]
};
