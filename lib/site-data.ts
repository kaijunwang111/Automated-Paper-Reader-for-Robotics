export const paperTaxonomy = {
  research: {
    label: "研究方向",
    values: ["VLA", "WAM", "WM", "表征学习", "Memory", "CoT", "Subtask", "其他"],
  },
  training: {
    label: "训练与优化",
    values: ["Pre-training", "Post-training", "BC", "RL", "Test-time Adaptation"],
  },
  modality: {
    label: "创新模态",
    values: [
      "Depth / RGB-D",
      "Point Cloud / 3D",
      "Force / Torque",
      "Tactile",
      "Audio",
      "Mask / Segmentation",
      "State / Proprioception",
      "其他模态",
    ],
  },
  data: {
    label: "数据方法",
    values: [
      "数据质量 / 筛选",
      "数据增强",
      "合成 / 仿真数据",
      "在线数据 / 人工纠正",
      "UMI / Ego / Human Video",
      "跨本体数据",
      "其他数据方法",
    ],
  },
  platform: {
    label: "机器人平台",
    values: ["机械臂", "Humanoid", "轮式底盘", "灵巧手", "夹爪", "其他平台"],
  },
  deployment: {
    label: "部署与迁移",
    values: ["真机部署优化", "Sim2Real", "Real2Sim", "Real2Sim2Real", "跨本体迁移"],
  },
} as const;

export type TaxonomyDimension = keyof typeof paperTaxonomy;
export type ResearchDirection = (typeof paperTaxonomy.research.values)[number];
export type TrainingCategory = (typeof paperTaxonomy.training.values)[number];
export type ModalityCategory = (typeof paperTaxonomy.modality.values)[number];
export type DataCategory = (typeof paperTaxonomy.data.values)[number];
export type PlatformCategory = (typeof paperTaxonomy.platform.values)[number];
export type DeploymentCategory = (typeof paperTaxonomy.deployment.values)[number];

export type PaperClassification = {
  research: ResearchDirection;
  training?: TrainingCategory;
  modalities?: ModalityCategory[];
  data?: DataCategory;
  platforms?: PlatformCategory[];
  deployment?: DeploymentCategory;
};

export type PaperDetailAttributes = {
  memoryImplementation?: string;
  memoryHorizon?: string;
};

export type PaperResource = {
  label: "项目页" | "GitHub" | "模型";
  url: string;
};

export type PaperFigure = {
  src: string;
  alt: string;
  caption: string;
};

export type Paper = {
  rank: number;
  title: string;
  arxivId: string;
  url: string;
  institutions: string[];
  signal: string;
  tags: string[];
  classification: PaperClassification;
  detailAttributes?: PaperDetailAttributes;
  resources?: PaperResource[];
  motivation: string;
  architecture: string;
  optimization: string;
  data: string;
  experiments: string;
  novelty?: string;
  reproducibility?: string;
  readingNotes?: string;
  strengths: string;
  limitations: string;
  transfer: string;
  figures: PaperFigure[];
};

export type Report = {
  slug: string;
  date: string;
  weekday: string;
  range: string;
  title: string;
  summary: string;
  overview: string;
  papers: Paper[];
};

export type PaperRecord = Paper & {
  reportSlug: string;
  reportDate: string;
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

export function getPaperClassificationLabels(paper: Paper) {
  return [
    paper.classification.research,
    paper.classification.training,
    ...(paper.classification.modalities ?? []),
    paper.classification.data,
    ...(paper.classification.platforms ?? []),
    paper.classification.deployment,
  ].filter((value): value is string => Boolean(value));
}

const paperDaily20260727Archive: Paper[] = [
  {
    rank: 1,
    title: "FELT: Generating Tactile Signals from Vision for Visuo-Tactile Manipulation",
    arxivId: "2607.20683",
    url: "https://arxiv.org/abs/2607.20683",
    institutions: ["University of Southern California", "Columbia University", "Starpilot"],
    signal: "从 RGB 合成触觉图像或 latent，在无触觉传感器部署时改善接触任务",
    tags: ["Tactile Generation", "Diffusion Policy", "Contact-rich"],
    classification: {
      research: "表征学习",
      training: "Post-training",
      modalities: ["Tactile"],
      data: "数据增强",
      platforms: ["机械臂", "夹爪"],
      deployment: "真机部署优化",
    },
    resources: [{ label: "项目页", url: "https://felt-tactile.github.io/" }],
    motivation:
      "真实触觉数据昂贵、易损且难标准化，视觉策略又难处理遮挡和接触歧义。FELT 尝试从腕部 RGB 生成双指压力表征，为视觉-only 数据补上接触信息。",
    architecture:
      "冻结视觉编码器，轻量 query decoder 分别解码左右指面，并通过跨指信息交换保持双指拓扑和非对称接触模式；输出可作为触觉图像或 latent feature 输入 visuo-tactile Diffusion Policy。",
    optimization:
      "先在配对 RGB-触觉数据上训练生成器，再以 imitation learning 训练四个任务策略；不使用 RL。",
    data:
      "生成器使用 2,700+ UMI-style 示范、约 2.6M RGB-触觉对；xArm 四任务各 60 条策略示范，共 240 条、约 520K 同步帧。",
    experiments:
      "四项 xArm 任务每种方法各 20 次。FELT 图像或 latent 在所有最终任务指标上优于视觉-only；Triangle Peg 最终插入从 50% 提升至 70%/90%。",
    strengths:
      "同时验证触觉预测质量和真实策略收益，并用双指结构、读取头和部署消融定位贡献。",
    limitations:
      "接触区域必须在 RGB 中可见；重遮挡和训练数据覆盖不足会造成伪触觉失真，20 次试验也不足以区分小差异。",
    transfer:
      "可将完整压力图重建替换为 contact phase、slip 或 failure-risk latent，并检查跨物体与跨传感器迁移。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.20683-architecture.png",
        alt: "FELT 从腕部 RGB 提取视觉特征并通过双指 query decoder 生成触觉表征的模型结构图",
        caption:
          "Figure 2 · FELT 触觉生成框架：冻结 DINOv2、双指查询解码器、跨指信息交换和触觉读出头。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 2,
    title: "URF: A Unified Robot Control-Policy Framework for Stable Contact Aware Manipulation",
    arxivId: "2607.20912",
    url: "https://arxiv.org/abs/2607.20912",
    institutions: ["Sungkyunkwan University"],
    signal: "策略同时预测动作、刚度与 impedance-admittance 控制模式",
    tags: ["Contact Control", "Diffusion Policy", "Force"],
    classification: {
      research: "其他",
      training: "BC",
      modalities: ["Force / Torque"],
      platforms: ["机械臂", "夹爪"],
      deployment: "真机部署优化",
    },
    motivation:
      "刚性接触中，策略与底层控制器分离会让同一目标导致振荡、工具损坏或安全停机；URF 将控制模式纳入策略输出。",
    architecture:
      "模型从视觉、本体与力觉预测虚拟目标、刚度矩阵和 switch ratio，在自由空间偏向精确跟踪，在刚性接触偏向稳定交互。",
    optimization:
      "使用直接示教数据训练 diffusion policy；以实测力构造 switch 标签，不使用 RL。",
    data:
      "Franka Research 3 上采集 Box Flipping 100 条示范、Line Pressing 50 条示范，同时记录 RGB、本体和六轴力/力矩。",
    experiments:
      "每任务每方法 20 次。Box Flipping 成功率 90%，Line Pressing 100%；标准 force-DP 两任务均为 0%，固定 switch 消融也明显落后。",
    strengths:
      "成功率、关键失败率、力增长率、跟踪误差和接触振荡共同说明策略与控制器需要联合设计。",
    limitations:
      "单个 switch ratio 共享所有控制轴，标签依赖人工 force bounds，且只验证两类刚性接触任务。",
    transfer:
      "可扩展成轴向或任务阶段相关的 controller-mode token，并与 VLA action chunk 联合预测。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.20912-architecture.png",
        alt: "URF 同时预测虚拟目标、刚度和控制切换比例的网络及控制框架",
        caption:
          "Figure 1 · URF 网络与控制框架：策略联合输出动作目标、刚度和 impedance-admittance 切换量。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 3,
    title:
      "GuidedAttention: Interpretable and Correctable Visual Attention for OOD-Robust Robot Manipulation via Imitation Learning",
    arxivId: "2607.21049",
    url: "https://arxiv.org/abs/2607.21049",
    institutions: ["CNRS-AIST Joint Robotics Laboratory", "AIST"],
    signal: "首帧一次性纠正注意关键点，随后自动跟踪以恢复 OOD 操作",
    tags: ["Guided Attention", "Human Correction", "OOD"],
    classification: {
      research: "表征学习",
      training: "BC",
      platforms: ["机械臂", "夹爪"],
      deployment: "真机部署优化",
    },
    resources: [
      { label: "项目页", url: "https://mmurooka.github.io/guided-attention-project-page" },
    ],
    motivation:
      "端到端策略的视觉注意位置不可见也难纠正；位置或外观变化时，人类能快速识别目标，策略却可能关注背景。",
    architecture:
      "attention encoder 预测任务关键点，Diffusion Policy 以关键点特征为条件；用户可在 rollout 首帧纠正一次，跟踪模块随后持续传播。",
    optimization:
      "imitation learning；训练时随机路由预测与人工 override 路径，使策略学会使用纠正后的表征。",
    data:
      "仿真三任务；真机 UR5e 上 Cup Insertion、Chain Pick-and-Place、Towel Fold，每任务 32 条遥操作示范。",
    experiments:
      "真机每条件 3 seeds × 10 rollouts。三任务 positional OOD 中纠正版平均 71.1%，DP 为 30%；Towel appearance OOD 为 90%，DP 为 50%。",
    strengths:
      "人类干预成本低，解释接口与性能增益直接关联，并覆盖位置和外观两类分布变化。",
    limitations:
      "二维少量关键点难覆盖深度、重遮挡和可变结构；首帧人工纠正也意味着系统并非完全自主。",
    transfer:
      "可升级为 3D object/contact tokens，并只在注意不确定性超过阈值时请求一次纠正。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.21049-architecture.jpg",
        alt: "GuidedAttention 从多视角图像预测注意关键点并条件化扩散动作策略的结构图",
        caption:
          "Figure 2 · GuidedAttention 策略结构：关键点注意编码器连接状态特征与去噪扩散动作生成。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 4,
    title:
      "Scale Up Strategically: Learning Compositional Generalization via Bias-Aware Evaluation and Data Collection for Robotic Manipulation",
    arxivId: "2607.21582",
    url: "https://arxiv.org/abs/2607.21582",
    institutions: ["Northeastern University", "NVIDIA"],
    signal: "诊断语言 factor bias，并把固定采集预算投向弱 grounding 因素",
    tags: ["Compositional Generalization", "Data Selection", "Language Grounding"],
    classification: {
      research: "VLA",
      training: "Post-training",
      data: "数据质量 / 筛选",
      platforms: ["机械臂", "夹爪"],
      deployment: "真机部署优化",
    },
    motivation:
      "增加数据不保证策略真正 grounding 语言；模型可能只依赖颜色等显著因素而忽略 verb、size 或 spatial attribute。",
    architecture:
      "Factor Dominance Rate 量化两两偏置，Factor Dominance Hierarchy 汇总全局优先级，再由偏置感知采样分配示范预算。",
    optimization:
      "模型无关的数据选择式后训练，不修改 VLA backbone，也不使用 RL。",
    data:
      "模拟覆盖六种 foundation policies；真机 UR5 + GELLO 上有 Bun、Pizza、Cup 三任务，每任务 16 条语言组合，并比较 100/200 条示范预算。",
    experiments:
      "每个真机 checkpoint 共 48 rollouts。偏置感知采样达到 54.2%-66.7%，Random 为 37.5%-50.0%；部分设置用一半示范超过完整预算基线。",
    strengths:
      "诊断结果能直接指导下一批数据采集，并在固定示范预算下比较。",
    limitations:
      "factor 空间人工离散且任务受控，尚未证明开放词汇、多步任务或自动发现 factor 时仍有效。",
    transfer:
      "可先测 verb、object、spatial、force-level 与 contact-phase 弱项，再定向采集失败组合。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.21582-overview.png",
        alt: "语言因素分解、因素偏置诊断和偏置感知数据采集的整体流程",
        caption:
          "Figure 1 · 从 instruction factors、factor bias 到 FDR/FDH 评估及偏置感知采集的完整思路。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 5,
    title: "PhysCoRe: Physics-Corrected Residual World Models for Material-Aware Deformable Dynamics",
    arxivId: "2607.20653",
    url: "https://arxiv.org/abs/2607.20653",
    institutions: ["Georgia Institute of Technology"],
    signal: "保留 MPM 物理结构，同时学习材料、残差和逐粒子置信度",
    tags: ["World Model", "Deformable Object", "Uncertainty"],
    classification: {
      research: "WM",
      training: "Pre-training",
      modalities: ["Depth / RGB-D", "Point Cloud / 3D"],
      platforms: ["机械臂", "夹爪"],
      deployment: "Real2Sim",
    },
    motivation:
      "解析模型需要逐物体优化，纯学习模型又容易违背物理并在分布外失效。PhysCoRe 用学习模块校正而不是替代物理。",
    architecture:
      "Material-from-Motion 推断逐粒子材料与置信度，Residual-from-Dynamics 修正 MPM 内部动力学误差。",
    optimization:
      "MfM 与 RfD 离线训练；新物体用前半段观测做快速材料识别，再进行 feed-forward rollout。",
    data:
      "12 个真实手工操作 episode，覆盖 rope、towel、plush bear 和 Play-Doh；另用 KUKA + Robotiq 对三种物体主动探测。",
    experiments:
      "相对 PhysTwin，弹性/弹塑性对象 Chamfer 距离分别下降 43.7%/30.5%；材料识别为 11.4 秒，对比 PhysTwin 930 秒。RfD 消融继续降低误差。",
    strengths:
      "物理结构、残差修正与不确定性分工清晰，并在真实 RGB-D 序列上评估。",
    limitations:
      "只有 12 个 episode，材料类别和对象范围仍窄；主动探索主要展示置信度变化，并未闭环优化策略。",
    transfer:
      "可把置信度接入主动操作策略，优先触碰材料不确定区域，并用接触事件门控残差模型。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.20653-overview.png",
        alt: "PhysCoRe 从 RGB-D 观测推断材料并用残差模块修正 MPM 动力学的整体结构",
        caption:
          "Figure 1 · PhysCoRe 总览：Material-from-Motion 推断材料，Residual-from-Dynamics 修正 MPM rollout。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 6,
    title:
      "RL-MACRO: A Cybernetic Closed-Loop Intelligence Framework for Multimodal Adaptive Robotic Craniotomy",
    arxivId: "2607.21113",
    url: "https://arxiv.org/abs/2607.21113",
    institutions: [
      "Dalian University of Technology",
      "Second Hospital of Dalian Medical University",
      "The University of Tokyo",
    ],
    signal: "多模态隐藏温度重建、offline RL 与轨迹执行组成接触闭环",
    tags: ["Offline RL", "Multimodal State", "Adaptive Control"],
    classification: {
      research: "其他",
      training: "RL",
      modalities: ["Force / Torque", "Audio"],
      platforms: ["机械臂", "其他平台"],
      deployment: "真机部署优化",
    },
    motivation:
      "骨切削温度在工具遮挡下不可直接测量，force、temperature 与效率又相互耦合，固定参数策略难以跨组织差异安全工作。",
    architecture:
      "CNN-LSTM 融合力与声音重建温度；belief state 进入双头 IQL actor 调节 feed rate、spindle speed 与 cutting depth，再由在线轨迹重规划执行。",
    optimization:
      "先训练 observer，再用离线数据训练 IQL；部署时根据观测闭环调节动作，但不在线更新参数。",
    data:
      "牛肋骨用于训练和 9 组配对对照；六个未见 ex vivo 山羊头骨用于跨标本验证。",
    experiments:
      "observer 在未见肋骨上 R² 0.927、MAE 2.105°C；RL 相对常量策略显著降低力和温度超调，六个头骨均完成骨瓣切除并从瞬时超阈值中恢复。",
    strengths:
      "感知、offline RL 和轨迹执行形成完整闭环，并披露跨标本 zero-shot 迁移中的激进动作。",
    limitations:
      "训练数据只来自牛肋骨，头骨样本仅六个；宏观无碳化不能替代组织学热安全验证。",
    transfer:
      "可复用“不可观测物理状态重建 + offline RL 调参 + 在线轨迹连续化”的分层闭环。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.21113-overview.png",
        alt: "RL-MACRO 从多模态温度重建到离线强化学习决策和轨迹执行的闭环框架",
        caption:
          "Figure 1 · RL-MACRO 感知—决策—执行闭环：隐藏温度观测、离线 RL 调参与在线轨迹执行。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 7,
    title:
      "Safe and Scalable Multi-Drone Payload Transport via CBF-based Reinforcement Learning with Zero-Shot Sim-to-Real Transfer",
    arxivId: "2607.20665",
    url: "https://arxiv.org/abs/2607.20665",
    institutions: ["Massachusetts Institute of Technology"],
    signal: "低维耦合抽象、分布式安全 RL 与零样本多机真机迁移",
    tags: ["Safe RL", "Control Barrier Function", "Multi-Robot"],
    classification: {
      research: "其他",
      training: "RL",
      platforms: ["其他平台"],
      deployment: "Sim2Real",
    },
    motivation:
      "多机吊运的耦合动力学、团队规模变化和动态障碍使集中式规划难扩展，安全证书还要跨离散策略与连续硬件执行。",
    architecture:
      "二维抽象保留载荷耦合，DGPPO 与离散图控制障碍函数联合约束；底层跟踪误差通过收紧安全边界处理。",
    optimization:
      "仿真 RL + domain randomization，随机团队规模和物理参数；真机 zero-shot，不微调。",
    data:
      "仿真训练覆盖 3-5 架无人机；Crazyflie 2.1 真机测试扩展到 3-6 架，并做两组独立载荷同时运输。",
    experiments:
      "3 机在 10 个真机场景全部完成；4/5/6 机扩展仅一个 6 机 hard 场景未达终点阈值且无安全碰撞。5+3 机双组试验能互相视为动态障碍。",
    strengths:
      "团队规模外推、动态多组协作和明确失败项均在硬件验证。",
    limitations:
      "只处理平面运输、等间距缆绳与固定高度，且规模扩展场景并非全部严格可比。",
    transfer:
      "“低维任务抽象 + 可证明安全裕度 + domain randomization”可迁移到多臂协同或移动操作。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.20665-overview.png",
        alt: "多无人机载荷运输的二维动力学抽象、安全强化学习决策和连续执行结构",
        caption:
          "Figure 1 · 多无人机安全运输框架：低维耦合抽象、DGPPO/图 CBF 决策与真机执行层。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 8,
    title:
      "Grasp, Handover, Rotate: Bimanual Object Reorientation via Compositional Diffusion and Energy-Based Optimization",
    arxivId: "2607.21341",
    url: "https://arxiv.org/abs/2607.21341",
    institutions: ["Hong Kong University of Science and Technology", "Shenzhen Loop Area Institute"],
    signal: "用组合能量梯度同时优化抓取、交接、重抓与双臂轨迹",
    tags: ["Bimanual", "Diffusion", "Energy-Based Optimization"],
    classification: {
      research: "其他",
      platforms: ["机械臂", "夹爪"],
      deployment: "真机部署优化",
    },
    motivation:
      "双臂重定向必须联合决定抓取、handover、regrasp 与放置，传统 sample-and-filter 组合爆炸且难优化轨迹。",
    architecture:
      "预训练 grasp diffusion 提供先验，bimanual EBM 把碰撞、可达性、平滑和安全约束梯度注入反向扩散，并用 annealed MCMC 细化。",
    optimization:
      "推理时能量优化，不使用 RL；SubnetIK 提供可微逆运动学，cuRobo 生成轨迹。",
    data:
      "60 个仿真重定向任务；真机为双 UR12e + Robotiq Hand-E 的两个代表场景。",
    experiments:
      "仿真相对 ReorientBot 成功率为 81.7% 对 58.3%；真机两场景关节位移分别下降 59.7% 和 46.4%。",
    strengths:
      "多个约束进入同一生成过程，结构和 MCMC 消融较完整。",
    limitations:
      "真机样本很少且假设物体 pose/geometry 完美，真实感知噪声、接触动力学和失败恢复未验证。",
    transfer:
      "可把 VLA 生成的高层 key poses 作为先验，再用能量或安全梯度做 inference-time refinement。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.21341-overview.png",
        alt: "BiCompoDiff 通过抓取扩散先验和双臂能量模型迭代优化动作姿态的流程",
        caption:
          "Figure 2 · BiCompoDiff 流程：初始化姿态、组合能量引导的迭代扩散优化与后续运动规划。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 9,
    title: "Towards Capability-Aware Traversability Navigation for Unstructured Environments",
    arxivId: "2607.20679",
    url: "https://arxiv.org/abs/2607.20679",
    institutions: ["University of São Paulo"],
    signal: "把机器人能力直接编码进空间表征，而不是只做轨迹后过滤",
    tags: ["Embodiment", "Traversability", "Representation"],
    classification: {
      research: "表征学习",
      modalities: ["Depth / RGB-D"],
      platforms: ["轮式底盘", "其他平台"],
      deployment: "跨本体迁移",
    },
    motivation:
      "同一地形对轮式和足式机器人含义不同，后处理过滤无法让视觉表征本身理解 embodiment 能力。",
    architecture:
      "DINOv3 编码 RGB/深度，CLIPSeg 提供语义地形图；SPADE 以 robot profile 调制空间特征，并为每种能力学习 prototype。",
    optimization:
      "监督式表征学习，正样本来自人工路径和真实执行轨迹；不使用 RL。",
    data:
      "NaviTrace 人工轨迹与完整序列隔离的 held-out 机器人轨迹；真机为 Spot 与 TerraSentia。",
    experiments:
      "held-out 轨迹 AUROC 0.945、AUPRC 0.832；Spot 森林 10/10，TerraSentia 避楼梯 7/10，部署速度 4.8Hz。",
    strengths:
      "两种 embodiment、结构消融和嵌入式部署形成完整证据链。",
    limitations:
      "能力只充分比较 wheeled/legged，semantic grouping 错误仍会破坏空间细节，感知和 planner 尚未联合优化。",
    transfer:
      "可把 embodiment profile 做成 VLA 条件 token，让不同机器人共享高层任务但保持能力一致的动作约束。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.20679-architecture.png",
        alt: "能力感知可通行性模型融合 RGB 深度语义地形和机器人能力向量的结构图",
        caption:
          "Figure 2 · Capability-Aware Traversability：多模态特征经 robot profile 调制后形成能力相关的可通行性估计。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 10,
    title: "TransBiolab: A Real-World Multi-View Dataset of Cluttered Transparent Biomedical Objects",
    arxivId: "2607.21071",
    url: "https://arxiv.org/abs/2607.21071",
    institutions: [
      "Huazhong University of Science and Technology",
      "Tongji University",
      "Shanghai Institute for Intelligent Autonomous Systems",
    ],
    signal: "透明实验室物体的大规模多视角数据与系统级抓取验证",
    tags: ["Transparent Objects", "Multi-view", "Laboratory Robotics"],
    classification: {
      research: "其他",
      training: "Pre-training",
      modalities: ["Depth / RGB-D", "Mask / Segmentation"],
      data: "数据质量 / 筛选",
      platforms: ["机械臂", "灵巧手", "夹爪"],
      deployment: "真机部署优化",
    },
    motivation:
      "透明耗材在遮挡、反射和重复实例下仍是 autonomous lab 的感知瓶颈，现有透明物体数据与真实流程差距较大。",
    architecture:
      "数据集支持 segmentation、depth completion、6D pose 和多视角推理；系统管线结合 mask、FoundationPose、手眼标定和 MoveIt。",
    optimization:
      "核心贡献是数据与评估，不主张新的策略训练或 RL。",
    data:
      "98 scenes、161,315 RGB-D frames、1.03M instance annotations、15 类实验室物体，包含 10 个 held-out 真实实验室场景。",
    experiments:
      "Franka parallel gripper 在 150 次抓取中成功 98 次；LinkerHand 10-DoF 在 150 次中成功 85 次。",
    strengths:
      "数据规模、多视角、透明物体和真机系统成功率形成闭环。",
    limitations:
      "系统成功率混合了感知、抓取合成和控制误差，没有隔离各模块的因果贡献。",
    transfer:
      "可作为实验室操作 perception stress test，并研究多视角不变表征如何改善透明物体 VLA。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.21071-overview.png",
        alt: "TransBiolab 透明生物医学物体数据集的多对象多视角场景概览",
        caption:
          "Figure 1 · TransBiolab 数据集总览：多对象、多视角及不同遮挡和杂乱程度的采集示例。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 11,
    title:
      "Human-Inspired Framework for Robotic Craniotomy: Integrating Multimodal Fusion and Adaptive Trajectory Adjustment",
    arxivId: "2607.21058",
    url: "https://arxiv.org/abs/2607.21058",
    institutions: ["Dalian University of Technology", "The University of Tokyo"],
    signal: "突破检测后用实测事件重锚定剩余切削轨迹",
    tags: ["Multimodal Perception", "Trajectory Adjustment", "Surgical Robot"],
    classification: {
      research: "其他",
      modalities: ["Force / Torque", "Audio"],
      platforms: ["机械臂", "其他平台"],
      deployment: "真机部署优化",
    },
    motivation:
      "CT 轨迹无法补偿注册误差、骨厚变化和术中位移，开环切削可能过冲并伤及硬脑膜。",
    architecture:
      "dual-contour 规划外层路径；CMA-TCN-Transformer 融合 force/acoustic，Bayesian filter 稳定状态；突破后把辅助路径投影到实测点。",
    optimization:
      "监督训练骨层/突破检测器，部署时按状态机闭环调整轨迹；不使用 RL。",
    data:
      "牛肋骨 16 次突破监测实验；山羊头骨做 5 次骨瓣移除，其中 4 次闭环、1 次开环。",
    experiments:
      "突破准确率 97%，延迟 0.048±0.097 秒，最大过冲 0.29mm；4 次闭环均无硬脑膜损伤，开环试验失败。",
    strengths:
      "把感知延迟直接连接到轨迹补偿和安全结果，并有开闭环对照。",
    limitations:
      "仅有 ex vivo 小样本，缺乏出血、搏动和软组织运动等扰动，也未做组织学验证。",
    transfer:
      "对精密插入和接触任务，可复用“事件检测后重锚定剩余轨迹”，避免持续累积偏差。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.21058-overview.png",
        alt: "机器人开颅系统从术前规划到术中监测和轨迹调整的总体架构",
        caption:
          "Figure 1 · 自主开颅系统总览：术前轨迹与注册、术中多模态监测、突破后的剩余轨迹调整。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 12,
    title:
      "Beyond Episodic Evaluation: Memory Architectural Bottlenecks in Sequential Embodied Question Answering",
    arxivId: "2607.21571",
    url: "https://arxiv.org/abs/2607.21571",
    institutions: [
      "University of Maryland, College Park",
      "The University of Texas at Austin",
      "University of Illinois Urbana-Champaign",
    ],
    signal: "持久状态不等于知识积累，结构化 3D memory 才能减少重复探索",
    tags: ["Sequential Evaluation", "3D Memory", "Embodied QA"],
    classification: {
      research: "Memory",
      modalities: ["Point Cloud / 3D"],
      platforms: ["其他平台"],
      deployment: "真机部署优化",
    },
    detailAttributes: {
      memoryImplementation: "显式 3D spatial-semantic memory",
      memoryHorizon: "跨连续问题长期保留",
    },
    resources: [
      { label: "项目页", url: "https://sequential-eqa.github.io/" },
      { label: "GitHub", url: "https://github.com/jangablox/sequential-eqa" },
    ],
    motivation:
      "EQA 常在每题后清空状态，但真实机器人要连续回答多问题；保留内存并不保证能复用先前知识。",
    architecture:
      "Sequential-EQA 保持环境和模型不变，只把问题序列化并保留 state，比较短期 buffer、隐式 VLA memory 与显式 3D spatial-semantic memory。",
    optimization:
      "评估协议本身不对被测 agent 额外优化，用于暴露既有 memory architecture 的瓶颈。",
    data:
      "模拟多场景序列；Unitree Go2 在室内实验室、大堂、走廊和室外露台，每环境 5 个问题。",
    experiments:
      "真机中 3D-Mem 从 episodic 20% 提至 sequential 40%，MemoryEQA 从 40% 到 47%；UniNavid 仍为 15%。",
    strengths:
      "区分 persistent state 与 compositional memory，并在物理噪声下复现模拟趋势。",
    limitations:
      "每环境仅一组 episodic/sequential trial，统计很小；任务为 EQA 而非 manipulation。",
    transfer:
      "VLA 长时任务应结构化保存事件、对象状态和空间锚点，而不是只增大 history window。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.21571-episodic.png",
        alt: "每个问题后清空记忆并重复探索的 episodic EQA 评估流程",
        caption:
          "Figure 1a · Episodic Evaluation：每道问题后重置记忆，后续问题需要重新探索。图片截取自 arXiv 原论文。",
      },
      {
        src: "/report-assets/2026-07-27/2607.21571-sequential.png",
        alt: "跨问题保留环境记忆并直接复用已有知识的 sequential EQA 评估流程",
        caption:
          "Figure 1b · Sequential Evaluation：记忆跨问题保留，后续任务可复用已探索的空间知识。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 13,
    title:
      "A Real-Time RGB-D Perception Pipeline for Autonomous Impact Hammers in Mining",
    arxivId: "2607.20748",
    url: "https://arxiv.org/abs/2607.20748",
    institutions: ["University of Chile"],
    signal: "大型机器人自过滤、岩石分割与可执行目标 pose 的嵌入式闭环感知",
    tags: ["RGB-D", "Robot Self-filtering", "Deployment"],
    classification: {
      research: "其他",
      modalities: ["Depth / RGB-D", "Mask / Segmentation"],
      platforms: ["其他平台"],
      deployment: "真机部署优化",
    },
    motivation:
      "矿山破碎锤依赖远程操作，机器人自身遮挡和钢格背景使岩石分割与可执行敲击 pose 生成困难。",
    architecture:
      "RGB instance segmentation 与点云聚类并行，结合机器人自过滤、深度背景模型和表面法向生成并排序目标 pose。",
    optimization:
      "使用预训练视觉分割和几何处理，不做策略 RL；在 Jetson AGX Orin 上约 10Hz。",
    data:
      "缩比真实装置、不使用仿真；150 个感知配置，另有 117 个目标 pose 执行，其中 111 个成功到达后进入统计。",
    experiments:
      "111 次压持试验中 72.07% 保持稳定接触并完成模拟敲击，post-contact slip 为 0%。",
    strengths:
      "部署链完整，指标区分到达、未接触和滑移，并明确披露缩比平台。",
    limitations:
      "只做持续压持而非真实冲击破碎，单视角无法判断支撑稳定性，缩比结果不能直接外推矿井。",
    transfer:
      "可复用 robot self-filtering 与 target-pose viability，并将支撑稳定性纳入 learned affordance。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.20748-pipeline.png",
        alt: "矿用冲击锤从 RGB-D 和机器人模型生成岩石分割与敲击目标位姿的感知流程",
        caption:
          "Figure 1 · RGB-D 感知管线：机器人自过滤、岩石分割、几何处理与目标位姿排序。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 14,
    title:
      "Scalable Low-Cost Laboratory Automation: A Digital Twin-Integrated Robotic Platform for Autonomous Liquid Handling",
    arxivId: "2607.20662",
    url: "https://arxiv.org/abs/2607.20662",
    institutions: ["University of Toronto", "AISCIA Informatics", "Hamad Bin Khalifa University"],
    signal: "低成本液体处理、浏览器数字孪生与闭环实验选择",
    tags: ["Digital Twin", "Self-driving Lab", "Human-in-the-loop"],
    classification: {
      research: "其他",
      data: "数据质量 / 筛选",
      platforms: ["机械臂", "夹爪"],
      deployment: "真机部署优化",
    },
    motivation:
      "商业液体处理平台昂贵且封闭，低成本装置通常缺少可监督、可干预的实时数字孪生与闭环实验选择。",
    architecture:
      "消费级 3D 打印机改造成 XYZ 移液平台；浏览器数字孪生同步运动和移液状态；CEID 根据已完成实验选择下一组配方。",
    optimization:
      "物理实验上的序贯 surrogate/acquisition 优化，不是机器人策略训练，也不使用 RL。",
    data:
      "24 次闭环颜色配方实验；移液精度另在 200/500/1000μL 各做 5 次称重。",
    experiments:
      "第 16 次找到最终最优配方；三档移液 CV 均低于 0.5%，数字孪生亚秒同步，RGB 响应与期望平均误差 2 个百分点。",
    strengths:
      "低成本硬件、远程安全介入和闭环实验选择组合完整。",
    limitations:
      "proof-of-concept 只做有色水溶液；部分对比的历史数据量不一致，不能视作严格独立比较。",
    transfer:
      "适合研究“真机自治 + 可观察数字孪生 + 人类紧急接管”的工程闭环。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.20662-overview.jpg",
        alt: "RAINBOT 液体处理硬件、数字孪生、闭环实验流程和平台架构概览",
        caption:
          "Figure 1 · RAINBOT 平台总览：低成本移液硬件、浏览器数字孪生与闭环实验选择。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 15,
    title: "ZONDA: Zero-shot Object Navigation with Dynamic Avoidance in Multi-floor Environments",
    arxivId: "2607.21025",
    url: "https://arxiv.org/abs/2607.21025",
    institutions: [
      "Southern University of Science and Technology",
      "Guangdong Direct Drive Technology",
      "South China University of Technology",
      "Great Bay University",
    ],
    signal: "多层零样本导航、多视图目标确认和动态行人避障",
    tags: ["ObjectNav", "VLM Verification", "Dynamic Avoidance"],
    classification: {
      research: "其他",
      modalities: ["Depth / RGB-D"],
      platforms: ["轮式底盘"],
      deployment: "真机部署优化",
    },
    motivation:
      "ObjectNav 往往只处理单层静态场景，单视图目标确认容易误检，机器人专用 PointNav 又难迁移到新硬件。",
    architecture:
      "高度差 traversability map 做多层规划，多视图 VLM 交叉确认目标，Kalman 预测行人运动并配合 MPPI 局部避障。",
    optimization:
      "zero-shot 模块组合，不做任务专用训练；TITA 仅按硬件参数适配几何与安全半径。",
    data:
      "HM3D 2,000 episodes、MP3D 2,195 episodes；HM3D-DYNA 加动态行人。真机为一个办公室代表性成功 episode。",
    experiments:
      "HM3D/MP3D 成功率 66.5%/48.2%，HM3D-DYNA 为 48.8%；多视图确认消融使成功率降至 41.5%/30.2%。",
    strengths:
      "多层、目标确认和动态避障三类部署问题被统一考虑，仿真消融清楚。",
    limitations:
      "真机只有代表案例、没有试验次数或失败统计，主要结论仍依赖仿真。",
    transfer:
      "可借鉴 VLM 目标确认与连续控制解耦的部署架构，但不应据此宣称已证明真机泛化。",
    figures: [
      {
        src: "/report-assets/2026-07-27/2607.21025-overview.png",
        alt: "ZONDA 从多视图目标确认到多层全局规划和动态局部避障的框架图",
        caption:
          "Figure 1 · ZONDA 总览：语义地图、多层规划、多视图 VLM 目标确认与动态行人避障。图片截取自 arXiv 原论文。",
      },
    ],
  },
];

const paperDaily20260727ExcludedFromPublic = new Set([
  "2607.21113",
  "2607.21071",
  "2607.21058",
  "2607.20748",
  "2607.20662",
  "2607.21025",
]);

const paperDaily20260727: Paper[] = paperDaily20260727Archive
  .filter((paper) => !paperDaily20260727ExcludedFromPublic.has(paper.arxivId))
  .map((paper, index) => ({ ...paper, rank: index + 1 }));

const latestPapers: Paper[] = [
  {
    rank: 1,
    title: "Patch Policy: Efficient Embodied Control via Dense Visual Representations",
    arxivId: "2607.18236",
    url: "https://arxiv.org/abs/2607.18236",
    institutions: ["New York University", "Meta FAIR", "AMI Labs"],
    signal: "轻量化 dense visual token 路线，同时报告真机、泛化与效率对照",
    tags: ["Dense Representation", "Imitation Learning", "Real Robot"],
    classification: {
      research: "表征学习",
      training: "BC",
      platforms: ["机械臂", "夹爪"],
      deployment: "真机部署优化",
    },
    resources: [
      { label: "项目页", url: "https://patch-policy.github.io/" },
      { label: "GitHub", url: "https://github.com/gaoyuezhou/patch_policy" },
    ],
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
    figures: [
      {
        src: "/report-assets/2026-07-23/2607.18236-method.png",
        alt: "Patch Policy 将多视角图像编码为 patch tokens，并通过逐帧因果注意力连接动作头的结构图",
        caption:
          "Figure 2 · Patch Policy architecture。图片截取自 arXiv 原论文，展示 dense patch observation trunk、frame-wise attention mask 与 action head。",
      },
    ],
  },
  {
    rank: 2,
    title:
      "WorldScape Policy 2.0: Empowering Steerable World Action Modeling with Reasoning-Augmented Memory",
    arxivId: "2607.18840",
    url: "https://arxiv.org/abs/2607.18840",
    institutions: ["Manifold AI", "Tsinghua University", "Shanghai Jiao Tong University"],
    signal: "长短期事件记忆 WAM，评估长程任务与视觉提示适应",
    tags: ["World Action Model", "Long-term Memory", "Short-term Memory", "Multimodal Prompt"],
    classification: {
      research: "WAM",
      training: "Pre-training",
      data: "UMI / Ego / Human Video",
      platforms: ["机械臂"],
      deployment: "真机部署优化",
    },
    detailAttributes: {
      memoryImplementation: "连续视觉上下文与事件级语义记忆并行",
      memoryHorizon: "短时与长时并用",
    },
    resources: [
      { label: "项目页", url: "https://manifoldai-research.github.io/WorldScape-Policy/" },
      { label: "GitHub", url: "https://github.com/manifoldai-research/WorldScape-Policy" },
    ],
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
      "“短期连续动力学 + 长期事件语义”的双层记忆可用于小模型 VLA，例如只保存接触事件、完成谓词和恢复节点。",
    figures: [
      {
        src: "/report-assets/2026-07-23/2607.18840-method.png",
        alt: "WorldScape Policy 2.0 从多模态提示编码到长短期记忆 WAM 和真机执行的整体结构",
        caption:
          "Figure 2 · WorldScape Policy 2.0 overview。图片截取自 arXiv 原论文，展示多模态提示、长短期记忆与 causal world action model。",
      },
    ],
  },
  {
    rank: 3,
    title:
      "FM-VLA: Force-based Memory for Vision-Language-Action Models in Contact-Rich Manipulation",
    arxivId: "2607.18231",
    url: "https://arxiv.org/abs/2607.18231",
    institutions: ["Tsinghua University", "Microsoft Research", "Fudan University", "USTC"],
    signal: "用低带宽力觉历史解决视觉不可辨识的接触记忆问题",
    tags: ["Force Memory", "Episodic Memory", "Contact-rich", "VLA"],
    classification: {
      research: "Memory",
      training: "Post-training",
      modalities: ["Force / Torque"],
      platforms: ["Humanoid", "夹爪"],
      deployment: "真机部署优化",
    },
    detailAttributes: {
      memoryImplementation: "将完整六轴力历史压缩为可检索 latent tokens",
      memoryHorizon: "单个 episode 内长期保留",
    },
    resources: [
      { label: "项目页", url: "https://qft-333.github.io/FM-VLA-Page/" },
      { label: "GitHub", url: "https://github.com/qft-333/FM-VLA" },
    ],
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
    figures: [
      {
        src: "/report-assets/2026-07-23/2607.18231-method.png",
        alt: "FM-VLA 两阶段训练架构，包括 Force-VAE 预训练和带力觉记忆的 VLA 后训练",
        caption:
          "Figure 2 · FM-VLA training pipeline。图片截取自 arXiv 原论文，展示 Force-VAE 预训练以及 force/state token 向 action expert 的注入方式。",
      },
    ],
  },
  {
    rank: 4,
    title: "RynnBrain 1.1: Towards More Capable and Generalizable Embodied Foundation Model",
    arxivId: "2607.17977",
    url: "https://arxiv.org/abs/2607.17977",
    institutions: ["DAMO Academy, Alibaba Group", "Lupan Lab"],
    signal: "统一 3D grounding、contact point 和跨本体动作空间",
    tags: ["Foundation Model", "Cross-embodiment", "3D Grounding"],
    classification: {
      research: "VLA",
      training: "Pre-training",
      modalities: ["Point Cloud / 3D"],
      data: "跨本体数据",
      platforms: ["Humanoid"],
      deployment: "跨本体迁移",
    },
    resources: [
      {
        label: "模型",
        url: "https://huggingface.co/Alibaba-DAMO-Academy/RynnBrain1.1-9B",
      },
    ],
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
    figures: [
      {
        src: "/report-assets/2026-07-23/2607.17977-architecture.png",
        alt: "RynnBrain-VLA 将语言、多视角观察、机器人状态和噪声动作映射到统一动作空间的结构图",
        caption:
          "Figure 3 · RynnBrain-VLA：单流 DiT、flow matching 与跨本体统一动作空间。图片截取自 arXiv 原论文。",
      },
    ],
  },
  {
    rank: 5,
    title:
      "Closing the Loop in Humanoid VLA: Persistent 3D Object Tokens for Verifiable Loco-Manipulation",
    arxivId: "2607.18016",
    url: "https://arxiv.org/abs/2607.18016",
    institutions: ["BUAA", "BZA", "TJU", "DeepCybo", "ZGCI"],
    signal: "让同一物理状态同时服务 action 与 verification",
    tags: ["Humanoid", "3D Object Token", "Closed-loop"],
    classification: {
      research: "VLA",
      training: "Post-training",
      modalities: ["Depth / RGB-D", "Point Cloud / 3D"],
      platforms: ["Humanoid", "灵巧手"],
      deployment: "真机部署优化",
    },
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
      "真机、消融与 controlled shift 都直接评估 object-state loop 的作用。",
    limitations:
      "训练数据严重缺失、每项 shift 只有 10 次且无 CI；系统依赖 RGB-D、分割、标定与人工 predicate threshold。",
    transfer:
      "可将硬 predicate 扩展成 uncertainty-aware learned verifier，并加入 force/contact event 以覆盖视觉几何不可判别的失败。",
    figures: [
      {
        src: "/report-assets/2026-07-23/2607.18016-overview.jpg",
        alt: "POT-VLA 持久三维对象记忆连接动作预测、执行和状态验证的闭环系统",
        caption:
          "Figure 1 · POT-VLA 总览：持久 3D object tokens 同时条件化动作头，并在执行后刷新状态完成验证与恢复。图片截取自 arXiv 原论文。",
      },
    ],
  },
];

const paperSupplements: Record<
  string,
  Pick<Paper, "novelty" | "reproducibility" | "readingNotes">
> = {
  "2607.20683": {
    novelty:
      "相对直接把触觉传感器读数送入策略的路线，FELT 把“触觉缺失”改写为条件生成问题，并显式建模左右指面的结构关系；关键比较是视觉-only、真实触觉、生成触觉以及去除跨指交互的消融。",
    reproducibility:
      "项目页已公开，论文披露生成器与策略数据量、四项任务和每项 20 次真机试验；当前条目未确认代码、权重或完整训练配置已发布。",
    readingNotes:
      "方法先用配对 RGB—压力图训练触觉生成器，再把生成图像或 latent 接入 Diffusion Policy。结果说明收益并非只来自增加网络容量：双指结构和生成表征消融均影响成功率。不过实验仍集中在视觉可看到接触区域的四项任务，不能据此推断对严重遮挡或新型触觉传感器同样有效。",
  },
  "2607.20912": {
    novelty:
      "常见 force-conditioned policy 只预测末端动作，URF 进一步让策略输出刚度和 impedance-admittance 切换量，使接触模式成为策略决策的一部分；固定控制模式和标准 force-DP 是最直接基线。",
    reproducibility:
      "论文披露机器人、传感器、150 条示范、任务设置及每方法每任务 20 次试验；当前未确认公开代码、数据或训练权重。",
    readingNotes:
      "URF 的核心不是增加一种输入模态，而是让动作生成和底层柔顺控制共享同一输出接口。两个刚性接触任务中标准 force-DP 失败，说明只感知力并不足以解决控制器不匹配；但任务数量和控制轴建模仍有限，尚不能证明该切换机制适用于更丰富的接触几何。",
  },
  "2607.21049": {
    novelty:
      "相对不可解释的端到端 Diffusion Policy，这项工作暴露可编辑的视觉关键点，并只要求用户在首帧纠正一次，之后由跟踪模块传播；比较重点是无纠正策略、人工 override 路径和不同 OOD 条件。",
    reproducibility:
      "项目页已公开，论文给出三项真机任务、每任务 32 条示范以及 3 seeds × 10 rollouts 的评测结构；当前未确认代码或数据已发布。",
    readingNotes:
      "训练阶段同时走预测关键点和人工 override 两条路径，让动作策略在部署时能接收纠正后的表征。OOD 提升与一次性纠正直接相关，但它仍依赖用户知道应点击哪里，且二维关键点无法表达深度、遮挡关系和可变形物体的完整状态。",
  },
  "2607.21582": {
    novelty:
      "区别于均匀增加示范，论文先用 Factor Dominance Rate/Hierarchy 识别语言因素偏置，再把固定预算投向弱项；主要基线是随机采样和相同或更大数据预算的常规后训练。",
    reproducibility:
      "论文披露因素划分、采样预算、六种仿真 foundation policy，以及真机任务中每个 checkpoint 的 48 次 rollout；当前未确认代码和数据采集工具发布。",
    readingNotes:
      "这是一篇数据选择工作，而不是新的 VLA 架构。它把 verb、object、size、spatial attribute 等因素两两对照，从偏置诊断推导下一批采集分配。真机结果支持“固定预算下定向补弱项”这一命题，但因素需要人工离散，开放词汇和长程任务中的因素发现仍未解决。",
  },
  "2607.20653": {
    novelty:
      "相对逐对象优化的 PhysTwin 和完全学习式动力学，PhysCoRe 保留 MPM rollout，只学习材料估计与动力学残差，并给出逐粒子不确定性；直接证据来自材料、残差和置信度模块消融。",
    reproducibility:
      "论文披露对象类型、12 个真实 episode、主动探测平台和主要速度/误差比较；当前未确认代码、模型或采集数据已公开，材料覆盖规模较小。",
    readingNotes:
      "Material-from-Motion 先从 RGB-D 序列估计材料参数，Residual-from-Dynamics 再修正 MPM 的系统误差。相对 PhysTwin 的速度和误差改善说明混合物理模型有价值，但训练样本很少，主动探索只展示不确定性下降，没有证明机器人能据此选择更有效的操作。",
  },
  "2607.20665": {
    novelty:
      "论文把多机载荷耦合压缩为低维任务模型，再把分布式图策略与控制障碍函数结合；相对普通 domain-randomized RL，新增的是显式安全约束和团队规模外推。",
    reproducibility:
      "论文给出 3–5 机仿真训练、3–6 机 Crazyflie 真机设置、失败场景和安全裕度处理；当前未确认代码、仿真环境或策略权重发布。",
    readingNotes:
      "训练只在低维仿真中进行，真实执行由底层控制器跟踪抽象动作，并通过收紧障碍边界吸收跟踪误差。硬件结果支持零样本 Sim2Real 和团队规模扩展，但验证限于固定高度和平面运输，因此这里把它作为可迁移的安全 RL 方法，而不是通用多机器人结论。",
  },
  "2607.21341": {
    novelty:
      "区别于先大量采样再过滤抓取与交接组合，BiCompoDiff 把碰撞、可达性和平滑约束写成能量梯度，直接在扩散反演中联合优化；ReorientBot 和去除能量/MCMC 的版本构成直接比较。",
    reproducibility:
      "论文披露 60 个仿真任务、双 UR12e 真机平台及主要消融；真机仅两个代表场景，当前未确认代码、对象集合或预训练 grasp diffusion 权重发布。",
    readingNotes:
      "该方法的主要贡献发生在推理阶段，因此没有强行归入 Post-training。预训练抓取扩散给出可行先验，能量模型在采样过程中持续修正双臂约束。仿真提升较清楚，但真机样本很少且依赖准确物体几何与位姿，尚未覆盖感知误差和接触失败恢复。",
  },
  "2607.20679": {
    novelty:
      "相对先生成通用地形表征、再按机器人类型后过滤，论文用 robot profile 直接调制空间特征，使可通行性表示随 embodiment 改变；Spot 与 TerraSentia 的跨平台测试是核心证据。",
    reproducibility:
      "论文披露 NaviTrace/held-out 轨迹划分、两种真机平台、部署频率及结构消融；当前未确认训练代码、数据划分或模型权重公开。",
    readingNotes:
      "DINOv3、深度和语义地形特征经过 SPADE 调制后形成机器人能力相关的 prototype。两种本体上的结果说明平台条件化比统一后过滤更合理，但实验主要区分轮式与足式能力，仍不足以覆盖机械臂或 humanoid 的细粒度动作约束。",
  },
  "2607.21571": {
    novelty:
      "论文主要贡献是把 EQA 从每题重置改为连续问题评估，并区分持久 state 与真正可复用的结构化 memory；它比较短期 buffer、隐式策略记忆和显式 3D spatial-semantic memory。",
    reproducibility:
      "项目页和 GitHub 已公开；论文提供模拟协议及 Unitree Go2 场景，但每个真机环境只有很少的 episodic/sequential 对照，统计结论应谨慎。",
    readingNotes:
      "Sequential-EQA 不额外训练被测 agent，而是保持环境与内部状态连续，观察后续问题能否复用已经探索的信息。显式 3D memory 的改善支持“持久化不等于知识积累”，但任务仍是问答而非 manipulation，因此网站只把它作为 Memory 架构参考。",
  },
  "2607.18236": {
    novelty:
      "相对把每帧视觉压成单个 global token，Patch Policy 保留冻结视觉编码器的 dense patch tokens，并用帧内充分交互、帧间因果的 attention mask连接动作头；主要对照保持策略框架一致，只改变视觉表征。",
    reproducibility:
      "项目页和 GitHub 已公开；论文披露仿真与三项 Franka 任务、未见物体测试、视觉 backbone、压缩率和延迟消融，真机置信区间仍未报告。",
    readingNotes:
      "这项工作的价值在于用较小策略读取冻结 ViT 的空间细节，而不是端到端微调整个 VLM。多组结构和效率比较支持 dense representation 的贡献；同时 token 数增加带来的时延和内存成本仍需按控制频率权衡。",
  },
  "2607.18840": {
    novelty:
      "相对短窗口 WAM，WorldScape Policy 2.0 同时维护近期视觉动力学和由 VLM 组织的事件级长期记忆，并支持文本、目标图像和跨本体视频提示；直接消融覆盖 memory components、训练阶段和 semantic forcing。",
    reproducibility:
      "项目页和 GitHub 已公开，论文披露 ManipEvent-5M 的规模、来源和三阶段训练；5B WAM、4B VLM 与大规模混合数据使完整复现成本较高。",
    readingNotes:
      "共享 video-action DiT 负责预测未来视觉与动作，短期记忆保留连续动力学，长期模块把历史压成事件边界与局部活动状态。RoboTwin 主表很高，但更严格的 clean-to-randomized 结果明显较低，因此应把它理解为大规模训练和事件记忆的联合收益，而非已解决开放环境泛化。",
  },
  "2607.18231": {
    novelty:
      "相对瞬时力输入或视觉历史，FM-VLA 用 Force-VAE 将完整六轴力序列压成少量 tokens，再注入 π0.5 action expert；无记忆、短期力、视觉记忆和不同 encoder/token 数是直接基线。",
    reproducibility:
      "项目页和 GitHub 已公开；论文披露 750 条示范、三项任务、每方法 18 次真机试验和多组消融，未验证跨传感器或跨平台复现。",
    readingNotes:
      "第一阶段预训练 Force-VAE 重建力历史，第二阶段冻结该编码器并后训练 VLA。结果支持低带宽力历史能区分重复接触次数和遮挡状态，但任务与训练数据高度同分布，83.3% 平均成功率不能外推到未见接触模式。",
  },
  "2607.17977": {
    novelty:
      "RynnBrain 1.1 将 3D grounding、contact point 和 VLA action 放入统一具身预训练体系，并用 shared action canvas 与 embodiment mask 兼容不同机器人；主要比较是相同 recipe 下的通用 Qwen-VLA 初始化。",
    reproducibility:
      "模型权重已在 Hugging Face 提供；论文披露主要模型结构和多平台测试，但完整训练 mixture、真机示范数量和置信区间未公开。",
    readingNotes:
      "论文先做具身多模态自回归预训练，再用单流 DiT 生成动作。多平台真机结果说明具身初始化有收益，但所谓 cross-embodiment 主要是已见本体联合训练，不等同于在未见机器人上零样本迁移。",
  },
  "2607.18016": {
    novelty:
      "相对只依赖 VLA 隐状态或外部任务管理器，POT-VLA 让同一组持久 3D object tokens 同时条件化动作生成和几何验证，从而减少动作模型与完成判据的状态分歧。",
    reproducibility:
      "论文披露 Unitree G1、八类任务各 10 次及 verifier/token/system 消融，但示范数量、训练时长、代码和关键 predicate 配置未公开。",
    readingNotes:
      "系统每执行一个短 action chunk 就重新观察、更新对象记录并判断继续、重试或重规划。71/80 对 39/80 的结果支持闭环验证价值，但系统依赖 RGB-D、分割、标定和人工阈值，当前证据不能把全部收益归因于 VLA 本身。",
  },
  "2607.15275": {
    novelty:
      "相对拼接固定长度历史，RoboTTT 在动作模型中加入可在线更新的 fast weights，用固定状态容量压缩最长 8K timesteps；1K/8K 上下文与普通单步策略是核心比较。",
    reproducibility:
      "NVIDIA GEAR 项目页已公开，论文披露 YAM 三项任务的数据时长、上下文长度和 GB200 训练规模；当前未确认完整代码和训练权重发布。",
    readingNotes:
      "TTT 层在序列推进时持续更新内部 MLP，把长历史写入参数化状态，而注意力仍处理当前帧内信息。复杂装配完成度明显提高，但训练成本很高，且 fast weights 仍会丢失部分早期事件，因此这里将其归为 Test-time Adaptation，并把长时上下文作为详情属性。",
  },
  "2607.14236": {
    novelty:
      "相对直接把力拼接到预训练 VLA，LIFT 增加独立 reactive action expert，并用零初始化 cross-attention 注入力历史；离线-only、无力反馈和无在线纠正版本构成关键消融。",
    reproducibility:
      "项目页已公开，论文披露 Flexiv 平台、三项接触任务和在线纠正流程；当前未确认代码、纠正数据或模型权重发布，数千条在线样本的具体组成仍有限。",
    readingNotes:
      "主干保留语义与慢速动作能力，旁路 expert 负责接触阶段的快速物理响应，DAgger 纠正失败状态的分布偏移。方法适合看作 VLA 后训练与在线数据闭环，而不是新的预训练方案；人工纠正和数据吞吐成本是主要限制。",
  },
  "2607.14609": {
    novelty:
      "区别于在任意层增加触觉预测 loss，论文先用 linear probe 找到最能预测未来触觉的 action-expert 层，再把训练期 tactile predictor 对齐到该位置；不同层、无对齐接口和两个 backbone 是直接比较。",
    reproducibility:
      "论文披露 ARX R5、PaXini 传感器、五项任务每项 50 条示范以及每方法 20 次真机试验；当前未确认代码、数据或权重发布。",
    readingNotes:
      "触觉头只在训练阶段提供辅助监督，部署时被移除，因此收益来自表征整形而不是新增在线传感输入。两个 VLA backbone 上的结果支持层选择的重要性，但单平台单传感器规模仍不足以说明该层级规律可普遍迁移。",
  },
};

function enrichPaper(paper: Paper): Paper {
  return { ...paper, ...(paperSupplements[paper.arxivId] ?? {}) };
}

export const reports: Report[] = [
  {
    slug: "2026-07-27",
    date: "2026.07.27",
    weekday: "周一",
    range: "2026.07.24 - 2026.07.26",
    title: "触觉 latent、接触控制与偏置感知数据采集",
    summary:
      "本期收录九篇经 PDF 核验的论文，覆盖触觉生成、接触控制、组合泛化、物理 world model、安全 RL、机器人能力表征与 Memory 评估。",
    overview:
      "本期论文分别讨论生成式触觉、接触控制、偏置感知数据采集、混合物理 world model、安全 RL、双臂推理优化、跨本体空间表征和结构化 Memory。",
    papers: paperDaily20260727.map(enrichPaper),
  },
  {
    slug: "2026-07-23",
    date: "2026.07.23",
    weekday: "周四",
    range: "2026.07.21 - 2026.07.22",
    title: "记忆、力觉与稠密视觉：近期具身智能论文",
    summary:
      "本期收录五篇论文，分别讨论 dense patch policy、长短期事件记忆 WAM、力觉 episodic memory、具身基础模型和 humanoid 闭环执行。",
    overview:
      "这些工作近期在探索稠密视觉表征、事件级记忆、力觉历史、跨本体动作空间，以及基于 3D object state 的执行验证。",
    papers: latestPapers.map(enrichPaper),
  },
  {
    slug: "2026-07-20",
    date: "2026.07.20",
    weekday: "周一",
    range: "2026.07.17 - 2026.07.19",
    title: "长上下文、接触闭环与动作表征整形",
    summary:
      "本期收录三篇论文，分别关注超长时序上下文、VLA 接触阶段的力反馈，以及触觉监督在动作表征中的注入位置。",
    overview:
      "三篇工作都包含真机实验，方法分别使用 fast weights、reactive force injection 和 latent tactile prediction。",
    papers: [
      {
        rank: 1,
        title: "RoboTTT: Context Scaling for Robot Policies",
        arxivId: "2607.15275",
        url: "https://arxiv.org/abs/2607.15275",
        institutions: ["NVIDIA", "Stanford University", "The University of Texas at Austin"],
        signal: "通过 fast weights 将 VLA 历史上下文扩展到 8K timesteps",
        tags: ["Long Context", "Long-term Memory", "Test-time Training"],
        classification: {
          research: "Memory",
          training: "Test-time Adaptation",
          platforms: ["机械臂", "夹爪"],
          deployment: "真机部署优化",
        },
        detailAttributes: {
          memoryImplementation: "TTT fast weights 压缩连续动作与观测历史",
          memoryHorizon: "最高 8K timesteps 长时上下文",
        },
        resources: [{ label: "项目页", url: "https://research.nvidia.com/labs/gear/robottt/" }],
        motivation: "长时装配需要保留阶段、失败与纠正关系，简单拼接历史帧无法持续扩展。",
        architecture: "在 GR00T N1.7 的 DiT 层中插入 TTT 层，用测试时更新的 MLP fast weights 压缩长历史。",
        optimization: "sequence action forcing 与 truncated BPTT；训练和部署阶段均维护固定大小状态。",
        data: "YAM 双臂真机上三项长时装配任务，分别约 8、6、5 小时真实数据。",
        experiments: "平均完成度 79%，单步基线为 42%；8K 上下文版本高于 1K 版本。",
        strengths: "在复杂真机任务中评估长上下文，并给出上下文长度消融。",
        limitations: "预训练使用 16 张 GB200，成本高；仍无法覆盖所有部署失败。",
        transfer: "可把 force event、失败恢复和动作 chunk 作为 fast-weight 更新信号。",
        figures: [
          {
            src: "/report-assets/2026-07-20/2607.15275-architecture.png",
            alt: "RoboTTT 在 DiT 动作头中插入跨时间 TTT 层并维护 fast weights 的训练与推理结构",
            caption:
              "Figure 2 · RoboTTT 模型、训练与推理：注意力处理帧内信息，TTT 层以 fast weights 压缩跨帧历史。图片截取自 arXiv 原论文。",
          },
        ],
      },
      {
        rank: 2,
        title: "Never Too Late for Force: Accelerating VLA Post-Training with Reactive Force Injection",
        arxivId: "2607.14236",
        url: "https://arxiv.org/abs/2607.14236",
        institutions: [
          "Shanghai Jiao Tong University",
          "Shanghai Innovation Institute",
          "Southern University of Science and Technology",
          "Noematrix Ltd.",
        ],
        signal: "通过 reactive action expert 和 online DAgger 注入力反馈",
        tags: ["Force", "Post-training", "DAgger"],
        classification: {
          research: "VLA",
          training: "Post-training",
          modalities: ["Force / Torque"],
          data: "在线数据 / 人工纠正",
          platforms: ["机械臂", "夹爪"],
          deployment: "真机部署优化",
        },
        resources: [{ label: "项目页", url: "https://lift-policy.github.io/" }],
        motivation: "预训练 VLA 的语义能力很强，但接触阶段的快速物理反应不足。",
        architecture: "复制 reactive action expert，并通过零初始化 cross-attention 注入短期 6D 力记忆。",
        optimization: "混合离线任务数据与在线人工纠正轨迹做 DAgger 后训练。",
        data: "Flexiv Rizon 4S 上三项接触任务，迭代收集数千条在线样本。",
        experiments: "毛巾折叠、书本插入与汉诺塔放环均优于视觉-only 与无在线纠正版本。",
        strengths: "结构简单，消融清晰，直接服务接触任务后训练。",
        limitations: "依赖人工在线纠正，只验证单臂，算力与数据吞吐成本仍高。",
        transfer: "适合作为 VLA 的旁路快速物理反馈模块。",
        figures: [
          {
            src: "/report-assets/2026-07-20/2607.14236-architecture.png",
            alt: "LIFT 在预训练 VLA 旁加入 reactive action expert 并通过交叉注意力注入力记忆的结构",
            caption:
              "Figure 2 · LIFT 架构：保留原视觉语言主干，复制 reactive action expert，并用零初始化 cross-attention 注入力记忆。图片截取自 arXiv 原论文。",
          },
        ],
      },
      {
        rank: 3,
        title: "Representation-Aligned Tactile Grounding for Contact-Rich Robotic Manipulation",
        arxivId: "2607.14609",
        url: "https://arxiv.org/abs/2607.14609",
        institutions: [
          "Fudan University",
          "Lenovo CTO Organization",
          "Nanyang Technological University",
          "TeleAI, China Telecom",
        ],
        signal: "先诊断各层物理可预测性，再选择触觉监督位置",
        tags: ["Tactile", "Representation", "Grounding"],
        classification: {
          research: "表征学习",
          training: "Post-training",
          modalities: ["Tactile"],
          platforms: ["机械臂", "夹爪"],
          deployment: "真机部署优化",
        },
        motivation: "直接加触觉 loss 并不保证监督落在真正决定动作的表征层。",
        architecture: "用 linear probe 选择最能预测未来触觉的 action-expert 中间层，并接入 Latent Tactile Predictor。",
        optimization: "触觉 predictor 仅训练期存在，推理时移除，不增加额外延迟。",
        data: "ARX R5 与 PaXini 触觉传感器，五项接触任务，每项 50 条专家示范。",
        experiments: "论文报告 SmolVLA 与 π0 上的成功率均高于基础模型和未对齐触觉接口，每项每种方法 20 次真机试验。",
        strengths: "回答了监督应该施加在哪一层，并在两个 backbone 上验证。",
        limitations: "单平台、单传感器，规模不足以证明大规模预训练下同样成立。",
        transfer: "可替换为 future-force、contact phase 或 failure-risk latent。",
        figures: [
          {
            src: "/report-assets/2026-07-20/2607.14609-overview.png",
            alt: "在训练阶段从动作专家中间表征预测未来触觉并对齐接触动力学的框架",
            caption:
              "Figure 3 · Future latent tactile grounding：在最具接触可预测性的 action-expert 中间层施加触觉监督，推理时移除预测头。图片截取自 arXiv 原论文。",
          },
        ],
      },
    ].map(enrichPaper),
  },
];

export const companyTrackerLastChecked = "2026.07.27";

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
    date: "2026.07.22",
    category: "Open Source",
    title: "开源 GPU 加速医疗机器人物理仿真框架",
    summary:
      "NVIDIA 在 Isaac for Healthcare 中开源医疗物理仿真能力，用于建模解剖结构与器械交互、生成稀缺场景并训练或评估机器人策略。",
    url: "https://blogs.nvidia.com/blog/medical-physics-simulation-open-source/",
    source: "NVIDIA Robotics Blog",
  },
  {
    company: "Tesla Optimus",
    shortName: "OP",
    color: "#c62828",
    date: "2026.07.22",
    category: "Manufacturing",
    title: "Fremont 开始 Optimus 工厂施工与产线安装",
    summary:
      "Tesla 称已停用 Model S/X 产线并安装首代 Optimus 产线，初期机器将用于 Optimus Academy 数据采集；年内投产仍是公司预期，不等同于已量产。",
    url: "https://assets-ir.tesla.com/tesla-contents/IR/TSLA-Q2-2026-Update.pdf",
    source: "Tesla Q2 2026 Update",
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
  {
    company: "宇树科技",
    shortName: "UT",
    color: "#16758d",
    date: "2026.06.01",
    category: "Reference Platform",
    title: "发布 H2 Plus Isaac GR00T 参考人形机器人",
    summary:
      "官方将 H2 Plus 定位为面向学术研究的 Isaac GR00T 参考平台；后续值得关注其数据采集、模型训练、仿真与真机部署接口的开放程度。",
    url: "https://www.unitree.com/cn/news/",
    source: "Unitree News Center",
  },
  {
    company: "逐际动力",
    shortName: "LX",
    color: "#7455c7",
    date: "2026.07.15",
    category: "Humanoid VLA",
    title: "COSA 0.5 更新人形 VLA 全身能力",
    summary:
      "官方发布 COSA 0.5，并将更新重点概括为人形 VLA V³-0 的全身能力升级；当前先记录为产品版本信号，后续关注真机任务、评测设置与接口开放度。",
    url: "https://www.limxdynamics.com/zh/news/BK000067",
    source: "LimX Dynamics News",
  },
  {
    company: "星动纪元",
    shortName: "RE",
    color: "#24745f",
    date: "2026.06.17",
    category: "Dexterous Hand",
    title: "发布 XHAND 1 PRO 灵巧手",
    summary:
      "官方发布 XHAND 1 PRO，并将其纳入自有机器人与 ERA-42 VLA 产品体系；目前公开信息以产品发布为主，后续关注触觉、控制接口与真机任务数据。",
    url: "https://www.robotera.com/news.html",
    source: "RobotEra News",
  },
  {
    company: "众擎机器人",
    shortName: "EN",
    color: "#b47b12",
    date: "2026.05.22",
    category: "Manufacturing",
    title: "首批 T800 下线，新制造基地启用",
    summary:
      "众擎称深圳红花岭基地完成首批 T800 下线，并在建设万台级交付能力；这里记录为产线与制造能力信号，不等同于已经完成万台交付。",
    url: "https://www.engineai.com.cn/about-news-media/59.html",
    source: "ENGINEAI News",
  },
  {
    company: "Genesis AI",
    shortName: "GE",
    color: "#263343",
    date: "2026.05.07",
    category: "Foundation Model",
    title: "发布 GENE-26.5 机器人基础模型系统",
    summary:
      "官方展示同一模型与控制栈覆盖烹饪、实验室操作、魔方和线束等长程接触任务；“human level”属于公司表述，公开材料仍不足以独立验证完整泛化范围。",
    url: "https://www.genesis.ai/blog/gene-26-5-advancing-robotic-manipulation-to-human-level",
    source: "Genesis AI Research",
  },
  {
    company: "Sharpa",
    shortName: "SH",
    color: "#d84478",
    date: "2026.06.01",
    category: "Tactile Manipulation",
    title: "Wave 灵巧手接入 Isaac GR00T 参考人形机器人",
    summary:
      "Sharpa 宣布将带触觉的 Wave 五指灵巧手集成到 Isaac GR00T 参考人形平台，重点信号是灵巧手、触觉感知与机器人模型开发流程的标准化衔接。",
    url: "https://www.sharpa.com/blogs/news/sharpa-brings-dexterous-tactile-manipulation-to-the-nvidia",
    source: "Sharpa News",
  },
];

export function getReport(slug: string) {
  return reports.find((report) => report.slug === slug);
}

export const paperRecords: PaperRecord[] = reports.flatMap((report) =>
  report.papers.map((paper) => ({
    ...paper,
    reportSlug: report.slug,
    reportDate: report.date,
  })),
);

export function getPaperById(arxivId: string) {
  return paperRecords.find((paper) => paper.arxivId === arxivId);
}
