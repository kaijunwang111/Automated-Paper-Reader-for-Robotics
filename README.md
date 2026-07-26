# 具身智能观察站

CAPR 的公开网站，展示具身智能论文日报与机器人公司动态。

公开地址：[embodied-observatory.kaijunwang111.chatgpt.site](https://embodied-observatory.kaijunwang111.chatgpt.site)

## 页面

- `/`：最新日报与公司动态
- `/reports`：日报归档
- `/reports/:date`：日报详情与论文原图
- `/papers`：论文数据库、分类与检索
- `/companies`：机器人公司官方动态追踪
- `/about`：论文范围、分类体系与公开边界

## 本地运行

需要 Node.js 22.13 或更高版本。

```bash
npm install
npm run dev
npm test
```

## 内容边界

- 本地完整日报保留检索和运行信息。
- 网站只发布清理后的论文内容。
- Method / Architecture 图片优先截取自 arXiv 原论文，每篇最多两幅。
- 公司动态当前每周一从官方来源更新。
