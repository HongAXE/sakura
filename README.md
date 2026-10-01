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
| 🎯 **小测试** | 从 100+ 道 ACGN 题库中随机抽取 15 题，支持上一题/下一题导航、错题回顾与评分 |
| 📁 **相关链接** | 樱花社衍生平台（QQ 群、贴吧、微博）与友情站点（科外所、开发者主页） |
| 🎵 **背景音乐** | 进入页面自动尝试播放，右上角悬浮开关，支持跨页续播与状态记忆 |
| 🌸 **樱花飘落** | 全站淡粉色樱花飘落动画，增强视觉氛围 |
| 👀 **访问统计** | 页脚展示本站总访问量（基于 Vercount 服务） |
| 🎨 **响应式设计** | 适配桌面端与移动端，手机端自动调整布局 |

---

## 📁 目录结构

```

Sakura/
├── history/
│   └── index.html
├── links/
│   └── index.html
├── quiz/
│   ├── index.html
│   └── qna.txt
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
│   ├── music-player.js
│   ├── sakura.css
│   ├── sakura.css.bak
│   └── 樱花社社史.docx
├── index.html
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
- **访问统计**：Vercount
- **动画**：CSS Keyframes 实现樱花飘落与加载动画
- **部署**：GitHub Pages

---

## 🚀 本地运行

1. 克隆或下载本仓库到本地：
   ```
   git clone https://github.com/HongAXE/sakura.git
   cd sakura
   ```

2. 直接双击打开 index.html 即可浏览主页。
3. 由于小测试页使用了 fetch 读取 qna.txt，直接双击打开会被浏览器的本地文件安全策略拦截。建议使用本地服务器预览：
   ```
   # 若已安装 Python 3
   python -m http.server 8000
   ```
   然后在浏览器中访问 http://localhost:8000/。

---

## 🌐 部署到 GitHub Pages

1. 将整个 Sakura/ 目录推送到 GitHub 仓库（可以是独立仓库，也可以是子目录）。
2. 进入仓库的 Settings → Pages。
3. 在 Source 中选择 main 分支和 /（根目录）或 /docs（若你放在 docs 目录下）。
4. 保存后等待 1~2 分钟，访问 https://<你的用户名>.github.io/<仓库名>/ 即可。

本网站当前部署地址：https://hongaxe.github.io/sakura/

---

## 📝 自定义与维护

| 想修改的内容 | 对应文件 |
|------|------|
| 社团简介、快捷入口 | index.html |
| 社史时间线、图片 | history/index.html |
| 小测试题目 | quiz/qna.txt |
| 相关链接、QQ 群号 | links/index.html |
| 全站配色、按钮风格 | static/sakura.css |
| 背景音乐 | static/music/music.mp3 |
| 樱花飘落数量与速度 | 各页面底部的 sakuraBg 脚本 |

---

## 🤝 贡献与反馈

· 如发现页面 bug、样式问题或有内容补充，欢迎提交 Issue 或 Pull Request。
· 如果你也是科高樱花社成员，并希望参与网站维护，请联系现任社长或开发者。

---

## 📜 版权与许可

· 本网站由 HongAX 开发与维护。
· 网站内容（社史文字、图片、题库）由樱花社成员共同整理，仅供社团展示与交流使用。
· 代码部分采用 MIT License，可自由参考与二次开发。
· 背景音乐、部分图片素材版权归原作者所有，请勿用于商业用途。

---

## 🙏 致谢

感谢所有为樱花社做出贡献的历届社员、指导老师，以及所有热爱 ACGN 文化的朋友们。

找绅士，找秀吉，到科高樱花社！

---

<p align="center">
  <sub>© 2026 深圳科学高中樱花社 · Built with ❤️ by HongAX</sub>
</p>