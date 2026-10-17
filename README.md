# 🍖 KIRA 食品进化 · KFE

> 把原版与第三方食品分成**八档品质**，吃下去更有价值，同时保留原版手感。
>
> **当前版本** `v6.0.1` ｜ **实测运行** `1.26.52.3`

[← 返回合集总仓库](https://github.com/dfy5535/minecraft-bedrock-addons)

---

## 简介

KFE 接管玩家食用的食品，按品质分档给出不同的附加效果，但**保留原版食物本身的回复量**，
不改变你熟悉的手感。

---

## 两个变体

| 变体 | 说明 | 文件 |
|---|---|---|
| **A 经典版** | 只接管**原版 39 种食品**，不碰第三方 | `KFE-A-Classic-v6.0.1.mcaddon` |
| **B 第三方兼容版** | 自动接管**第三方 Add-on 食品**（关键词 / Tag / food 组件三重判定） | `KFE-B-ThirdParty-v6.0.1.mcaddon` |

两者代码不同（1535 / 1704 行），按需装一个，不要同时装。

---

## 版本与兼容性

| 项 | 值 |
|---|---|
| 当前版本 | v6.0.1 |
| manifest 最低版本 | BP `1.21.0` / RP `1.21.120` |
| 脚本 API | `@minecraft/server` **2.10.0** |
| 实测运行版本 | 1.26.52.3 |

> ⚠️ **注意**：manifest 写的 `min_engine_version` 是 1.21.0，但脚本依赖 `@minecraft/server 2.10.0`，
> 这个模块版本只在较新的引擎里提供，所以**实际最低需要 1.26 左右**，不是 1.21.0。

---

## 真机验证（BDS 1.26.52.3）

```
[KIRA-Food] KIRA 食品进化已装载 {"foods":39,"mode":"batch","thirdParty":false,"totalWeight":100000}
```

- 加载正常，识别 39 种食品
- 无脚本报错
- 0 实体加载失败

---

## 安装

1. 下载 `dist/` 里对应变体的 `.mcaddon`
2. 双击导入（或游戏内「设置 → 存储」导入）
3. 新建世界或进入已有世界，**同时启用行为包与资源包**

> **v6.0.1 修复了打包结构**：原包是「`.mcaddon` 里再装 `.mcpack`」的嵌套结构，
> Minecraft 导入器不会递归解包，用户导入可能完全无效。现已改为标准扁平结构（BP/RP 直接在根）。

---

## 已知限制

- **尚未做 1.21.60 适配**。需要的话要替换 3 处 2.x 专属 API：
  `PlayerInventoryType` / `Difficulty` 枚举导入、`world.getDifficulty()`、`system.beforeEvents`，
  以及 `playerInventoryItemChange` / `entityItemPickup` / `worldLoad` 三个事件。

---

## 源码结构

```
bedrock-kfe-food-evolution/
├── README.md
├── CHANGELOG.md
├── LICENSE                  ← MIT
├── LICENSE-ASSETS.md        ← CC-BY-4.0
├── NOTICE.md
├── dist/
│   ├── KFE-A-Classic-v6.0.1.mcaddon
│   └── KFE-B-ThirdParty-v6.0.1.mcaddon
└── source/
    ├── A-classic/           ← BP + RP
    └── B-thirdparty/
```

---

## 许可证

- **代码与 JSON**：MIT — 见 [LICENSE](./LICENSE)
- **贴图与 3D 模型**：CC-BY-4.0 — 见 [LICENSE-ASSETS.md](./LICENSE-ASSETS.md)
