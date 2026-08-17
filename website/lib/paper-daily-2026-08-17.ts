import type { Paper } from "./site-data";

type Entry = Omit<Paper, "rank" | "figures" | "optimization" | "experimentDetails" | "reproducibilityDetails" | "deepDive"> & {
  figure: { number: string; alt: string; caption: string };
  technique: string[];
  evaluation: string[];
  comparison: string;
  reproducibilityStatus: Paper["reproducibilityDetails"] extends infer R ? R extends { status: infer S } ? S : never : never;
  implementation: string[];
  missing: string[];
};

const makePaper = (entry: Entry, index: number): Paper => ({
  ...entry,
  rank: index + 1,
  optimization: entry.technique.join("；"),
  experimentDetails: [{
    title: "实验和消融测试",
    setup: entry.experiments,
    comparisons: entry.comparison,
    results: entry.evaluation,
    evidenceNote: "数字来自论文正文、表格或附录；未报告的置信区间、真机重复次数和资源状态不会由演示或宣传材料补写。",
  }],
  reproducibilityDetails: {
    status: entry.reproducibilityStatus,
    verifiedResources: entry.resources?.map((resource) => `${resource.label}: ${resource.url}`) ?? ["arXiv 正文与源码"],
    implementation: entry.implementation,
    missing: entry.missing,
  },
  deepDive: {
    lead: entry.methodSummary ?? entry.signal,
    sections: [
      { title: "技术细节", paragraphs: entry.technique },
      { title: "实验和消融测试", paragraphs: entry.evaluation },
    ],
    experimentReading: entry.evaluation,
    reflections: [entry.transfer],
  },
  figures: [{
    src: `/report-assets/2026-08-17/${entry.arxivId}-fig${entry.figure.number}.png`,
    alt: entry.figure.alt,
    caption: entry.figure.caption,
  }],
});

const entries: Entry[] = [
  {
    title: "AdvDex: Learning Dexterous Manipulation from Human Demonstrations via Joint-Aligned Actions and Adversarial Learning",
    arxivId: "2608.14028",
    url: "https://arxiv.org/abs/2608.14028",
    institutions: ["Zhejiang University", "Shanghai Innovation Institute", "Shanghai Jiao Tong University", "Fudan University", "Paxini Tech"],
    signal: "把人手、灵巧手和夹爪动作映射到同一关节语义空间，并用对抗训练削弱本体外观捷径。",
    tags: ["Dexterous Manipulation", "Human-to-Robot", "Cross-Embodiment"],
    classification: { research: "VLA", training: "Pre-training", modalities: ["Tactile"], data: "UMI / Ego / Human Video", platforms: ["机械臂", "灵巧手", "夹爪"], deployment: "跨本体迁移" },
    motivation: "人类示范规模大，但人手、不同灵巧手和夹爪的自由度与外观不一致，直接混训容易学到硬件身份而不是任务结构。",
    methodSummary: "OmniShare 提供同步手部运动、触觉和多视图示范；JAAS 用 SE(3) 腕位姿与 15 个功能对齐手指关节统一动作；GRL 域对抗分支压低视觉特征中的本体身份。",
    architecture: "SigLIP/VLM 产生 cognition token，Diffusion Transformer action expert 在 JAAS 中去噪动作块；训练期 domain discriminator 经 Gradient Reversal 回传，推理期移除。",
    data: "OmniShare 含 168k 轨迹、500 余项任务和 721 个物体；预训练按 OmniShare、VITRA-1M、Open X-Embodiment 以 5:4:1 混合，真机后训练使用五项任务共 1,000 条示范。",
    experiments: "Paxini Tora + 19-DoF DexH13；五项已见任务、未见物体与未见环境均为每方法每任务 20 次，另以任务互斥的人类/机器人各 1,000 条轨迹测试零样本技能迁移。",
    novelty: "相较 π0.5 与 VITRA，同一真机数据和训练步数下，完整模型在未见物体/环境达到 50%/60%，对应 π0.5 为 35%/45%；四项仅在人类数据出现的任务也获得 30%–70% 成功率。",
    strengths: "数据、动作对齐和域对抗都有独立消融；测试对象、指令与机器人后训练数据做了非重叠检查，并给出固定真机试验次数。",
    limitations: "物理评测只覆盖一种灵巧手平台；JAAS 未显式建模不同硬件的动力学和接触约束，细粒度技能仍需目标机器人后训练。",
    transfer: "异构动作数据可先按功能关节语义对齐，并把未激活关节做 loss mask；视觉域对抗应只作为训练信号，避免增加部署路径。",
    technique: [
      "JAAS 以 SE(3) 腕位姿加 15 个手指关节作为共享接口；人手 MANO、19-DoF 灵巧手与 1-DoF 夹爪分别映射到可用槽，缺失槽不计动作损失。",
      "域判别器读取 cognition token 与状态 token，GRL 在反向传播时乘以负权重；动作 expert 仍以 diffusion denoising loss 保留完成任务所需信息。",
      "OmniShare 的 29 个磁编码器与 Hall-effect 触觉阵列做微秒级同步，处理阶段联合运动学和触觉误差完成 canonical hand retargeting。",
    ],
    evaluation: [
      "五项已见真机任务中 AdvDex 为 55%–90%；移除预训练后降为 10%–50%，移除 OmniShare 或域对抗也在未见设置出现明显下降。",
      "未见物体和未见环境分别为 50% 与 60%，VITRA 为 40% 与 35%；每个表格单元来自 20 次、覆盖四个工作区的随机初始配置。",
      "人类任务零样本迁移中，Box Doll、Press Button、Move Bottle、Tool Use 分别为 60%、70%、45%、30%；论文未报告置信区间。",
    ],
    comparison: "π0.5、VITRA、无预训练、无 OmniShare、无域对抗，以及域对抗在预训练/后训练阶段的移除消融。",
    reproducibilityStatus: "部分可复现",
    implementation: ["正文给出 JAAS 映射、损失、数据混合比例、真机示范与评测协议。"],
    missing: ["本次检查未确认 OmniShare 数据、完整训练代码、模型权重或硬件标定工具公开。"],
    figure: { number: "4", alt: "AdvDex 域对抗 VLA 与 JAAS 架构", caption: "Figure 4 · VLM、域判别器、Gradient Reversal、动作专家与 Joint-Aligned Action Space。来源：arXiv HTML 原图。" },
  },
  {
    title: "Reflex: Enabling Fast and Predictive Vision-Language-Action Models for Reaction-Critical Manipulation",
    arxivId: "2608.14379",
    url: "https://arxiv.org/abs/2608.14379",
    institutions: ["Shanghai Jiao Tong University"],
    signal: "把未来语义预测、视觉中层时序融合和部署时延优化放进同一动态操作 VLA。",
    tags: ["Reaction-Critical", "VLA", "Latency"],
    classification: { research: "VLA", training: "Post-training", platforms: ["机械臂", "夹爪"], deployment: "真机部署优化" },
    resources: [{ label: "项目页", url: "https://reflexvla.github.io" }],
    motivation: "静态操作基准会暂停环境等待推理，无法反映传送带、接球和移动目标中感知到执行的时延。",
    methodSummary: "ReflexBench 解耦仿真步进与控制并注入同步/异步时延；ReflexVLA 用冻结 DINOv3 的未来 latent 监督和视觉中层多帧融合预测动态，再以批量编码和 CUDA Graph 缩短部署路径。",
    architecture: "1B VLA-Adapter 主干接收双时刻多视图；中间 ViT 特征做 temporal attention，只向语言模型暴露当前融合 token；action head 与训练期 future-prediction head 并行。",
    data: "ReflexBench 六项动态任务每项 200 条示范；真机三项任务均用遥操作示范训练，论文未披露真机示范数量。",
    experiments: "ReflexBench 每任务 150 个 episode、三个随机种子；LIBERO 静态基准；AgileX Piper 真机完成传送带抓放、按键和接球，每个策略每项评测 20 次。",
    novelty: "相较同为 1B 的 VLA-Adapter，ReflexBench 平均成功率由 30.3% 提至 50.4%；渐进消融中批量视觉编码与 CUDA Graph 将 125.1 ms 降到 65.0 ms。",
    strengths: "动态基准明确建模时延，直接对照六类 VLA；仿真报告三种子均值/标准差，真机三项任务给出固定次数与任务特定成功判据。",
    limitations: "未来预测与时序融合只在微调阶段加入；未测试 RTC 等更先进异步推理机制，且真机示范规模未报告。",
    transfer: "动态操作评测应让环境在模型推理期间继续演化，并把算法时延换算为可控仿真延迟；未来 latent 可只在训练期提供预测监督。",
    technique: [
      "冻结 DINOv3 为未来帧提供语义 target，以 cosine similarity 训练 future head；若 target encoder 一起训练，成功率反而由 36.8% 降至 4.9%。",
      "两个时间点的 ViT 中层特征做多头时序融合，避免把全部历史图像 token 送入语言模型；中层融合优于末层 cross-attention 与末层 MHA。",
      "部署把多视图/多时刻图像一次批量编码，并预捕获固定计算图；架构和动作目标不变。",
    ],
    evaluation: [
      "ReflexBench 六任务平均 50.4%，PUMA 为 50.2%，VLA-Adapter 为 30.3%；本文模型为 1B，PUMA 为 4B。",
      "渐进消融：36.8% 基线 → 62.8% 冻结未来目标 → 71.7% 中层时序融合 → 73.8% 加时延优化，最后一步延迟 125.1 ms → 65.0 ms。",
      "真机每项 20 次：传送带抓放 16/20，按键 30 秒平均 22.5 个，10 球平均接到 6.7 个；PUMA 对应 13/20、20.8、5.4。",
    ],
    comparison: "OpenVLA-OFT、π0.5、PUMA、DynamicVLA、SmolVLA、VLA-Adapter，以及未来目标、融合层位、视觉批处理和 CUDA Graph 的渐进消融。",
    reproducibilityStatus: "部分可复现",
    implementation: ["论文给出任务示范数、动作块/执行时域、种子数、硬件、时延协议与主要训练权重。"],
    missing: ["本次检查未确认 ReflexBench 代码、模型权重或真机训练数据公开；真机示范数量未披露。"],
    figure: { number: "3", alt: "ReflexVLA 未来预测、时序融合与时延优化架构", caption: "Figure 3 · 视觉中层时序融合、冻结 DINOv3 未来监督，以及批量编码与 CUDA Graph 部署优化。来源：arXiv HTML 原图。" },
  },
  {
    title: "PRM-as-a-Judge 1.5: A Toolkit for Robot Process Assessment",
    arxivId: "2608.14284",
    url: "https://arxiv.org/abs/2608.14284",
    institutions: ["Institute of Automation, Chinese Academy of Sciences", "Beijing Academy of Artificial Intelligence"],
    signal: "把 rollout 视频变成进度曲线，再区分接近成功的失败、回退后的恢复和成功过程质量。",
    tags: ["Process Evaluation", "PRM", "Failure Analysis"],
    classification: { research: "其他", training: "Post-training", data: "数据质量 / 筛选", platforms: ["机械臂", "灵巧手", "夹爪"] },
    resources: [{ label: "项目页", url: "https://prm-as-a-judge.github.io" }, { label: "GitHub", url: "https://github.com/Yuheng2000/PRM-as-a-Judge" }],
    motivation: "二元成功率无法区分早期崩溃与临门失败，也不能分辨平稳成功和反复尝试后勉强成功。",
    methodSummary: "工具链先用过程奖励模型从视频估计归一化进度曲线，再计算 Outcome–Process–Diagnosis 指标；1.5 新增 FNS、DRR、SQS，并生成失败位置、回退和同步视频报告。",
    architecture: "输入是任务描述与单/多视角 rollout 视频；可插拔 PRM 生成逐帧进度，平滑后进入统一指标层与可视化报告，不修改被评测策略。",
    data: "RoboPulse++ 含 700 条轨迹、275 个任务、17,052 帧和 2,244 个人工标注区间，其中 439 条为真机；RoboDojo 对齐实验覆盖 6,076 条 rollout，其中真机 1,470 条。",
    experiments: "比较 10 种专用 PRM 与四种通用 VLM 的 pair/sequence 形式；用 RoboPulse++ 测上升/下降区间判断，并在 RoboDojo 的 42 项仿真和 18 项真机任务上核对进度曲线恢复成功率的能力。",
    novelty: "从同一进度曲线同时给出可达里程碑、路径效率、累计回退、停滞、近成功失败、回退恢复和成功质量，而不是再造一个单一总分。",
    strengths: "包含大量真实 rollout、人工区间标注、十余种 judge 对照、计算成本剖析和传统成功率一致性检查；官方 GitHub 已提供 Apache-2.0 工具与使用指南。",
    limitations: "这是离线评测工具，不是闭环控制策略；下降进度最难识别，最佳 Falling F1 仅 0.63，且官方仓库在本次检查时仍标注 RoboPulse++ benchmark 为 coming soon。",
    transfer: "训练与数据迭代可按 FNS 定位临门失败、按 DRR 找恢复样本、按 SQS 筛除低质量成功轨迹，但应保留原始曲线并同时报告 judge 的误差。",
    technique: [
      "FNS 只在失败 rollout 上组合最大进度与 50%/75% 里程碑；DRR 用最大 drawdown 后的恢复比例；SQS 只在成功 rollout 上综合路径效率、回退面积与停滞。",
      "RoboPulse++ 将人工标注区间统一为 Rising/Falling，边界各去除两个采样点后计算 Macro-F1、Accuracy 与分类型 precision/recall。",
      "评测器与策略解耦：只消费任务文本和 rollout 视频，可选腕部视角；报告层同步视频、曲线、里程碑和失败位置。",
    ],
    evaluation: [
      "Robo-Dopamine Forward 在 700 episodes 上 Macro-F1=0.77、Accuracy=0.84；最佳 Rising F1=0.92，而最佳 Falling F1=0.63。",
      "对 6,076 条 RoboDojo rollout，进度曲线恢复的成功率与官方成功率在仿真/真机上的 MAE 为 1.57/1.32 个百分点，Spearman 相关为 0.88/0.96。",
      "上下文依赖子集上，sequence-style RoboMeter 总体准确率 0.940，高于 pair-style Robo-Dopamine Forward 的 0.746；说明局部帧对容易漏掉已完成子目标被撤销。",
    ],
    comparison: "Robo-Dopamine、RoboMeter、LRM、TOPReward、VLAC、GVL、PRIMO，以及 GPT-5.4、Gemini 3.1 Pro、Qwen 3.6 Plus、Claude Sonnet 4.6 的 pair/sequence 评测形式。",
    reproducibilityStatus: "资源较完整",
    implementation: ["官方 GitHub 提供 Apache-2.0 代码、CLI、Quick Start、进阶配置与可视化工具。"],
    missing: ["官方仓库仍将 RoboPulse++ 完整 benchmark 标为 coming soon；重现实验还需要外部 PRM 权重和各基准 rollout。"],
    figure: { number: "1", alt: "PRM-as-a-Judge 1.5 过程评测体系", caption: "Figure 1 · 从二元结果到进度曲线、1.5 诊断指标和自动评测报告。来源：arXiv HTML 原图。" },
  },
];

export const paperDaily20260817: Paper[] = entries.map(makePaper);
