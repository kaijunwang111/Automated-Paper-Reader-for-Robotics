# 自动化维护说明

本目录是两个 Codex 定时任务的唯一运行手册。自动化应从仓库根目录
`C:\Users\kaijun\Desktop\Code\Codex_Automated_Paper_Reader` 开始，不得切换到同名旧目录。

## 定时任务

1. 论文日报：每周一、周五 09:00（Asia/Shanghai），执行
   [PAPER_DAILY_AUTOMATION.md](PAPER_DAILY_AUTOMATION.md)。
2. 公司动态：每周一 09:00（Asia/Shanghai），执行
   [COMPANY_TRACKER_AUTOMATION.md](COMPANY_TRACKER_AUTOMATION.md)。

## 共同约束

- 两个任务都必须完成“获取内容 → 更新本地文件 → 验证网站 → 发布现有网站”的完整闭环。
- 网站项目固定为 `website/.openai/hosting.json` 中记录的 Sites 项目；禁止创建新站点。
- 自动化可以提交本次生成的本地改动并发布到 Sites，但不得自动向 GitHub `origin` 推送。
- 如果工作区存在无关的用户改动，必须保留；若与本任务将修改的文件冲突，停止并报告，不得 reset、checkout 或覆盖。
- 周一两个任务可能同时被触发。若发现同一项目已有自动化运行、Git 锁或正在变化的目标文件，应等待前一个任务完成后重新读取最新文件，再继续；不得并发覆盖 `website/lib/site-data.ts`。
- 本地日报允许保留检索、Prompt、评分与运行信息；公开网站不得展示这些内部内容。
- 发布失败不能伪装成成功。最终结果必须分别说明本地内容、测试和线上发布状态。

