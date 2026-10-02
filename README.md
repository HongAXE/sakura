# 科高樱花社 · 官方网站

> 深圳科学高中樱花社（ACGN 同好会）官方网站  
> 历久弥新 · 记录社团的点点滴滴

[![Website](https://img.shields.io/badge/Website-hongaxe.github.io%2Fsakura-ffb7c5?style=flat-square)](https://hongaxe.github.io/sakura/)
[![License](https://img.shields.io/badge/License-MIT-e05a6d?style=flat-square)](#版权与许可)

---

## 📖 项目简介

本项目是 **深圳科学高中樱花社** 的官方网站，旨在为社团成员与校内外 ACGN 爱好者提供信息展示与互动平台。网站包含社团简介、社史时间线、趣味小测试、相关链接与加入方式等模块。

樱花社成立于 2013 年，是科高历史最悠久的 ACGN 社团之一。我们秉持「不攀比实力、不拘泥于出身、不在意入坑时间」的初心，欢迎所有热爱二次元文化的同学加入。

---

## ✨ 功能特性

| 模块 | 说明 |
|------|------|
| 🏠 **主页** | 社团 badge、社徽展示、S.O.S. 团致敬文案、快捷入口 |
| 📜 **社史** | 时间线形式记录 2013 年至今的重要事件，配有历史图片与历届干部名单 |
| 🎯 **小测试 · 普通模式** | 从题库随机抽取 15 题，可返回上题修改答案，按百分制计分 |
| 🔥 **小测试 · 无尽模式** | 全部题目打乱后依次作答，不可回退，答对 +10 分，累计答错 10 题结束 |
| 🏆 **排行榜** | 普通 / 无尽两个榜单，按「分数降序 → 用时升序」排名，每人每模式仅保留最好成绩 |
| 💬 **留言板** | 使用 GitHub 账号登录，每人限一条留言，可修改自己的留言（基于 Supabase） |
| 📁 **相关链接** | 樱花社衍生平台（QQ 群、贴吧、微博）与友情站点（科外所、开发者主页） |
| 🎵 **背景音乐** | 进入页面自动尝试播放，右上角悬浮开关，支持跨页续播与状态记忆 |
| 🌸 **樱花飘落** | 全站淡粉色樱花飘落动画，增强视觉氛围 |
| 👀 **访问统计** | 页脚展示本站总访问量（基于 Vercount 服务） |
| 🎨 **响应式设计** | 适配桌面端与移动端，手机端自动调整布局 |

---

## 📁 目录结构

```

Sakura/
├── comment/
│   └── index.html              # 留言板页面
├── history/
│   └── index.html              # 社史页面
├── links/
│   └── index.html              # 相关链接页面
├── quiz/
│   ├── index.html              # 模式选择 + 排行榜
│   ├── play.html               # 答题页面
│   ├── qna-easy.txt            # 题库数据 - 简单
│   └── qna-hard.txt            # 题库数据 - 困难
├── static/
│   ├── image/
│   │   ├── intro-2014.png
│   │   ├── intro-2016.1.png
│   │   ├── intro-2016.2.png
│   │   ├── personification.png
│   │   ├── sakura.png
│   │   ├── sakura-new.png
│   │   └── sakura-past.png
│   ├── music/
│   │   └── music.mp3
│   ├── music-player.js         # 背景音乐播放器
│   ├── sakura.css              # 全站公共样式
│   └── supabase-client.js      # Supabase 客户端配置
├── index.html                  # 主页
├── LICENSE
└── README.md

```

### 题库格式（`quiz/qna.txt`）

每行一题，字段以 `|` 分隔：

```

题目|选项A|选项B|选项C|选项D|正确答案序号

```

正确答案序号从 `0` 开始（0=A，1=B，2=C，3=D）。示例：

```

《魔法少女小圆》的编剧是？|虚渊玄|麻枝准|冈田麿里|大河内一楼|0

```

---

## 🛠️ 技术栈

- **纯静态**：HTML5 + CSS3 + 原生 JavaScript，无框架依赖
- **字体**：系统默认字体栈，保证跨平台显示一致
- **背景音乐**：HTML5 Audio API，配合 localStorage 实现跨页续播
- **认证与数据库**：Supabase（GitHub OAuth + PostgreSQL）
- **访问统计**：Vercount
- **动画**：CSS Keyframes 实现樱花飘落与加载动画
- **部署**：GitHub Pages

---


## 🤝 贡献与反馈

· 如发现页面 bug、样式问题或有内容补充，欢迎提交 Issue 或 Pull Request。
· 如果你也是科高樱花社成员，并希望参与网站维护，请联系现任社长或开发者。

---

## 📜 版权与许可

- 本网站由 **HongAX** 开发与维护。
- 网站内容（社史文字、图片、题库）由樱花社成员共同整理，仅供社团展示与交流使用。
- 代码部分采用 **MIT License**，可自由参考与二次开发。
- 背景音乐、部分图片素材版权归原作者所有，请勿用于商业用途。

---

## 🙏 致谢

感谢所有为樱花社做出贡献的历届社员、指导老师，以及所有热爱 ACGN 文化的朋友们。

**找绅士，找秀吉，到科高樱花社！**

---

<p align="center">
  <sub>© 2026 深圳科学高中樱花社 · Built with ❤️ by HongAX</sub>
</p>