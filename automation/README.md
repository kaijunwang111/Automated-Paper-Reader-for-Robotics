# 自动化维护说明

本目录是一个 Codex 定时任务的唯一运行手册。自动化应从仓库根目录
`C:\Users\kaijun\Desktop\Code\Codex_Automated_Paper_Reader` 开始，不得切换到同名旧目录。

## 定时任务

同一个任务每周一、周五 10:00（Asia/Shanghai）运行，并按计划日期分支。arXiv 的新论文公告在美国东部时间周日至周四 20:00 发布，换算到中国时间通常是次日 08:00 或 09:00；10:00 为公告和索引同步预留缓冲，避免凌晨运行把“批次尚未发布”误判为“0 篇”：

- 周一：先执行 [PAPER_DAILY_AUTOMATION.md](PAPER_DAILY_AUTOMATION.md)，再执行
  [COMPANY_TRACKER_AUTOMATION.md](COMPANY_TRACKER_AUTOMATION.md)，最后统一测试、提交和发布一次。
- 周五：只执行 [PAPER_DAILY_AUTOMATION.md](PAPER_DAILY_AUTOMATION.md)，不得检索、改写或刷新公司动态及 `companyTrackerLastChecked`。
- 所有论文更新都必须通过 [PAPER_DAILY_QUALITY_GATES.md](PAPER_DAILY_QUALITY_GATES.md) 的全部质量门禁。

只有在预期公告批次已确认可见后，才允许把候选数为零解释为真正无新候选。若 OAI/API 返回整个窗口为零、目标日期仍被服务端视为未来、或最近批次落后于预期，论文阶段必须重试并最终失败退出，不得发布空日报或把查询上限退回更早日期。周一论文阶段失败时仍可继续公司阶段，但最终回报必须明确论文未更新；周五没有经过就绪确认的新论文且没有公开文件变更时，不创建空提交，也不重复发布网站。

## 单任务执行顺序

1. 读取本文件和当天适用的子流程，检查工作区、Git 锁和未完成的发布状态。
2. 完成论文阶段，只更新论文相关产物。
3. 仅在周一顺序完成公司阶段；周五明确跳过。
4. 所有当天阶段结束后，仅运行一轮完整测试，创建一个本地提交，并向两个站点各发布一次。
5. 最终回报分别列出论文阶段、公司阶段（周五标记为“按计划跳过”）和双站点发布状态。

## 共同约束

- 单个任务必须完成“按星期执行内容阶段 → 更新本地文件 → 双目标构建与测试 → 提交并推送 GitHub → 发布两个现有网站 → 线上验证”的完整闭环。
- ChatGPT Sites 项目固定为 `website/.openai/hosting.json` 中记录的现有项目；GitHub Pages 固定使用仓库 `main` 分支和 `.github/workflows/pages.yml`。禁止创建新站点、重复工作流或新的 Pages 分支。
- 自动化获准把本次经过验证的相关改动提交并推送到 GitHub `origin/main`。不得 force-push，不得提交 `Paper_Reader.txt`、`paper-daily/data/`、日志、本地完整日报、`tmp/`、`website/.sites/` 或其他私有/临时产物。
- 发布前必须运行 `paper-daily` Python 测试，以及 `website` 的 `npm run lint`、`npm test` 和 `npm run test:pages`；两种构建必须使用同一份 `website` 源码。
- 本地提交完成后先获取 `origin/main` 最新状态。若手动操作或其他进程已推进远端，只能在工作区干净且不会丢失提交时安全整合；发生冲突、远端拒绝或历史不明确时停止并报告，禁止 reset、覆盖或强推。
- 推送 `origin/main` 后必须定位 `head_sha` 等于本次提交的 GitHub Pages workflow run，并等待其 `conclusion=success`；不能用旧的成功记录代替本次部署。
- ChatGPT Sites 必须从该根提交对应的精确 `website` 源码树保存和部署新版本，并轮询到 `succeeded`。最终分别验证 `github.io` 与 `chatgpt.site` 的首页、本次内容路由和至少一个代表性详情/资源路由。
- 如果工作区存在无关的用户改动，必须保留；若与本任务将修改的文件冲突，停止并报告，不得 reset、checkout 或覆盖。
- 虽然不再存在两个定时任务互相并发，但仍须防范手动运行、上一次异常未结束或用户编辑。若发现 Git 锁、未完成的提交/推送、正在进行的部署或目标文件持续变化，应停止或等待状态明确后重新读取，不得覆盖 `website/lib/site-data.ts`。
- 本地日报允许保留检索、Prompt、评分与运行信息；公开网站不得展示这些内部内容。
- 任一站点发布失败都不能伪装成“双站点已同步”。最终结果必须分别说明本地内容、测试、GitHub 提交与 push、Pages workflow、Sites 版本和两个线上网址的状态。
