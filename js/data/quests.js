/**
 * WooFarm - Quest Data Definitions
 * All quests organized into chapters, from tutorial to endgame.
 */
window.QUEST_DATA = [

  // ═══════════════════════════════════════════════════════════════════════
  //  Chapter 1: Tutorial — Welcome to WooFarm
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'q_tutorial_01',
    title: 'First Harvest',
    description: 'Plant and harvest 5 turnips to learn the basics of farming.',
    type: 'harvest',
    chapter: 1,
    requirements: [
      { type: 'harvest', target: 'turnip', amount: 5 }
    ],
    rewards: { gold: 100, exp: 20, items: [{ id: 'potato_seeds', amount: 5 }] },
    prerequisite: null,
    repeatable: false
  },
  {
    id: 'q_tutorial_02',
    title: 'Green Thumb',
    description: 'Water your crops 10 times. Healthy crops need consistent watering.',
    type: 'harvest',
    chapter: 1,
    requirements: [
      { type: 'water', target: 'any', amount: 10 }
    ],
    rewards: { gold: 50, exp: 15 },
    prerequisite: 'q_tutorial_01',
    repeatable: false
  },
  {
    id: 'q_tutorial_03',
    title: 'Market Day',
    description: 'Sell your first crops at the market. Earn at least 200 gold from sales.',
    type: 'sell',
    chapter: 1,
    requirements: [
      { type: 'sell_gold', target: 'any', amount: 200 }
    ],
    rewards: { gold: 100, exp: 25 },
    prerequisite: 'q_tutorial_02',
    repeatable: false
  },
  {
    id: 'q_tutorial_04',
    title: 'Tool Time',
    description: 'Purchase a hoe and a watering can from the shop.',
    type: 'build',
    chapter: 1,
    requirements: [
      { type: 'own_item', target: 'hoe', amount: 1 },
      { type: 'own_item', target: 'watering_can', amount: 1 }
    ],
    rewards: { gold: 50, exp: 15, items: [{ id: 'turnip_seeds', amount: 10 }] },
    prerequisite: null,
    repeatable: false
  },
  {
    id: 'q_tutorial_05',
    title: 'Feathered Friend',
    description: 'Buy your first chicken and collect an egg.',
    type: 'animal',
    chapter: 1,
    requirements: [
      { type: 'own_animal', target: 'chicken', amount: 1 },
      { type: 'collect_product', target: 'egg', amount: 1 }
    ],
    rewards: { gold: 200, exp: 30, items: [{ id: 'chicken_feed', amount: 10 }] },
    prerequisite: 'q_tutorial_03',
    repeatable: false
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  Chapter 2: Growing Farmer — Expanding the Fields
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'q_growing_01',
    title: 'Diversify Your Crops',
    description: 'Harvest 5 different crop types. Variety is the spice of farm life.',
    type: 'harvest',
    chapter: 2,
    requirements: [
      { type: 'harvest_unique', target: 'any', amount: 5 }
    ],
    rewards: { gold: 300, exp: 50 },
    prerequisite: 'q_tutorial_05',
    repeatable: false
  },
  {
    id: 'q_growing_02',
    title: 'Summer Bounty',
    description: 'Harvest 10 tomatoes and 10 corn during summer.',
    type: 'harvest',
    chapter: 2,
    requirements: [
      { type: 'harvest', target: 'tomato', amount: 10 },
      { type: 'harvest', target: 'corn', amount: 10 }
    ],
    rewards: { gold: 500, exp: 60, items: [{ id: 'melon_seeds', amount: 3 }] },
    prerequisite: 'q_growing_01',
    repeatable: false
  },
  {
    id: 'q_growing_03',
    title: 'Flower Power',
    description: 'Grow and harvest 10 flowers of any kind.',
    type: 'harvest',
    chapter: 2,
    requirements: [
      { type: 'harvest_category', target: 'flower', amount: 10 }
    ],
    rewards: { gold: 250, exp: 40, items: [{ id: 'fertilizer', amount: 5 }] },
    prerequisite: 'q_growing_01',
    repeatable: false
  },
  {
    id: 'q_growing_04',
    title: 'Big Spender',
    description: 'Accumulate a total of 5,000 gold in lifetime earnings.',
    type: 'sell',
    chapter: 2,
    requirements: [
      { type: 'total_gold_earned', target: 'any', amount: 5000 }
    ],
    rewards: { gold: 500, exp: 50 },
    prerequisite: 'q_growing_01',
    repeatable: false
  },
  {
    id: 'q_growing_05',
    title: 'Copper Upgrade',
    description: 'Upgrade any tool to copper tier.',
    type: 'build',
    chapter: 2,
    requirements: [
      { type: 'upgrade_tool', target: 'any', amount: 1 }
    ],
    rewards: { gold: 300, exp: 40, items: [{ id: 'iron_ore', amount: 3 }] },
    prerequisite: 'q_growing_04',
    repeatable: false
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  Chapter 3: Animal Lover — Building the Barnyard
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'q_animal_01',
    title: 'Moo-ving Up',
    description: 'Purchase a cow and collect 5 bottles of milk.',
    type: 'animal',
    chapter: 3,
    requirements: [
      { type: 'own_animal', target: 'cow', amount: 1 },
      { type: 'collect_product', target: 'milk', amount: 5 }
    ],
    rewards: { gold: 500, exp: 60 },
    prerequisite: 'q_growing_05',
    repeatable: false
  },
  {
    id: 'q_animal_02',
    title: 'Woolly World',
    description: 'Own a sheep and collect 3 bundles of wool.',
    type: 'animal',
    chapter: 3,
    requirements: [
      { type: 'own_animal', target: 'sheep', amount: 1 },
      { type: 'collect_product', target: 'wool', amount: 3 }
    ],
    rewards: { gold: 400, exp: 50 },
    prerequisite: 'q_animal_01',
    repeatable: false
  },
  {
    id: 'q_animal_03',
    title: 'Truffle Hunter',
    description: 'Purchase a pig and find your first truffle.',
    type: 'animal',
    chapter: 3,
    requirements: [
      { type: 'own_animal', target: 'pig', amount: 1 },
      { type: 'collect_product', target: 'truffle', amount: 1 }
    ],
    rewards: { gold: 800, exp: 80, items: [{ id: 'premium_feed', amount: 5 }] },
    prerequisite: 'q_animal_02',
    repeatable: false
  },
  {
    id: 'q_animal_04',
    title: 'Happy Animals',
    description: 'Keep all your animals at maximum happiness for 7 consecutive days.',
    type: 'animal',
    chapter: 3,
    requirements: [
      { type: 'happiness_streak', target: 'all', amount: 7 }
    ],
    rewards: { gold: 600, exp: 70, items: [{ id: 'golden_egg', amount: 1 }] },
    prerequisite: 'q_animal_03',
    repeatable: false
  },
  {
    id: 'q_animal_05',
    title: 'Egg Collector',
    description: 'Collect a total of 50 eggs (chicken or duck).',
    type: 'animal',
    chapter: 3,
    requirements: [
      { type: 'collect_product', target: 'egg', amount: 30 },
      { type: 'collect_product', target: 'duck_egg', amount: 20 }
    ],
    rewards: { gold: 500, exp: 60 },
    prerequisite: 'q_animal_01',
    repeatable: false
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  Chapter 4: Master Farmer — Mastering the Land
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'q_master_01',
    title: 'Pumpkin Patch',
    description: 'Harvest 20 pumpkins in a single fall season.',
    type: 'harvest',
    chapter: 4,
    requirements: [
      { type: 'harvest_in_season', target: 'pumpkin', amount: 20 }
    ],
    rewards: { gold: 1000, exp: 100, items: [{ id: 'ancient_seed', amount: 1 }] },
    prerequisite: 'q_animal_04',
    repeatable: false
  },
  {
    id: 'q_master_02',
    title: 'Iron Will',
    description: 'Upgrade all 5 tools to at least iron tier.',
    type: 'build',
    chapter: 4,
    requirements: [
      { type: 'upgrade_tool', target: 'hoe', amount: 2 },
      { type: 'upgrade_tool', target: 'watering_can', amount: 2 },
      { type: 'upgrade_tool', target: 'basket', amount: 2 },
      { type: 'upgrade_tool', target: 'axe', amount: 2 },
      { type: 'upgrade_tool', target: 'pickaxe', amount: 2 }
    ],
    rewards: { gold: 2000, exp: 150, items: [{ id: 'gold_ore', amount: 5 }] },
    prerequisite: 'q_master_01',
    repeatable: false
  },
  {
    id: 'q_master_03',
    title: 'Seasonal Champion',
    description: 'Harvest at least one crop from every season.',
    type: 'harvest',
    chapter: 4,
    requirements: [
      { type: 'harvest_season', target: 'spring', amount: 1 },
      { type: 'harvest_season', target: 'summer', amount: 1 },
      { type: 'harvest_season', target: 'fall', amount: 1 },
      { type: 'harvest_season', target: 'winter', amount: 1 }
    ],
    rewards: { gold: 800, exp: 80 },
    prerequisite: 'q_animal_04',
    repeatable: false
  },
  {
    id: 'q_master_04',
    title: 'Decorator',
    description: 'Place 15 decorations on your farm.',
    type: 'build',
    chapter: 4,
    requirements: [
      { type: 'place_decoration', target: 'any', amount: 15 }
    ],
    rewards: { gold: 600, exp: 70 },
    prerequisite: 'q_master_01',
    repeatable: false
  },
  {
    id: 'q_master_05',
    title: 'Wealthy Farmer',
    description: 'Accumulate 25,000 gold in lifetime earnings.',
    type: 'sell',
    chapter: 4,
    requirements: [
      { type: 'total_gold_earned', target: 'any', amount: 25000 }
    ],
    rewards: { gold: 2000, exp: 120 },
    prerequisite: 'q_master_01',
    repeatable: false
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  Chapter 5: Farm Legend — The Ultimate Challenges
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'q_legend_01',
    title: 'Full Barnyard',
    description: 'Own at least one of every animal type.',
    type: 'animal',
    chapter: 5,
    requirements: [
      { type: 'own_animal', target: 'chicken', amount: 1 },
      { type: 'own_animal', target: 'cow', amount: 1 },
      { type: 'own_animal', target: 'sheep', amount: 1 },
      { type: 'own_animal', target: 'pig', amount: 1 },
      { type: 'own_animal', target: 'duck', amount: 1 },
      { type: 'own_animal', target: 'goat', amount: 1 }
    ],
    rewards: { gold: 3000, exp: 200 },
    prerequisite: 'q_master_05',
    repeatable: false
  },
  {
    id: 'q_legend_02',
    title: 'Golden Touch',
    description: 'Upgrade all tools to gold tier — the ultimate craftsman.',
    type: 'build',
    chapter: 5,
    requirements: [
      { type: 'upgrade_tool', target: 'hoe', amount: 3 },
      { type: 'upgrade_tool', target: 'watering_can', amount: 3 },
      { type: 'upgrade_tool', target: 'basket', amount: 3 },
      { type: 'upgrade_tool', target: 'axe', amount: 3 },
      { type: 'upgrade_tool', target: 'pickaxe', amount: 3 }
    ],
    rewards: { gold: 5000, exp: 300, items: [{ id: 'lucky_clover', amount: 3 }] },
    prerequisite: 'q_legend_01',
    repeatable: false
  },
  {
    id: 'q_legend_03',
    title: 'Crop Encyclopedia',
    description: 'Harvest every crop type at least once. A true botanist.',
    type: 'harvest',
    chapter: 5,
    requirements: [
      { type: 'harvest', target: 'turnip', amount: 1 },
      { type: 'harvest', target: 'potato', amount: 1 },
      { type: 'harvest', target: 'strawberry', amount: 1 },
      { type: 'harvest', target: 'tulip', amount: 1 },
      { type: 'harvest', target: 'cauliflower', amount: 1 },
      { type: 'harvest', target: 'tomato', amount: 1 },
      { type: 'harvest', target: 'corn', amount: 1 },
      { type: 'harvest', target: 'melon', amount: 1 },
      { type: 'harvest', target: 'sunflower', amount: 1 },
      { type: 'harvest', target: 'blueberry', amount: 1 },
      { type: 'harvest', target: 'pumpkin', amount: 1 },
      { type: 'harvest', target: 'carrot', amount: 1 },
      { type: 'harvest', target: 'grape', amount: 1 },
      { type: 'harvest', target: 'eggplant', amount: 1 },
      { type: 'harvest', target: 'sweet_potato', amount: 1 },
      { type: 'harvest', target: 'winter_radish', amount: 1 },
      { type: 'harvest', target: 'holly', amount: 1 },
      { type: 'harvest', target: 'wheat', amount: 1 }
    ],
    rewards: { gold: 3000, exp: 250, items: [{ id: 'ancient_seed', amount: 3 }] },
    prerequisite: 'q_master_03',
    repeatable: false
  },
  {
    id: 'q_legend_04',
    title: 'Tycoon',
    description: 'Earn a lifetime total of 50,000 gold. You are a farming mogul.',
    type: 'sell',
    chapter: 5,
    requirements: [
      { type: 'total_gold_earned', target: 'any', amount: 50000 }
    ],
    rewards: { gold: 5000, exp: 300 },
    prerequisite: 'q_master_05',
    repeatable: false
  },
  {
    id: 'q_legend_05',
    title: 'WooFarm Legend',
    description: 'Complete all other quests to earn the title of Farm Legend.',
    type: 'social',
    chapter: 5,
    requirements: [
      { type: 'complete_quest', target: 'q_legend_01', amount: 1 },
      { type: 'complete_quest', target: 'q_legend_02', amount: 1 },
      { type: 'complete_quest', target: 'q_legend_03', amount: 1 },
      { type: 'complete_quest', target: 'q_legend_04', amount: 1 }
    ],
    rewards: { gold: 10000, exp: 500, items: [{ id: 'lucky_clover', amount: 5 }, { id: 'golden_egg', amount: 3 }] },
    prerequisite: null,
    repeatable: false
  },

  // ═══════════════════════════════════════════════════════════════════════
  //  Repeatable Quests — Daily / Weekly Tasks
  // ═══════════════════════════════════════════════════════════════════════

  {
    id: 'q_daily_harvest',
    title: 'Daily Harvest',
    description: 'Harvest 10 crops of any kind today.',
    type: 'harvest',
    chapter: 0,
    requirements: [
      { type: 'harvest', target: 'any', amount: 10 }
    ],
    rewards: { gold: 100, exp: 15 },
    prerequisite: 'q_tutorial_01',
    repeatable: true
  },
  {
    id: 'q_daily_sell',
    title: 'Daily Sales',
    description: 'Earn at least 500 gold from sales today.',
    type: 'sell',
    chapter: 0,
    requirements: [
      { type: 'sell_gold', target: 'any', amount: 500 }
    ],
    rewards: { gold: 150, exp: 20 },
    prerequisite: 'q_tutorial_03',
    repeatable: true
  },
  {
    id: 'q_daily_feed',
    title: 'Caretaker',
    description: 'Feed all your animals today.',
    type: 'animal',
    chapter: 0,
    requirements: [
      { type: 'feed_all', target: 'any', amount: 1 }
    ],
    rewards: { gold: 75, exp: 10 },
    prerequisite: 'q_tutorial_05',
    repeatable: true
  }
];
