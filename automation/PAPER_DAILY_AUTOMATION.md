# 论文日报自动化

## 目标

从 arXiv 获取指定窗口内的新论文，最多保留 300 篇候选，完成内部语义评分与全文核对，
输出最多 15 篇高价值论文的本地日报，并同步到公开网站。

详细筛选、评分和单篇写作结构以仓库根目录的 `Paper_Reader.template.txt` 与
`paper-daily/config.yaml` 为准；本文件定义定时运行和网站同步流程。

## 日期窗口

- 周一运行：覆盖上周五、周六、周日。
- 周五运行：覆盖本周一、周二、周三、周四。
- 使用 Asia/Shanghai 的运行日期确定窗口。
- 对窗口内每个自然日分别执行一次 arXiv fetch，并使用 `--lookback-days 1`；没有公告批次的日期记录后跳过。
- 只使用 arXiv。不要查询 OpenReview、OpenAlex、搜索聚合站或其他论文源。

## 获取与合并

1. 在 `paper-daily` 目录运行：

   ```text
   python scripts/daily_papers.py --config config.yaml --date YYYY-MM-DD --stage fetch --force --sources arxiv --lookback-days 1
   ```

2. 逐日检查 raw JSON 的 `recommended_action`、`duplicate_check`、warnings 和日志。
3. 将有效 candidates 文件交给：

   ```text
   python scripts/merge_candidates.py <候选文件...> --output data/processed/RUN_DATE_window_candidates.json --limit 300
   ```

4. 合并文件必须按 arXiv id 去重且不得超过 300 篇。不得用旧批次填充窗口。
5. 网络预检或 arXiv 获取失败时停止；保留已有线上内容并报告，不生成伪空日报。

## 筛选与阅读

1. 对全部候选基于标题、摘要、类别和检索线索做内部语义评分。
2. 评分仅用于筛选和本地排查，不得发布到网站。
3. 选择最多 30 篇进入论文页或 PDF 核对，最终输出 15 篇；若合格论文不足 15 篇，按实际数量输出并说明原因，不得凑数。
4. 最终论文必须核对 PDF 首页机构、方法、训练阶段、数据、实验、消融、真机试验与局限。
5. 真机泛化、复杂任务、充分消融和公平对照提高 Experimental Evidence；宣传视频、少量挑选案例和不公平对比必须降权。
6. 保存内部评分到 `paper-daily/data/processed/RUN_DATE_scored.json`，保存本地完整日报到
   `paper-daily/reports/RUN_DATE.md`。

## 网站同步

1. 将新日报置于 `website/lib/site-data.ts` 的 `reports` 最新位置，并把本期论文加入数据库。
2. 公开内容只保留论文出发点、模型结构、训练优化、数据组成、实验结果、亮点与局限、迁移价值、机构及资源链接；删除评分、Prompt、配置和运行过程。
3. 为论文标注现有数据库分类；只有论文证据支持时才增加 CoT、Pre-training、Post-training、数据质量等标签。
4. 项目页、GitHub、模型链接必须真实可访问；没有可靠链接时省略。
5. Method / Architecture 图片优先截取 arXiv 原论文，每篇最多两幅，存入
   `website/public/report-assets/RUN_DATE/`，并标明原论文图号和含义。
6. 不得把作者的“最佳”“human-level”“通用”等表述改写成独立验证事实。
7. 在 `website` 目录运行完整测试。测试通过后，按照 Sites 技能使用现有
   `website/.openai/hosting.json` 项目发布到当前公开网址。

## 无新批次与失败处理

- 窗口内没有任何新候选：只写本地“无新候选批次”说明，不新增空的网站日报，不重复旧论文。
- PDF 或机构无法核验：不得进入正式 15 篇，除非合格论文不足，并在本地明确记录限制。
- 网站测试失败：修复后重试；无法修复则不发布并报告。
- Sites 发布失败：保留本地日报和已验证源码，明确报告线上仍是上一版本。

## 完成回报

报告覆盖日期、候选数量、最终论文数量、本地日报路径、限制或失败项、网站发布结果和公开网址。

