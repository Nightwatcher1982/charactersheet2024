# 📤 GitHub 上传指南

**状态**：✅ Git仓库已初始化，代码已提交  
**下一步**：创建GitHub仓库并推送代码

---

## ✅ 已完成

1. ✅ 初始化Git仓库（`git init`）
2. ✅ 添加所有文件（`git add .`）
3. ✅ 创建初始提交（`git commit`）
   - 提交ID：`9d00916`
   - 100个文件，34491行代码

---

## 📋 上传到GitHub的步骤

### 方法1：使用GitHub网页界面（推荐）

#### 步骤1：创建GitHub仓库

1. 访问 [GitHub.com](https://github.com)
2. 登录您的账户
3. 点击右上角的 **"+"** → **"New repository"**
4. 填写仓库信息：
   - **Repository name**: `dnd-2024-character-sheet`（或您喜欢的名称）
   - **Description**: `D&D 2024 Character Sheet Creator - Web-based character creation tool`
   - **Visibility**: 
     - ✅ Public（公开，任何人都可以看到）
     - 或 🔒 Private（私有，只有您可以看到）
   - ⚠️ **不要**勾选 "Initialize this repository with a README"
   - ⚠️ **不要**添加 .gitignore 或 license（我们已经有了）
5. 点击 **"Create repository"**

#### 步骤2：推送代码

GitHub会显示推送代码的指令。在终端中执行：

```bash
cd "/Users/nwdemacmini/Documents/5r character sheet"

# 添加远程仓库（替换YOUR_USERNAME为您的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/dnd-2024-character-sheet.git

# 或者使用SSH（如果您配置了SSH密钥）
# git remote add origin git@github.com:YOUR_USERNAME/dnd-2024-character-sheet.git

# 推送代码到GitHub
git branch -M main
git push -u origin main
```

**如果使用HTTPS**，GitHub会要求您输入：
- **用户名**：您的GitHub用户名
- **密码**：使用 **Personal Access Token**（不是账户密码）

#### 获取Personal Access Token

1. GitHub → Settings → Developer settings → Personal access tokens → Tokens (classic)
2. 点击 "Generate new token (classic)"
3. 填写：
   - **Note**: `DND Character Sheet Upload`
   - **Expiration**: 选择过期时间（建议90天或更长）
   - **Scopes**: 勾选 `repo`（完整仓库访问权限）
4. 点击 "Generate token"
5. **复制token**（只显示一次！）
6. 在推送时，密码处粘贴这个token

---

### 方法2：使用GitHub CLI（更简单）

如果您安装了GitHub CLI：

```bash
# 安装GitHub CLI（如果未安装）
# macOS: brew install gh
# 或访问: https://cli.github.com

# 登录GitHub
gh auth login

# 创建仓库并推送
cd "/Users/nwdemacmini/Documents/5r character sheet"
gh repo create dnd-2024-character-sheet --public --source=. --remote=origin --push
```

---

## 🔍 验证上传

上传成功后，访问您的GitHub仓库：
```
https://github.com/YOUR_USERNAME/dnd-2024-character-sheet
```

您应该看到：
- ✅ 所有文件都在仓库中
- ✅ README.md显示在首页
- ✅ 提交历史显示初始提交

---

## 📝 后续更新代码

当您修改代码后，使用以下命令更新GitHub：

```bash
cd "/Users/nwdemacmini/Documents/5r character sheet"

# 查看修改的文件
git status

# 添加修改的文件
git add .

# 提交修改（添加有意义的提交信息）
git commit -m "修复：添加物种技能栏位显示"

# 推送到GitHub
git push
```

---

## 🛠️ 常用Git命令

### 查看状态
```bash
git status              # 查看工作区状态
git log                 # 查看提交历史
git diff                # 查看未暂存的修改
```

### 提交修改
```bash
git add .               # 添加所有修改
git add 文件名          # 添加特定文件
git commit -m "消息"    # 提交修改
git push                # 推送到GitHub
```

### 撤销操作
```bash
git reset HEAD 文件名   # 取消暂存
git checkout -- 文件名  # 撤销工作区修改（危险！）
```

---

## ⚠️ 注意事项

### 不要上传的文件

`.gitignore` 已经配置了以下文件不会被上传：
- ✅ `node_modules/` - 依赖包（太大）
- ✅ `.next/` - Next.js构建文件
- ✅ `.env*.local` - 本地环境变量（可能包含密钥）
- ✅ `*.log` - 日志文件

### 敏感信息

⚠️ **不要**在代码中硬编码：
- API密钥
- 数据库密码
- 个人访问令牌

如果必须使用，请使用环境变量（`.env.local`），并确保`.env.local`在`.gitignore`中。

---

## 🎯 推荐的仓库设置

### README.md

您的仓库已经有README.md，但可以更新为：

```markdown
# D&D 2024 Character Sheet Creator

基于D&D 2024规则的在线角色卡创建工具。

## 功能

- ✅ 完整的角色创建向导
- ✅ 职业、背景、物种选择
- ✅ 属性分配（标准数组、购点法）
- ✅ 技能熟练管理
- ✅ 装备和武器显示
- ✅ 2页可打印角色卡
- ✅ 移动端友好设计
- ✅ 中文支持

## 技术栈

- Next.js 14
- TypeScript
- Tailwind CSS
- Zustand

## 安装

\`\`\`bash
npm install
npm run dev
\`\`\`

## 许可证

MIT License
```

### 添加Topics（标签）

在GitHub仓库页面，点击 ⚙️ Settings → Topics，添加：
- `dnd`
- `dnd-2024`
- `character-sheet`
- `nextjs`
- `typescript`
- `rpg`

---

## 🆘 遇到问题？

### 问题1：推送时要求认证

**解决方案**：
- 使用Personal Access Token而不是密码
- 或配置SSH密钥

### 问题2：远程仓库已存在

**解决方案**：
```bash
# 删除现有远程仓库
git remote remove origin

# 重新添加
git remote add origin https://github.com/YOUR_USERNAME/dnd-2024-character-sheet.git
```

### 问题3：推送被拒绝

**解决方案**：
```bash
# 先拉取远程更改
git pull origin main --allow-unrelated-histories

# 解决冲突后再次推送
git push
```

---

## ✅ 完成检查清单

- [ ] 在GitHub创建了仓库
- [ ] 添加了远程仓库（`git remote add origin`）
- [ ] 成功推送代码（`git push`）
- [ ] 在GitHub上看到所有文件
- [ ] 更新了README.md（可选）
- [ ] 添加了仓库Topics（可选）

---

**状态**：✅ 本地Git仓库已就绪  
**下一步**：创建GitHub仓库并推送

**祝您上传顺利！** 🚀✨
