export type ScoreBreakdown = {
  label: string;
  value: number;
};

export type Paper = {
  rank: number;
  title: string;
  arxivId: string;
  url: string;
  institutions: string[];
  score: number;
  signal: string;
  tags: string[];
  motivation: string;
  architecture: string;
  optimization: string;
  data: string;
  experiments: string;
  strengths: string;
  limitations: string;
  transfer: string;
  scoreBreakdown: ScoreBreakdown[];
  figure?: {
    src: string;
    alt: string;
    caption: string;
  };
};

export type Report = {
  slug: string;
  date: string;
  weekday: string;
  range: string;
  title: string;
  summary: string;
  trend: string;
  candidateCount: number;
  papers: Paper[];
};

export type CompanyUpdate = {
  company: string;
  shortName: string;
  color: string;
  date: string;
  category: string;
  title: string;
  summary: string;
  url: string;
  source: string;
};

const latestPapers: Paper[] = [
  {
    rank: 1,
    title: "Patch Policy: Efficient Embodied Control via Dense Visual Representations",
    arxivId: "2607.18236",
    url: "https://arxiv.org/abs/2607.18236",
    institutions: ["New York University", "Meta FAIR", "AMI Labs"],
    score: 4.814,
    signal: "轻量化 dense visual token 路线，真机与泛化证据均较完整",
    tags: ["Dense Representation", "Imitation Learning", "Real Robot"],
    motivation:
      "机器人策略通常把视觉压缩成一个全局 token，损失精细空间信息；直接微调大规模 VLM 又会显著增加训练和控制延迟。论文验证冻结 ViT 的 dense patch feature 能否以更低成本服务精细控制。",
    architecture:
      "将多视角图像编码为 dense patch tokens，可选拼接目标图像或状态；block-causal attention 允许同帧 patch 充分交互，同时保持跨帧时间因果性。该观察主干可以连接 VQ-BeT、Diffusion Policy 或 ACT 类 action head。",
    optimization:
      "属于 imitation learning / behavior cloning 后训练，不使用 RL。视觉 backbone 冻结，只训练较小的 Transformer 策略与 action head。",
    data:
      "仿真包含 Push-T、LIBERO-Goal、BlockPush 和 Cube；真机在 Franka 上自采 Tool Hanging、Pen Collection、Cable Insertion 数据，并使用 CAP 数据检查十个训练未见物体的抓取泛化。",
    experiments:
      "三项真机任务最终阶段成功率分别达到 70%、85% 和 90%；未见物体抓取为 87%。论文同时比较 patch/global representation、五种视觉 backbone、压缩率、attention mask、模型规模和推理延迟。",
    strengths:
      "因果链清晰：同一策略框架内直接比较 patch 与 global representation，并补齐真机、泛化、效率和多组结构消融。",
    limitations:
      "仍是 behavior cloning；dense tokens 增加序列长度，真机结果未报告置信区间，也尚未验证 RL 或端到端视觉微调。",
    transfer:
      "适合作为“高层语义不变、下层空间细节保真”的低成本视觉基线，也可进一步与 force/contact tokens 做分层融合。",
    scoreBreakdown: [
      { label: "方法", value: 4.9 },
      { label: "启发", value: 4.8 },
      { label: "迁移", value: 4.9 },
      { label: "实验", value: 4.8 },
      { label: "质量", value: 4.8 },
    ],
    figure: {
      src: "/report-assets/2026-07-23/2607.18236-method.png",
      alt: "Patch Policy 将多视角图像编码为 patch tokens，并通过逐帧因果注意力连接动作头的结构图",
      caption:
        "Figure 2 · Patch Policy architecture。图片截取自 arXiv 原论文，展示 dense patch observation trunk、frame-wise attention mask 与 action head。",
    },
  },
  {
    rank: 2,
    title:
      "WorldScape Policy 2.0: Empowering Steerable World Action Modeling with Reasoning-Augmented Memory",
    arxivId: "2607.18840",
    url: "https://arxiv.org/abs/2607.18840",
    institutions: ["Manifold AI", "Tsinghua University", "Shanghai Jiao Tong University"],
    score: 4.752,
    signal: "长短期事件记忆 WAM，具备长程任务与视觉提示适应能力",
    tags: ["World Action Model", "Long-term Memory", "Multimodal Prompt"],
    motivation:
      "现有 WAM 的历史窗口短、语言监督粗，并且多依赖文本条件，难以追踪长任务进度或利用目标图像与跨本体视频示范。",
    architecture:
      "以 Wan2.2-5B 初始化共享 video-action DiT；短期视觉记忆以 causal prefill 保留近期动力学，长期事件记忆由 VLM 将历史组织成 global-history、local-active 和 event-boundary 表征，再生成 latent planning tokens。",
    optimization:
      "三阶段训练且不使用 RL：ManipEvent-5M 上事件级预训练；加入长期事件记忆和 semantic forcing 的 mid-training；最后针对下游机器人与交互方式 post-training。",
    data:
      "ManipEvent-5M 约含 512M 帧、2,983 小时、944K episodes 和近 5M event segments，混合自采 PiPER、UMI、AgiBot World、RoboMIND、DROID、LIBERO 等来源。",
    experiments:
      "RoboTwin 2.0 的 50 项任务平均为 94.3%；clean-to-randomized 设置为 47.9%。PiPER 真机五类任务各 20 次，部分长程和视觉提示任务达到 60%-75%。",
    strengths:
      "数据、三阶段训练和 memory component 都有明确消融，并区分了主表和更严格的 clean-to-randomized 泛化结果。",
    limitations:
      "主表 94.3% 不能直接视作 OOD 泛化；5B WAM + 4B VLM 与大规模数据的复现成本很高，真机实验仍缺少置信区间。",
    transfer:
      "最值得迁移的是“短期连续动力学 + 长期事件语义”的双层记忆，可先在小模型 VLA 中仅保存接触事件、完成谓词和恢复节点。",
    scoreBreakdown: [
      { label: "方法", value: 5.0 },
      { label: "启发", value: 4.9 },
      { label: "迁移", value: 4.8 },
      { label: "实验", value: 4.6 },
      { label: "质量", value: 4.5 },
    ],
    figure: {
      src: "/report-assets/2026-07-23/2607.18840-method.png",
      alt: "WorldScape Policy 2.0 从多模态提示编码到长短期记忆 WAM 和真机执行的整体结构",
      caption:
        "Figure 2 · WorldScape Policy 2.0 overview。图片截取自 arXiv 原论文，展示多模态提示、长短期记忆与 causal world action model。",
    },
  },
  {
    rank: 3,
    title:
      "FM-VLA: Force-based Memory for Vision-Language-Action Models in Contact-Rich Manipulation",
    arxivId: "2607.18231",
    url: "https://arxiv.org/abs/2607.18231",
    institutions: ["Tsinghua University", "Microsoft Research", "Fudan University", "USTC"],
    score: 4.636,
    signal: "用低带宽力觉历史解决视觉不可辨识的接触记忆问题",
    tags: ["Force Memory", "Contact-rich", "VLA"],
    motivation:
      "视觉 memory 在重复按压、擦拭次数和遮挡搜索等任务中既昂贵又含糊；瞬时力输入则无法记录完整 episode 内已经发生了多少次接触。",
    architecture:
      "Force-VAE 使用 Perceiver-IO 将长时 6-axis wrench history 压缩为八个 latent tokens，另一 token 编码约一秒的关节状态历史；两者作为 action-expert suffix 注入 π0.5。",
    optimization:
      "两阶段、无 RL：先以重建和 KL 目标预训练 Force-VAE，再冻结它并微调 VLM、flow-matching action expert 和两个 projector。",
    data:
      "AgiBot G1 双臂平台自采 750 条 VR 遥操作示范，覆盖找杯下方物体、重复按键和擦拭；同时从公开 π0.5 初始化，并使用 Zhiyuan Challenge 数据补充训练。",
    experiments:
      "三项真机任务每种方法各 18 次，FM-VLA 平均成功率 83.3%，明显高于无记忆、短期力和视觉记忆基线；同时提供输入模态、encoder 类型和 token 数消融。",
    strengths:
      "对照公平，消融紧贴核心命题，且只有约 3.3ms 额外延迟，说明力历史可以成为非常轻量的 episodic memory。",
    limitations:
      "仅三项固定任务和单一平台，没有未见物体、未见接触模式或跨传感器泛化，所有评测都与自采训练任务紧密绑定。",
    transfer:
      "可将 force memory 从完整信号重建扩展为同时预测 contact count、slip、phase 和 failure risk，并检查 latent 的跨物体可对齐性。",
    scoreBreakdown: [
      { label: "方法", value: 5.0 },
      { label: "启发", value: 4.8 },
      { label: "迁移", value: 4.9 },
      { label: "实验", value: 4.0 },
      { label: "质量", value: 4.4 },
    ],
    figure: {
      src: "/report-assets/2026-07-23/2607.18231-method.png",
      alt: "FM-VLA 两阶段训练架构，包括 Force-VAE 预训练和带力觉记忆的 VLA 后训练",
      caption:
        "Figure 2 · FM-VLA training pipeline。图片截取自 arXiv 原论文，展示 Force-VAE 预训练以及 force/state token 向 action expert 的注入方式。",
    },
  },
  {
    rank: 4,
    title: "RynnBrain 1.1: Towards More Capable and Generalizable Embodied Foundation Model",
    arxivId: "2607.17977",
    url: "https://arxiv.org/abs/2607.17977",
    institutions: ["DAMO Academy, Alibaba Group", "Lupan Lab"],
    score: 4.532,
    signal: "统一 3D grounding、contact point 和跨本体动作空间",
    tags: ["Foundation Model", "Cross-embodiment", "3D Grounding"],
    motivation:
      "尝试把视频时序、空间 grounding、3D 理解、contact point 和 VLA action 统一到一组 embodied foundation models 中。",
    architecture:
      "基于 Qwen3.5 的多尺度模型，以统一自回归接口训练语言和空间输出；VLA 使用单流 DiT 生成 action chunk，并以 81D shared action canvas 和 embodiment mask 兼容不同机器人。",
    optimization:
      "先做 embodied multimodal autoregressive pretraining，再做 VLA flow-matching post-training，不使用 RL。",
    data:
      "混合 LLaVA、视频、具身认知、自采 reasoning/planning 数据以及 AgiBotWorld、Open X-Embodiment 等；论文没有披露完整 mixture 总量与三项真机任务的示范数量。",
    experiments:
      "三项主任务每项 20 次，generalist joint training 的平均成功率为 91.67%；还在 Unitree G1、Astribot S1 和 Tianji-Wuji 上展示多任务结果。",
    strengths:
      "多平台真机与同 recipe 的 Qwen-VLA 对照说明 embodied initialization 有实际收益。",
    limitations:
      "所谓 cross-embodiment 主要仍是已见本体上的联合训练，而非 held-out embodiment 零样本迁移；数据规模和置信区间缺失。",
    transfer:
      "统一 action canvas、embodiment mask 以及先做 3D/contact supervision 再迁移到 VLA 的路径值得复用。",
    scoreBreakdown: [
      { label: "方法", value: 4.9 },
      { label: "启发", value: 4.7 },
      { label: "迁移", value: 4.8 },
      { label: "实验", value: 4.0 },
      { label: "质量", value: 4.3 },
    ],
  },
  {
    rank: 5,
    title:
      "Closing the Loop in Humanoid VLA: Persistent 3D Object Tokens for Verifiable Loco-Manipulation",
    arxivId: "2607.18016",
    url: "https://arxiv.org/abs/2607.18016",
    institutions: ["BUAA", "BZA", "TJU", "DeepCybo", "ZGCI"],
    score: 4.514,
    signal: "让同一物理状态同时服务 action 与 verification",
    tags: ["Humanoid", "3D Object Token", "Closed-loop"],
    motivation:
      "长时 humanoid VLA 容易出现 object-state divergence：动作模型理解的对象状态与任务管理器用于判断完成的状态并不一致。",
    architecture:
      "POT 从 RGB-D 与分割结果构建 role-indexed 3D object records，一路作为 tokens 条件化 action expert，另一路进入 geometric predicate verifier；每个短 action chunk 后重新观察、验证并决定继续、重试或重规划。",
    optimization:
      "VLA imitation post-training 加规则化执行监督，不使用 RL；几何 predicate 的阈值和 failure handler 来自任务与机器人标定。",
    data:
      "在 Unitree G1 与灵巧手上采集 demonstrations，并为每条示范生成 object-token sidecar；论文未披露示范数量和采集时长。",
    experiments:
      "八类真机任务各 10 次，从 direct GR00T 的 39/80 提升至 71/80；对 verifier、tokens 和完整系统做了拆分消融，并加入未见物体、位置变化和执行中扰动。",
    strengths:
      "真机、消融与 controlled shift 都直接对准 object-state loop，证据链强。",
    limitations:
      "训练数据严重缺失、每项 shift 只有 10 次且无 CI；系统依赖 RGB-D、分割、标定与人工 predicate threshold。",
    transfer:
      "可将硬 predicate 扩展成 uncertainty-aware learned verifier，并加入 force/contact event 以覆盖视觉几何不可判别的失败。",
    scoreBreakdown: [
      { label: "方法", value: 4.9 },
      { label: "启发", value: 4.6 },
      { label: "迁移", value: 4.7 },
      { label: "实验", value: 4.6 },
      { label: "质量", value: 3.6 },
    ],
  },
];

export const reports: Report[] = [
  {
    slug: "2026-07-23",
    date: "2026.07.23",
    weekday: "周四",
    range: "2026.07.21 - 2026.07.22",
    title: "记忆、力觉与稠密视觉：执行闭环正在成为主线",
    summary:
      "从轻量 dense patch policy，到长短期事件记忆 WAM，再到基于力觉的 episodic memory，本期五篇精选共同回答一个问题：机器人在执行中究竟应该保留什么状态。",
    trend:
      "最强趋势是把历史压缩为可验证的物理状态，而不是继续无差别堆叠视觉帧。",
    candidateCount: 24,
    papers: latestPapers,
  },
  {
    slug: "2026-07-20",
    date: "2026.07.20",
    weekday: "周一",
    range: "2026.07.17 - 2026.07.19",
    title: "长上下文、接触闭环与动作表征整形",
    summary:
      "超长时序上下文、接触/力觉闭环与动作侧表征整形构成三条互补路线；五篇精选均提供真机闭环证据，但在平台和任务覆盖上仍有限。",
    trend:
      "长上下文正在从更多历史帧转向可学习状态压缩，触觉监督的位置也开始成为研究对象。",
    candidateCount: 40,
    papers: [
      {
        rank: 1,
        title: "RoboTTT: Context Scaling for Robot Policies",
        arxivId: "2607.15275",
        url: "https://arxiv.org/abs/2607.15275",
        institutions: ["Research collaboration"],
        score: 4.925,
        signal: "通过 fast weights 将 VLA 历史上下文扩展到 8K timesteps",
        tags: ["Long Context", "Test-time Training"],
        motivation: "长时装配需要保留阶段、失败与纠正关系，简单拼接历史帧无法持续扩展。",
        architecture: "在 GR00T N1.7 的 DiT 层中插入 TTT 层，用测试时更新的 MLP fast weights 压缩长历史。",
        optimization: "sequence action forcing 与 truncated BPTT；训练和部署阶段均维护固定大小状态。",
        data: "YAM 双臂真机上三项长时装配任务，分别约 8、6、5 小时真实数据。",
        experiments: "平均完成度 79%，单步基线为 42%；8K 上下文版本明显优于 1K 版本。",
        strengths: "真正把长上下文落到复杂真机任务，并给出上下文长度消融。",
        limitations: "预训练使用 16 张 GB200，成本高；仍无法覆盖所有部署失败。",
        transfer: "可把 force event、失败恢复和动作 chunk 作为 fast-weight 更新信号。",
        scoreBreakdown: [
          { label: "方法", value: 5.0 },
          { label: "启发", value: 5.0 },
          { label: "迁移", value: 5.0 },
          { label: "实验", value: 4.8 },
          { label: "质量", value: 4.8 },
        ],
      },
      {
        rank: 2,
        title: "Never Too Late for Force: Accelerating VLA Post-Training with Reactive Force Injection",
        arxivId: "2607.14236",
        url: "https://arxiv.org/abs/2607.14236",
        institutions: ["Research collaboration"],
        score: 4.83,
        signal: "通过 reactive action expert 和 online DAgger 注入力反馈",
        tags: ["Force", "Post-training", "DAgger"],
        motivation: "预训练 VLA 的语义能力很强，但接触阶段的快速物理反应不足。",
        architecture: "复制 reactive action expert，并通过零初始化 cross-attention 注入短期 6D 力记忆。",
        optimization: "混合离线任务数据与在线人工纠正轨迹做 DAgger 后训练。",
        data: "Flexiv Rizon 4S 上三项接触任务，迭代收集数千条在线样本。",
        experiments: "毛巾折叠、书本插入与汉诺塔放环均优于视觉-only 与无在线纠正版本。",
        strengths: "结构简单，消融清晰，直接服务接触任务后训练。",
        limitations: "依赖人工在线纠正，只验证单臂，算力与数据吞吐成本仍高。",
        transfer: "适合作为 VLA 的旁路快速物理反馈模块。",
        scoreBreakdown: [
          { label: "方法", value: 4.9 },
          { label: "启发", value: 4.9 },
          { label: "迁移", value: 5.0 },
          { label: "实验", value: 4.7 },
          { label: "质量", value: 4.7 },
        ],
      },
      {
        rank: 3,
        title: "Representation-Aligned Tactile Grounding for Contact-Rich Robotic Manipulation",
        arxivId: "2607.14609",
        url: "https://arxiv.org/abs/2607.14609",
        institutions: ["Research collaboration"],
        score: 4.81,
        signal: "先诊断各层物理可预测性，再选择触觉监督位置",
        tags: ["Tactile", "Representation", "Grounding"],
        motivation: "直接加触觉 loss 并不保证监督落在真正决定动作的表征层。",
        architecture: "用 linear probe 选择最能预测未来触觉的 action-expert 中间层，并接入 Latent Tactile Predictor。",
        optimization: "触觉 predictor 仅训练期存在，推理时移除，不增加额外延迟。",
        data: "ARX R5 与 PaXini 触觉传感器，五项接触任务，每项 50 条专家示范。",
        experiments: "SmolVLA 与 π0 上均明显超过基础模型和未对齐触觉接口，每项每种方法 20 次真机试验。",
        strengths: "回答了监督应该施加在哪一层，并在两个 backbone 上验证。",
        limitations: "单平台、单传感器，规模不足以证明大规模预训练下同样成立。",
        transfer: "可替换为 future-force、contact phase 或 failure-risk latent。",
        scoreBreakdown: [
          { label: "方法", value: 4.9 },
          { label: "启发", value: 5.0 },
          { label: "迁移", value: 4.9 },
          { label: "实验", value: 4.7 },
          { label: "质量", value: 4.7 },
        ],
      },
    ],
  },
];

export const companyUpdates: CompanyUpdate[] = [
  {
    company: "Physical Intelligence / OpenPI",
    shortName: "π",
    color: "#6757d9",
    date: "2026.04.16",
    category: "Foundation Model",
    title: "π0.7 展示可控提示与涌现能力",
    summary:
      "新模型强调跨任务泛化、语言 coaching 和视觉目标提示，值得持续观察其真实部署稳定性及是否开放更多训练细节。",
    url: "https://www.pi.website/blog/pi07",
    source: "Physical Intelligence Blog",
  },
  {
    company: "NVIDIA Robotics",
    shortName: "NV",
    color: "#6ea51f",
    date: "2026.07.15",
    category: "Edge Compute",
    title: "Jetson Thor T3000 / T2000 面向机器人边缘部署",
    summary:
      "Blackwell 架构下放到更紧凑的平台，同时推进 Cosmos 3 Edge、Isaac 与端侧 VLA/WFM 推理，是硬件到机器人模型部署链的重要更新。",
    url: "https://blogs.nvidia.com/blog/jetson-thor-robotics-edge-ai-agent/",
    source: "NVIDIA Robotics Blog",
  },
  {
    company: "自变量机器人",
    shortName: "X²",
    color: "#168d84",
    date: "2026.07.02",
    category: "Action Tokenizer",
    title: "发布跨模态具身动作分词器 X-Tokenizer",
    summary:
      "将动作离散化重新定义为多模态语义接口学习，官方披露多模态对齐与长程任务指标提升，后续应重点核验对照设置与真机泛化。",
    url: "https://x2robot.com/news",
    source: "X Square Robot",
  },
  {
    company: "智元机器人",
    shortName: "AG",
    color: "#2765d8",
    date: "2026.06.28",
    category: "Deployment",
    title: "第 15,000 台机器人下线",
    summary:
      "里程碑机型为面向工业与真实作业场景的 G2，信号重点不在单次展示，而在量产、交付与场景规模化能力。",
    url: "https://www.agibot.com/article/231/detail/82.html",
    source: "AGIBOT News",
  },
  {
    company: "LingBot",
    shortName: "LB",
    color: "#d76a3b",
    date: "2026.07.25",
    category: "Open Source",
    title: "LingBot-VLA 2.0 发布 RoboTwin 后训练权重",
    summary:
      "VLA 2.0 使用约 60,000 小时预训练数据、55D 统一动作空间与 MoE action expert，新权重补齐了 RoboTwin 50 任务的后训练示例。",
    url: "https://github.com/robbyant/lingbot-vla-v2",
    source: "Robbyant GitHub",
  },
];

export function getReport(slug: string) {
  return reports.find((report) => report.slug === slug);
}
