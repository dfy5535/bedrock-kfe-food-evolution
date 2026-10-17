# 兼容性说明 · 为什么最低是 1.26.50

> 逐项说明每个功能依赖什么、对应哪个最低版本、能不能降、为什么。
> **原则：宁可保持较高的最低版本，也不为了降版本而削弱功能。**

---

## 一、最低版本怎么定的

| `@minecraft/server` | 随哪个 MC 版本发布 | 依据 |
|---|---|---|
| 2.8.0 | 1.26.30 | `Update1.26.30.md`「ships v2.8.0」 |
| 2.9.0 | 1.26.40 | `Update1.26.40.md`「ships v2.9.0」 |
| 2.10.0 | 1.26.40 时仍是 **beta**；stable 标签 1.26.44 | npm 版本标签 + `Update1.26.40.md` 原文 |

本 MOD 依赖 `@minecraft/server 2.10.0` → 引擎必须 ≥ 提供 2.10.0 的版本。
**v6.0.2 起把 `min_engine_version` 修正为 `[1,26,50]`**（此前误写 `1.21.0`，在 1.21.x 安装会静默失败）。

---

## 二、逐功能：依赖什么、能不能降

| 功能 | 依赖的 API | 1.x（1.21.60）有吗 | 能否等价替代 |
|---|---|---|---|
| **食品品质转换**（背包里的原版食品自动换成八档变体） | `world.afterEvents.playerInventoryItemChange` + `system.runInterval` 周期扫描 | ❌ 事件没有 | ⚠️ 周期扫描已在用，可只靠它（有延迟） |
| **食用时结算品质效果** | `system.beforeEvents.startup` → `itemComponentRegistry.registerCustomComponent(onConsume)` | ❌ 没有 | ⚠️ 可用 `world.afterEvents.itemCompleteUse` 近似 |
| 拾取后重扫 | `world.afterEvents.entityItemPickup` | ❌ 没有 | ✅ 周期扫描已覆盖 |
| 和平模式判定 | `world.getDifficulty()` + `Difficulty` 枚举 | ❌ 没有 | ⚠️ 只能用 gamerule/动态属性近似 |
| 启动引导 | `world.afterEvents.worldLoad` | ❌ 没有 | ✅ `worldInitialize` |
| 背包类型过滤 | `PlayerInventoryType` 枚举 | ❌ 没有 | ✅ 用 `getComponent("minecraft:inventory")` 判断 |

### 关键结论

**核心机制是「自定义物品组件 `onConsume`」**，它必须通过 `system.beforeEvents.startup` 注册。

降到 1.x 会连锁触发两件事：

1. 组件注册时机变晚（`worldInitialize` 在方块/物品 JSON 解析**之后**）→
   物品里引用的 `kira_food:*` 组件解析失败 → **39 种食品变体全部加载不出来**；
2. 必须把「组件消费」改成「`itemCompleteUse` 事件」+ **删掉所有物品 JSON 里的组件引用** ——
   这是重写核心机制，不是适配。

因此**不降**。

---

## 三、真机验证（BDS 1.26.52.3）

### 启动

```
[KIRA-Food] KIRA 食品进化已装载 {"foods":39,"mode":"batch","thirdParty":false,"totalWeight":100000}
[KIRA-Food] 旧存档迁移完成 {"player":"vtest1"}
```
无脚本报错、0 实体加载失败。

### 无头 Bot 实测：面包真的被转换了

用服务端 `/clear <玩家> <物品> 0` 报数（绕开客户端背包不同步）：

```
给 5 个 minecraft:bread → 等 6 秒（KFE 每 20 tick 扫描一次）
clear vkfe2 minecraft:bread 0        → "no items to remove"      ← 原版面包 0 个
clear vkfe2 kira_food:bread_p0 0     → "removing 5 items"        ← 5 个变体
```

**5 个面包全部转成了 `kira_food:bread_p0`。** 转换链路正常。

---

## 四、如果将来真的需要 1.21.60

只能出**独立降级版**（`-1.21.60-lite`），代价是：
- 食用结算改为 `itemCompleteUse` 事件（时机略不同）
- 背包转换改为纯轮询（有 1 秒级延迟）
- 和平模式判定改为近似实现

主版本不受影响。当前选择 **不降**。
