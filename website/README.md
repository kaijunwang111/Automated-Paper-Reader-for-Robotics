# 具身智能观察站

Automated Paper Reader for Robotics 的公开网站，展示具身智能论文日报、可检索论文数据库与机器人公司动态。

公开地址：

- [GitHub Pages](https://kaijunwang111.github.io/Automated-Paper-Reader-for-Robotics/)
- [ChatGPT Sites](https://embodied-observatory.kaijunwang111.chatgpt.site)

两个站点使用本目录中的同一份源码和内容。

## 页面

- `/`：最新日报与公司动态
- `/reports`：日报归档
- `/reports/:date`：日报详情与论文原图
- `/papers`：论文数据库、分类与检索
- `/companies`：机器人公司官方动态追踪

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
npm test
npm run test:pages
```

`npm test` 验证 ChatGPT Sites / vinext 构建，`npm run test:pages` 验证 GitHub Pages 静态导出、路径前缀、资源完整性和大小门槛。

## 内容边界

- 本地完整日报保留检索和运行信息。
- 网站只发布清理后的论文内容。
- 每篇论文使用一至两幅能帮助理解方法的 Overview / Method / Architecture 图片，优先截取自 arXiv 原论文。
- 公司动态当前每周一从官方来源更新。
