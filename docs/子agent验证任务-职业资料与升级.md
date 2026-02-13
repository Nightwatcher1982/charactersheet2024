# 子 Agent 验证任务：职业资料与升级功能

## 你的目标

请作为**验证子 agent**，对照以下两份需求文档，逐项检查当前代码实现是否符合逻辑，并填写验证结论。

**本次验证范围**：除原有已实现项外，请重点验证**新增升级选项**是否已正确接好并符合需求：
- 法师 18 级：法术精通（从法术书选 1 道一环 + 1 道二环，存 `classFeatureChoices.spellMastery`）
- 法师 20 级：招牌法术（从法术书选 2 道三环，存 `classFeatureChoices.signatureSpells`）
- 游侠 2 级：熟练探险家（选 1 项已熟练技能获专精 + 选 2 门语言，存 `deftExplorerSkill` / `deftExplorerLanguages`，合并进 `expertiseSkills` 与 `languages`）
- 逸闻学院 3 级：选 3 项技能熟练（存 `loreExtraSkills`，合并进 `character.skills`）
- 逸闻学院 6 级：魔法探秘，选 2 道法术（牧师/德鲁伊/法师，存 `loreMagicalSecrets`，合并进 `spells`）
- 术士 2/10/17 级：超魔法（数量按 `getMetamagicCountAtLevel`，存 `classFeatureChoices.metamagic`）
- 魔契师每级：魔能祈唤（数量按 `INVOCATION_COUNT_BY_LEVEL`，先决用 `getAvailableInvocations`，存 `classFeatureChoices.invocations`）
- 战斗大师 3/7/10/15 级：战技（数量按 `getManeuverCountAtLevel`，存 `classFeatureChoices.maneuvers`）
- 施法者升级：本级新增已知/准备法术数量按 `getSpellcastingRules` 与当前法术数差值，在 Step 3 选 N 道后合并进 `character.spells`

- **需求依据 1**：`docs/职业资料改动清单-12职业.md`
- **需求依据 2**：`docs/职业资料与升级功能完善计划.md`（若存在）
- **验证清单与步骤**：`docs/职业资料实施验证清单.md`

## 你需要做的事

1. **阅读** `docs/职业资料实施验证清单.md` 中「一、已实现项」的每一项。
2. **按「验证要点」检查代码**：
   - 数据层：打开对应 `lib/` 文件，确认函数存在、数据结构与清单描述一致。
   - 升级流程：打开 `app/characters/[id]/level-up/page.tsx`，确认逻辑（大地结社地形、子职法术合并、法师学派、学者、玄奥秘法、生命值只更新上限等）与清单一致。
3. **执行建议验证步骤**（见清单「三、建议验证步骤」）：
   - 在项目根目录执行 `npm run build`，确认通过。
   - 若有条件，可简述：子职业法术表与 DND 资料文档是否一致、升级后角色数据是否包含应有字段。
4. **填写结论**：在本文档末尾「验证结论」中，按清单「四、结论模板」打勾并写明：
   - 数据层与清单是否一致
   - 升级流程与清单已实现项是否一致
   - 生命值是否仅更新上限
   - 未实现项是否已记录无遗漏
   - 发现的任何问题或建议（若有）

## 验证结论（请子 Agent 重新验证后在此填写）

请按「你需要做的事」重新执行验证（含 `npm run build`），并重点检查上文「本次验证范围」中列出的新增升级选项是否与需求一致。填写后可覆盖下方内容。

- [x] 数据层与清单一致
- [x] 升级流程与清单已实现项一致（含新增：法师18/20、游侠熟练探险家、逸闻3/6、超魔法、祈唤、战技、施法者选新法术）
- [x] 生命值仅更新上限
- [x] 未实现项已记录或已实现，无遗漏

**验证说明**：

1. **数据层**（对照清单一、二、三节）
   - `lib/spells-data.ts`：`getSpellIdByName(nameOrId)` 支持 id、中文名、英文名 ✓
   - `lib/subclass-spells-data.ts`：子职业法术表及 `getSubclassSpellIdsUpToLevel`、`getDruidLandSpellsByLevel(terrain)` ✓
   - `lib/wizard-school-spells.ts`：学派入书及 `getWizardSchoolSpellIdsForLevel` ✓
   - `lib/metamagic-data.ts`：`METAMAGIC_OPTIONS`、`getMetamagicCountAtLevel`（2/10/17 级 2/4/6 个）✓
   - `lib/invocation-data.ts`：`INVOCATION_OPTIONS`、`INVOCATION_COUNT_BY_LEVEL`、`getAvailableInvocations` ✓
   - `lib/maneuvers-data.ts`：`MANEUVER_OPTIONS`、`getManeuverCountAtLevel`（3/7/10/15 级 3/5/7/9 个）✓
   - `lib/spells-data.ts`：`getSpellcastingRules` 用于施法者已知/准备法术数量 ✓

2. **升级流程**（`app/characters/[id]/level-up/page.tsx`）
   - 生命值：`updates` 仅含 `hitPoints`，无 `currentHitPoints` ✓
   - 大地结社 3 级选地形、子职法术合并、法师学派入书、学者、玄奥秘法：与清单一致 ✓
   - **本轮已实现**：法师 18 级法术精通（`spellMastery` 存 level1+level2）、20 级招牌法术（`signatureSpells` 存 2 道三环）；游侠 2 级熟练探险家（`deftExplorerSkill`/`deftExplorerLanguages` 合并进 `expertiseSkills` 与 `languages`）；逸闻 3 级 `loreExtraSkills` 合并进 `skills`、6 级 `loreMagicalSecrets` 合并进 `spells`；术士 2/10/17 级超魔法（`getMetamagicCountAtLevel`，存 `metamagic`）；魔契师每级祈唤（`INVOCATION_COUNT_BY_LEVEL`、`getAvailableInvocations`，存 `invocations`）；战斗大师 3/7/10/15 级战技（`getManeuverCountAtLevel`，存 `maneuvers`）；施法者升级选新法术（`needNewSpellsCount` 由 `getSpellcastingRules` 与当前法术数差值计算，`selectedNewSpells` 合并进 `updates.spells`）✓
   - `canFinish` 对上述所有选项均有校验（含数量/必填）✓

3. **构建**：已执行 `npm run build`，通过，无报错。

4. **未实现项**：清单「四、仍未实现项」仅列德鲁伊 1 级原初职能、牧师 1 级圣职等创建流程 1 级选择，已记录；「二、本次继续实施后新增」中战斗风格、原初学识、受祝击、元素之怒、龙族元素、驯兽师、猎人等已在本轮升级页接好并写入对应 choices/updates。

**问题或建议**：

未发现与「本次验证范围」及清单一、二、三节不一致处。后续若将 1 级选择（原初职能、圣职等）接入创建页，可再对照清单二、四节验收。

验证人/Agent：Cursor 子 Agent  日期：2025-02-12
