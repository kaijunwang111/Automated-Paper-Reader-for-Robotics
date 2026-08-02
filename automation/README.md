# 自动化维护说明

本目录是两个 Codex 定时任务的唯一运行手册。自动化应从仓库根目录
`C:\Users\kaijun\Desktop\Code\Codex_Automated_Paper_Reader` 开始，不得切换到同名旧目录。

## 定时任务

1. 论文日报：每周一、周五 09:30（Asia/Shanghai），执行
   [PAPER_DAILY_AUTOMATION.md](PAPER_DAILY_AUTOMATION.md)，并通过
   [PAPER_DAILY_QUALITY_GATES.md](PAPER_DAILY_QUALITY_GATES.md) 的全部质量门禁。
2. 公司动态：每周一 09:30（Asia/Shanghai），执行
   [COMPANY_TRACKER_AUTOMATION.md](COMPANY_TRACKER_AUTOMATION.md)。

## 共同约束

- 两个任务都必须完成“获取内容 → 更新本地文件 → 双目标构建与测试 → 提交并推送 GitHub → 发布两个现有网站 → 线上验证”的完整闭环。
- ChatGPT Sites 项目固定为 `website/.openai/hosting.json` 中记录的现有项目；GitHub Pages 固定使用仓库 `main` 分支和 `.github/workflows/pages.yml`。禁止创建新站点、重复工作流或新的 Pages 分支。
- 自动化获准把本次经过验证的相关改动提交并推送到 GitHub `origin/main`。不得 force-push，不得提交 `Paper_Reader.txt`、`paper-daily/data/`、日志、本地完整日报、`tmp/`、`website/.sites/` 或其他私有/临时产物。
- 发布前必须运行 `paper-daily` Python 测试，以及 `website` 的 `npm run lint`、`npm test` 和 `npm run test:pages`；两种构建必须使用同一份 `website` 源码。
- 本地提交完成后先获取 `origin/main` 最新状态。若另一个任务已推进远端，只能在工作区干净且不会丢失提交时安全整合；发生冲突、远端拒绝或历史不明确时停止并报告，禁止 reset、覆盖或强推。
- 推送 `origin/main` 后必须定位 `head_sha` 等于本次提交的 GitHub Pages workflow run，并等待其 `conclusion=success`；不能用旧的成功记录代替本次部署。
- ChatGPT Sites 必须从该根提交对应的精确 `website` 源码树保存和部署新版本，并轮询到 `succeeded`。最终分别验证 `github.io` 与 `chatgpt.site` 的首页、本次内容路由和至少一个代表性详情/资源路由。
- 如果工作区存在无关的用户改动，必须保留；若与本任务将修改的文件冲突，停止并报告，不得 reset、checkout 或覆盖。
- 周一两个任务可能同时被触发。若发现同一项目已有自动化运行、Git 锁、未完成的提交/推送或正在变化的目标文件，应等待前一个任务完成，重新读取最新文件和 `origin/main` 后再继续；不得并发覆盖 `website/lib/site-data.ts`。
- 本地日报允许保留检索、Prompt、评分与运行信息；公开网站不得展示这些内部内容。
- 任一站点发布失败都不能伪装成“双站点已同步”。最终结果必须分别说明本地内容、测试、GitHub 提交与 push、Pages workflow、Sites 版本和两个线上网址的状态。
