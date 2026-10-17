// scripts/runtime/main.ts
import {
  ItemStack,
  PlayerInventoryType,
  system,
  world,
  Difficulty
} from "@minecraft/server";

// scripts/data/TierTable.ts
var TIERS = [
  { tier: 0, id: "p0", weight: 55e3, color: "\xA78", labelCN: "\u5931\u51C6", labelEN: "Flawed", loreCN: "\u6210\u8272\u6B20\u4F73\uFF0C\u52C9\u5F3A\u80FD\u5403", loreEN: "Poorly made, barely edible" },
  { tier: 1, id: "p1", weight: 3e4, color: "\xA77", labelCN: "\u5BB6\u5E38", labelEN: "Homemade", loreCN: "\u6734\u5B9E\u7684\u5BB6\u5E38\u505A\u6CD5", loreEN: "Plain, homely cooking" },
  { tier: 2, id: "p2", weight: 11e3, color: "\xA7f", labelCN: "\u6539\u826F", labelEN: "Improved", loreCN: "\u914D\u6BD4\u7ECF\u8FC7\u8C03\u6574", loreEN: "Improved recipe" },
  { tier: 3, id: "p3", weight: 3200, color: "\xA7a", labelCN: "\u8003\u7A76", labelEN: "Refined", loreCN: "\u7ECF\u8FC7\u7CBE\u5FC3\u6539\u826F", loreEN: "Carefully refined" },
  { tier: 4, id: "p4", weight: 650, color: "\xA7b", labelCN: "\u5320\u4F5C", labelEN: "Artisan", loreCN: "\u5320\u4EBA\u624B\u4F5C\uFF0C\u540D\u53A8\u76D1\u5236", loreEN: "Artisan crafted" },
  { tier: 5, id: "p5", weight: 100, color: "\xA7e", labelCN: "\u73CD\u85CF", labelEN: "Reserved", loreCN: "\u5BB4\u5E2D\u73CD\u85CF\uFF0C\u8282\u5E86\u7CBE\u9009", loreEN: "Banquet reserve" },
  { tier: 6, id: "p6", weight: 40, color: "\xA7d", labelCN: "\u4F20\u4E16", labelEN: "Heritage", loreCN: "\u4F20\u4E16\u914D\u65B9\uFF0C\u8001\u94FA\u79D8\u5236", loreEN: "Heritage recipe" },
  { tier: 7, id: "p7", weight: 10, color: "\xA76", labelCN: "\u6668\u661F", labelEN: "Dawnstar", loreCN: "\u6668\u661F\u7737\u987E\uFF0C\u661F\u8F89\u51DD\u9732", loreEN: "Blessed by the dawnstar" }
];

// scripts/core/Roller.ts
var defaultRng = { next: () => Math.random() };
function randomInt(rng, min, max) {
  return Math.floor(rng.next() * (max - min + 1)) + min;
}
function rollTier(rng = defaultRng, weights) {
  let w = weights ?? TIERS.map((t) => t.weight), total = w.reduce((a, b) => a + b, 0);
  if (total <= 0) return 1;
  let n = randomInt(rng, 1, total), acc = 0;
  for (let i = 0; i < w.length; i++)
    if (acc += w[i], n <= acc) return i;
  return 1;
}

// scripts/data/Families.ts
var FAMILIES = [
  { id: "special", cn: "\u7279\u6B8A\u9B54\u6CD5\u98DF\u54C1", keywords: [] },
  { id: "risky", cn: "\u5371\u9669\u98DF\u54C1", keywords: [] },
  // ⚠️ 顺序敏感：更具体的复合词必须排在通用词前面
  //    （如 fish_stew 应先命中 stew，而不是被 fish 抢走）
  { id: "stew", cn: "\u6C64\u54C1", keywords: ["stew", "soup"] },
  { id: "dessert", cn: "\u751C\u70B9", keywords: ["cookie", "pie", "cake"] },
  { id: "raw_meat", cn: "\u751F\u8089", keywords: ["raw_beef", "raw_porkchop", "raw_mutton", "raw_rabbit", "beef", "porkchop", "mutton", "rabbit"] },
  { id: "raw_fish", cn: "\u751F\u9C7C", keywords: ["raw_cod", "raw_salmon", "cod", "salmon", "tropical_fish", "clownfish"] },
  { id: "bakery", cn: "\u70D8\u7119\u4E3B\u98DF", keywords: ["bread", "baked_potato", "dried_kelp", "kelp"] },
  { id: "fish", cn: "\u719F\u9C7C", keywords: ["cooked_cod", "cooked_salmon", "cooked_fish"] },
  { id: "meat", cn: "\u719F\u8089", keywords: ["cooked_beef", "cooked_porkchop", "cooked_chicken", "cooked_mutton", "cooked_rabbit"] },
  { id: "fruit", cn: "\u6C34\u679C", keywords: ["apple", "melon", "berries", "chorus_fruit"] },
  { id: "vegetable", cn: "\u852C\u83DC", keywords: ["carrot", "beetroot", "potato", "vegetable"] }
], FAMILY_IDS = FAMILIES.map((f) => f.id);
function familyLabel(id) {
  return FAMILIES.find((f) => f.id === id)?.cn ?? id;
}

// scripts/data/FoodTable.ts
var FOODS = [
  {
    key: "apple",
    id: "minecraft:apple",
    cn: "\u82F9\u679C",
    en: "Apple",
    family: "fruit",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 4,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 4, saturation_modifier: 0.3 },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:apple_p0", nutrition: 3, saturation: 0.22, cn: "\u6210\u8272\u6B20\u4F73\u7684\u82F9\u679C", en: "Flawed Apple" },
      { tier: 1, tierId: "p1", id: "kira_food:apple_p1", nutrition: 4, saturation: 0.3, cn: "\u5F53\u5B63\u82F9\u679C", en: "Apple" },
      { tier: 2, tierId: "p2", id: "kira_food:apple_p2", nutrition: 4, saturation: 0.336, cn: "\u679C\u56ED\u7CBE\u9009\u7684\u82F9\u679C", en: "Improved Apple" },
      { tier: 3, tierId: "p3", id: "kira_food:apple_p3", nutrition: 5, saturation: 0.288, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6311\u9009\u7684\u82F9\u679C", en: "Refined Apple" },
      { tier: 4, tierId: "p4", id: "kira_food:apple_p4", nutrition: 5, saturation: 0.312, cn: "\u679C\u56ED\u73CD\u9009\u7684\u82F9\u679C", en: "Artisan Apple" },
      { tier: 5, tierId: "p5", id: "kira_food:apple_p5", nutrition: 6, saturation: 0.28, cn: "\u8282\u5E86\u7CBE\u9009\u7684\u82F9\u679C", en: "Reserved Apple" },
      { tier: 6, tierId: "p6", id: "kira_food:apple_p6", nutrition: 6, saturation: 0.31, cn: "\u8001\u6811\u7CBE\u9009\u7684\u82F9\u679C", en: "Heritage Apple" },
      { tier: 7, tierId: "p7", id: "kira_food:apple_p7", nutrition: 6, saturation: 0.34, cn: "\u66D9\u5149\u6620\u7167\u7684\u82F9\u679C", en: "Dawnstar Apple" }
    ]
  },
  {
    key: "baked_potato",
    id: "minecraft:baked_potato",
    cn: "\u70E4\u9A6C\u94C3\u85AF",
    en: "Baked Potato",
    family: "bakery",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 5,
    baseSaturation: 0.6,
    vanillaFood: { nutrition: 5, saturation_modifier: "normal" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:baked_potato_p0", nutrition: 3, saturation: 0.55, cn: "\u706B\u5019\u5931\u51C6\u7684\u70E4\u9A6C\u94C3\u85AF", en: "Flawed Baked Potato" },
      { tier: 1, tierId: "p1", id: "kira_food:baked_potato_p1", nutrition: 5, saturation: 0.6, cn: "\u5BB6\u5E38\u70E4\u9A6C\u94C3\u85AF", en: "Baked Potato" },
      { tier: 2, tierId: "p2", id: "kira_food:baked_potato_p2", nutrition: 5, saturation: 0.672, cn: "\u6539\u826F\u914D\u65B9\u7684\u70E4\u9A6C\u94C3\u85AF", en: "Improved Baked Potato" },
      { tier: 3, tierId: "p3", id: "kira_food:baked_potato_p3", nutrition: 6, saturation: 0.6, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6539\u826F\u7684\u70E4\u9A6C\u94C3\u85AF", en: "Refined Baked Potato" },
      { tier: 4, tierId: "p4", id: "kira_food:baked_potato_p4", nutrition: 6, saturation: 0.65, cn: "\u540D\u53A8\u76D1\u5236\u7684\u70E4\u9A6C\u94C3\u85AF", en: "Artisan Baked Potato" },
      { tier: 5, tierId: "p5", id: "kira_food:baked_potato_p5", nutrition: 7, saturation: 0.6, cn: "\u5BB4\u5E2D\u73CD\u85CF\u7684\u70E4\u9A6C\u94C3\u85AF", en: "Reserved Baked Potato" },
      { tier: 6, tierId: "p6", id: "kira_food:baked_potato_p6", nutrition: 7, saturation: 0.6643, cn: "\u4F20\u4E16\u914D\u65B9\u70D8\u7119\u7684\u70E4\u9A6C\u94C3\u85AF", en: "Heritage Baked Potato" },
      { tier: 7, tierId: "p7", id: "kira_food:baked_potato_p7", nutrition: 7, saturation: 0.7286, cn: "\u6668\u661F\u7737\u987E\u7684\u70E4\u9A6C\u94C3\u85AF", en: "Dawnstar Baked Potato" }
    ]
  },
  {
    key: "beetroot",
    id: "minecraft:beetroot",
    cn: "\u751C\u83DC\u6839",
    en: "Beetroot",
    family: "vegetable",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 1,
    baseSaturation: 0.6,
    vanillaFood: { nutrition: 1, saturation_modifier: "normal" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:beetroot_p0", nutrition: 1, saturation: 0.33, cn: "\u6210\u8272\u6B20\u4F73\u7684\u751C\u83DC\u6839", en: "Flawed Beetroot" },
      { tier: 1, tierId: "p1", id: "kira_food:beetroot_p1", nutrition: 1, saturation: 0.6, cn: "\u65B0\u9C9C\u7684\u751C\u83DC\u6839", en: "Beetroot" },
      { tier: 2, tierId: "p2", id: "kira_food:beetroot_p2", nutrition: 1, saturation: 0.672, cn: "\u7CBE\u6311\u7EC6\u9009\u7684\u751C\u83DC\u6839", en: "Improved Beetroot" },
      { tier: 3, tierId: "p3", id: "kira_food:beetroot_p3", nutrition: 2, saturation: 0.36, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6311\u9009\u7684\u751C\u83DC\u6839", en: "Refined Beetroot" },
      { tier: 4, tierId: "p4", id: "kira_food:beetroot_p4", nutrition: 2, saturation: 0.39, cn: "\u679C\u56ED\u73CD\u9009\u7684\u751C\u83DC\u6839", en: "Artisan Beetroot" },
      { tier: 5, tierId: "p5", id: "kira_food:beetroot_p5", nutrition: 3, saturation: 0.28, cn: "\u8282\u5E86\u7CBE\u9009\u7684\u751C\u83DC\u6839", en: "Reserved Beetroot" },
      { tier: 6, tierId: "p6", id: "kira_food:beetroot_p6", nutrition: 3, saturation: 0.31, cn: "\u4F20\u627F\u80B2\u79CD\u7684\u751C\u83DC\u6839", en: "Heritage Beetroot" },
      { tier: 7, tierId: "p7", id: "kira_food:beetroot_p7", nutrition: 3, saturation: 0.34, cn: "\u66D9\u5149\u6620\u7167\u7684\u751C\u83DC\u6839", en: "Dawnstar Beetroot" }
    ]
  },
  {
    key: "beetroot_soup",
    id: "minecraft:beetroot_soup",
    cn: "\u751C\u83DC\u6C64",
    en: "Beetroot Soup",
    family: "stew",
    mode: "full",
    kiraOverlay: "normal",
    stack: 1,
    baseNutrition: 6,
    baseSaturation: 0.6,
    vanillaFood: { nutrition: 6, saturation_modifier: "normal", using_converts_to: "bowl" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:beetroot_soup_p0", nutrition: 4, saturation: 0.495, cn: "\u8C03\u5473\u5931\u8861\u7684\u751C\u83DC\u6C64", en: "Flawed Beetroot Soup" },
      { tier: 1, tierId: "p1", id: "kira_food:beetroot_soup_p1", nutrition: 6, saturation: 0.6, cn: "\u5BB6\u5E38\u751C\u83DC\u6C64", en: "Beetroot Soup" },
      { tier: 2, tierId: "p2", id: "kira_food:beetroot_soup_p2", nutrition: 6, saturation: 0.672, cn: "\u914D\u6BD4\u7ECF\u8FC7\u8C03\u6574\u7684\u751C\u83DC\u6C64", en: "Improved Beetroot Soup" },
      { tier: 3, tierId: "p3", id: "kira_food:beetroot_soup_p3", nutrition: 7, saturation: 0.6171, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u8C03\u5473\u7684\u751C\u83DC\u6C64", en: "Refined Beetroot Soup" },
      { tier: 4, tierId: "p4", id: "kira_food:beetroot_soup_p4", nutrition: 7, saturation: 0.6686, cn: "\u540D\u53A8\u76D1\u5236\u7684\u751C\u83DC\u6C64", en: "Artisan Beetroot Soup" },
      { tier: 5, tierId: "p5", id: "kira_food:beetroot_soup_p5", nutrition: 8, saturation: 0.63, cn: "\u76DB\u5BB4\u4E3B\u53A8\u7684\u751C\u83DC\u6C64", en: "Reserved Beetroot Soup" },
      { tier: 6, tierId: "p6", id: "kira_food:beetroot_soup_p6", nutrition: 8, saturation: 0.6975, cn: "\u4F20\u4E16\u79D8\u65B9\u7096\u5236\u7684\u751C\u83DC\u6C64", en: "Heritage Beetroot Soup" },
      { tier: 7, tierId: "p7", id: "kira_food:beetroot_soup_p7", nutrition: 8, saturation: 0.765, cn: "\u6668\u661F\u8D50\u798F\u7684\u751C\u83DC\u6C64", en: "Dawnstar Beetroot Soup" }
    ]
  },
  {
    key: "bread",
    id: "minecraft:bread",
    cn: "\u9762\u5305",
    en: "Bread",
    family: "bakery",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 5,
    baseSaturation: 0.6,
    vanillaFood: { nutrition: 5, saturation_modifier: "normal" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:bread_p0", nutrition: 3, saturation: 0.55, cn: "\u706B\u5019\u5931\u51C6\u7684\u9762\u5305", en: "Flawed Bread" },
      { tier: 1, tierId: "p1", id: "kira_food:bread_p1", nutrition: 5, saturation: 0.6, cn: "\u5BB6\u5E38\u9762\u5305", en: "Bread" },
      { tier: 2, tierId: "p2", id: "kira_food:bread_p2", nutrition: 5, saturation: 0.672, cn: "\u6539\u826F\u914D\u65B9\u7684\u9762\u5305", en: "Improved Bread" },
      { tier: 3, tierId: "p3", id: "kira_food:bread_p3", nutrition: 6, saturation: 0.6, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6539\u826F\u7684\u9762\u5305", en: "Refined Bread" },
      { tier: 4, tierId: "p4", id: "kira_food:bread_p4", nutrition: 6, saturation: 0.65, cn: "\u540D\u53A8\u76D1\u5236\u7684\u9762\u5305", en: "Artisan Bread" },
      { tier: 5, tierId: "p5", id: "kira_food:bread_p5", nutrition: 7, saturation: 0.6, cn: "\u5BB4\u5E2D\u73CD\u85CF\u7684\u9762\u5305", en: "Reserved Bread" },
      { tier: 6, tierId: "p6", id: "kira_food:bread_p6", nutrition: 7, saturation: 0.6643, cn: "\u4F20\u4E16\u914D\u65B9\u70D8\u7119\u7684\u9762\u5305", en: "Heritage Bread" },
      { tier: 7, tierId: "p7", id: "kira_food:bread_p7", nutrition: 7, saturation: 0.7286, cn: "\u6668\u661F\u7737\u987E\u7684\u9762\u5305", en: "Dawnstar Bread" }
    ]
  },
  {
    key: "carrot",
    id: "minecraft:carrot",
    cn: "\u80E1\u841D\u535C",
    en: "Carrot",
    family: "vegetable",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 3,
    baseSaturation: 0.6,
    vanillaFood: { nutrition: 3, saturation_modifier: "normal" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:carrot_p0", nutrition: 2, saturation: 0.495, cn: "\u6210\u8272\u6B20\u4F73\u7684\u80E1\u841D\u535C", en: "Flawed Carrot" },
      { tier: 1, tierId: "p1", id: "kira_food:carrot_p1", nutrition: 3, saturation: 0.6, cn: "\u65B0\u9C9C\u7684\u80E1\u841D\u535C", en: "Carrot" },
      { tier: 2, tierId: "p2", id: "kira_food:carrot_p2", nutrition: 3, saturation: 0.672, cn: "\u7CBE\u6311\u7EC6\u9009\u7684\u80E1\u841D\u535C", en: "Improved Carrot" },
      { tier: 3, tierId: "p3", id: "kira_food:carrot_p3", nutrition: 4, saturation: 0.54, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6311\u9009\u7684\u80E1\u841D\u535C", en: "Refined Carrot" },
      { tier: 4, tierId: "p4", id: "kira_food:carrot_p4", nutrition: 4, saturation: 0.585, cn: "\u679C\u56ED\u73CD\u9009\u7684\u80E1\u841D\u535C", en: "Artisan Carrot" },
      { tier: 5, tierId: "p5", id: "kira_food:carrot_p5", nutrition: 5, saturation: 0.504, cn: "\u8282\u5E86\u7CBE\u9009\u7684\u80E1\u841D\u535C", en: "Reserved Carrot" },
      { tier: 6, tierId: "p6", id: "kira_food:carrot_p6", nutrition: 5, saturation: 0.558, cn: "\u4F20\u627F\u80B2\u79CD\u7684\u80E1\u841D\u535C", en: "Heritage Carrot" },
      { tier: 7, tierId: "p7", id: "kira_food:carrot_p7", nutrition: 5, saturation: 0.612, cn: "\u66D9\u5149\u6620\u7167\u7684\u80E1\u841D\u535C", en: "Dawnstar Carrot" }
    ]
  },
  {
    key: "chorus_fruit",
    id: "minecraft:chorus_fruit",
    cn: "\u7D2B\u9882\u679C",
    en: "Chorus Fruit",
    family: "fruit",
    mode: "protected",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 4,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 4, saturation_modifier: "low", on_use_action: "chorus_teleport", on_use_range: [8, 8, 8], cooldown_type: "chorusfruit", cooldown_time: 20, can_always_eat: !0 },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:chorus_fruit_p0", nutrition: 4, saturation: 0.3, cn: "\u6210\u8272\u6B20\u4F73\u7684\u7D2B\u9882\u679C", en: "Flawed Chorus Fruit" },
      { tier: 1, tierId: "p1", id: "kira_food:chorus_fruit_p1", nutrition: 4, saturation: 0.3, cn: "\u5F53\u5B63\u7D2B\u9882\u679C", en: "Chorus Fruit" },
      { tier: 2, tierId: "p2", id: "kira_food:chorus_fruit_p2", nutrition: 4, saturation: 0.3, cn: "\u679C\u56ED\u7CBE\u9009\u7684\u7D2B\u9882\u679C", en: "Improved Chorus Fruit" },
      { tier: 3, tierId: "p3", id: "kira_food:chorus_fruit_p3", nutrition: 4, saturation: 0.3, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6311\u9009\u7684\u7D2B\u9882\u679C", en: "Refined Chorus Fruit" },
      { tier: 4, tierId: "p4", id: "kira_food:chorus_fruit_p4", nutrition: 4, saturation: 0.3, cn: "\u679C\u56ED\u73CD\u9009\u7684\u7D2B\u9882\u679C", en: "Artisan Chorus Fruit" },
      { tier: 5, tierId: "p5", id: "kira_food:chorus_fruit_p5", nutrition: 4, saturation: 0.3, cn: "\u8282\u5E86\u7CBE\u9009\u7684\u7D2B\u9882\u679C", en: "Reserved Chorus Fruit" },
      { tier: 6, tierId: "p6", id: "kira_food:chorus_fruit_p6", nutrition: 4, saturation: 0.3, cn: "\u8001\u6811\u7CBE\u9009\u7684\u7D2B\u9882\u679C", en: "Heritage Chorus Fruit" },
      { tier: 7, tierId: "p7", id: "kira_food:chorus_fruit_p7", nutrition: 4, saturation: 0.3, cn: "\u66D9\u5149\u6620\u7167\u7684\u7D2B\u9882\u679C", en: "Dawnstar Chorus Fruit" }
    ]
  },
  {
    key: "cooked_chicken",
    id: "minecraft:cooked_chicken",
    cn: "\u719F\u9E21\u8089",
    en: "Cooked Chicken",
    family: "meat",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 6,
    baseSaturation: 0.6,
    vanillaFood: { nutrition: 6, saturation_modifier: "normal" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:cooked_chicken_p0", nutrition: 4, saturation: 0.495, cn: "\u70E4\u5236\u5931\u5F53\u7684\u719F\u9E21\u8089", en: "Flawed Cooked Chicken" },
      { tier: 1, tierId: "p1", id: "kira_food:cooked_chicken_p1", nutrition: 6, saturation: 0.6, cn: "\u5BB6\u5E38\u719F\u9E21\u8089", en: "Cooked Chicken" },
      { tier: 2, tierId: "p2", id: "kira_food:cooked_chicken_p2", nutrition: 6, saturation: 0.672, cn: "\u7CBE\u9009\u8089\u6E90\u7684\u719F\u9E21\u8089", en: "Improved Cooked Chicken" },
      { tier: 3, tierId: "p3", id: "kira_food:cooked_chicken_p3", nutrition: 7, saturation: 0.6171, cn: "\u706B\u5019\u8003\u7A76\u7684\u719F\u9E21\u8089", en: "Refined Cooked Chicken" },
      { tier: 4, tierId: "p4", id: "kira_food:cooked_chicken_p4", nutrition: 7, saturation: 0.6686, cn: "\u5320\u4EBA\u624B\u4F5C\u7684\u719F\u9E21\u8089", en: "Artisan Cooked Chicken" },
      { tier: 5, tierId: "p5", id: "kira_food:cooked_chicken_p5", nutrition: 8, saturation: 0.63, cn: "\u5BB4\u5E2D\u7CBE\u9009\u7684\u719F\u9E21\u8089", en: "Reserved Cooked Chicken" },
      { tier: 6, tierId: "p6", id: "kira_food:cooked_chicken_p6", nutrition: 8, saturation: 0.6975, cn: "\u8001\u94FA\u79D8\u5236\u7684\u719F\u9E21\u8089", en: "Heritage Cooked Chicken" },
      { tier: 7, tierId: "p7", id: "kira_food:cooked_chicken_p7", nutrition: 8, saturation: 0.765, cn: "\u65E5\u5195\u706B\u5019\u6DEC\u70BC\u7684\u719F\u9E21\u8089", en: "Dawnstar Cooked Chicken" }
    ]
  },
  {
    key: "cooked_cod",
    id: "minecraft:cooked_cod",
    cn: "\u719F\u9CD5\u9C7C",
    en: "Cooked Cod",
    family: "fish",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 5,
    baseSaturation: 0.6,
    vanillaFood: { nutrition: 5, saturation_modifier: "normal" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:cooked_cod_p0", nutrition: 3, saturation: 0.55, cn: "\u70E4\u5236\u5931\u5F53\u7684\u719F\u9CD5\u9C7C", en: "Flawed Cooked Cod" },
      { tier: 1, tierId: "p1", id: "kira_food:cooked_cod_p1", nutrition: 5, saturation: 0.6, cn: "\u5BB6\u5E38\u719F\u9CD5\u9C7C", en: "Cooked Cod" },
      { tier: 2, tierId: "p2", id: "kira_food:cooked_cod_p2", nutrition: 5, saturation: 0.672, cn: "\u5904\u7406\u5F97\u5F53\u7684\u719F\u9CD5\u9C7C", en: "Improved Cooked Cod" },
      { tier: 3, tierId: "p3", id: "kira_food:cooked_cod_p3", nutrition: 6, saturation: 0.6, cn: "\u706B\u5019\u8003\u7A76\u7684\u719F\u9CD5\u9C7C", en: "Refined Cooked Cod" },
      { tier: 4, tierId: "p4", id: "kira_food:cooked_cod_p4", nutrition: 6, saturation: 0.65, cn: "\u540D\u53A8\u76D1\u5236\u7684\u719F\u9CD5\u9C7C", en: "Artisan Cooked Cod" },
      { tier: 5, tierId: "p5", id: "kira_food:cooked_cod_p5", nutrition: 7, saturation: 0.6, cn: "\u5BB4\u5E2D\u7CBE\u9009\u7684\u719F\u9CD5\u9C7C", en: "Reserved Cooked Cod" },
      { tier: 6, tierId: "p6", id: "kira_food:cooked_cod_p6", nutrition: 7, saturation: 0.6643, cn: "\u8001\u94FA\u79D8\u5236\u7684\u719F\u9CD5\u9C7C", en: "Heritage Cooked Cod" },
      { tier: 7, tierId: "p7", id: "kira_food:cooked_cod_p7", nutrition: 7, saturation: 0.7286, cn: "\u661F\u6F6E\u73CD\u9009\u7684\u719F\u9CD5\u9C7C", en: "Dawnstar Cooked Cod" }
    ]
  },
  {
    key: "cooked_mutton",
    id: "minecraft:cooked_mutton",
    cn: "\u719F\u7F8A\u8089",
    en: "Cooked Mutton",
    family: "meat",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 6,
    baseSaturation: 0.8,
    vanillaFood: { nutrition: 6, saturation_modifier: "good" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:cooked_mutton_p0", nutrition: 4, saturation: 0.66, cn: "\u70E4\u5236\u5931\u5F53\u7684\u719F\u7F8A\u8089", en: "Flawed Cooked Mutton" },
      { tier: 1, tierId: "p1", id: "kira_food:cooked_mutton_p1", nutrition: 6, saturation: 0.8, cn: "\u5BB6\u5E38\u719F\u7F8A\u8089", en: "Cooked Mutton" },
      { tier: 2, tierId: "p2", id: "kira_food:cooked_mutton_p2", nutrition: 6, saturation: 0.896, cn: "\u7CBE\u9009\u8089\u6E90\u7684\u719F\u7F8A\u8089", en: "Improved Cooked Mutton" },
      { tier: 3, tierId: "p3", id: "kira_food:cooked_mutton_p3", nutrition: 7, saturation: 0.8229, cn: "\u706B\u5019\u8003\u7A76\u7684\u719F\u7F8A\u8089", en: "Refined Cooked Mutton" },
      { tier: 4, tierId: "p4", id: "kira_food:cooked_mutton_p4", nutrition: 7, saturation: 0.8914, cn: "\u5320\u4EBA\u624B\u4F5C\u7684\u719F\u7F8A\u8089", en: "Artisan Cooked Mutton" },
      { tier: 5, tierId: "p5", id: "kira_food:cooked_mutton_p5", nutrition: 8, saturation: 0.84, cn: "\u5BB4\u5E2D\u7CBE\u9009\u7684\u719F\u7F8A\u8089", en: "Reserved Cooked Mutton" },
      { tier: 6, tierId: "p6", id: "kira_food:cooked_mutton_p6", nutrition: 8, saturation: 0.93, cn: "\u8001\u94FA\u79D8\u5236\u7684\u719F\u7F8A\u8089", en: "Heritage Cooked Mutton" },
      { tier: 7, tierId: "p7", id: "kira_food:cooked_mutton_p7", nutrition: 8, saturation: 1.02, cn: "\u65E5\u5195\u706B\u5019\u6DEC\u70BC\u7684\u719F\u7F8A\u8089", en: "Dawnstar Cooked Mutton" }
    ]
  },
  {
    key: "cooked_porkchop",
    id: "minecraft:cooked_porkchop",
    cn: "\u719F\u732A\u6392",
    en: "Cooked Porkchop",
    family: "meat",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 8,
    baseSaturation: 0.8,
    vanillaFood: { nutrition: 8, saturation_modifier: "good" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:cooked_porkchop_p0", nutrition: 6, saturation: 0.5867, cn: "\u70E4\u5236\u5931\u5F53\u7684\u719F\u732A\u6392", en: "Flawed Cooked Porkchop" },
      { tier: 1, tierId: "p1", id: "kira_food:cooked_porkchop_p1", nutrition: 8, saturation: 0.8, cn: "\u5BB6\u5E38\u719F\u732A\u6392", en: "Cooked Porkchop" },
      { tier: 2, tierId: "p2", id: "kira_food:cooked_porkchop_p2", nutrition: 8, saturation: 0.896, cn: "\u7CBE\u9009\u8089\u6E90\u7684\u719F\u732A\u6392", en: "Improved Cooked Porkchop" },
      { tier: 3, tierId: "p3", id: "kira_food:cooked_porkchop_p3", nutrition: 9, saturation: 0.8533, cn: "\u706B\u5019\u8003\u7A76\u7684\u719F\u732A\u6392", en: "Refined Cooked Porkchop" },
      { tier: 4, tierId: "p4", id: "kira_food:cooked_porkchop_p4", nutrition: 9, saturation: 0.9244, cn: "\u5320\u4EBA\u624B\u4F5C\u7684\u719F\u732A\u6392", en: "Artisan Cooked Porkchop" },
      { tier: 5, tierId: "p5", id: "kira_food:cooked_porkchop_p5", nutrition: 10, saturation: 0.896, cn: "\u5BB4\u5E2D\u7CBE\u9009\u7684\u719F\u732A\u6392", en: "Reserved Cooked Porkchop" },
      { tier: 6, tierId: "p6", id: "kira_food:cooked_porkchop_p6", nutrition: 10, saturation: 0.992, cn: "\u8001\u94FA\u79D8\u5236\u7684\u719F\u732A\u6392", en: "Heritage Cooked Porkchop" },
      { tier: 7, tierId: "p7", id: "kira_food:cooked_porkchop_p7", nutrition: 10, saturation: 1.088, cn: "\u65E5\u5195\u706B\u5019\u6DEC\u70BC\u7684\u719F\u732A\u6392", en: "Dawnstar Cooked Porkchop" }
    ]
  },
  {
    key: "cooked_rabbit",
    id: "minecraft:cooked_rabbit",
    cn: "\u719F\u5154\u8089",
    en: "Cooked Rabbit",
    family: "meat",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 5,
    baseSaturation: 0.6,
    vanillaFood: { nutrition: 5, saturation_modifier: "normal" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:cooked_rabbit_p0", nutrition: 3, saturation: 0.55, cn: "\u70E4\u5236\u5931\u5F53\u7684\u719F\u5154\u8089", en: "Flawed Cooked Rabbit" },
      { tier: 1, tierId: "p1", id: "kira_food:cooked_rabbit_p1", nutrition: 5, saturation: 0.6, cn: "\u5BB6\u5E38\u719F\u5154\u8089", en: "Cooked Rabbit" },
      { tier: 2, tierId: "p2", id: "kira_food:cooked_rabbit_p2", nutrition: 5, saturation: 0.672, cn: "\u7CBE\u9009\u8089\u6E90\u7684\u719F\u5154\u8089", en: "Improved Cooked Rabbit" },
      { tier: 3, tierId: "p3", id: "kira_food:cooked_rabbit_p3", nutrition: 6, saturation: 0.6, cn: "\u706B\u5019\u8003\u7A76\u7684\u719F\u5154\u8089", en: "Refined Cooked Rabbit" },
      { tier: 4, tierId: "p4", id: "kira_food:cooked_rabbit_p4", nutrition: 6, saturation: 0.65, cn: "\u5320\u4EBA\u624B\u4F5C\u7684\u719F\u5154\u8089", en: "Artisan Cooked Rabbit" },
      { tier: 5, tierId: "p5", id: "kira_food:cooked_rabbit_p5", nutrition: 7, saturation: 0.6, cn: "\u5BB4\u5E2D\u7CBE\u9009\u7684\u719F\u5154\u8089", en: "Reserved Cooked Rabbit" },
      { tier: 6, tierId: "p6", id: "kira_food:cooked_rabbit_p6", nutrition: 7, saturation: 0.6643, cn: "\u8001\u94FA\u79D8\u5236\u7684\u719F\u5154\u8089", en: "Heritage Cooked Rabbit" },
      { tier: 7, tierId: "p7", id: "kira_food:cooked_rabbit_p7", nutrition: 7, saturation: 0.7286, cn: "\u65E5\u5195\u706B\u5019\u6DEC\u70BC\u7684\u719F\u5154\u8089", en: "Dawnstar Cooked Rabbit" }
    ]
  },
  {
    key: "cooked_salmon",
    id: "minecraft:cooked_salmon",
    cn: "\u719F\u9C91\u9C7C",
    en: "Cooked Salmon",
    family: "fish",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 6,
    baseSaturation: 0.8,
    vanillaFood: { nutrition: 6, saturation_modifier: "good" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:cooked_salmon_p0", nutrition: 4, saturation: 0.66, cn: "\u70E4\u5236\u5931\u5F53\u7684\u719F\u9C91\u9C7C", en: "Flawed Cooked Salmon" },
      { tier: 1, tierId: "p1", id: "kira_food:cooked_salmon_p1", nutrition: 6, saturation: 0.8, cn: "\u5BB6\u5E38\u719F\u9C91\u9C7C", en: "Cooked Salmon" },
      { tier: 2, tierId: "p2", id: "kira_food:cooked_salmon_p2", nutrition: 6, saturation: 0.896, cn: "\u5904\u7406\u5F97\u5F53\u7684\u719F\u9C91\u9C7C", en: "Improved Cooked Salmon" },
      { tier: 3, tierId: "p3", id: "kira_food:cooked_salmon_p3", nutrition: 7, saturation: 0.8229, cn: "\u706B\u5019\u8003\u7A76\u7684\u719F\u9C91\u9C7C", en: "Refined Cooked Salmon" },
      { tier: 4, tierId: "p4", id: "kira_food:cooked_salmon_p4", nutrition: 7, saturation: 0.8914, cn: "\u540D\u53A8\u76D1\u5236\u7684\u719F\u9C91\u9C7C", en: "Artisan Cooked Salmon" },
      { tier: 5, tierId: "p5", id: "kira_food:cooked_salmon_p5", nutrition: 8, saturation: 0.84, cn: "\u5BB4\u5E2D\u7CBE\u9009\u7684\u719F\u9C91\u9C7C", en: "Reserved Cooked Salmon" },
      { tier: 6, tierId: "p6", id: "kira_food:cooked_salmon_p6", nutrition: 8, saturation: 0.93, cn: "\u8001\u94FA\u79D8\u5236\u7684\u719F\u9C91\u9C7C", en: "Heritage Cooked Salmon" },
      { tier: 7, tierId: "p7", id: "kira_food:cooked_salmon_p7", nutrition: 8, saturation: 1.02, cn: "\u661F\u6F6E\u73CD\u9009\u7684\u719F\u9C91\u9C7C", en: "Dawnstar Cooked Salmon" }
    ]
  },
  {
    key: "cookie",
    id: "minecraft:cookie",
    cn: "\u66F2\u5947",
    en: "Cookie",
    family: "dessert",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 2,
    baseSaturation: 0.1,
    vanillaFood: { nutrition: 2, saturation_modifier: "poor" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:cookie_p0", nutrition: 1, saturation: 0.11, cn: "\u7565\u5E26\u7126\u5473\u7684\u66F2\u5947", en: "Flawed Cookie" },
      { tier: 1, tierId: "p1", id: "kira_food:cookie_p1", nutrition: 2, saturation: 0.1, cn: "\u6734\u7D20\u7684\u66F2\u5947", en: "Cookie" },
      { tier: 2, tierId: "p2", id: "kira_food:cookie_p2", nutrition: 2, saturation: 0.112, cn: "\u6539\u826F\u914D\u65B9\u7684\u66F2\u5947", en: "Improved Cookie" },
      { tier: 3, tierId: "p3", id: "kira_food:cookie_p3", nutrition: 3, saturation: 0.08, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u70D8\u7119\u7684\u66F2\u5947", en: "Refined Cookie" },
      { tier: 4, tierId: "p4", id: "kira_food:cookie_p4", nutrition: 3, saturation: 0.0867, cn: "\u540D\u53A8\u76D1\u5236\u7684\u66F2\u5947", en: "Artisan Cookie" },
      { tier: 5, tierId: "p5", id: "kira_food:cookie_p5", nutrition: 4, saturation: 0.07, cn: "\u5BB4\u5E2D\u73CD\u85CF\u7684\u66F2\u5947", en: "Reserved Cookie" },
      { tier: 6, tierId: "p6", id: "kira_food:cookie_p6", nutrition: 4, saturation: 0.0775, cn: "\u4F20\u4E16\u914D\u65B9\u70D8\u7119\u7684\u66F2\u5947", en: "Heritage Cookie" },
      { tier: 7, tierId: "p7", id: "kira_food:cookie_p7", nutrition: 4, saturation: 0.085, cn: "\u6668\u661F\u7737\u987E\u7684\u66F2\u5947", en: "Dawnstar Cookie" }
    ]
  },
  {
    key: "dried_kelp",
    id: "minecraft:dried_kelp",
    cn: "\u5E72\u6D77\u5E26",
    en: "Dried Kelp",
    family: "bakery",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 1,
    baseSaturation: 0.1,
    vanillaFood: { nutrition: 1, saturation_modifier: "poor" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:dried_kelp_p0", nutrition: 1, saturation: 0.055, cn: "\u706B\u5019\u5931\u51C6\u7684\u5E72\u6D77\u5E26", en: "Flawed Dried Kelp" },
      { tier: 1, tierId: "p1", id: "kira_food:dried_kelp_p1", nutrition: 1, saturation: 0.1, cn: "\u5BB6\u5E38\u5E72\u6D77\u5E26", en: "Dried Kelp" },
      { tier: 2, tierId: "p2", id: "kira_food:dried_kelp_p2", nutrition: 1, saturation: 0.112, cn: "\u6539\u826F\u914D\u65B9\u7684\u5E72\u6D77\u5E26", en: "Improved Dried Kelp" },
      { tier: 3, tierId: "p3", id: "kira_food:dried_kelp_p3", nutrition: 2, saturation: 0.06, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6539\u826F\u7684\u5E72\u6D77\u5E26", en: "Refined Dried Kelp" },
      { tier: 4, tierId: "p4", id: "kira_food:dried_kelp_p4", nutrition: 2, saturation: 0.065, cn: "\u540D\u53A8\u76D1\u5236\u7684\u5E72\u6D77\u5E26", en: "Artisan Dried Kelp" },
      { tier: 5, tierId: "p5", id: "kira_food:dried_kelp_p5", nutrition: 3, saturation: 0.0467, cn: "\u5BB4\u5E2D\u73CD\u85CF\u7684\u5E72\u6D77\u5E26", en: "Reserved Dried Kelp" },
      { tier: 6, tierId: "p6", id: "kira_food:dried_kelp_p6", nutrition: 3, saturation: 0.0517, cn: "\u4F20\u4E16\u914D\u65B9\u70D8\u7119\u7684\u5E72\u6D77\u5E26", en: "Heritage Dried Kelp" },
      { tier: 7, tierId: "p7", id: "kira_food:dried_kelp_p7", nutrition: 3, saturation: 0.0567, cn: "\u6668\u661F\u7737\u987E\u7684\u5E72\u6D77\u5E26", en: "Dawnstar Dried Kelp" }
    ]
  },
  {
    key: "enchanted_golden_apple",
    id: "minecraft:enchanted_golden_apple",
    cn: "\u9644\u9B54\u91D1\u82F9\u679C",
    en: "Enchanted Golden Apple",
    family: "special",
    mode: "protected",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 4,
    baseSaturation: 1.2,
    vanillaFood: { nutrition: 4, saturation_modifier: "supernatural", can_always_eat: !0, effects: [{ name: "regeneration", chance: 1, duration: 30, amplifier: 1 }, { name: "absorption", chance: 1, duration: 120, amplifier: 3 }, { name: "resistance", chance: 1, duration: 300, amplifier: 0 }, { name: "fire_resistance", chance: 1, duration: 300, amplifier: 0 }] },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:enchanted_golden_apple_p0", nutrition: 4, saturation: 1.2, cn: "\u5149\u8F89\u7A0D\u5F31\u7684\u9644\u9B54\u91D1\u82F9\u679C", en: "Flawed Enchanted Golden Apple" },
      { tier: 1, tierId: "p1", id: "kira_food:enchanted_golden_apple_p1", nutrition: 4, saturation: 1.2, cn: "\u7A33\u5B9A\u8F89\u6620\u7684\u9644\u9B54\u91D1\u82F9\u679C", en: "Enchanted Golden Apple" },
      { tier: 2, tierId: "p2", id: "kira_food:enchanted_golden_apple_p2", nutrition: 4, saturation: 1.2, cn: "\u5149\u8F89\u51DD\u5B9E\u7684\u9644\u9B54\u91D1\u82F9\u679C", en: "Improved Enchanted Golden Apple" },
      { tier: 3, tierId: "p3", id: "kira_food:enchanted_golden_apple_p3", nutrition: 4, saturation: 1.2, cn: "\u7ECF\u8FC7\u7CBE\u7EC6\u6DEC\u70BC\u7684\u9644\u9B54\u91D1\u82F9\u679C", en: "Refined Enchanted Golden Apple" },
      { tier: 4, tierId: "p4", id: "kira_food:enchanted_golden_apple_p4", nutrition: 4, saturation: 1.2, cn: "\u5320\u5FC3\u7A33\u5B9A\u7684\u9644\u9B54\u91D1\u82F9\u679C", en: "Artisan Enchanted Golden Apple" },
      { tier: 5, tierId: "p5", id: "kira_food:enchanted_golden_apple_p5", nutrition: 4, saturation: 1.2, cn: "\u73CD\u85CF\u8F89\u5149\u7684\u9644\u9B54\u91D1\u82F9\u679C", en: "Reserved Enchanted Golden Apple" },
      { tier: 6, tierId: "p6", id: "kira_food:enchanted_golden_apple_p6", nutrition: 4, saturation: 1.2, cn: "\u4F20\u4E16\u8F89\u5149\u7684\u9644\u9B54\u91D1\u82F9\u679C", en: "Heritage Enchanted Golden Apple" },
      { tier: 7, tierId: "p7", id: "kira_food:enchanted_golden_apple_p7", nutrition: 4, saturation: 1.2, cn: "\u6668\u661F\u7167\u8000\u7684\u9644\u9B54\u91D1\u82F9\u679C", en: "Dawnstar Enchanted Golden Apple" }
    ]
  },
  {
    key: "glow_berries",
    id: "minecraft:glow_berries",
    cn: "\u53D1\u5149\u6D46\u679C",
    en: "Glow Berries",
    family: "fruit",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 2,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 2, saturation_modifier: "low", is_meat: !1 },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:glow_berries_p0", nutrition: 1, saturation: 0.33, cn: "\u6210\u8272\u6B20\u4F73\u7684\u53D1\u5149\u6D46\u679C", en: "Flawed Glow Berries" },
      { tier: 1, tierId: "p1", id: "kira_food:glow_berries_p1", nutrition: 2, saturation: 0.3, cn: "\u5F53\u5B63\u53D1\u5149\u6D46\u679C", en: "Glow Berries" },
      { tier: 2, tierId: "p2", id: "kira_food:glow_berries_p2", nutrition: 2, saturation: 0.336, cn: "\u679C\u56ED\u7CBE\u9009\u7684\u53D1\u5149\u6D46\u679C", en: "Improved Glow Berries" },
      { tier: 3, tierId: "p3", id: "kira_food:glow_berries_p3", nutrition: 3, saturation: 0.24, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6311\u9009\u7684\u53D1\u5149\u6D46\u679C", en: "Refined Glow Berries" },
      { tier: 4, tierId: "p4", id: "kira_food:glow_berries_p4", nutrition: 3, saturation: 0.26, cn: "\u679C\u56ED\u73CD\u9009\u7684\u53D1\u5149\u6D46\u679C", en: "Artisan Glow Berries" },
      { tier: 5, tierId: "p5", id: "kira_food:glow_berries_p5", nutrition: 4, saturation: 0.21, cn: "\u8282\u5E86\u7CBE\u9009\u7684\u53D1\u5149\u6D46\u679C", en: "Reserved Glow Berries" },
      { tier: 6, tierId: "p6", id: "kira_food:glow_berries_p6", nutrition: 4, saturation: 0.2325, cn: "\u8001\u6811\u7CBE\u9009\u7684\u53D1\u5149\u6D46\u679C", en: "Heritage Glow Berries" },
      { tier: 7, tierId: "p7", id: "kira_food:glow_berries_p7", nutrition: 4, saturation: 0.255, cn: "\u66D9\u5149\u6620\u7167\u7684\u53D1\u5149\u6D46\u679C", en: "Dawnstar Glow Berries" }
    ]
  },
  {
    key: "golden_apple",
    id: "minecraft:golden_apple",
    cn: "\u91D1\u82F9\u679C",
    en: "Golden Apple",
    family: "special",
    mode: "protected",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 4,
    baseSaturation: 1.2,
    vanillaFood: { nutrition: 4, saturation_modifier: "supernatural", can_always_eat: !0, effects: [{ name: "regeneration", chance: 1, duration: 5, amplifier: 1 }, { name: "absorption", chance: 1, duration: 120, amplifier: 0 }] },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:golden_apple_p0", nutrition: 4, saturation: 1.2, cn: "\u5149\u6CFD\u7A0D\u6697\u7684\u91D1\u82F9\u679C", en: "Flawed Golden Apple" },
      { tier: 1, tierId: "p1", id: "kira_food:golden_apple_p1", nutrition: 4, saturation: 1.2, cn: "\u5149\u6CFD\u7A33\u5B9A\u7684\u91D1\u82F9\u679C", en: "Golden Apple" },
      { tier: 2, tierId: "p2", id: "kira_food:golden_apple_p2", nutrition: 4, saturation: 1.2, cn: "\u91D1\u7B94\u8272\u6CFD\u9C9C\u660E\u7684\u91D1\u82F9\u679C", en: "Improved Golden Apple" },
      { tier: 3, tierId: "p3", id: "kira_food:golden_apple_p3", nutrition: 4, saturation: 1.2, cn: "\u7ECF\u8FC7\u7CBE\u7EC6\u5305\u88F9\u7684\u91D1\u82F9\u679C", en: "Refined Golden Apple" },
      { tier: 4, tierId: "p4", id: "kira_food:golden_apple_p4", nutrition: 4, saturation: 1.2, cn: "\u5320\u5FC3\u953B\u5236\u5916\u89C2\u7684\u91D1\u82F9\u679C", en: "Artisan Golden Apple" },
      { tier: 5, tierId: "p5", id: "kira_food:golden_apple_p5", nutrition: 4, saturation: 1.2, cn: "\u5BB4\u5E2D\u73CD\u85CF\u7684\u91D1\u82F9\u679C", en: "Reserved Golden Apple" },
      { tier: 6, tierId: "p6", id: "kira_food:golden_apple_p6", nutrition: 4, saturation: 1.2, cn: "\u4F20\u627F\u5DE5\u827A\u7684\u91D1\u82F9\u679C", en: "Heritage Golden Apple" },
      { tier: 7, tierId: "p7", id: "kira_food:golden_apple_p7", nutrition: 4, saturation: 1.2, cn: "\u6668\u661F\u8F89\u6620\u7684\u91D1\u82F9\u679C", en: "Dawnstar Golden Apple" }
    ]
  },
  {
    key: "golden_carrot",
    id: "minecraft:golden_carrot",
    cn: "\u91D1\u80E1\u841D\u535C",
    en: "Golden Carrot",
    family: "vegetable",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 6,
    baseSaturation: 1.2,
    vanillaFood: { nutrition: 6, saturation_modifier: "supernatural" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:golden_carrot_p0", nutrition: 4, saturation: 0.99, cn: "\u6210\u8272\u6B20\u4F73\u7684\u91D1\u80E1\u841D\u535C", en: "Flawed Golden Carrot" },
      { tier: 1, tierId: "p1", id: "kira_food:golden_carrot_p1", nutrition: 6, saturation: 1.2, cn: "\u65B0\u9C9C\u7684\u91D1\u80E1\u841D\u535C", en: "Golden Carrot" },
      { tier: 2, tierId: "p2", id: "kira_food:golden_carrot_p2", nutrition: 6, saturation: 1.344, cn: "\u7CBE\u6311\u7EC6\u9009\u7684\u91D1\u80E1\u841D\u535C", en: "Improved Golden Carrot" },
      { tier: 3, tierId: "p3", id: "kira_food:golden_carrot_p3", nutrition: 7, saturation: 1.2343, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6311\u9009\u7684\u91D1\u80E1\u841D\u535C", en: "Refined Golden Carrot" },
      { tier: 4, tierId: "p4", id: "kira_food:golden_carrot_p4", nutrition: 7, saturation: 1.3371, cn: "\u679C\u56ED\u73CD\u9009\u7684\u91D1\u80E1\u841D\u535C", en: "Artisan Golden Carrot" },
      { tier: 5, tierId: "p5", id: "kira_food:golden_carrot_p5", nutrition: 8, saturation: 1.26, cn: "\u8282\u5E86\u7CBE\u9009\u7684\u91D1\u80E1\u841D\u535C", en: "Reserved Golden Carrot" },
      { tier: 6, tierId: "p6", id: "kira_food:golden_carrot_p6", nutrition: 8, saturation: 1.395, cn: "\u4F20\u627F\u80B2\u79CD\u7684\u91D1\u80E1\u841D\u535C", en: "Heritage Golden Carrot" },
      { tier: 7, tierId: "p7", id: "kira_food:golden_carrot_p7", nutrition: 8, saturation: 1.53, cn: "\u66D9\u5149\u6620\u7167\u7684\u91D1\u80E1\u841D\u535C", en: "Dawnstar Golden Carrot" }
    ]
  },
  {
    key: "honey_bottle",
    id: "minecraft:honey_bottle",
    cn: "\u8702\u871C\u74F6",
    en: "Honey Bottle",
    family: "special",
    mode: "protected",
    kiraOverlay: "normal",
    stack: 16,
    baseNutrition: 6,
    baseSaturation: 0.1,
    vanillaFood: { nutrition: 6, saturation_modifier: "poor", can_always_eat: !0, using_converts_to: "glass_bottle", remove_effects: ["poison"] },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:honey_bottle_p0", nutrition: 6, saturation: 0.1, cn: "\u5149\u6CFD\u7A0D\u6697\u7684\u8702\u871C\u74F6", en: "Flawed Honey Bottle" },
      { tier: 1, tierId: "p1", id: "kira_food:honey_bottle_p1", nutrition: 6, saturation: 0.1, cn: "\u5149\u6CFD\u7A33\u5B9A\u7684\u8702\u871C\u74F6", en: "Honey Bottle" },
      { tier: 2, tierId: "p2", id: "kira_food:honey_bottle_p2", nutrition: 6, saturation: 0.1, cn: "\u8272\u6CFD\u9C9C\u660E\u7684\u8702\u871C\u74F6", en: "Improved Honey Bottle" },
      { tier: 3, tierId: "p3", id: "kira_food:honey_bottle_p3", nutrition: 6, saturation: 0.1, cn: "\u7ECF\u8FC7\u7CBE\u7EC6\u5305\u88F9\u7684\u8702\u871C\u74F6", en: "Refined Honey Bottle" },
      { tier: 4, tierId: "p4", id: "kira_food:honey_bottle_p4", nutrition: 6, saturation: 0.1, cn: "\u5320\u5FC3\u953B\u5236\u7684\u8702\u871C\u74F6", en: "Artisan Honey Bottle" },
      { tier: 5, tierId: "p5", id: "kira_food:honey_bottle_p5", nutrition: 6, saturation: 0.1, cn: "\u5BB4\u5E2D\u73CD\u85CF\u7684\u8702\u871C\u74F6", en: "Reserved Honey Bottle" },
      { tier: 6, tierId: "p6", id: "kira_food:honey_bottle_p6", nutrition: 6, saturation: 0.1, cn: "\u4F20\u4E16\u5DE5\u827A\u7684\u8702\u871C\u74F6", en: "Heritage Honey Bottle" },
      { tier: 7, tierId: "p7", id: "kira_food:honey_bottle_p7", nutrition: 6, saturation: 0.1, cn: "\u6668\u661F\u8F89\u6620\u7684\u8702\u871C\u74F6", en: "Dawnstar Honey Bottle" }
    ]
  },
  {
    key: "melon_slice",
    id: "minecraft:melon_slice",
    cn: "\u897F\u74DC\u7247",
    en: "Melon Slice",
    family: "fruit",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 2,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 2, saturation_modifier: "low" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:melon_slice_p0", nutrition: 1, saturation: 0.33, cn: "\u6210\u8272\u6B20\u4F73\u7684\u897F\u74DC\u7247", en: "Flawed Melon Slice" },
      { tier: 1, tierId: "p1", id: "kira_food:melon_slice_p1", nutrition: 2, saturation: 0.3, cn: "\u5F53\u5B63\u897F\u74DC\u7247", en: "Melon Slice" },
      { tier: 2, tierId: "p2", id: "kira_food:melon_slice_p2", nutrition: 2, saturation: 0.336, cn: "\u679C\u56ED\u7CBE\u9009\u7684\u897F\u74DC\u7247", en: "Improved Melon Slice" },
      { tier: 3, tierId: "p3", id: "kira_food:melon_slice_p3", nutrition: 3, saturation: 0.24, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6311\u9009\u7684\u897F\u74DC\u7247", en: "Refined Melon Slice" },
      { tier: 4, tierId: "p4", id: "kira_food:melon_slice_p4", nutrition: 3, saturation: 0.26, cn: "\u679C\u56ED\u73CD\u9009\u7684\u897F\u74DC\u7247", en: "Artisan Melon Slice" },
      { tier: 5, tierId: "p5", id: "kira_food:melon_slice_p5", nutrition: 4, saturation: 0.21, cn: "\u8282\u5E86\u7CBE\u9009\u7684\u897F\u74DC\u7247", en: "Reserved Melon Slice" },
      { tier: 6, tierId: "p6", id: "kira_food:melon_slice_p6", nutrition: 4, saturation: 0.2325, cn: "\u8001\u6811\u7CBE\u9009\u7684\u897F\u74DC\u7247", en: "Heritage Melon Slice" },
      { tier: 7, tierId: "p7", id: "kira_food:melon_slice_p7", nutrition: 4, saturation: 0.255, cn: "\u66D9\u5149\u6620\u7167\u7684\u897F\u74DC\u7247", en: "Dawnstar Melon Slice" }
    ]
  },
  {
    key: "mushroom_stew",
    id: "minecraft:mushroom_stew",
    cn: "\u8611\u83C7\u7172",
    en: "Mushroom Stew",
    family: "stew",
    mode: "full",
    kiraOverlay: "normal",
    stack: 1,
    baseNutrition: 6,
    baseSaturation: 0.6,
    vanillaFood: { nutrition: 6, saturation_modifier: "normal", using_converts_to: "bowl" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:mushroom_stew_p0", nutrition: 4, saturation: 0.495, cn: "\u8C03\u5473\u5931\u8861\u7684\u8611\u83C7\u7172", en: "Flawed Mushroom Stew" },
      { tier: 1, tierId: "p1", id: "kira_food:mushroom_stew_p1", nutrition: 6, saturation: 0.6, cn: "\u5BB6\u5E38\u8611\u83C7\u7172", en: "Mushroom Stew" },
      { tier: 2, tierId: "p2", id: "kira_food:mushroom_stew_p2", nutrition: 6, saturation: 0.672, cn: "\u914D\u6BD4\u7ECF\u8FC7\u8C03\u6574\u7684\u8611\u83C7\u7172", en: "Improved Mushroom Stew" },
      { tier: 3, tierId: "p3", id: "kira_food:mushroom_stew_p3", nutrition: 7, saturation: 0.6171, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u8C03\u5473\u7684\u8611\u83C7\u7172", en: "Refined Mushroom Stew" },
      { tier: 4, tierId: "p4", id: "kira_food:mushroom_stew_p4", nutrition: 7, saturation: 0.6686, cn: "\u540D\u53A8\u76D1\u5236\u7684\u8611\u83C7\u7172", en: "Artisan Mushroom Stew" },
      { tier: 5, tierId: "p5", id: "kira_food:mushroom_stew_p5", nutrition: 8, saturation: 0.63, cn: "\u76DB\u5BB4\u4E3B\u53A8\u7684\u8611\u83C7\u7172", en: "Reserved Mushroom Stew" },
      { tier: 6, tierId: "p6", id: "kira_food:mushroom_stew_p6", nutrition: 8, saturation: 0.6975, cn: "\u4F20\u4E16\u79D8\u65B9\u7096\u5236\u7684\u8611\u83C7\u7172", en: "Heritage Mushroom Stew" },
      { tier: 7, tierId: "p7", id: "kira_food:mushroom_stew_p7", nutrition: 8, saturation: 0.765, cn: "\u6668\u661F\u8D50\u798F\u7684\u8611\u83C7\u7172", en: "Dawnstar Mushroom Stew" }
    ]
  },
  {
    key: "poisonous_potato",
    id: "minecraft:poisonous_potato",
    cn: "\u6BD2\u9A6C\u94C3\u85AF",
    en: "Poisonous Potato",
    family: "risky",
    mode: "protected",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 2,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 2, saturation_modifier: "low", effects: [{ name: "poison", chance: 0.6, duration: 5, amplifier: 0 }] },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:poisonous_potato_p0", nutrition: 2, saturation: 0.3, cn: "\u5904\u7406\u5931\u5F53\u7684\u6BD2\u9A6C\u94C3\u85AF", en: "Flawed Poisonous Potato" },
      { tier: 1, tierId: "p1", id: "kira_food:poisonous_potato_p1", nutrition: 2, saturation: 0.3, cn: "\u5E38\u89C1\u7684\u6BD2\u9A6C\u94C3\u85AF", en: "Poisonous Potato" },
      { tier: 2, tierId: "p2", id: "kira_food:poisonous_potato_p2", nutrition: 2, saturation: 0.3, cn: "\u8C28\u614E\u5904\u7406\u7684\u6BD2\u9A6C\u94C3\u85AF", en: "Improved Poisonous Potato" },
      { tier: 3, tierId: "p3", id: "kira_food:poisonous_potato_p3", nutrition: 2, saturation: 0.3, cn: "\u7ECF\u8FC7\u7CBE\u7EC6\u5904\u7406\u7684\u6BD2\u9A6C\u94C3\u85AF", en: "Refined Poisonous Potato" },
      { tier: 4, tierId: "p4", id: "kira_food:poisonous_potato_p4", nutrition: 2, saturation: 0.3, cn: "\u8001\u624B\u5904\u7406\u7684\u6BD2\u9A6C\u94C3\u85AF", en: "Artisan Poisonous Potato" },
      { tier: 5, tierId: "p5", id: "kira_food:poisonous_potato_p5", nutrition: 2, saturation: 0.3, cn: "\u5BB4\u5E2D\u7EA7\u5904\u7406\u7684\u6BD2\u9A6C\u94C3\u85AF", en: "Reserved Poisonous Potato" },
      { tier: 6, tierId: "p6", id: "kira_food:poisonous_potato_p6", nutrition: 2, saturation: 0.3, cn: "\u53E4\u6CD5\u5904\u7406\u7684\u6BD2\u9A6C\u94C3\u85AF", en: "Heritage Poisonous Potato" },
      { tier: 7, tierId: "p7", id: "kira_food:poisonous_potato_p7", nutrition: 2, saturation: 0.3, cn: "\u661F\u6F6E\u73CD\u9009\u7684\u6BD2\u9A6C\u94C3\u85AF", en: "Dawnstar Poisonous Potato" }
    ]
  },
  {
    key: "potato",
    id: "minecraft:potato",
    cn: "\u9A6C\u94C3\u85AF",
    en: "Potato",
    family: "vegetable",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 1,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 1, saturation_modifier: "low" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:potato_p0", nutrition: 1, saturation: 0.165, cn: "\u6210\u8272\u6B20\u4F73\u7684\u9A6C\u94C3\u85AF", en: "Flawed Potato" },
      { tier: 1, tierId: "p1", id: "kira_food:potato_p1", nutrition: 1, saturation: 0.3, cn: "\u65B0\u9C9C\u7684\u9A6C\u94C3\u85AF", en: "Potato" },
      { tier: 2, tierId: "p2", id: "kira_food:potato_p2", nutrition: 1, saturation: 0.336, cn: "\u7CBE\u6311\u7EC6\u9009\u7684\u9A6C\u94C3\u85AF", en: "Improved Potato" },
      { tier: 3, tierId: "p3", id: "kira_food:potato_p3", nutrition: 2, saturation: 0.18, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6311\u9009\u7684\u9A6C\u94C3\u85AF", en: "Refined Potato" },
      { tier: 4, tierId: "p4", id: "kira_food:potato_p4", nutrition: 2, saturation: 0.195, cn: "\u679C\u56ED\u73CD\u9009\u7684\u9A6C\u94C3\u85AF", en: "Artisan Potato" },
      { tier: 5, tierId: "p5", id: "kira_food:potato_p5", nutrition: 3, saturation: 0.14, cn: "\u8282\u5E86\u7CBE\u9009\u7684\u9A6C\u94C3\u85AF", en: "Reserved Potato" },
      { tier: 6, tierId: "p6", id: "kira_food:potato_p6", nutrition: 3, saturation: 0.155, cn: "\u4F20\u627F\u80B2\u79CD\u7684\u9A6C\u94C3\u85AF", en: "Heritage Potato" },
      { tier: 7, tierId: "p7", id: "kira_food:potato_p7", nutrition: 3, saturation: 0.17, cn: "\u66D9\u5149\u6620\u7167\u7684\u9A6C\u94C3\u85AF", en: "Dawnstar Potato" }
    ]
  },
  {
    key: "pufferfish",
    id: "minecraft:pufferfish",
    cn: "\u6CB3\u8C5A",
    en: "Pufferfish",
    family: "risky",
    mode: "protected",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 1,
    baseSaturation: 0.1,
    vanillaFood: { nutrition: 1, saturation_modifier: "poor", effects: [{ name: "poison", duration: 60, amplifier: 1 }, { name: "nausea", duration: 15, amplifier: 0 }, { name: "hunger", duration: 15, amplifier: 2 }] },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:pufferfish_p0", nutrition: 1, saturation: 0.1, cn: "\u5904\u7406\u5931\u5F53\u7684\u6CB3\u8C5A", en: "Flawed Pufferfish" },
      { tier: 1, tierId: "p1", id: "kira_food:pufferfish_p1", nutrition: 1, saturation: 0.1, cn: "\u5E38\u89C1\u6CB3\u8C5A", en: "Pufferfish" },
      { tier: 2, tierId: "p2", id: "kira_food:pufferfish_p2", nutrition: 1, saturation: 0.1, cn: "\u8C28\u614E\u5904\u7406\u7684\u6CB3\u8C5A", en: "Improved Pufferfish" },
      { tier: 3, tierId: "p3", id: "kira_food:pufferfish_p3", nutrition: 1, saturation: 0.1, cn: "\u7ECF\u8FC7\u7CBE\u7EC6\u5904\u7406\u7684\u6CB3\u8C5A", en: "Refined Pufferfish" },
      { tier: 4, tierId: "p4", id: "kira_food:pufferfish_p4", nutrition: 1, saturation: 0.1, cn: "\u8001\u624B\u5904\u7406\u7684\u6CB3\u8C5A", en: "Artisan Pufferfish" },
      { tier: 5, tierId: "p5", id: "kira_food:pufferfish_p5", nutrition: 1, saturation: 0.1, cn: "\u5BB4\u5E2D\u7EA7\u5904\u7406\u7684\u6CB3\u8C5A", en: "Reserved Pufferfish" },
      { tier: 6, tierId: "p6", id: "kira_food:pufferfish_p6", nutrition: 1, saturation: 0.1, cn: "\u53E4\u6CD5\u5904\u7406\u7684\u6CB3\u8C5A", en: "Heritage Pufferfish" },
      { tier: 7, tierId: "p7", id: "kira_food:pufferfish_p7", nutrition: 1, saturation: 0.1, cn: "\u661F\u6F6E\u73CD\u9009\u7684\u6CB3\u8C5A", en: "Dawnstar Pufferfish" }
    ]
  },
  {
    key: "pumpkin_pie",
    id: "minecraft:pumpkin_pie",
    cn: "\u5357\u74DC\u6D3E",
    en: "Pumpkin Pie",
    family: "dessert",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 8,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 8, saturation_modifier: "low" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:pumpkin_pie_p0", nutrition: 6, saturation: 0.22, cn: "\u7565\u5E26\u7126\u5473\u7684\u5357\u74DC\u6D3E", en: "Flawed Pumpkin Pie" },
      { tier: 1, tierId: "p1", id: "kira_food:pumpkin_pie_p1", nutrition: 8, saturation: 0.3, cn: "\u6734\u7D20\u7684\u5357\u74DC\u6D3E", en: "Pumpkin Pie" },
      { tier: 2, tierId: "p2", id: "kira_food:pumpkin_pie_p2", nutrition: 8, saturation: 0.336, cn: "\u6539\u826F\u914D\u65B9\u7684\u5357\u74DC\u6D3E", en: "Improved Pumpkin Pie" },
      { tier: 3, tierId: "p3", id: "kira_food:pumpkin_pie_p3", nutrition: 9, saturation: 0.32, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u70D8\u7119\u7684\u5357\u74DC\u6D3E", en: "Refined Pumpkin Pie" },
      { tier: 4, tierId: "p4", id: "kira_food:pumpkin_pie_p4", nutrition: 9, saturation: 0.3467, cn: "\u540D\u53A8\u76D1\u5236\u7684\u5357\u74DC\u6D3E", en: "Artisan Pumpkin Pie" },
      { tier: 5, tierId: "p5", id: "kira_food:pumpkin_pie_p5", nutrition: 10, saturation: 0.336, cn: "\u5BB4\u5E2D\u73CD\u85CF\u7684\u5357\u74DC\u6D3E", en: "Reserved Pumpkin Pie" },
      { tier: 6, tierId: "p6", id: "kira_food:pumpkin_pie_p6", nutrition: 10, saturation: 0.372, cn: "\u4F20\u4E16\u914D\u65B9\u70D8\u7119\u7684\u5357\u74DC\u6D3E", en: "Heritage Pumpkin Pie" },
      { tier: 7, tierId: "p7", id: "kira_food:pumpkin_pie_p7", nutrition: 10, saturation: 0.408, cn: "\u6668\u661F\u7737\u987E\u7684\u5357\u74DC\u6D3E", en: "Dawnstar Pumpkin Pie" }
    ]
  },
  {
    key: "rabbit_stew",
    id: "minecraft:rabbit_stew",
    cn: "\u5154\u8089\u7172",
    en: "Rabbit Stew",
    family: "stew",
    mode: "full",
    kiraOverlay: "normal",
    stack: 1,
    baseNutrition: 10,
    baseSaturation: 0.6,
    vanillaFood: { nutrition: 10, saturation_modifier: "normal", using_converts_to: "bowl" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:rabbit_stew_p0", nutrition: 7, saturation: 0.4714, cn: "\u8C03\u5473\u5931\u8861\u7684\u5154\u8089\u7172", en: "Flawed Rabbit Stew" },
      { tier: 1, tierId: "p1", id: "kira_food:rabbit_stew_p1", nutrition: 10, saturation: 0.6, cn: "\u5BB6\u5E38\u5154\u8089\u7172", en: "Rabbit Stew" },
      { tier: 2, tierId: "p2", id: "kira_food:rabbit_stew_p2", nutrition: 10, saturation: 0.672, cn: "\u914D\u6BD4\u7ECF\u8FC7\u8C03\u6574\u7684\u5154\u8089\u7172", en: "Improved Rabbit Stew" },
      { tier: 3, tierId: "p3", id: "kira_food:rabbit_stew_p3", nutrition: 11, saturation: 0.6545, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u8C03\u5473\u7684\u5154\u8089\u7172", en: "Refined Rabbit Stew" },
      { tier: 4, tierId: "p4", id: "kira_food:rabbit_stew_p4", nutrition: 11, saturation: 0.7091, cn: "\u540D\u53A8\u76D1\u5236\u7684\u5154\u8089\u7172", en: "Artisan Rabbit Stew" },
      { tier: 5, tierId: "p5", id: "kira_food:rabbit_stew_p5", nutrition: 12, saturation: 0.7, cn: "\u76DB\u5BB4\u4E3B\u53A8\u7684\u5154\u8089\u7172", en: "Reserved Rabbit Stew" },
      { tier: 6, tierId: "p6", id: "kira_food:rabbit_stew_p6", nutrition: 12, saturation: 0.775, cn: "\u4F20\u4E16\u79D8\u65B9\u7096\u5236\u7684\u5154\u8089\u7172", en: "Heritage Rabbit Stew" },
      { tier: 7, tierId: "p7", id: "kira_food:rabbit_stew_p7", nutrition: 12, saturation: 0.85, cn: "\u6668\u661F\u8D50\u798F\u7684\u5154\u8089\u7172", en: "Dawnstar Rabbit Stew" }
    ]
  },
  {
    key: "beef",
    id: "minecraft:beef",
    cn: "\u751F\u725B\u8089",
    en: "Raw Beef",
    family: "raw_meat",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 3,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 3, saturation_modifier: "low" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:beef_p0", nutrition: 2, saturation: 0.2475, cn: "\u4E0D\u592A\u65B0\u9C9C\u7684\u751F\u725B\u8089", en: "Flawed Raw Beef" },
      { tier: 1, tierId: "p1", id: "kira_food:beef_p1", nutrition: 3, saturation: 0.3, cn: "\u65B0\u9C9C\u7684\u751F\u725B\u8089", en: "Raw Beef" },
      { tier: 2, tierId: "p2", id: "kira_food:beef_p2", nutrition: 3, saturation: 0.336, cn: "\u7CBE\u9009\u8089\u6E90\u7684\u751F\u725B\u8089", en: "Improved Raw Beef" },
      { tier: 3, tierId: "p3", id: "kira_food:beef_p3", nutrition: 4, saturation: 0.27, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u5904\u7406\u7684\u751F\u725B\u8089", en: "Refined Raw Beef" },
      { tier: 4, tierId: "p4", id: "kira_food:beef_p4", nutrition: 4, saturation: 0.2925, cn: "\u4E25\u683C\u6311\u9009\u7684\u751F\u725B\u8089", en: "Artisan Raw Beef" },
      { tier: 5, tierId: "p5", id: "kira_food:beef_p5", nutrition: 5, saturation: 0.252, cn: "\u51B7\u94FE\u73CD\u9009\u7684\u751F\u725B\u8089", en: "Reserved Raw Beef" },
      { tier: 6, tierId: "p6", id: "kira_food:beef_p6", nutrition: 5, saturation: 0.279, cn: "\u4F20\u627F\u5904\u7406\u6CD5\u7684\u751F\u725B\u8089", en: "Heritage Raw Beef" },
      { tier: 7, tierId: "p7", id: "kira_food:beef_p7", nutrition: 5, saturation: 0.306, cn: "\u661F\u8F89\u4FDD\u9C9C\u7684\u751F\u725B\u8089", en: "Dawnstar Raw Beef" }
    ]
  },
  {
    key: "chicken",
    id: "minecraft:chicken",
    cn: "\u751F\u9E21\u8089",
    en: "Raw Chicken",
    family: "risky",
    mode: "protected",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 2,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 2, saturation_modifier: "low", effects: [{ name: "hunger", chance: 0.3, duration: 30, amplifier: 0 }] },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:chicken_p0", nutrition: 2, saturation: 0.3, cn: "\u5904\u7406\u6B20\u59A5\u7684\u751F\u9E21\u8089", en: "Flawed Raw Chicken" },
      { tier: 1, tierId: "p1", id: "kira_food:chicken_p1", nutrition: 2, saturation: 0.3, cn: "\u65B0\u9C9C\u7684\u751F\u9E21\u8089", en: "Raw Chicken" },
      { tier: 2, tierId: "p2", id: "kira_food:chicken_p2", nutrition: 2, saturation: 0.3, cn: "\u7CBE\u6311\u7EC6\u9009\u7684\u751F\u9E21\u8089", en: "Improved Raw Chicken" },
      { tier: 3, tierId: "p3", id: "kira_food:chicken_p3", nutrition: 2, saturation: 0.3, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u5904\u7406\u7684\u751F\u9E21\u8089", en: "Refined Raw Chicken" },
      { tier: 4, tierId: "p4", id: "kira_food:chicken_p4", nutrition: 2, saturation: 0.3, cn: "\u4E25\u683C\u6311\u9009\u7684\u751F\u9E21\u8089", en: "Artisan Raw Chicken" },
      { tier: 5, tierId: "p5", id: "kira_food:chicken_p5", nutrition: 2, saturation: 0.3, cn: "\u51B7\u94FE\u73CD\u9009\u7684\u751F\u9E21\u8089", en: "Reserved Raw Chicken" },
      { tier: 6, tierId: "p6", id: "kira_food:chicken_p6", nutrition: 2, saturation: 0.3, cn: "\u4F20\u627F\u5904\u7406\u6CD5\u7684\u751F\u9E21\u8089", en: "Heritage Raw Chicken" },
      { tier: 7, tierId: "p7", id: "kira_food:chicken_p7", nutrition: 2, saturation: 0.3, cn: "\u661F\u8F89\u4FDD\u9C9C\u7684\u751F\u9E21\u8089", en: "Dawnstar Raw Chicken" }
    ]
  },
  {
    key: "cod",
    id: "minecraft:cod",
    cn: "\u751F\u9CD5\u9C7C",
    en: "Raw Cod",
    family: "raw_fish",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 2,
    baseSaturation: 0.1,
    vanillaFood: { nutrition: 2, saturation_modifier: "poor" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:cod_p0", nutrition: 1, saturation: 0.11, cn: "\u4E0D\u592A\u65B0\u9C9C\u7684\u751F\u9CD5\u9C7C", en: "Flawed Raw Cod" },
      { tier: 1, tierId: "p1", id: "kira_food:cod_p1", nutrition: 2, saturation: 0.1, cn: "\u65B0\u9C9C\u7684\u751F\u9CD5\u9C7C", en: "Raw Cod" },
      { tier: 2, tierId: "p2", id: "kira_food:cod_p2", nutrition: 2, saturation: 0.112, cn: "\u5904\u7406\u5F97\u5F53\u7684\u751F\u9CD5\u9C7C", en: "Improved Raw Cod" },
      { tier: 3, tierId: "p3", id: "kira_food:cod_p3", nutrition: 3, saturation: 0.08, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u5904\u7406\u7684\u751F\u9CD5\u9C7C", en: "Refined Raw Cod" },
      { tier: 4, tierId: "p4", id: "kira_food:cod_p4", nutrition: 3, saturation: 0.0867, cn: "\u8001\u624B\u5904\u7406\u7684\u751F\u9CD5\u9C7C", en: "Artisan Raw Cod" },
      { tier: 5, tierId: "p5", id: "kira_food:cod_p5", nutrition: 4, saturation: 0.07, cn: "\u5BB4\u5E2D\u7EA7\u5904\u7406\u7684\u751F\u9CD5\u9C7C", en: "Reserved Raw Cod" },
      { tier: 6, tierId: "p6", id: "kira_food:cod_p6", nutrition: 4, saturation: 0.0775, cn: "\u53E4\u6CD5\u5904\u7406\u7684\u751F\u9CD5\u9C7C", en: "Heritage Raw Cod" },
      { tier: 7, tierId: "p7", id: "kira_food:cod_p7", nutrition: 4, saturation: 0.085, cn: "\u661F\u6F6E\u73CD\u9009\u7684\u751F\u9CD5\u9C7C", en: "Dawnstar Raw Cod" }
    ]
  },
  {
    key: "mutton",
    id: "minecraft:mutton",
    cn: "\u751F\u7F8A\u8089",
    en: "Raw Mutton",
    family: "raw_meat",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 2,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 2, saturation_modifier: "low" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:mutton_p0", nutrition: 1, saturation: 0.33, cn: "\u4E0D\u592A\u65B0\u9C9C\u7684\u751F\u7F8A\u8089", en: "Flawed Raw Mutton" },
      { tier: 1, tierId: "p1", id: "kira_food:mutton_p1", nutrition: 2, saturation: 0.3, cn: "\u65B0\u9C9C\u7684\u751F\u7F8A\u8089", en: "Raw Mutton" },
      { tier: 2, tierId: "p2", id: "kira_food:mutton_p2", nutrition: 2, saturation: 0.336, cn: "\u7CBE\u9009\u8089\u6E90\u7684\u751F\u7F8A\u8089", en: "Improved Raw Mutton" },
      { tier: 3, tierId: "p3", id: "kira_food:mutton_p3", nutrition: 3, saturation: 0.24, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u5904\u7406\u7684\u751F\u7F8A\u8089", en: "Refined Raw Mutton" },
      { tier: 4, tierId: "p4", id: "kira_food:mutton_p4", nutrition: 3, saturation: 0.26, cn: "\u4E25\u683C\u6311\u9009\u7684\u751F\u7F8A\u8089", en: "Artisan Raw Mutton" },
      { tier: 5, tierId: "p5", id: "kira_food:mutton_p5", nutrition: 4, saturation: 0.21, cn: "\u51B7\u94FE\u73CD\u9009\u7684\u751F\u7F8A\u8089", en: "Reserved Raw Mutton" },
      { tier: 6, tierId: "p6", id: "kira_food:mutton_p6", nutrition: 4, saturation: 0.2325, cn: "\u4F20\u627F\u5904\u7406\u6CD5\u7684\u751F\u7F8A\u8089", en: "Heritage Raw Mutton" },
      { tier: 7, tierId: "p7", id: "kira_food:mutton_p7", nutrition: 4, saturation: 0.255, cn: "\u661F\u8F89\u4FDD\u9C9C\u7684\u751F\u7F8A\u8089", en: "Dawnstar Raw Mutton" }
    ]
  },
  {
    key: "porkchop",
    id: "minecraft:porkchop",
    cn: "\u751F\u732A\u6392",
    en: "Raw Porkchop",
    family: "raw_meat",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 3,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 3, saturation_modifier: "low" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:porkchop_p0", nutrition: 2, saturation: 0.2475, cn: "\u4E0D\u592A\u65B0\u9C9C\u7684\u751F\u732A\u6392", en: "Flawed Raw Porkchop" },
      { tier: 1, tierId: "p1", id: "kira_food:porkchop_p1", nutrition: 3, saturation: 0.3, cn: "\u65B0\u9C9C\u7684\u751F\u732A\u6392", en: "Raw Porkchop" },
      { tier: 2, tierId: "p2", id: "kira_food:porkchop_p2", nutrition: 3, saturation: 0.336, cn: "\u7CBE\u9009\u8089\u6E90\u7684\u751F\u732A\u6392", en: "Improved Raw Porkchop" },
      { tier: 3, tierId: "p3", id: "kira_food:porkchop_p3", nutrition: 4, saturation: 0.27, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u5904\u7406\u7684\u751F\u732A\u6392", en: "Refined Raw Porkchop" },
      { tier: 4, tierId: "p4", id: "kira_food:porkchop_p4", nutrition: 4, saturation: 0.2925, cn: "\u4E25\u683C\u6311\u9009\u7684\u751F\u732A\u6392", en: "Artisan Raw Porkchop" },
      { tier: 5, tierId: "p5", id: "kira_food:porkchop_p5", nutrition: 5, saturation: 0.252, cn: "\u51B7\u94FE\u73CD\u9009\u7684\u751F\u732A\u6392", en: "Reserved Raw Porkchop" },
      { tier: 6, tierId: "p6", id: "kira_food:porkchop_p6", nutrition: 5, saturation: 0.279, cn: "\u4F20\u627F\u5904\u7406\u6CD5\u7684\u751F\u732A\u6392", en: "Heritage Raw Porkchop" },
      { tier: 7, tierId: "p7", id: "kira_food:porkchop_p7", nutrition: 5, saturation: 0.306, cn: "\u661F\u8F89\u4FDD\u9C9C\u7684\u751F\u732A\u6392", en: "Dawnstar Raw Porkchop" }
    ]
  },
  {
    key: "rabbit",
    id: "minecraft:rabbit",
    cn: "\u751F\u5154\u8089",
    en: "Raw Rabbit",
    family: "raw_meat",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 3,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 3, saturation_modifier: "low" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:rabbit_p0", nutrition: 2, saturation: 0.2475, cn: "\u4E0D\u592A\u65B0\u9C9C\u7684\u751F\u5154\u8089", en: "Flawed Raw Rabbit" },
      { tier: 1, tierId: "p1", id: "kira_food:rabbit_p1", nutrition: 3, saturation: 0.3, cn: "\u65B0\u9C9C\u7684\u751F\u5154\u8089", en: "Raw Rabbit" },
      { tier: 2, tierId: "p2", id: "kira_food:rabbit_p2", nutrition: 3, saturation: 0.336, cn: "\u7CBE\u9009\u8089\u6E90\u7684\u751F\u5154\u8089", en: "Improved Raw Rabbit" },
      { tier: 3, tierId: "p3", id: "kira_food:rabbit_p3", nutrition: 4, saturation: 0.27, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u5904\u7406\u7684\u751F\u5154\u8089", en: "Refined Raw Rabbit" },
      { tier: 4, tierId: "p4", id: "kira_food:rabbit_p4", nutrition: 4, saturation: 0.2925, cn: "\u4E25\u683C\u6311\u9009\u7684\u751F\u5154\u8089", en: "Artisan Raw Rabbit" },
      { tier: 5, tierId: "p5", id: "kira_food:rabbit_p5", nutrition: 5, saturation: 0.252, cn: "\u51B7\u94FE\u73CD\u9009\u7684\u751F\u5154\u8089", en: "Reserved Raw Rabbit" },
      { tier: 6, tierId: "p6", id: "kira_food:rabbit_p6", nutrition: 5, saturation: 0.279, cn: "\u4F20\u627F\u5904\u7406\u6CD5\u7684\u751F\u5154\u8089", en: "Heritage Raw Rabbit" },
      { tier: 7, tierId: "p7", id: "kira_food:rabbit_p7", nutrition: 5, saturation: 0.306, cn: "\u661F\u8F89\u4FDD\u9C9C\u7684\u751F\u5154\u8089", en: "Dawnstar Raw Rabbit" }
    ]
  },
  {
    key: "salmon",
    id: "minecraft:salmon",
    cn: "\u751F\u9C91\u9C7C",
    en: "Raw Salmon",
    family: "raw_fish",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 2,
    baseSaturation: 0.1,
    vanillaFood: { nutrition: 2, saturation_modifier: "poor" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:salmon_p0", nutrition: 1, saturation: 0.11, cn: "\u4E0D\u592A\u65B0\u9C9C\u7684\u751F\u9C91\u9C7C", en: "Flawed Raw Salmon" },
      { tier: 1, tierId: "p1", id: "kira_food:salmon_p1", nutrition: 2, saturation: 0.1, cn: "\u65B0\u9C9C\u7684\u751F\u9C91\u9C7C", en: "Raw Salmon" },
      { tier: 2, tierId: "p2", id: "kira_food:salmon_p2", nutrition: 2, saturation: 0.112, cn: "\u5904\u7406\u5F97\u5F53\u7684\u751F\u9C91\u9C7C", en: "Improved Raw Salmon" },
      { tier: 3, tierId: "p3", id: "kira_food:salmon_p3", nutrition: 3, saturation: 0.08, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u5904\u7406\u7684\u751F\u9C91\u9C7C", en: "Refined Raw Salmon" },
      { tier: 4, tierId: "p4", id: "kira_food:salmon_p4", nutrition: 3, saturation: 0.0867, cn: "\u8001\u624B\u5904\u7406\u7684\u751F\u9C91\u9C7C", en: "Artisan Raw Salmon" },
      { tier: 5, tierId: "p5", id: "kira_food:salmon_p5", nutrition: 4, saturation: 0.07, cn: "\u5BB4\u5E2D\u7EA7\u5904\u7406\u7684\u751F\u9C91\u9C7C", en: "Reserved Raw Salmon" },
      { tier: 6, tierId: "p6", id: "kira_food:salmon_p6", nutrition: 4, saturation: 0.0775, cn: "\u53E4\u6CD5\u5904\u7406\u7684\u751F\u9C91\u9C7C", en: "Heritage Raw Salmon" },
      { tier: 7, tierId: "p7", id: "kira_food:salmon_p7", nutrition: 4, saturation: 0.085, cn: "\u661F\u6F6E\u73CD\u9009\u7684\u751F\u9C91\u9C7C", en: "Dawnstar Raw Salmon" }
    ]
  },
  {
    key: "rotten_flesh",
    id: "minecraft:rotten_flesh",
    cn: "\u8150\u8089",
    en: "Rotten Flesh",
    family: "risky",
    mode: "protected",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 4,
    baseSaturation: 0.1,
    vanillaFood: { nutrition: 4, saturation_modifier: "poor", effects: [{ name: "hunger", chance: 0.8, duration: 30, amplifier: 0 }] },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:rotten_flesh_p0", nutrition: 4, saturation: 0.1, cn: "\u5904\u7406\u5931\u5F53\u7684\u8150\u8089", en: "Flawed Rotten Flesh" },
      { tier: 1, tierId: "p1", id: "kira_food:rotten_flesh_p1", nutrition: 4, saturation: 0.1, cn: "\u5E38\u89C1\u7684\u8150\u8089", en: "Rotten Flesh" },
      { tier: 2, tierId: "p2", id: "kira_food:rotten_flesh_p2", nutrition: 4, saturation: 0.1, cn: "\u8C28\u614E\u5904\u7406\u7684\u8150\u8089", en: "Improved Rotten Flesh" },
      { tier: 3, tierId: "p3", id: "kira_food:rotten_flesh_p3", nutrition: 4, saturation: 0.1, cn: "\u7ECF\u8FC7\u7CBE\u7EC6\u5904\u7406\u7684\u8150\u8089", en: "Refined Rotten Flesh" },
      { tier: 4, tierId: "p4", id: "kira_food:rotten_flesh_p4", nutrition: 4, saturation: 0.1, cn: "\u8001\u624B\u5904\u7406\u7684\u8150\u8089", en: "Artisan Rotten Flesh" },
      { tier: 5, tierId: "p5", id: "kira_food:rotten_flesh_p5", nutrition: 4, saturation: 0.1, cn: "\u5BB4\u5E2D\u7EA7\u5904\u7406\u7684\u8150\u8089", en: "Reserved Rotten Flesh" },
      { tier: 6, tierId: "p6", id: "kira_food:rotten_flesh_p6", nutrition: 4, saturation: 0.1, cn: "\u53E4\u6CD5\u5904\u7406\u7684\u8150\u8089", en: "Heritage Rotten Flesh" },
      { tier: 7, tierId: "p7", id: "kira_food:rotten_flesh_p7", nutrition: 4, saturation: 0.1, cn: "\u661F\u6F6E\u73CD\u9009\u7684\u8150\u8089", en: "Dawnstar Rotten Flesh" }
    ]
  },
  {
    key: "spider_eye",
    id: "minecraft:spider_eye",
    cn: "\u8718\u86DB\u773C",
    en: "Spider Eye",
    family: "risky",
    mode: "protected",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 2,
    baseSaturation: 0.8,
    vanillaFood: { nutrition: 2, saturation_modifier: "good", effects: [{ name: "poison", chance: 1, duration: 5, amplifier: 0 }] },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:spider_eye_p0", nutrition: 2, saturation: 0.8, cn: "\u5904\u7406\u5931\u5F53\u7684\u8718\u86DB\u773C", en: "Flawed Spider Eye" },
      { tier: 1, tierId: "p1", id: "kira_food:spider_eye_p1", nutrition: 2, saturation: 0.8, cn: "\u5E38\u89C1\u7684\u8718\u86DB\u773C", en: "Spider Eye" },
      { tier: 2, tierId: "p2", id: "kira_food:spider_eye_p2", nutrition: 2, saturation: 0.8, cn: "\u8C28\u614E\u5904\u7406\u7684\u8718\u86DB\u773C", en: "Improved Spider Eye" },
      { tier: 3, tierId: "p3", id: "kira_food:spider_eye_p3", nutrition: 2, saturation: 0.8, cn: "\u7ECF\u8FC7\u7CBE\u7EC6\u5904\u7406\u7684\u8718\u86DB\u773C", en: "Refined Spider Eye" },
      { tier: 4, tierId: "p4", id: "kira_food:spider_eye_p4", nutrition: 2, saturation: 0.8, cn: "\u8001\u624B\u5904\u7406\u7684\u8718\u86DB\u773C", en: "Artisan Spider Eye" },
      { tier: 5, tierId: "p5", id: "kira_food:spider_eye_p5", nutrition: 2, saturation: 0.8, cn: "\u5BB4\u5E2D\u7EA7\u5904\u7406\u7684\u8718\u86DB\u773C", en: "Reserved Spider Eye" },
      { tier: 6, tierId: "p6", id: "kira_food:spider_eye_p6", nutrition: 2, saturation: 0.8, cn: "\u53E4\u6CD5\u5904\u7406\u7684\u8718\u86DB\u773C", en: "Heritage Spider Eye" },
      { tier: 7, tierId: "p7", id: "kira_food:spider_eye_p7", nutrition: 2, saturation: 0.8, cn: "\u661F\u6F6E\u73CD\u9009\u7684\u8718\u86DB\u773C", en: "Dawnstar Spider Eye" }
    ]
  },
  {
    key: "cooked_beef",
    id: "minecraft:cooked_beef",
    cn: "\u725B\u6392",
    en: "Steak",
    family: "meat",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 8,
    baseSaturation: 0.8,
    vanillaFood: { nutrition: 8, saturation_modifier: "good" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:cooked_beef_p0", nutrition: 6, saturation: 0.5867, cn: "\u70E4\u5236\u5931\u5F53\u7684\u725B\u6392", en: "Flawed Steak" },
      { tier: 1, tierId: "p1", id: "kira_food:cooked_beef_p1", nutrition: 8, saturation: 0.8, cn: "\u5BB6\u5E38\u725B\u6392", en: "Steak" },
      { tier: 2, tierId: "p2", id: "kira_food:cooked_beef_p2", nutrition: 8, saturation: 0.896, cn: "\u7CBE\u9009\u8089\u6E90\u7684\u725B\u6392", en: "Improved Steak" },
      { tier: 3, tierId: "p3", id: "kira_food:cooked_beef_p3", nutrition: 9, saturation: 0.8533, cn: "\u706B\u5019\u8003\u7A76\u7684\u725B\u6392", en: "Refined Steak" },
      { tier: 4, tierId: "p4", id: "kira_food:cooked_beef_p4", nutrition: 9, saturation: 0.9244, cn: "\u5320\u4EBA\u624B\u4F5C\u7684\u725B\u6392", en: "Artisan Steak" },
      { tier: 5, tierId: "p5", id: "kira_food:cooked_beef_p5", nutrition: 10, saturation: 0.896, cn: "\u5BB4\u5E2D\u7CBE\u9009\u7684\u725B\u6392", en: "Reserved Steak" },
      { tier: 6, tierId: "p6", id: "kira_food:cooked_beef_p6", nutrition: 10, saturation: 0.992, cn: "\u8001\u94FA\u79D8\u5236\u7684\u725B\u6392", en: "Heritage Steak" },
      { tier: 7, tierId: "p7", id: "kira_food:cooked_beef_p7", nutrition: 10, saturation: 1.088, cn: "\u65E5\u5195\u706B\u5019\u6DEC\u70BC\u7684\u725B\u6392", en: "Dawnstar Steak" }
    ]
  },
  {
    key: "sweet_berries",
    id: "minecraft:sweet_berries",
    cn: "\u751C\u6D46\u679C",
    en: "Sweet Berries",
    family: "fruit",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 2,
    baseSaturation: 0.3,
    vanillaFood: { nutrition: 2, saturation_modifier: "low", is_meat: !1 },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:sweet_berries_p0", nutrition: 1, saturation: 0.33, cn: "\u6210\u8272\u6B20\u4F73\u7684\u751C\u6D46\u679C", en: "Flawed Sweet Berries" },
      { tier: 1, tierId: "p1", id: "kira_food:sweet_berries_p1", nutrition: 2, saturation: 0.3, cn: "\u5F53\u5B63\u751C\u6D46\u679C", en: "Sweet Berries" },
      { tier: 2, tierId: "p2", id: "kira_food:sweet_berries_p2", nutrition: 2, saturation: 0.336, cn: "\u679C\u56ED\u7CBE\u9009\u7684\u751C\u6D46\u679C", en: "Improved Sweet Berries" },
      { tier: 3, tierId: "p3", id: "kira_food:sweet_berries_p3", nutrition: 3, saturation: 0.24, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u6311\u9009\u7684\u751C\u6D46\u679C", en: "Refined Sweet Berries" },
      { tier: 4, tierId: "p4", id: "kira_food:sweet_berries_p4", nutrition: 3, saturation: 0.26, cn: "\u679C\u56ED\u73CD\u9009\u7684\u751C\u6D46\u679C", en: "Artisan Sweet Berries" },
      { tier: 5, tierId: "p5", id: "kira_food:sweet_berries_p5", nutrition: 4, saturation: 0.21, cn: "\u8282\u5E86\u7CBE\u9009\u7684\u751C\u6D46\u679C", en: "Reserved Sweet Berries" },
      { tier: 6, tierId: "p6", id: "kira_food:sweet_berries_p6", nutrition: 4, saturation: 0.2325, cn: "\u8001\u6811\u7CBE\u9009\u7684\u751C\u6D46\u679C", en: "Heritage Sweet Berries" },
      { tier: 7, tierId: "p7", id: "kira_food:sweet_berries_p7", nutrition: 4, saturation: 0.255, cn: "\u66D9\u5149\u6620\u7167\u7684\u751C\u6D46\u679C", en: "Dawnstar Sweet Berries" }
    ]
  },
  {
    key: "tropical_fish",
    id: "minecraft:tropical_fish",
    cn: "\u70ED\u5E26\u9C7C",
    en: "Tropical Fish",
    family: "raw_fish",
    mode: "full",
    kiraOverlay: "normal",
    stack: 64,
    baseNutrition: 1,
    baseSaturation: 0.1,
    vanillaFood: { nutrition: 1, saturation_modifier: "poor" },
    variants: [
      { tier: 0, tierId: "p0", id: "kira_food:tropical_fish_p0", nutrition: 1, saturation: 0.055, cn: "\u4E0D\u592A\u65B0\u9C9C\u7684\u70ED\u5E26\u9C7C", en: "Flawed Tropical Fish" },
      { tier: 1, tierId: "p1", id: "kira_food:tropical_fish_p1", nutrition: 1, saturation: 0.1, cn: "\u65B0\u9C9C\u7684\u70ED\u5E26\u9C7C", en: "Tropical Fish" },
      { tier: 2, tierId: "p2", id: "kira_food:tropical_fish_p2", nutrition: 1, saturation: 0.112, cn: "\u5904\u7406\u5F97\u5F53\u7684\u70ED\u5E26\u9C7C", en: "Improved Tropical Fish" },
      { tier: 3, tierId: "p3", id: "kira_food:tropical_fish_p3", nutrition: 2, saturation: 0.06, cn: "\u7ECF\u8FC7\u7CBE\u5FC3\u5904\u7406\u7684\u70ED\u5E26\u9C7C", en: "Refined Tropical Fish" },
      { tier: 4, tierId: "p4", id: "kira_food:tropical_fish_p4", nutrition: 2, saturation: 0.065, cn: "\u8001\u624B\u5904\u7406\u7684\u70ED\u5E26\u9C7C", en: "Artisan Tropical Fish" },
      { tier: 5, tierId: "p5", id: "kira_food:tropical_fish_p5", nutrition: 3, saturation: 0.0467, cn: "\u5BB4\u5E2D\u7EA7\u5904\u7406\u7684\u70ED\u5E26\u9C7C", en: "Reserved Tropical Fish" },
      { tier: 6, tierId: "p6", id: "kira_food:tropical_fish_p6", nutrition: 3, saturation: 0.0517, cn: "\u53E4\u6CD5\u5904\u7406\u7684\u70ED\u5E26\u9C7C", en: "Heritage Tropical Fish" },
      { tier: 7, tierId: "p7", id: "kira_food:tropical_fish_p7", nutrition: 3, saturation: 0.0567, cn: "\u661F\u6F6E\u73CD\u9009\u7684\u70ED\u5E26\u9C7C", en: "Dawnstar Tropical Fish" }
    ]
  }
], FOOD_BY_BASE_ID = Object.fromEntries(FOODS.map((f) => [f.id, f])), FOOD_BY_VARIANT_ID = (() => {
  let m = {};
  for (let f of FOODS) for (let v of f.variants) m[v.id] = f;
  return m;
})(), FOOD_BASE_IDS = new Set(FOODS.map((f) => f.id)), FOOD_VARIANT_IDS = new Set(FOODS.flatMap((f) => f.variants.map((v) => v.id)));

// scripts/core/Classify.ts
function pathOf(typeId) {
  let id = String(typeId ?? "").toLowerCase(), i = id.indexOf(":");
  return i >= 0 ? id.slice(i + 1) : id;
}
function hasWord(path, word) {
  let w = word.toLowerCase();
  return w ? `_${path}_`.includes(`_${w}_`) : !1;
}
function classifyByKeyword(typeId) {
  let path = pathOf(typeId);
  if (path) {
    for (let fam of FAMILIES)
      for (let kw of fam.keywords)
        if (hasWord(path, kw)) return fam.id;
  }
}
function classifyFamily(typeId, nutrition, saturation) {
  let explicit = FOOD_BY_BASE_ID[typeId];
  if (explicit?.family) return explicit.family;
  let byKeyword = classifyByKeyword(typeId);
  if (byKeyword) return byKeyword;
  let n = typeof nutrition == "number" && Number.isFinite(nutrition) ? nutrition : 0, s2 = typeof saturation == "number" && Number.isFinite(saturation) ? saturation : 0;
  return n >= 7 || n >= 5 && s2 >= 0.8 ? "meat" : n <= 2 && n > 0 ? "bakery" : "generic";
}

// scripts/domain/Effects.ts
var s = (sec) => Math.round(sec * 20), P0_TABLE = [
  { id: "none", weight: 560 },
  { id: "nausea", weight: 220 },
  // 反胃 3 秒
  { id: "weakness", weight: 100 },
  // 虚弱 I 5 秒
  { id: "hunger", weight: 70 },
  // 饥饿 I 4 秒
  { id: "poison", weight: 45 },
  // 中毒 I 2 秒
  { id: "damage", weight: 5 }
  // 立即扣 0.5–1 心
];
function rollP0Outcome(rng) {
  let n = Math.floor(rng() * 1e3) + 1, acc = 0;
  for (let e of P0_TABLE)
    if (acc += e.weight, n <= acc) return e.id;
  return "none";
}
function planP0Effects(ctx) {
  let outcome = rollP0Outcome(ctx.rng), recentlyPenalized = ctx.ticksSinceLastNegative !== void 0 && ctx.ticksSinceLastNegative < s(10);
  if (ctx.peaceful)
    return outcome === "none" ? [] : recentlyPenalized ? [] : [{ id: "minecraft:nausea", ticks: s(3), amplifier: 0 }];
  if (ctx.protection === "poison_hunger")
    return recentlyPenalized ? [] : outcome === "none" ? [] : [{ id: "minecraft:nausea", ticks: s(3), amplifier: 0 }];
  switch (outcome) {
    case "nausea":
      return recentlyPenalized ? [] : [{ id: "minecraft:nausea", ticks: s(3), amplifier: 0 }];
    case "weakness":
      return recentlyPenalized ? [] : [{ id: "minecraft:weakness", ticks: s(5), amplifier: 0 }];
    case "hunger":
      return recentlyPenalized ? [] : ctx.protection === "hunger" ? [] : [{ id: "minecraft:hunger", ticks: s(4), amplifier: 0 }];
    case "poison":
      return recentlyPenalized ? [] : ctx.protection === "poison" ? [] : [{ id: "minecraft:poison", ticks: s(2), amplifier: 0 }];
    case "damage":
      return ctx.playerHealth !== void 0 && ctx.playerHealth < 4 ? [{ id: "minecraft:nausea", ticks: s(3), amplifier: 0 }] : ctx.protection === "absolute" ? [] : [{ id: "kira_food:direct_damage", ticks: 0, amplifier: 0 }];
    default:
      return [];
  }
}
var FAMILY_POOLS = {
  // 文档 6.1 烘焙、主食与甜点
  bakery: {
    2: [{ id: "minecraft:speed", ticks: s(4), amplifier: 0 }],
    3: [{ id: "minecraft:haste", ticks: s(5), amplifier: 0 }],
    4: [{ id: "minecraft:haste", ticks: s(8), amplifier: 0 }],
    5: [
      { id: "minecraft:haste", ticks: s(12), amplifier: 0 },
      { id: "minecraft:regeneration", ticks: s(3), amplifier: 0 }
    ],
    6: [
      { id: "minecraft:haste", ticks: s(15), amplifier: 0 },
      { id: "minecraft:absorption", ticks: s(10), amplifier: 0 }
    ],
    7: [
      { id: "minecraft:haste", ticks: s(8), amplifier: 0 },
      { id: "minecraft:speed", ticks: s(8), amplifier: 0 }
    ]
  },
  dessert: {
    2: [{ id: "minecraft:speed", ticks: s(4), amplifier: 0 }],
    3: [{ id: "minecraft:haste", ticks: s(5), amplifier: 0 }],
    4: [{ id: "minecraft:haste", ticks: s(8), amplifier: 0 }],
    5: [
      { id: "minecraft:haste", ticks: s(12), amplifier: 0 },
      { id: "minecraft:regeneration", ticks: s(3), amplifier: 0 }
    ],
    6: [
      { id: "minecraft:haste", ticks: s(15), amplifier: 0 },
      { id: "minecraft:absorption", ticks: s(10), amplifier: 0 }
    ],
    7: [
      { id: "minecraft:haste", ticks: s(8), amplifier: 0 },
      { id: "minecraft:speed", ticks: s(8), amplifier: 0 }
    ]
  },
  // 文档 6.2 水果与可食用植物
  fruit: {
    2: [{ id: "minecraft:speed", ticks: s(5), amplifier: 0 }],
    3: [{ id: "minecraft:jump_boost", ticks: s(6), amplifier: 0 }],
    4: [
      { id: "minecraft:speed", ticks: s(8), amplifier: 0 },
      { id: "minecraft:jump_boost", ticks: s(5), amplifier: 0 }
    ],
    5: [
      { id: "minecraft:night_vision", ticks: s(15), amplifier: 0 },
      { id: "minecraft:speed", ticks: s(8), amplifier: 0 }
    ],
    6: [
      { id: "minecraft:regeneration", ticks: s(5), amplifier: 0 },
      { id: "minecraft:speed", ticks: s(10), amplifier: 0 }
    ],
    7: [{ id: "minecraft:speed", ticks: s(8), amplifier: 0 }]
    // §7.1 水果速度 I 8 秒
  },
  vegetable: {
    2: [{ id: "minecraft:speed", ticks: s(5), amplifier: 0 }],
    3: [{ id: "minecraft:night_vision", ticks: s(8), amplifier: 0 }],
    4: [
      { id: "minecraft:speed", ticks: s(8), amplifier: 0 },
      { id: "minecraft:jump_boost", ticks: s(5), amplifier: 0 }
    ],
    5: [
      { id: "minecraft:night_vision", ticks: s(15), amplifier: 0 },
      { id: "minecraft:speed", ticks: s(8), amplifier: 0 }
    ],
    6: [
      { id: "minecraft:regeneration", ticks: s(5), amplifier: 0 },
      { id: "minecraft:speed", ticks: s(10), amplifier: 0 }
    ],
    7: [{ id: "minecraft:night_vision", ticks: s(10), amplifier: 0 }]
  },
  // 文档 6.3 熟肉
  meat: {
    2: [{ id: "minecraft:strength", ticks: s(4), amplifier: 0 }],
    3: [{ id: "minecraft:strength", ticks: s(5), amplifier: 0 }],
    4: [
      { id: "minecraft:strength", ticks: s(8), amplifier: 0 },
      { id: "minecraft:resistance", ticks: s(4), amplifier: 0 }
    ],
    5: [
      { id: "minecraft:strength", ticks: s(10), amplifier: 0 },
      { id: "minecraft:regeneration", ticks: s(4), amplifier: 0 }
    ],
    6: [
      { id: "minecraft:strength", ticks: s(12), amplifier: 0 },
      { id: "minecraft:resistance", ticks: s(8), amplifier: 0 }
    ],
    7: [{ id: "minecraft:strength", ticks: s(8), amplifier: 0 }]
    // §7.1 熟肉力量 I 8 秒（≤力量 II / ≤15 秒）
  },
  // 文档 6.3 生肉
  raw_meat: {
    2: [{ id: "minecraft:speed", ticks: s(4), amplifier: 0 }],
    3: [{ id: "minecraft:jump_boost", ticks: s(5), amplifier: 0 }],
    4: [{ id: "minecraft:speed", ticks: s(6), amplifier: 0 }],
    5: [
      { id: "minecraft:speed", ticks: s(8), amplifier: 0 },
      { id: "minecraft:jump_boost", ticks: s(5), amplifier: 0 }
    ],
    6: [
      { id: "minecraft:strength", ticks: s(6), amplifier: 0 },
      { id: "minecraft:speed", ticks: s(8), amplifier: 0 }
    ],
    7: [{ id: "minecraft:speed", ticks: s(8), amplifier: 0 }]
  },
  // 文档 6.4 熟鱼
  fish: {
    2: [{ id: "minecraft:water_breathing", ticks: s(5), amplifier: 0 }],
    3: [{ id: "minecraft:water_breathing", ticks: s(8), amplifier: 0 }],
    4: [
      { id: "minecraft:water_breathing", ticks: s(12), amplifier: 0 },
      { id: "minecraft:night_vision", ticks: s(6), amplifier: 0 }
    ],
    5: [
      { id: "minecraft:water_breathing", ticks: s(20), amplifier: 0 },
      { id: "minecraft:night_vision", ticks: s(10), amplifier: 0 }
    ],
    6: [
      { id: "minecraft:water_breathing", ticks: s(30), amplifier: 0 },
      { id: "minecraft:regeneration", ticks: s(4), amplifier: 0 }
    ],
    7: [{ id: "minecraft:water_breathing", ticks: s(20), amplifier: 0 }]
    // §7.1 熟鱼水下呼吸 I 20 秒
  },
  // 文档 6.4 生鱼
  raw_fish: {
    2: [{ id: "minecraft:water_breathing", ticks: s(4), amplifier: 0 }],
    3: [{ id: "minecraft:water_breathing", ticks: s(6), amplifier: 0 }],
    4: [{ id: "minecraft:water_breathing", ticks: s(8), amplifier: 0 }],
    5: [{ id: "minecraft:water_breathing", ticks: s(12), amplifier: 0 }],
    6: [{ id: "minecraft:water_breathing", ticks: s(16), amplifier: 0 }],
    7: [{ id: "minecraft:water_breathing", ticks: s(20), amplifier: 0 }]
  },
  // 文档 6.5 汤品
  stew: {
    2: [{ id: "minecraft:speed", ticks: s(4), amplifier: 0 }],
    3: [{ id: "minecraft:regeneration", ticks: s(4), amplifier: 0 }],
    4: [
      { id: "minecraft:regeneration", ticks: s(6), amplifier: 0 },
      { id: "minecraft:resistance", ticks: s(4), amplifier: 0 }
    ],
    5: [
      { id: "minecraft:regeneration", ticks: s(8), amplifier: 0 },
      { id: "minecraft:resistance", ticks: s(6), amplifier: 0 }
    ],
    6: [
      { id: "minecraft:regeneration", ticks: s(5), amplifier: 1 },
      { id: "minecraft:absorption", ticks: s(15), amplifier: 0 }
    ],
    7: [{ id: "minecraft:regeneration", ticks: s(4), amplifier: 0 }]
  },
  // 文档 6.6 危险食品：只保留「原版效果保护」，KIRA 层极轻
  risky: {
    2: [{ id: "minecraft:speed", ticks: s(4), amplifier: 0 }],
    3: [{ id: "minecraft:speed", ticks: s(5), amplifier: 0 }],
    4: [{ id: "minecraft:speed", ticks: s(6), amplifier: 0 }],
    5: [{ id: "minecraft:resistance", ticks: s(5), amplifier: 0 }],
    6: [{ id: "minecraft:resistance", ticks: s(6), amplifier: 0 }],
    7: [{ id: "minecraft:water_breathing", ticks: s(10), amplifier: 0 }]
  },
  // 文档 6.6 特殊食品：KIRA 层只做「不冲突的轻效果」
  special: {
    2: [{ id: "minecraft:speed", ticks: s(4), amplifier: 0 }],
    3: [{ id: "minecraft:resistance", ticks: s(5), amplifier: 0 }],
    4: [{ id: "minecraft:resistance", ticks: s(6), amplifier: 0 }],
    5: [{ id: "minecraft:resistance", ticks: s(8), amplifier: 0 }],
    6: [{ id: "minecraft:resistance", ticks: s(10), amplifier: 0 }],
    7: [{ id: "minecraft:resistance", ticks: s(12), amplifier: 0 }]
  }
}, FALLBACK_POOL = FAMILY_POOLS.bakery;
function shouldTriggerTier2(rng) {
  return rng() < 0.15;
}
function dawnstarBlessing(ctx) {
  return ctx.protection === "absolute" ? FAMILY_POOLS.special?.[7] ?? [] : [
    { id: "minecraft:regeneration", ticks: s(8), amplifier: 1 },
    // 生命恢复 II
    { id: "minecraft:absorption", ticks: s(120), amplifier: 0 },
    // 伤害吸收 I
    { id: "minecraft:resistance", ticks: s(15), amplifier: 0 }
    // 抗性提升 I
  ];
}
function planConsumeEffects(ctx) {
  let tier = ctx.tier.tier, out = [];
  if (tier === 0)
    return out.push(...planP0Effects(ctx)), out;
  if (tier === 1) return out;
  if (tier === 7) {
    out.push(...dawnstarBlessing(ctx));
    let pool2 = FAMILY_POOLS[ctx.family] ?? FALLBACK_POOL;
    return out.push(...pool2[7] ?? []), out;
  }
  if (tier === 2) {
    if (!shouldTriggerTier2(ctx.rng)) return out;
    let pool2 = FAMILY_POOLS[ctx.family] ?? FALLBACK_POOL;
    return out.push(...pool2[2] ?? []), out;
  }
  let pool = FAMILY_POOLS[ctx.family] ?? FALLBACK_POOL;
  return out.push(...pool[tier] ?? []), out;
}

// scripts/domain/ThirdParty.ts
var TP_TAG_ENABLE = "kira:food", TP_TAG_IGNORE = "kira:food_ignore", TP_TAG_FAMILY_PREFIX = "kira:food_family_", TP_TAG_OVERLAY_PREFIX = "kira:food_overlay_", TP_FAMILIES = /* @__PURE__ */ new Set([
  "bakery",
  "dessert",
  "fruit",
  "vegetable",
  "meat",
  "raw_meat",
  "fish",
  "raw_fish",
  "stew",
  "risky",
  "special",
  "generic"
]), TP_RULES = [
  // 汤品 / 炖菜
  { family: "stew", words: ["stew", "soup", "broth", "chowder", "bisque", "goulash", "curry", "hotpot", "porridge", "congee"] },
  // 甜点
  { family: "dessert", words: ["cake", "pie", "cookie", "biscuit", "pastry", "donut", "doughnut", "pudding", "dessert", "ice_cream", "sundae", "waffle", "pancake", "muffin", "brownie", "candy", "chocolate", "tart", "cupcake", "macaron", "jelly", "jam", "honey_cookie"] },
  // 危险食品
  { family: "risky", overlay: "light", words: ["pufferfish", "puffer", "rotten", "poisonous", "poison_food", "spider_eye", "cursed_food", "tainted", "corrupted_food", "radioactive"] },
  // 特殊魔法食品
  { family: "special", overlay: "light", words: ["golden_", "enchanted_", "magic_", "mystic_", "divine_", "celestial", "phoenix", "ambrosia", "nectar", "elixir_food", "blessed_"] },
  // 生鱼
  { family: "raw_fish", words: ["raw_fish", "raw_cod", "raw_salmon", "raw_tropical", "raw_clownfish", "sashimi", "raw_sushi"] },
  // 熟鱼
  { family: "fish", words: ["cooked_cod", "cooked_salmon", "cooked_fish", "grilled_fish", "smoked_fish", "fish_steak", "fish_fillet", "fishcake"] },
  // 生肉
  { family: "raw_meat", words: ["raw_beef", "raw_pork", "raw_mutton", "raw_rabbit", "raw_meat", "raw_chicken", "raw_venison", "raw_boar", "tartare", "carpaccio"] },
  // 熟肉
  { family: "meat", words: ["cooked_beef", "cooked_pork", "cooked_mutton", "cooked_rabbit", "cooked_chicken", "steak", "bacon", "ham", "sausage", "jerky", "roast", "barbecue", "bbq", "kebab", "meatball", "drumstick", "cutlet", "schnitzel", "burger", "hotdog", "salami", "pepperoni"] },
  // 烘焙主食
  { family: "bakery", words: ["bread", "bun", "toast", "bagel", "baguette", "croissant", "baked_potato", "dried_kelp", "kelp", "cracker", "pretzel", "pita", "naan", "tortilla", "rice", "noodle", "pasta", "dumpling", "biscuit_bread"] },
  // 水果
  { family: "fruit", words: ["fruit", "apple", "berry", "berries", "melon", "watermelon", "orange", "banana", "grape", "peach", "pear", "cherry", "mango", "pineapple", "kiwi", "papaya", "coconut", "lemon", "lime", "plum", "apricot", "fig", "date_fruit", "pomegranate", "strawberry", "blueberry", "raspberry", "blackberry", "chorus_fruit"] },
  // 蔬菜
  { family: "vegetable", words: ["carrot", "potato", "beetroot", "vegetable", "cabbage", "onion", "tomato", "radish", "turnip", "pumpkin", "corn", "pea", "bean", "lentil", "broccoli", "cauliflower", "spinach", "lettuce", "cucumber", "pepper", "garlic", "ginger", "mushroom", "seaweed", "algae"] },
  // 兜底：明确的"食物"词
  { family: "generic", words: ["food", "meal", "ration", "snack", "dish", "cuisine", "feast", "delicacy", "provision", "edible"] }
], denyWord = (words) => new RegExp(`(?:^|_)(?:${words.join("|")})(?:_|$)`), TP_DENY = [
  // 方块 / 建材
  denyWord(["block", "blocks", "brick", "bricks", "slab", "slabs", "stair", "stairs", "wall", "walls", "fence", "fences", "door", "doors", "trapdoor", "trapdoors", "pane", "panes", "lamp", "lamps", "torch", "torches", "lantern", "lanterns", "candle", "candles", "sign", "signs", "banner", "banners", "carpet", "carpets", "wool", "concrete", "terracotta", "glass", "plank", "planks", "log", "logs", "wood", "woods", "leaves", "leaf", "sapling", "saplings", "seed", "seeds", "sprout", "sprouts", "stem", "stems", "crop", "crops", "farmland", "soil", "dirt", "sand", "gravel", "ore", "ores", "ingot", "ingots", "nugget", "nuggets", "gem", "gems", "crystal", "crystals", "dust", "dusts", "powder", "powders", "shard", "shards", "bar", "bars", "plate", "plates", "sheet", "sheets", "scrap"]),
  // 刷怪蛋 / 生物掉落物（不可食用）
  denyWord(["spawn_egg", "spawn_eggs", "spawner", "spawners", "head", "heads", "skull", "skulls", "trophy", "trophies", "pelt", "pelts", "hide", "hides", "feather", "feathers", "scale", "scales", "fang", "fangs", "claw", "claws", "horn", "horns", "bone", "bones", "tooth", "teeth", "eye", "eyes", "heart", "hearts", "brain", "brains", "organ", "organs", "blood", "venom", "sac", "sacs", "gland", "glands", "wing", "wings", "shell", "shells", "carapace", "chitin", "leather", "string", "thread", "rope", "chain"]),
  // 容器 / 工具 / 杂项
  denyWord(["bucket", "buckets", "cauldron", "barrel", "barrels", "crate", "crates", "box", "boxes", "bag", "bags", "pouch", "pouches", "sack", "sacks", "basket", "baskets", "chest", "chests", "furnace", "furnaces", "table", "tables", "shelf", "shelves", "frame", "frames", "painting", "paintings", "totem", "totems", "saddle", "saddles", "lead", "leash", "name_tag", "compass", "clock", "clocks", "spyglass", "shears", "key", "keys", "coin", "coins", "token", "tokens", "ticket", "tickets", "badge", "badges", "emblem", "emblems", "flag", "flags", "paint", "dye", "dyes", "ink", "pen", "pens", "quill", "book", "books", "tome", "tomes", "scroll", "scrolls", "map", "maps", "blueprint", "blueprints", "recipe", "recipes"]),
  // 药水 / 非食物消耗品
  denyWord(["potion", "potions", "splash_potion", "lingering_potion", "tipped_arrow", "syringe", "injection", "pill", "pills", "capsule", "capsules", "tablet", "tablets", "medicine", "antidote", "bomb", "bombs", "grenade", "grenades", "ammo", "ammunition", "bullet", "bullets", "arrow", "arrows", "dart", "darts"])
];
function hasWord2(path, word) {
  let w = word.toLowerCase();
  if (!w) return !1;
  let esc = w.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), lead = w.startsWith("_") ? "" : "(?:^|_)", tail = w.endsWith("_") ? "" : "(?:_|$)";
  try {
    return new RegExp(lead + esc + tail).test(path);
  } catch {
    return !1;
  }
}
function pathOf2(typeId) {
  let id = String(typeId ?? "").toLowerCase(), i = id.indexOf(":");
  return i >= 0 ? id.slice(i + 1) : id;
}
function isTpDenied(typeId) {
  let path = pathOf2(typeId);
  return path ? TP_DENY.some((re) => re.test(path)) : !1;
}
function classifyTpByKeyword(typeId) {
  let path = pathOf2(typeId);
  if (path && !isTpDenied(typeId)) {
    for (let rule of TP_RULES)
      for (let w of rule.words)
        if (hasWord2(path, w))
          return { family: rule.family, overlay: rule.overlay ?? "normal", matched: w };
  }
}
function classifyThirdParty(typeId, tags, hasFoodComponent) {
  let list = tags ?? [];
  if (list.includes(TP_TAG_IGNORE)) return;
  if (list.includes(TP_TAG_ENABLE) || list.some((t) => t.startsWith(TP_TAG_FAMILY_PREFIX) || t.startsWith(TP_TAG_OVERLAY_PREFIX))) {
    let family = "generic";
    for (let t of list)
      if (t.startsWith(TP_TAG_FAMILY_PREFIX)) {
        let k = t.slice(TP_TAG_FAMILY_PREFIX.length).toLowerCase();
        if (TP_FAMILIES.has(k)) {
          family = k;
          break;
        }
      }
    let overlay = "normal";
    for (let t of list)
      if (t.startsWith(TP_TAG_OVERLAY_PREFIX)) {
        let k = t.slice(TP_TAG_OVERLAY_PREFIX.length).toLowerCase();
        if (k === "normal" || k === "light" || k === "none") {
          overlay = k;
          break;
        }
      }
    return { family, overlay, source: "declared", matched: TP_TAG_ENABLE };
  }
  if (isTpDenied(typeId) || !hasFoodComponent) return;
  let byKeyword = classifyTpByKeyword(typeId);
  return byKeyword ? { family: byKeyword.family, overlay: byKeyword.overlay, source: "keyword", matched: byKeyword.matched } : { family: "generic", overlay: "normal", source: "component" };
}
var TP_LORE_TAG = "[KFE]", TP_MARKER_RE = /\[KFE\](\d)\|([a-z_]+)\|(normal|light|none)/;
function encodeTpMarker(tier, family, overlay) {
  return `\xA78${TP_LORE_TAG}${tier}|${family}|${overlay}\xA7r`;
}
function decodeTpMarker(lore) {
  if (lore?.length)
    for (let line of lore) {
      let m = TP_MARKER_RE.exec(String(line));
      if (m) return { tier: Number(m[1]) | 0, family: m[2], overlay: m[3] };
    }
}
function hasTpMarker(lore) {
  return decodeTpMarker(lore) !== void 0;
}

// scripts/runtime/main.ts
var TP_ENABLED = !0, CONFIG = {
  qualityMode: "batch",
  poorFoodPenalty: "soft",
  negativeEffectsInPeaceful: !1,
  protectVanillaSpecialEffects: !0,
  protectUnknownFoods: !0,
  enableQualitySounds: !0,
  migrationOldFoodTier: 1,
  thirdParty: TP_ENABLED
}, NS = "kira_food", COMPONENT_ID = `${NS}:quality_food`, Stats = {
  scanned: 0,
  converted: 0,
  consumed: 0,
  effects: 0,
  errors: 0,
  skipped: 0,
  migrated: 0,
  byTier: {}
}, lastNegativeTick = /* @__PURE__ */ new Map();
function log(msg, data) {
  try {
    console.warn(`[KIRA-Food] ${msg}${data !== void 0 ? " " + JSON.stringify(data) : ""}`);
  } catch {
  }
}
function isConvertibleBase(typeId) {
  return FOOD_BASE_IDS.has(typeId) ? FOOD_BY_BASE_ID[typeId] ? !0 : !CONFIG.protectUnknownFoods : !1;
}
function isKiraVariant(typeId) {
  return FOOD_BY_VARIANT_ID[typeId] !== void 0;
}
function variantIdFor(baseId, tier) {
  let food = FOOD_BY_BASE_ID[baseId];
  if (food)
    return food.variants.find((v) => v.tier === tier)?.id;
}
function planConversion(typeId, amount, tier) {
  if (!isConvertibleBase(typeId)) return { ok: !1, reason: `\u975E\u8F6C\u6362\u76EE\u6807: ${typeId}` };
  let newId = variantIdFor(typeId, tier);
  return newId ? amount < 1 ? { ok: !1, reason: `\u6570\u91CF\u975E\u6CD5: ${amount}` } : { ok: !0, tier, newId, reason: "ok" } : { ok: !1, reason: `\u627E\u4E0D\u5230\u53D8\u4F53: ${typeId} + P${tier}` };
}
function planBatchConversion(typeId, amount, rng) {
  if (!isConvertibleBase(typeId) || amount < 1) return [];
  let tier = rollTier({ next: rng }), newId = variantIdFor(typeId, tier);
  return newId ? [{ tier, newId, count: amount }] : [];
}
function planPerItemConversion(typeId, amount, rng) {
  if (!isConvertibleBase(typeId) || amount < 1) return [];
  let buckets = /* @__PURE__ */ new Map();
  for (let i = 0; i < amount; i++) {
    let t = rollTier({ next: rng });
    buckets.set(t, (buckets.get(t) ?? 0) + 1);
  }
  let out = [];
  for (let [tier, count] of buckets) {
    let newId = variantIdFor(typeId, tier);
    newId && out.push({ tier, newId, count });
  }
  return out;
}
function isPeaceful() {
  try {
    return world.getDifficulty() === Difficulty.Peaceful;
  } catch {
    return !1;
  }
}
function healthOf(entity) {
  try {
    let h = entity.getComponent("minecraft:health");
    return typeof h?.currentValue == "number" ? h.currentValue : void 0;
  } catch {
    return;
  }
}
function applyEffects(source, effects) {
  for (let eff of effects) {
    if (eff.id === "kira_food:direct_damage") {
      try {
        let dmg = 1 + Math.floor(Math.random() * 2);
        source.applyDamage(dmg);
      } catch (e) {
        Stats.errors++, log("\u6263\u8840\u5931\u8D25", { error: String(e) });
      }
      continue;
    }
    try {
      source.addEffect(eff.id, eff.ticks, { amplifier: eff.amplifier, showParticles: !0 }), Stats.effects++;
    } catch (e) {
      Stats.errors++, log("\u65BD\u52A0\u6548\u679C\u5931\u8D25", { effect: eff.id, error: String(e) });
    }
  }
}
function dawnstarFeedback(player) {
  try {
    let loc = player.location;
    player.dimension.spawnParticle("minecraft:endrod", loc), CONFIG.enableQualitySounds && player.playSound("random.levelup", { volume: 0.8, pitch: 1.4 }), player.sendMessage("\xA76[\u6668\u661F\u7737\u987E] \xA7e\u8FD9\u4EFD\u98DF\u7269\u95EA\u8000\u7740\u4E0D\u5BFB\u5E38\u7684\u5149\u6CFD\u2026\u2026");
  } catch (e) {
    log("\u9876\u7EA7\u53CD\u9988\u5931\u8D25", { error: String(e) });
  }
}
function handleConsume(source, tier, baseId, overlay) {
  let family = FOOD_BY_BASE_ID[baseId]?.family ?? classifyFamily(baseId);
  applyQualityConsume(source, tier, family, overlay, baseId);
}
function applyQualityConsume(source, tier, family, overlay, label) {
  if (overlay === "none") {
    log("overlay=none\uFF0C\u8DF3\u8FC7 KIRA \u6548\u679C", { label, tier });
    return;
  }
  let peaceful = isPeaceful(), ctx = {
    tier: TIERS[tier] ?? TIERS[1],
    family,
    // 文档 §5.3：原版已有中毒/饥饿风险的食品，KIRA 不重复叠加同种负面
    protection: overlay === "light" ? "poison_hunger" : "none",
    rng: Math.random,
    playerHealth: healthOf(source),
    peaceful,
    ticksSinceLastNegative: (() => {
      let key = source.id ?? "", last = lastNegativeTick.get(key);
      return last === void 0 ? void 0 : system.currentTick - last;
    })()
  }, effects = planConsumeEffects(ctx), filtered = overlay === "light" ? effects.filter((e) => !NEGATIVE_IDS.has(e.id)) : effects;
  CONFIG.poorFoodPenalty === "soft" && (filtered = filtered.map(
    (e) => e.id === "kira_food:direct_damage" ? { ...e, amplifier: -1 } : e
  )), tier === 0 && filtered.length > 0 && filtered.some((e) => NEGATIVE_IDS.has(e.id)) && lastNegativeTick.set(source.id ?? "", system.currentTick), applyEffects(source, filtered), tier === 7 && typeof source.playSound == "function" && dawnstarFeedback(source);
}
var NEGATIVE_IDS = /* @__PURE__ */ new Set([
  "minecraft:nausea",
  "minecraft:weakness",
  "minecraft:hunger",
  "minecraft:poison",
  "kira_food:direct_damage"
]);
function registerComponents() {
  try {
    system.beforeEvents.startup.subscribe((init) => {
      try {
        init.itemComponentRegistry.registerCustomComponent(COMPONENT_ID, {
          onConsume: (event, params) => {
            try {
              let p = params?.params ?? {};
              if (typeof p.tier != "number" || !p.baseId) return;
              Stats.consumed++, handleConsume(event.source, p.tier, p.baseId, p.kiraOverlay ?? "normal");
            } catch (e) {
              Stats.errors++, log("onConsume \u5F02\u5E38", { error: String(e) });
            }
          }
        }), log("\u81EA\u5B9A\u4E49\u7EC4\u4EF6\u5DF2\u6CE8\u518C", { component: COMPONENT_ID });
      } catch (e) {
        Stats.errors++, log("\u6CE8\u518C\u81EA\u5B9A\u4E49\u7EC4\u4EF6\u5931\u8D25", { error: String(e) });
      }
    });
  } catch (e) {
    Stats.errors++, log("\u8BA2\u9605 startup \u5931\u8D25", { error: String(e) });
  }
}
var tpFoodProbe = /* @__PURE__ */ new Map(), TpStats = { scanned: 0, ingested: 0, byTier: {} };
function tpHasFoodComponent(stack) {
  let id = stack.typeId, hit = tpFoodProbe.get(id);
  if (hit !== void 0) return hit;
  let v = !1;
  try {
    v = !!stack.getComponent("minecraft:food");
  } catch {
    v = !1;
  }
  return tpFoodProbe.set(id, v), v;
}
function isThirdPartyCandidate(stack) {
  let id = stack.typeId;
  if (FOOD_BY_VARIANT_ID[id] || FOOD_BASE_IDS.has(id)) return !1;
  try {
    if (hasTpMarker(stack.getLore())) return !1;
  } catch {
  }
  return !0;
}
function ingestThirdParty(container, slot) {
  if (!CONFIG.thirdParty) return !1;
  let stack = container.getItem(slot);
  if (!stack || !isThirdPartyCandidate(stack)) return !1;
  TpStats.scanned++;
  let tags = [];
  try {
    tags = stack.getTags();
  } catch {
  }
  let hasFood = tpHasFoodComponent(stack), info = classifyThirdParty(stack.typeId, tags, hasFood);
  if (!info) return !1;
  let tier = rollTier({ next: Math.random }), def = TIERS[tier] ?? TIERS[1];
  try {
    let lore = stack.getLore().slice();
    return lore.push(`${def.color}\u3010${def.labelCN}\u3011${def.loreCN}\xA7r`), lore.push(`\xA78\u7B2C\u4E09\u65B9\u98DF\u54C1 \xB7 ${familyLabel(info.family)} \xB7 ${info.source}\xA7r`), lore.push(encodeTpMarker(tier, info.family, info.overlay)), stack.setLore(lore), container.setItem(slot, stack), TpStats.ingested++, TpStats.byTier[`p${tier}`] = (TpStats.byTier[`p${tier}`] ?? 0) + 1, log("thirdparty:ingest", { item: stack.typeId, tier, family: info.family, source: info.source, matched: info.matched }), !0;
  } catch (e) {
    return Stats.errors++, log("\u7B2C\u4E09\u65B9\u63A5\u5165\u5931\u8D25", { item: stack.typeId, error: String(e) }), !1;
  }
}
function convertSlot(player, slot) {
  try {
    let container = player.getComponent("minecraft:inventory")?.container;
    if (!container || slot < 0 || slot >= container.size) return !1;
    let stack = container.getItem(slot);
    if (!stack) return !1;
    if (CONFIG.thirdParty && ingestThirdParty(container, slot)) return !0;
    if (Stats.scanned++, isKiraVariant(stack.typeId) || !isConvertibleBase(stack.typeId)) return !1;
    let rng = Math.random, plans = CONFIG.qualityMode === "per_item" ? planPerItemConversion(stack.typeId, stack.amount, rng) : planBatchConversion(stack.typeId, stack.amount, rng);
    if (plans.length === 0)
      return Stats.skipped++, !1;
    if (plans.length === 1) {
      let plan = plans[0], newStack;
      try {
        newStack = new ItemStack(plan.newId, plan.count);
      } catch (e) {
        return Stats.errors++, log("\u521B\u5EFA\u53D8\u4F53\u5931\u8D25", { id: plan.newId, error: String(e) }), !1;
      }
      try {
        let lore = stack.getLore();
        lore?.length && newStack.setLore(lore);
      } catch {
      }
      return container.setItem(slot, newStack), Stats.converted++, Stats.byTier[`p${plan.tier}`] = (Stats.byTier[`p${plan.tier}`] ?? 0) + 1, !0;
    }
    let placedFirst = !1;
    for (let plan of plans) {
      let s2;
      try {
        s2 = new ItemStack(plan.newId, plan.count);
      } catch {
        continue;
      }
      if (!placedFirst)
        container.setItem(slot, s2), placedFirst = !0;
      else {
        let rest = container.addItem(s2);
        rest && (Stats.skipped++, log("\u80CC\u5305\u6EE1\uFF0C\u5269\u4F59\u7269\u54C1\u672A\u8F6C\u6362", { id: plan.newId, count: rest.amount }));
      }
      Stats.converted++, Stats.byTier[`p${plan.tier}`] = (Stats.byTier[`p${plan.tier}`] ?? 0) + 1;
    }
    return !0;
  } catch (e) {
    return Stats.errors++, log("\u8F6C\u6362\u69FD\u4F4D\u5931\u8D25", { slot, error: String(e) }), !1;
  }
}
function scanPlayer(player) {
  try {
    let container = player.getComponent("minecraft:inventory")?.container;
    if (!container) return;
    for (let slot = 0; slot < container.size; slot++) convertSlot(player, slot);
  } catch (e) {
    Stats.errors++, log("\u626B\u63CF\u73A9\u5BB6\u5931\u8D25", { error: String(e) });
  }
}
var booted = !1;
function boot() {
  if (booted) return;
  booted = !0, registerComponents();
  try {
    world.afterEvents.playerInventoryItemChange.subscribe((ev) => {
      try {
        if (ev.inventoryType !== PlayerInventoryType.Hotbar && ev.inventoryType !== PlayerInventoryType.Inventory) return;
        let player = ev.player, slot = ev.slot;
        system.run(() => convertSlot(player, slot));
      } catch (e) {
        Stats.errors++, log("\u80CC\u5305\u4E8B\u4EF6\u5F02\u5E38", { error: String(e) });
      }
    });
  } catch (e) {
    log("\u8BA2\u9605\u80CC\u5305\u4E8B\u4EF6\u5931\u8D25", { error: String(e) });
  }
  try {
    world.afterEvents.entityItemPickup.subscribe((ev) => {
      try {
        let entity = ev.entity;
        if (typeof entity?.getComponent != "function") return;
        system.run(() => scanPlayer(entity));
      } catch (e) {
        Stats.errors++, log("\u6361\u8D77\u4E8B\u4EF6\u5F02\u5E38", { error: String(e) });
      }
    });
  } catch (e) {
    log("\u8BA2\u9605\u6361\u8D77\u4E8B\u4EF6\u5931\u8D25\uFF08\u53EF\u5FFD\u7565\uFF09", { error: String(e) });
  }
  try {
    world.afterEvents.playerSpawn.subscribe((ev) => {
      try {
        if (!ev.initialSpawn) return;
        let player = ev.player;
        system.run(() => {
          scanPlayer(player), Stats.migrated++, log("\u65E7\u5B58\u6863\u8FC1\u79FB\u5B8C\u6210", { player: player?.name });
        });
      } catch (e) {
        Stats.errors++, log("\u8FC1\u79FB\u5F02\u5E38", { error: String(e) });
      }
    });
  } catch (e) {
    log("\u8BA2\u9605 playerSpawn \u5931\u8D25\uFF08\u53EF\u5FFD\u7565\uFF09", { error: String(e) });
  }
  let ticks = 0;
  system.runInterval(() => {
    if (ticks++, ticks % 20 === 0)
      try {
        for (let p of world.getAllPlayers()) p && scanPlayer(p);
      } catch (e) {
        Stats.errors++, log("\u5468\u671F\u626B\u63CF\u5F02\u5E38", { error: String(e) });
      }
  }, 1);
  try {
    world.afterEvents.itemCompleteUse.subscribe((ev) => {
      try {
        let stack = ev.itemStack;
        if (!stack) return;
        let mark = decodeTpMarker(stack.getLore());
        if (!mark) return;
        Stats.consumed++, log("thirdparty:consume", { item: stack.typeId, tier: mark.tier, family: mark.family, overlay: mark.overlay }), applyQualityConsume(ev.source, mark.tier, mark.family, mark.overlay, stack.typeId);
      } catch (e) {
        Stats.errors++, log("\u7B2C\u4E09\u65B9\u6D88\u8D39\u5F02\u5E38", { error: String(e) });
      }
    }), log("\u7B2C\u4E09\u65B9\u6D88\u8D39\u901A\u9053\u5DF2\u8BA2\u9605", { event: "itemCompleteUse" });
  } catch (e) {
    log("\u8BA2\u9605 itemCompleteUse \u5931\u8D25\uFF08\u53EF\u5FFD\u7565\uFF09", { error: String(e) });
  }
  log("KIRA \u98DF\u54C1\u8FDB\u5316\u5DF2\u88C5\u8F7D", {
    tick: system.currentTick,
    foods: FOOD_BASE_IDS.size,
    mode: CONFIG.qualityMode,
    thirdParty: TP_ENABLED,
    totalWeight: TIERS.reduce((s2, t) => s2 + t.weight, 0)
  });
}
try {
  world.afterEvents.worldLoad.subscribe(() => boot());
} catch (e) {
  log("\u8BA2\u9605 worldLoad \u5931\u8D25", { error: String(e) });
}
system.run(() => {
  if (!booted)
    try {
      world.getDimension("overworld"), boot();
    } catch (e) {
      log("\u5EF6\u8FDF\u542F\u52A8\u5931\u8D25", { error: String(e) });
    }
});
export {
  CONFIG,
  Stats,
  boot,
  isConvertibleBase,
  isKiraVariant,
  planBatchConversion,
  planConversion,
  planPerItemConversion,
  variantIdFor
};
