/**
 * WooFarm - Animal Data Definitions
 * All animal types, their products, costs, and happiness mechanics.
 */
window.ANIMAL_DATA = {

  chicken: {
    id: 'chicken',
    name: 'Chicken',
    emoji: '🐔',
    buyPrice: 300,
    feedCost: 10,
    product: {
      name: 'Egg',
      emoji: '🥚',
      sellPrice: 30,
      productionInterval: 1
    },
    maxHappiness: 100,
    happinessDecay: 5,
    description: 'A friendly hen that lays eggs daily. Great for beginners.',
    exp: 5
  },

  cow: {
    id: 'cow',
    name: 'Cow',
    emoji: '🐄',
    buyPrice: 1500,
    feedCost: 30,
    product: {
      name: 'Milk',
      emoji: '🥛',
      sellPrice: 100,
      productionInterval: 2
    },
    maxHappiness: 100,
    happinessDecay: 5,
    description: 'A gentle dairy cow. Produces rich, creamy milk.',
    exp: 15
  },

  sheep: {
    id: 'sheep',
    name: 'Sheep',
    emoji: '🐑',
    buyPrice: 1200,
    feedCost: 25,
    product: {
      name: 'Wool',
      emoji: '🧶',
      sellPrice: 80,
      productionInterval: 3
    },
    maxHappiness: 100,
    happinessDecay: 5,
    description: 'A fluffy sheep that provides soft wool for the market.',
    exp: 12
  },

  pig: {
    id: 'pig',
    name: 'Pig',
    emoji: '🐷',
    buyPrice: 2000,
    feedCost: 40,
    product: {
      name: 'Truffle',
      emoji: '🍄',
      sellPrice: 200,
      productionInterval: 4
    },
    maxHappiness: 100,
    happinessDecay: 5,
    description: 'An expert forager with a nose for valuable truffles.',
    exp: 25
  },

  duck: {
    id: 'duck',
    name: 'Duck',
    emoji: '🦆',
    buyPrice: 500,
    feedCost: 15,
    product: {
      name: 'Duck Egg',
      emoji: '🥚',
      sellPrice: 40,
      productionInterval: 1
    },
    maxHappiness: 100,
    happinessDecay: 5,
    description: 'A cheerful duck that enjoys the pond and lays large eggs.',
    exp: 7
  },

  goat: {
    id: 'goat',
    name: 'Goat',
    emoji: '🐐',
    buyPrice: 1800,
    feedCost: 35,
    product: {
      name: 'Goat Milk',
      emoji: '🥛',
      sellPrice: 120,
      productionInterval: 2
    },
    maxHappiness: 100,
    happinessDecay: 5,
    description: 'A spirited goat that produces premium milk prized by chefs.',
    exp: 18
  }
};
