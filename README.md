# 科高樱花社 · 官方网站

> 深圳科学高中樱花社（ACGN 同好会）官方网站  
> 历久弥新 · 记录社团的点点滴滴

[![Website](https://img.shields.io/badge/Website-hongaxe.github.io%2Fsakura-ffb7c5?style=flat-square)](https://hongaxe.github.io/sakura/)
[![License](https://img.shields.io/badge/License-MIT-e05a6d?style=flat-square)](#版权与许可)

---

##  项目简介

本项目是 **深圳科学高中樱花社** 的官方网站，旨在为社团成员与校内外 ACGN 爱好者提供信息展示与互动平台。网站包含社团简介、社史时间线、趣味小测试、相关链接与加入方式等模块。

樱花社成立于 2013 年，是科高历史最悠久的 ACGN 社团之一。我们秉持「不攀比实力、不拘泥于出身、不在意入坑时间」的初心，欢迎所有热爱二次元文化的同学加入。

---

##  功能特性

| 模块 | 说明 |
|------|------|
| **主页** | 社团 badge、社徽展示、S.O.S. 团致敬文案、像素风快捷入口 |
| **社史** | 时间线形式记录，配有历史图片；历届干部与指导老师数据通过 JSON 动态渲染；提供 Word/PDF 原稿下载 |
| **小测试** | 分为 **简单** 、 **困难** 双题库，普通模式（抽 15 题、可回退）与无尽模式（全题库乱序、累计错 10 题结束） |
| **排行榜** | 按「分数降序 → 用时升序」排名，每人每模式仅保留最好成绩（基于 Supabase） |
| **留言板** | 使用 GitHub 登录，每人限一条留言，可修改（基于 Supabase） |
| **相关链接** | 衍生平台、友情站点、其他ACGN群 |
| **背景音乐** | 进入页面自动尝试播放，右上角悬浮开关，支持跨页续播 |
| **访问统计** | 页脚展示本站总访问量（基于 Vercount 服务） |
| **复古 UI** | 全站采用 **Zpix 像素字体**，复古羊皮纸亮色主题 |
| **响应式** | 适配桌面端与移动端，手机端自动调整布局 |

---

##  目录结构

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
│   ├── qna-easy.txt            # 简单题库
│   └── qna-hard.txt            # 困难题库
├── static/
│   ├── another/
│   │   ├── sakura-history.docx # 社史 Word 原稿
│   │   └── sakura-history.pdf  # 社史 PDF 原稿
│   ├── data/
│   │   ├── groups.json         # 社团分组数据
│   │   ├── leaders.json        # 历届社长与干部数据
│   │   └── teachers.json       # 历届指导老师数据
│   ├── fonts/
│   │   └── Zpix.woff2          # 像素字体文件
│   ├── image/
│   │   ├── activity-room.png
│   │   ├── fair-1.png
│   │   ├── fair-2.png
│   │   ├── fair-3.png
│   │   ├── fair-4.png
│   │   ├── fair-5.png
│   │   ├── fair-6.png
│   │   ├── fair-7.png
│   │   ├── fair-8.png
│   │   ├── fair-9.png
│   │   ├── group-photo.png
│   │   ├── intro-2014.png
│   │   ├── intro-2016-1.png
│   │   ├── intro-2016-2.png
│   │   ├── personification.png
│   │   ├── sakura.png
│   │   ├── sakura-new.png
│   │   ├── sakura-past.png
│   │   ├── tieba.png
│   │   └── weibo.png
│   ├── logo/
│   │   ├── 627028677.jpg
│   │   ├── 748447914.jpg
│   │   ├── 754021038.jpg
│   │   ├── 777269544.jpg
│   │   ├── 793241707.jpg
│   │   ├── 801762549.jpg
│   │   ├── 812476105.jpg
│   │   ├── 858902007.jpg
│   │   ├── 983372305.jpg
│   │   ├── 1021186735.jpg
│   │   ├── github.jpg
│   │   ├── hongax.png
│   │   ├── kgri.jpg
│   │   ├── sakura.png
│   │   ├── tieba.jpg
│   │   └── weibo.jpg
│   ├── music/
│   │   └── music.mp3           # 背景音乐
│   ├── music-player.js         # 背景音乐播放器
│   ├── sakura.css              # 全站公共样式
│   └── supabase-client.js      # Supabase 客户端配置
├── index.html                  # 主页
├── LICENSE
└── README.md


```

### 题库格式

`quiz/qna-xxxx.txt`，每行一题，字段以 `|` 分隔：

```

题目|选项A|选项B|选项C|选项D|正确答案序号

```

正确答案序号从 `0` 开始（0=A，1=B，2=C，3=D）。示例：

```

《魔法少女小圆》的编剧是？|虚渊玄|麻枝准|冈田麿里|大河内一楼|0

```

---

##  使用技术

- **纯静态**：HTML5 + CSS3 + 原生 JavaScript
- **背景音乐**：HTML5 Audio API，配合 localStorage 实现跨页续播
- **认证与数据库**：Supabase（GitHub OAuth + PostgreSQL）
- **访问统计**：Vercount
- **动画**：CSS Keyframes
- **部署**：GitHub Pages

---


##  贡献反馈

· 如发现页面 bug、样式问题或有内容补充，欢迎提交 Issue 或 Pull Request。
· 如果你也是科高樱花社成员，并希望参与网站维护，请联系现任社长或开发者。

---

## 版权许可

- 本网站由 **HongAX** 开发与维护。
- 社史、图片由2026届社长 **Cyan.** 整理，仅供社团展示与交流使用。

---

## 最终致谢

感谢所有为樱花社做出贡献的历届社员、指导老师，以及所有热爱 ACGN 文化的朋友们。

**找绅士，找秀吉，到科高樱花社！**

---

<p align="center">
  <sub>© 2026 深圳科学高中樱花社 · Built with ❤️ by HongAX</sub>
</p>