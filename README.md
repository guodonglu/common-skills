# Common Skills (常用工具 Skill 集合)

个人智能助手（Antigravity / Gemini CLI / Claude Code / Cursor 等）的常用 Skill 与自动化脚本合集。

## 目录

- [Skills 列表](#skills-列表)
  - [1. download-tiktok-mod](#1-download-tiktok-mod)
- [安装与使用方法](#安装与使用方法)
  - [方式 1：安装到 Agent 全局 Skills 目录（推荐）](#方式-1安装到-agent-全局-skills-目录推荐)
  - [方式 2：作为独立脚本运行](#方式-2作为独立脚本运行)
- [目录结构](#目录结构)
- [License](#license)

---

## Skills 列表

### 1. `download-tiktok-mod`

- **功能说明**：自动从 LiteAPKs 解析并下载适用于 64 位 ARM8 (`arm64-v8a`) 设备的最新的 TikTok Mod APK（支持 Platinum 稳定版和 Private Plus 增强版）。
- **核心特点**：
  - 自动穿透 LiteAPKs 动态双重 Base64 编码的时间戳 Token 防盗链机制。
  - 智能匹配适配手机架构（`arm64-v8a`）的高性能安装包。
  - 自动下载并进行 ZIP 完整性校验（校验 APK 是否损坏或缺失分卷）。
  - **路径隐私保护**：下载路径支持动态解析，不会在代码与仓库中泄露个人手机路径。支持通过 `--dest` 参数、环境变量 `DOWNLOAD_DIR` 或本地配置文件 `~/.config/agent_download_dir` 进行自定义。

---

## 安装与使用方法

### 方式 1：安装到 Agent 全局 Skills 目录（推荐）

将仓库中的技能目录复制到 `~/.agents/skills/` 即可完成安装：

```bash
# 1. 克隆仓库
git clone https://github.com/guodonglu/common-skills.git

# 2. 部署技能
mkdir -p ~/.agents/skills
cp -r common-skills/skills/download-tiktok-mod ~/.agents/skills/
```

部署完成后，当对智能体说：
- *“下载最新版TikTok”*
- *“下载最新版TikTok mod包”*
- *“更新TikTok mod”*

智能体将自动识别并调用此 Skill 自动化完成下载。

### 方式 2：作为独立脚本运行

无需 Agent，也可以直接在终端中使用 Node.js 执行：

```bash
cd common-skills/skills/download-tiktok-mod

# 下载 Platinum 稳定推荐版（体积小、稳定）
node scripts/download_tiktok.js --type=platinum

# 下载 Private Plus 增强版（功能最全）
node scripts/download_tiktok.js --type=private_plus

# 自定义保存路径
node scripts/download_tiktok.js --type=platinum --dest=/path/to/download
```

---

## 目录结构

```text
common-skills/
├── README.md
├── LICENSE
└── skills/
    └── download-tiktok-mod/
        ├── SKILL.md                  # Skill 定义规范与自动触发规则
        └── scripts/
            └── download_tiktok.js    # 自动化下载与完整性校验脚本
```

---

## License

[MIT](LICENSE)
