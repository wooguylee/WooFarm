/**
 * WooFarm - Quest Data Definitions
 * All quests organized by ID with transformed field names and objectives structure.
 */
window.QUEST_DATA = {
  q_tutorial_01: {
    id: "q_tutorial_01",
    name: "First Harvest",
    description: "Plant and harvest 5 turnips to learn the basics of farming.",
    chapter: 1,
    objectives: [
      {
        type: "crop_harvested",
        target: "turnip",
        required: 5
      }
    ],
    rewards: {
      gold: 100,
      exp: 20,
      items: [
        {
          id: "potato_seed",
          amount: 5
        }
      ]
    },
    prerequisites: [],
    repeatable: false
  },
  q_tutorial_02: {
    id: "q_tutorial_02",
    name: "Green Thumb",
    description: "Water your crops 10 times. Healthy crops need consistent watering.",
    chapter: 1,
    objectives: [
      {
        type: "crop_watered",
        target: "any",
        required: 10
      }
    ],
    rewards: {
      gold: 50,
      exp: 15,
      items: []
    },
    prerequisites: [
      "q_tutorial_01"
    ],
    repeatable: false
  },
  q_tutorial_03: {
    id: "q_tutorial_03",
    name: "Market Day",
    description: "Sell your first crops at the market. Earn at least 200 gold from sales.",
    chapter: 1,
    objectives: [
      {
        type: "gold_changed",
        target: "any",
        required: 200
      }
    ],
    rewards: {
      gold: 100,
      exp: 25,
      items: []
    },
    prerequisites: [
      "q_tutorial_02"
    ],
    repeatable: false
  },
  q_tutorial_04: {
    id: "q_tutorial_04",
    name: "Tool Time",
    description: "Purchase a hoe and a watering can from the shop.",
    chapter: 1,
    objectives: [
      {
        type: "item_owned",
        target: "hoe",
        required: 1
      },
      {
        type: "item_owned",
        target: "watering_can",
        required: 1
      }
    ],
    rewards: {
      gold: 50,
      exp: 15,
      items: [
        {
          id: "turnip_seed",
          amount: 10
        }
      ]
    },
    prerequisites: [],
    repeatable: false
  },
  q_tutorial_05: {
    id: "q_tutorial_05",
    name: "Feathered Friend",
    description: "Buy your first chicken and collect an egg.",
    chapter: 1,
    objectives: [
      {
        type: "animal_added",
        target: "chicken",
        required: 1
      },
      {
        type: "product_collected",
        target: "egg",
        required: 1
      }
    ],
    rewards: {
      gold: 200,
      exp: 30,
      items: [
        {
          id: "chicken_feed",
          amount: 10
        }
      ]
    },
    prerequisites: [
      "q_tutorial_03"
    ],
    repeatable: false
  },
  q_growing_01: {
    id: "q_growing_01",
    name: "Diversify Your Crops",
    description: "Harvest 5 different crop types. Variety is the spice of farm life.",
    chapter: 2,
    objectives: [
      {
        type: "crops_harvested_unique",
        target: "any",
        required: 5
      }
    ],
    rewards: {
      gold: 300,
      exp: 50,
      items: []
    },
    prerequisites: [
      "q_tutorial_05"
    ],
    repeatable: false
  },
  q_growing_02: {
    id: "q_growing_02",
    name: "Summer Bounty",
    description: "Harvest 10 tomatoes and 10 corn during summer.",
    chapter: 2,
    objectives: [
      {
        type: "crop_harvested",
        target: "tomato",
        required: 10
      },
      {
        type: "crop_harvested",
        target: "corn",
        required: 10
      }
    ],
    rewards: {
      gold: 500,
      exp: 60,
      items: [
        {
          id: "melon_seed",
          amount: 3
        }
      ]
    },
    prerequisites: [
      "q_growing_01"
    ],
    repeatable: false
  },
  q_growing_03: {
    id: "q_growing_03",
    name: "Flower Power",
    description: "Grow and harvest 10 flowers of any kind.",
    chapter: 2,
    objectives: [
      {
        type: "crops_harvested_by_category",
        target: "flower",
        required: 10
      }
    ],
    rewards: {
      gold: 250,
      exp: 40,
      items: [
        {
          id: "fertilizer",
          amount: 5
        }
      ]
    },
    prerequisites: [
      "q_growing_01"
    ],
    repeatable: false
  },
  q_growing_04: {
    id: "q_growing_04",
    name: "Big Spender",
    description: "Accumulate a total of 5,000 gold in lifetime earnings.",
    chapter: 2,
    objectives: [
      {
        type: "total_gold_earned",
        target: "any",
        required: 5000
      }
    ],
    rewards: {
      gold: 500,
      exp: 50,
      items: []
    },
    prerequisites: [
      "q_growing_01"
    ],
    repeatable: false
  },
  q_growing_05: {
    id: "q_growing_05",
    name: "Copper Upgrade",
    description: "Upgrade any tool to copper tier.",
    chapter: 2,
    objectives: [
      {
        type: "tool_upgraded",
        target: "any",
        required: 1
      }
    ],
    rewards: {
      gold: 300,
      exp: 40,
      items: [
        {
          id: "iron_ore",
          amount: 3
        }
      ]
    },
    prerequisites: [
      "q_growing_04"
    ],
    repeatable: false
  },
  q_animal_01: {
    id: "q_animal_01",
    name: "Moo-ving Up",
    description: "Purchase a cow and collect 5 bottles of milk.",
    chapter: 3,
    objectives: [
      {
        type: "animal_added",
        target: "cow",
        required: 1
      },
      {
        type: "product_collected",
        target: "milk",
        required: 5
      }
    ],
    rewards: {
      gold: 500,
      exp: 60,
      items: []
    },
    prerequisites: [
      "q_growing_05"
    ],
    repeatable: false
  },
  q_animal_02: {
    id: "q_animal_02",
    name: "Woolly World",
    description: "Own a sheep and collect 3 bundles of wool.",
    chapter: 3,
    objectives: [
      {
        type: "animal_added",
        target: "sheep",
        required: 1
      },
      {
        type: "product_collected",
        target: "wool",
        required: 3
      }
    ],
    rewards: {
      gold: 400,
      exp: 50,
      items: []
    },
    prerequisites: [
      "q_animal_01"
    ],
    repeatable: false
  },
  q_animal_03: {
    id: "q_animal_03",
    name: "Truffle Hunter",
    description: "Purchase a pig and find your first truffle.",
    chapter: 3,
    objectives: [
      {
        type: "animal_added",
        target: "pig",
        required: 1
      },
      {
        type: "product_collected",
        target: "truffle",
        required: 1
      }
    ],
    rewards: {
      gold: 800,
      exp: 80,
      items: [
        {
          id: "premium_feed",
          amount: 5
        }
      ]
    },
    prerequisites: [
      "q_animal_02"
    ],
    repeatable: false
  },
  q_animal_04: {
    id: "q_animal_04",
    name: "Happy Animals",
    description: "Keep all your animals at maximum happiness for 7 consecutive days.",
    chapter: 3,
    objectives: [
      {
        type: "happiness_streak",
        target: "all",
        required: 7
      }
    ],
    rewards: {
      gold: 600,
      exp: 70,
      items: [
        {
          id: "golden_egg",
          amount: 1
        }
      ]
    },
    prerequisites: [
      "q_animal_03"
    ],
    repeatable: false
  },
  q_animal_05: {
    id: "q_animal_05",
    name: "Egg Collector",
    description: "Collect a total of 50 eggs (chicken or duck).",
    chapter: 3,
    objectives: [
      {
        type: "product_collected",
        target: "egg",
        required: 30
      },
      {
        type: "product_collected",
        target: "duck_egg",
        required: 20
      }
    ],
    rewards: {
      gold: 500,
      exp: 60,
      items: []
    },
    prerequisites: [
      "q_animal_01"
    ],
    repeatable: false
  },
  q_master_01: {
    id: "q_master_01",
    name: "Pumpkin Patch",
    description: "Harvest 20 pumpkins in a single fall season.",
    chapter: 4,
    objectives: [
      {
        type: "crop_harvested_in_season",
        target: "pumpkin",
        required: 20
      }
    ],
    rewards: {
      gold: 1000,
      exp: 100,
      items: [
        {
          id: "ancient_seed",
          amount: 1
        }
      ]
    },
    prerequisites: [
      "q_animal_04"
    ],
    repeatable: false
  },
  q_master_02: {
    id: "q_master_02",
    name: "Iron Will",
    description: "Upgrade all 5 tools to at least iron tier.",
    chapter: 4,
    objectives: [
      {
        type: "tool_upgraded",
        target: "hoe",
        required: 2
      },
      {
        type: "tool_upgraded",
        target: "watering_can",
        required: 2
      },
      {
        type: "tool_upgraded",
        target: "basket",
        required: 2
      },
      {
        type: "tool_upgraded",
        target: "axe",
        required: 2
      },
      {
        type: "tool_upgraded",
        target: "pickaxe",
        required: 2
      }
    ],
    rewards: {
      gold: 2000,
      exp: 150,
      items: [
        {
          id: "gold_ore",
          amount: 5
        }
      ]
    },
    prerequisites: [
      "q_master_01"
    ],
    repeatable: false
  },
  q_master_03: {
    id: "q_master_03",
    name: "Seasonal Champion",
    description: "Harvest at least one crop from every season.",
    chapter: 4,
    objectives: [
      {
        type: "crop_harvested_in_season",
        target: "spring",
        required: 1
      },
      {
        type: "crop_harvested_in_season",
        target: "summer",
        required: 1
      },
      {
        type: "crop_harvested_in_season",
        target: "fall",
        required: 1
      },
      {
        type: "crop_harvested_in_season",
        target: "winter",
        required: 1
      }
    ],
    rewards: {
      gold: 800,
      exp: 80,
      items: []
    },
    prerequisites: [
      "q_animal_04"
    ],
    repeatable: false
  },
  q_master_04: {
    id: "q_master_04",
    name: "Decorator",
    description: "Place 15 decorations on your farm.",
    chapter: 4,
    objectives: [
      {
        type: "decoration_placed",
        target: "any",
        required: 15
      }
    ],
    rewards: {
      gold: 600,
      exp: 70,
      items: []
    },
    prerequisites: [
      "q_master_01"
    ],
    repeatable: false
  },
  q_master_05: {
    id: "q_master_05",
    name: "Wealthy Farmer",
    description: "Accumulate 25,000 gold in lifetime earnings.",
    chapter: 4,
    objectives: [
      {
        type: "total_gold_earned",
        target: "any",
        required: 25000
      }
    ],
    rewards: {
      gold: 2000,
      exp: 120,
      items: []
    },
    prerequisites: [
      "q_master_01"
    ],
    repeatable: false
  },
  q_legend_01: {
    id: "q_legend_01",
    name: "Full Barnyard",
    description: "Own at least one of every animal type.",
    chapter: 5,
    objectives: [
      {
        type: "animal_added",
        target: "chicken",
        required: 1
      },
      {
        type: "animal_added",
        target: "cow",
        required: 1
      },
      {
        type: "animal_added",
        target: "sheep",
        required: 1
      },
      {
        type: "animal_added",
        target: "pig",
        required: 1
      },
      {
        type: "animal_added",
        target: "duck",
        required: 1
      },
      {
        type: "animal_added",
        target: "goat",
        required: 1
      }
    ],
    rewards: {
      gold: 3000,
      exp: 200,
      items: []
    },
    prerequisites: [
      "q_master_05"
    ],
    repeatable: false
  },
  q_legend_02: {
    id: "q_legend_02",
    name: "Golden Touch",
    description: "Upgrade all tools to gold tier — the ultimate craftsman.",
    chapter: 5,
    objectives: [
      {
        type: "tool_upgraded",
        target: "hoe",
        required: 3
      },
      {
        type: "tool_upgraded",
        target: "watering_can",
        required: 3
      },
      {
        type: "tool_upgraded",
        target: "basket",
        required: 3
      },
      {
        type: "tool_upgraded",
        target: "axe",
        required: 3
      },
      {
        type: "tool_upgraded",
        target: "pickaxe",
        required: 3
      }
    ],
    rewards: {
      gold: 5000,
      exp: 300,
      items: [
        {
          id: "lucky_clover",
          amount: 3
        }
      ]
    },
    prerequisites: [
      "q_legend_01"
    ],
    repeatable: false
  },
  q_legend_03: {
    id: "q_legend_03",
    name: "Crop Encyclopedia",
    description: "Harvest every crop type at least once. A true botanist.",
    chapter: 5,
    objectives: [
      {
        type: "crop_harvested",
        target: "turnip",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "potato",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "strawberry",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "tulip",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "cauliflower",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "tomato",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "corn",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "melon",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "sunflower",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "blueberry",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "pumpkin",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "carrot",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "grape",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "eggplant",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "sweet_potato",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "winter_radish",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "holly",
        required: 1
      },
      {
        type: "crop_harvested",
        target: "wheat",
        required: 1
      }
    ],
    rewards: {
      gold: 3000,
      exp: 250,
      items: [
        {
          id: "ancient_seed",
          amount: 3
        }
      ]
    },
    prerequisites: [
      "q_master_03"
    ],
    repeatable: false
  },
  q_legend_04: {
    id: "q_legend_04",
    name: "Tycoon",
    description: "Earn a lifetime total of 50,000 gold. You are a farming mogul.",
    chapter: 5,
    objectives: [
      {
        type: "total_gold_earned",
        target: "any",
        required: 50000
      }
    ],
    rewards: {
      gold: 5000,
      exp: 300,
      items: []
    },
    prerequisites: [
      "q_master_05"
    ],
    repeatable: false
  },
  q_legend_05: {
    id: "q_legend_05",
    name: "WooFarm Legend",
    description: "Complete all other quests to earn the title of Farm Legend.",
    chapter: 5,
    objectives: [
      {
        type: "quest_completed",
        target: "q_legend_01",
        required: 1
      },
      {
        type: "quest_completed",
        target: "q_legend_02",
        required: 1
      },
      {
        type: "quest_completed",
        target: "q_legend_03",
        required: 1
      },
      {
        type: "quest_completed",
        target: "q_legend_04",
        required: 1
      }
    ],
    rewards: {
      gold: 10000,
      exp: 500,
      items: [
        {
          id: "lucky_clover",
          amount: 5
        },
        {
          id: "golden_egg",
          amount: 3
        }
      ]
    },
    prerequisites: [],
    repeatable: false
  },
  q_daily_harvest: {
    id: "q_daily_harvest",
    name: "Daily Harvest",
    description: "Harvest 10 crops of any kind today.",
    chapter: 0,
    objectives: [
      {
        type: "crop_harvested",
        target: "any",
        required: 10
      }
    ],
    rewards: {
      gold: 100,
      exp: 15,
      items: []
    },
    prerequisites: [
      "q_tutorial_01"
    ],
    repeatable: true
  },
  q_daily_sell: {
    id: "q_daily_sell",
    name: "Daily Sales",
    description: "Earn at least 500 gold from sales today.",
    chapter: 0,
    objectives: [
      {
        type: "gold_changed",
        target: "any",
        required: 500
      }
    ],
    rewards: {
      gold: 150,
      exp: 20,
      items: []
    },
    prerequisites: [
      "q_tutorial_03"
    ],
    repeatable: true
  },
  q_daily_feed: {
    id: "q_daily_feed",
    name: "Caretaker",
    description: "Feed all your animals today.",
    chapter: 0,
    objectives: [
      {
        type: "animals_fed",
        target: "any",
        required: 1
      }
    ],
    rewards: {
      gold: 75,
      exp: 10,
      items: []
    },
    prerequisites: [
      "q_tutorial_05"
    ],
    repeatable: true
  }
};
