import type { Paper } from "./site-data";

type Entry = Omit<Paper, "rank" | "figures" | "optimization" | "experimentDetails" | "reproducibilityDetails" | "deepDive"> & {
  figureFile: string; figureAlt: string; figureCaption: string; technique: string[]; evaluation: string[];
  comparison: string; reproducibilityStatus: "资源较完整" | "部分可复现" | "信息不足"; implementation: string[]; missing: string[];
};

const makePaper = (entry: Entry, index: number): Paper => ({
  ...entry, rank: index + 1,
  optimization: entry.technique.join("；"),
  experimentDetails: [{ title: "原文实验与消融", setup: entry.experiments, comparisons: entry.comparison, results: entry.evaluation }],
  reproducibilityDetails: { status: entry.reproducibilityStatus, verifiedResources: entry.resources?.map((x) => `${x.label}: ${x.url}`) ?? ["arXiv 论文正文"], implementation: entry.implementation, missing: entry.missing },
  deepDive: { lead: entry.methodSummary ?? entry.signal, sections: [{ title: "方法与模型改进", paragraphs: entry.technique }], experimentReading: entry.evaluation, reflections: [entry.transfer] },
  figures: [{ src: `/report-assets/2026-09-14/${entry.figureFile}`, alt: entry.figureAlt, caption: entry.figureCaption }],
});

const entries: Entry[] = [
  {
    title: "Dynin-Robotics: A Unified Omnimodal World-Action Model for Generalist Robot Learning", arxivId: "2609.13053", url: "https://arxiv.org/abs/2609.13053",
    institutions: ["Seoul National University", "AIDAS Lab"], signal: "用同一掩码扩散主干统一语言、图像、视频与动作，在策略、世界建模、目标状态预测和任务理解之间共享表示。",
    tags: ["World-Action Model", "Masked Diffusion", "Generalist"], classification: { research: "WAM", training: "Pre-training", data: "跨本体数据", platforms: ["机械臂", "夹爪"], deployment: "跨本体迁移" },
    motivation: "多数机器人基础模型把动作预测与视觉未来建模分开，难以让多种目标共同改善物理理解。", methodSummary: "Dynin 把文本、视觉和离散动作拼成统一 token 序列，通过改变可见上下文、目标标记与掩码区间，在一个骨干上切换四类任务。",
    architecture: "共享 omnimodal masked-diffusion Transformer；文本与视觉使用模态 tokenizer，连续动作均匀量化，最长上下文 2,048 token。", data: "第一阶段汇总 48 个 OXE 数据集，共 1,332,985 条轨迹、65,217,081 个 transition；第二阶段按下游基准后训练。",
    experiments: "LIBERO、LIBERO-Plus、VLABench 与 FR3 四项真机任务；真机同时比较 π0.5、GR00T、Cosmos Policy 和 Mimic。", novelty: "LIBERO 平均 98.1、LIBERO-Plus 73.0；FR3 四任务平均 78.4%，并将解码最高加速 29.15×。",
    strengths: "统一目标、百万轨迹预训练、跨基准与真实机器人结果形成完整证据链。", limitations: "对机器人外观和光照扰动仍敏感；整图世界模型指标不一定优于复制最后一帧，任务理解也缺少量化评测。", transfer: "统一模型的价值不只是多任务接口，而在于让动作、后果和语言解释共享同一条件化机制。",
    technique: ["四个目标只改变上下文与掩码模式，不引入彼此独立的专用骨干。", "动作离散化后与视觉/文本共同扩散；优化解码器复用已确定 token，减少重复前向。"], evaluation: ["LIBERO 98.1%，LIBERO-Plus 73.0%，说明标准任务接近饱和后，扰动基准仍能区分鲁棒性。", "FR3：水果抓放 97.5%、方块分类 85.5%、堆叠 62.0%、按颜色堆叠 68.5%，平均 78.4%；论文未清楚披露这些百分比对应的总 trial 数。"], comparison: "π0.5、GR00T N1.5、Cosmos Policy、Mimic，以及目标与解码组件消融。", reproducibilityStatus: "部分可复现", implementation: ["披露两阶段训练规模、动作 token、上下文长度、真实任务逐项结果与解码硬件。"], missing: ["完整训练代码、权重与真机 trial 总数未确认公开。"], figureFile: "2609.13053-fig1.png", figureAlt: "Dynin-Robotics 统一世界动作模型目标", figureCaption: "Figure 1 · 同一掩码扩散骨干通过不同上下文与目标覆盖策略、世界建模、目标预测和任务理解。来源：arXiv 原图。",
  },
  {
    title: "UniPart: A Unified Part-centric Framework for Generalizable 3D Manipulation", arxivId: "2609.12898", url: "https://arxiv.org/abs/2609.12898",
    institutions: ["Chinese Academy of Sciences", "Peking University", "Tsinghua University", "Galbot", "BAAI"], signal: "用八百万文本—部件配对训练前馈式 3D 部件分割器，再把开放词汇部件掩码直接用于真机抓取。",
    tags: ["3D Part Segmentation", "Open Vocabulary", "Manipulation"], classification: { research: "表征学习", training: "Pre-training", modalities: ["Point Cloud / 3D", "Mask / Segmentation"], data: "合成 / 仿真数据", platforms: ["机械臂", "灵巧手"] },
    motivation: "开放世界操作需要识别对象的功能部件，但现有 3D 部件数据规模小、类别封闭。", methodSummary: "UniPart 从 16 万多个 Objaverse 资产生成 LangPart-1M，冻结 CLIP 文本特征并在纯 Transformer 中与点 token 相加，实现单次前馈的文本条件部件分割。",
    architecture: "图像—点云预对齐后，N 层 3D Transformer 接收点与文本嵌入；加法融合优于拼接、乘法和 cross-attention。", data: "LangPart-1M 含 8M 文本—部件对；LangPart-4K 由十名标注员复核，并拆为 3K 训练与 1K 评测。",
    experiments: "Objaverse-General、ShapeNet、LangPart-1K，以及 Franka Panda/UR+Shadow Hand、RealSense D415 的 20 个真实物体抓取。", novelty: "LangPart-1K 单视图分割 31.23/33.56，显著高于 FIND3D 10.39/8.97；真实部件分割 90.5%，目标部件抓取 85.0%。",
    strengths: "数据规模、手工复核基准、跨数据集结果和两种末端执行器真机验证相互支撑。", limitations: "真实评测只有 20 个物体，抓取依赖现成规划器，尚未证明复杂闭环策略收益。", transfer: "开放词汇部件表征可以作为 VLA 前端：先稳定定位功能区域，再把动作学习留给策略层。",
    technique: ["多视角一致分割与文本对齐把合成资产扩成大规模部件监督。", "冻结文本编码器并采用 token-level addition，避免复杂融合在小型精标集上过拟合。"], evaluation: ["模型与数据同时替换时分数 47.25；仅换模型 35.27、仅换数据 38.42，说明数据与架构贡献互补。", "20 个真实物体上分割准确率 90.5%、抓取成功率 85.0%；成功定义为抓取落在语言指定部件。"], comparison: "FIND3D、不同数据/模型组合、预训练与融合方式消融。", reproducibilityStatus: "部分可复现", implementation: ["给出数据生成管线、精标协议、网络融合方式和真实硬件。"], missing: ["LangPart-1M 完整分发、训练代码与真机逐物体重复次数需等待公开。"], figureFile: "2609.12898-fig1.png", figureAlt: "UniPart 数据模型与抓取应用概览", figureCaption: "Figure 1 · LangPart-1M 数据生成、UniPart 分割器与真实机器人部件抓取。来源：arXiv 原图。",
  },
  {
    title: "Before the Tipping Point: Shape-Independent Object Property Estimation through Safe Robotic Interaction", arxivId: "2609.12894", url: "https://arxiv.org/abs/2609.12894",
    institutions: ["Worcester Polytechnic Institute"], signal: "让机器人把未知物体推到倾倒阈值之前再撤回，仅靠力矩—角度轨迹估计质量、质心高度与倾倒角。",
    tags: ["System Identification", "Safe Interaction", "Force Torque"], classification: { research: "其他", training: "Test-time Adaptation", modalities: ["Force / Torque", "State / Proprioception"], platforms: ["机械臂", "夹爪"], deployment: "真机部署优化" },
    motivation: "依赖视觉形状或 CAD 的惯性参数估计难处理透明、纹理缺失和未知物体，直接倾倒又可能损坏物体。", methodSummary: "方法执行一次准静态推—撤轨迹，用力矩平衡与视觉角度拟合未知质量和质心高度，并以安全裕度 η 在真正失稳前停止。",
    architecture: "ABB IRB120、腕部六轴 F/T、固定摄像头与 AprilTag；解析模型而非学习网络。", data: "四个物体（盒、心形棱柱、手电筒、显示器），三档安全裕度 0.1/0.5/0.65。",
    experiments: "逐物体比较真实质量、质心高度与倾倒角；另用支点和电子秤验证最佳质心估计。", novelty: "盒子在 η=0.1 时三项相对误差分别 2.618%、0.205%、0.195%，多数配置维持低个位数误差。",
    strengths: "单次安全交互即可估计多个物理参数，且透明物体不依赖外观形状。", limitations: "要求刚体、平面接触、视觉角度和标签；圆弧底手电在低裕度时发生旋转并使模型失效。", transfer: "在操作前主动探测物理参数，可把未知动力学转成可量化的不确定性，而非直接交给策略试错。",
    technique: ["利用推/撤阶段摩擦方向反转产生的力矩差分，消去部分不可观测接触量。", "安全裕度控制逼近失稳点的距离，在信息量与倾倒风险之间显式权衡。"], evaluation: ["四类物体、三档安全裕度均报告质量/质心/倾倒角误差；误差随轨迹更早截断而上升。", "手电筒 η=0.1 的曲面底座引起绕底部旋转，是清晰记录的模型失效案例。"], comparison: "不同安全裕度与真实测量值；论文未提供学习式或视觉形状基线。", reproducibilityStatus: "部分可复现", implementation: ["解析方程、传感器、对象和安全裕度均披露。"], missing: ["逐配置 trial 数、控制代码与无标签姿态估计未公开。"], figureFile: "2609.12894-fig2.png", figureAlt: "机器人安全推压与撤回的完整倾倒试验", figureCaption: "Figure 2 · 机器人逼近倾倒阈值后撤回，并从力矩—角度轨迹估计物理参数。来源：arXiv 原图。",
  },
  {
    title: "SCQ: Sigmoid-Bounded Conservative Q-Learning for Stable Offline-to-Online Robot Reinforcement Learning", arxivId: "2609.12749", url: "https://arxiv.org/abs/2609.12749",
    institutions: ["Wuhan University", "Anhui University"], signal: "把离线保守 Q 学习的熵项限制为有界正值，降低转入在线训练时的梯度方差与价值崩溃。",
    tags: ["Offline-to-Online RL", "Conservative Q", "Real Robot"], classification: { research: "其他", training: "RL", platforms: ["机械臂", "轮式底盘", "Humanoid"], deployment: "真机部署优化" },
    motivation: "离线预训练策略进入在线环境后，标准样本熵项可能放大 Q 梯度的时间波动，导致有限交互预算内不稳定。", methodSummary: "SCQ 在 Cal-QL 基础上使用 sigmoid-bounded positive entropy，并只对 critic 加 LayerNorm，使乐观探索和保守价值估计同时可控。",
    architecture: "actor–critic 不改观测接口；核心是有界熵机制、critic-only LayerNorm 与离线到在线训练日程。", data: "D4RL、视觉控制、one-shot 模仿和五项真实机器人任务；在线预算 20K–150K step。",
    experiments: "真实任务各 10 次最终评测：高精度对齐、抽屉、球到目标、四足 slalom、人形导航踢球。", novelty: "SCQ 在五项真机任务成功 10/10、10/10、6/10、8/10、10/10；VSAC 为 10/10、10/10、2/10、4/10、3/10。",
    strengths: "从梯度诊断到多类基准、消融和五种真机形态形成闭环。", limitations: "真实任务大多偏导航或低维对齐，尚未覆盖接触丰富的多阶段操作；每项仅 10 次最终试验。", transfer: "离线到在线的稳定性可以从目标函数的梯度波动入手，而不只是继续调小学习率。",
    technique: ["sigmoid 把熵贡献变为有界正值，抑制小方差高斯策略产生的极端样本。", "LayerNorm 只放在 critic，避免同时改变 actor 导致探索分布漂移。"], evaluation: ["五项真机总成功 44/50，对比 VSAC 的 29/50；最明显差距来自 humanoid navigation-kick 的 10/10 对 3/10。", "该条作为邻接 RL 例外保留：证据强，但不能据此推出接触操作能力。"], comparison: "Cal-QL、SAC/VSAC、标准熵和归一化位置消融。", reproducibilityStatus: "部分可复现", implementation: ["公开算法公式、预算、示范数和逐任务 10 次结果。"], missing: ["真实机器人训练日志、硬件控制栈与统计置信区间未公开。"], figureFile: "2609.12749-fig2.png", figureAlt: "SCQ 的五项真实机器人训练与部署任务", figureCaption: "Figure 2 · 从机械臂对齐到轮式、四足和人形任务的真实在线评测。来源：arXiv 原图。",
  },
  {
    title: "Breaking the Vision-Action Shortcut: Learning Image-Free Action Priors for Robust Robot Policies", arxivId: "2609.12641", url: "https://arxiv.org/abs/2609.12641",
    institutions: ["University of California, Berkeley"], signal: "先在无图像条件下学习空间目标到动作的先验，再让少量视觉 latent 进入动作专家，迫使策略避免视觉捷径。",
    tags: ["Visual Robustness", "Action Prior", "VLA"], classification: { research: "VLA", training: "Post-training", modalities: ["State / Proprioception"], platforms: ["机械臂", "夹爪"], deployment: "真机部署优化" },
    motivation: "VLA 很容易把训练场景的像素相关性当作动作捷径，在光照、相机和干扰物变化下失败。", methodSummary: "LIT 第一阶段只凭语言、状态和终点 SE(3) 学空间目标动作先验；第二阶段用可学习 latent 读取视觉语义，并用位姿重建头约束视觉信息。",
    architecture: "可插入 π0.5、MolmoAct2、FAST-WAM 和 ImageWAM；视觉只经 latent cross-attention 进入 action expert。", data: "LIBERO 40 任务、LIBERO-Plus 10,030 个扰动实例；真机三任务共 300 条示范。",
    experiments: "LIBERO 每任务 50 次，共 2,000 rollout；真机每任务 ID 25 次，三种 OOD 各 10 次，共 165 次。", novelty: "真机平均 ID 74.7→88.0，光照 53.3→70.0，相机 30.0→46.7，干扰物 50.0→63.3。",
    strengths: "四种架构、万级扰动评测与严格真机 ID/OOD 拆分共同验证机制。", limitations: "真实任务与数据规模仍小，视觉 latent 容量在更复杂环境下是否成为瓶颈未知。", transfer: "视觉鲁棒性不一定来自更强增强；先让策略学会在没有图像时如何运动，再受控补入视觉，能减少捷径。",
    technique: ["Stage 1 用终点位姿作为空间目标学习 image-free action prior。", "Stage 2 用 latent token 和终点位姿辅助头约束视觉信息的路径与内容。"], evaluation: ["MolmoAct2 的完整 LIT 在 OOD 为 71.92；去 Stage 1、去位姿头、直接视觉分别为 68.23、68.86、67.74。", "Transfer Egg 的 ID 52→92、光照 30→90、干扰物 20→90，显示并非只有仿真平均值改善。"], comparison: "四类 VLA/WAM 基线，以及 Stage 1、位姿头和视觉路径消融。", reproducibilityStatus: "部分可复现", implementation: ["披露两阶段目标、四架构适配和每个真实条件的 trial 数。"], missing: ["代码、权重及更大规模真实任务尚未公开。"], figureFile: "2609.12641-fig1.png", figureAlt: "LIT 的无图像动作先验与受控视觉注入", figureCaption: "Figure 1 · 先学习 image-free action prior，再通过少量视觉 latent 进行条件化。来源：arXiv 原图。",
  },
  {
    title: "Online Material Estimation for Material-Conditioned Deformable Object Manipulation", arxivId: "2609.12634", url: "https://arxiv.org/abs/2609.12634",
    institutions: ["National Institute of Advanced Industrial Science and Technology (AIST)"], signal: "从短观测序列在线识别柔性物体材质，再用预测标签条件化扩散策略处理同任务下不同动力学。",
    tags: ["Deformable Object", "Material Estimation", "Diffusion Policy"], classification: { research: "表征学习", training: "BC", modalities: ["Depth / RGB-D", "State / Proprioception"], platforms: ["机械臂", "夹爪"] },
    motivation: "布料和长柔性物体外观相近但动力学不同，单一策略容易把材料差异误当噪声。", methodSummary: "独立材料估计器读取十帧图像与关节状态，输出离散材料标签；扩散策略同时条件化任务和材料，网络不共享权重。",
    architecture: "UR5e、环境 RealSense D405 与腕部 D415；策略预测 16 步、执行 8 步，使用 8-step DDIM。", data: "四种材料、三种槽形任务，共 12 个组合；每组合 40 条成功示范，总计 480 条。",
    experiments: "每策略在 12 个组合各 10 次，共 120 次；另用 120 条 held-out oracle rollout 分析估计混淆。", novelty: "平均成功率：专用策略 41.7%、仅任务 45.8%、oracle 材料 60.0%、在线估计 60.8%。",
    strengths: "固定演示量、清楚的 oracle 上界与逐材料混淆分析让因果解释较可信。", limitations: "只有四个已知离散材料；硅胶在一项任务上估计策略 20% 而 oracle 100%，每格仅 10 次且无显著性检验。", transfer: "动力学属性可先在线估计为紧凑条件变量，再交给策略，而不是要求一个隐空间自己解耦所有材料。",
    technique: ["材料估计和动作策略分开训练，避免策略 loss 反向塑造不可解释的材质标签。", "任务标签与材料标签联合条件化扩散策略，执行时周期性重规划。"], evaluation: ["Estimated 60.8% 与 Oracle 60.0% 接近，优于 Task-only 45.8%，说明在线标签总体有效。", "硅胶 SV 任务的 20% 对 oracle 100% 暴露估计错误会被条件策略放大。"], comparison: "每组合 specialist、task-only、oracle material 与 estimated material。", reproducibilityStatus: "部分可复现", implementation: ["硬件、数据矩阵、扩散步长、epoch 和每格 10 次试验均披露。"], missing: ["代码、示范数据与未见材料连续属性评测未公开。"], figureFile: "2609.12634-fig1.png", figureAlt: "在线材料估计和材料条件扩散策略框架", figureCaption: "Figure 1 · 独立估计材料标签，并与任务标签共同条件化扩散策略。来源：arXiv 原图。",
  },
  {
    title: "STAR: Scalable Tactile-Aware Robot Learning for Dexterous Manipulation", arxivId: "2609.12549", url: "https://arxiv.org/abs/2609.12549",
    institutions: ["Shanghai AI Laboratory", "Shanghai Jiao Tong University"], signal: "在 200 小时双手数据上联合掩码预训练视觉与触觉，并把稀疏激活 taxel 压缩成可扩展 token。",
    tags: ["Tactile Pretraining", "Dexterous Manipulation", "Bimanual"], classification: { research: "VLA", training: "Pre-training", modalities: ["Tactile"], platforms: ["灵巧手", "机械臂"] },
    motivation: "高分辨触觉对接触任务关键，但原始 taxel 稠密、激活稀疏，直接拼入 VLA 会浪费上下文。", methodSummary: "STAR 以 75% 掩码联合预测 RGB/触觉，保留激活空间 token 与每手全局 token，并监督多个未来触觉时间点。",
    architecture: "双臂双灵巧手、268 个 taxel；触觉每帧仅约 35% 激活，未来监督覆盖 10/20/30/40/50 帧。", data: "200 小时、10,576 条轨迹、65 个任务，其中 69.5% 为灵巧操作。",
    experiments: "四项真实任务各 100 条后训练轨迹；每方法每任务 20 次，共 80 次，测试预训练未见物体。", novelty: "平均成功率 0.61、任务完成率 0.79；π0.5 为 0.28/0.44，未用 STAR 的 dexterous π0.5 为 0.44/0.61。",
    strengths: "规模化真实触觉数据、完整组件消融和未见物体试验直接支撑触觉预训练价值。", limitations: "数据仍小于主流夹爪语料，边缘接触覆盖不足，论文明确指出这会伤害多物体抓取。", transfer: "触觉 token 化应尊重稀疏接触结构；全局 token 保留整体力态，局部 token 保留接触位置。",
    technique: ["VTP 联合重建 RGB 与触觉掩码，学习跨模态接触表征。", "稀疏局部 token、全局 token 与多时间点未来触觉监督分别覆盖位置、整体状态和接触演化。"], evaluation: ["四任务成功率为 0.65、0.55、0.85、0.40；平均 0.61。", "完整模型在两项消融任务为 0.60/0.78；去 STAR 为 0.35/0.46，去 VTP 为 0.38/0.45，去未来触觉为 0.53/0.69。"], comparison: "π0.5、π0.5-Dex 与预训练/表示/未来预测/触觉输入消融。", reproducibilityStatus: "部分可复现", implementation: ["披露数据小时、轨迹/任务量、taxel 数、掩码率和每任务 20 次协议。"], missing: ["完整数据、触觉硬件标定与训练权重未确认公开。"], figureFile: "2609.12549-fig3.png", figureAlt: "STAR 视觉触觉预训练与稀疏触觉 token 管线", figureCaption: "Figure 3 · 视觉—触觉掩码预训练、稀疏全局表示和未来触觉监督。来源：arXiv 原图。",
  },
  {
    title: "ArtManip: Zero-Shot Dexterous Manipulation of Articulated Objects via Procedural Simulation", arxivId: "2609.12498", url: "https://arxiv.org/abs/2609.12498",
    institutions: ["ETH Zurich"], signal: "用程序化关节物体、功能接触模板和多样抓姿训练类别策略，零样本迁移到真实刀、打火机、订书机和夹子。",
    tags: ["Dexterous Hand", "Procedural Simulation", "Zero-Shot"], classification: { research: "其他", training: "RL", data: "合成 / 仿真数据", platforms: ["灵巧手"], deployment: "Sim2Real" },
    motivation: "真实关节物体形状差异大，逐实例采集接触策略昂贵；纯几何随机化又常生成不可用抓姿。", methodSummary: "ArtManip 程序化生成单自由度两连杆物体，以允许/禁止接触区域构造功能抓姿，再把特权教师蒸馏到仅依赖本体历史的学生。",
    architecture: "22-DoF Sharpa 灵巧手；仿真 120 Hz、控制 30 Hz，策略以本体历史和初始观测预测特权 latent。", data: "刀、打火机、订书机、夹子四类；每类 30 个训练实例、5 个仿真未见实例，真实 12 个未见物体。",
    experiments: "真实每物体取 5 个抓姿、每抓姿 5 次：12×5×5=300 次；由实验员把手初始化到仿真抓姿。", novelty: "真实 257/300 成功，平均 85.7%；四类分别 69.3%、80.0%、93.3%、100%，实例覆盖 100%。",
    strengths: "300 次真实试验、类别级未见对象和多抓姿覆盖比单一演示更有说服力。", limitations: "假设已有功能抓姿并手工初始化，只支持两连杆单自由度；纯本体策略在失去接触后不能重定位。", transfer: "程序化资产的关键不是外观数量，而是把功能接触约束编码进生成过程。",
    technique: ["接触模板约束允许与禁止的指尖区域，避免随机抓姿只在几何上可行。", "特权教师看对象状态，学生从本体历史回归 latent，从而保持部署端传感简洁。"], evaluation: ["300 次真机中 257 次完成完整开合循环；真实实例覆盖 100%、抓姿覆盖 88.3%。", "刀类未见仿真从单实例训练 29.4% 随程序化多样性提升到 85.0%。"], comparison: "不同程序化实例数量、教师/学生与四对象类别的 sim/real 结果。", reproducibilityStatus: "部分可复现", implementation: ["对象类别、训练实例数、控制频率、真实抓姿与 trial 总数披露完整。"], missing: ["程序化资产生成器、真实初始化自动化和多自由度物体评测未公开。"], figureFile: "2609.12498-fig1.png", figureAlt: "ArtManip 程序化仿真到真实关节物体零样本操作", figureCaption: "Figure 1 · 程序化物体与功能抓姿训练类别策略，并零样本部署到真实物体。来源：arXiv 原图。",
  },
  {
    title: "FoldNet++: Large-Scale Multi-Embodiment Sim-to-Real Learning for Garment Folding", arxivId: "2609.12433", url: "https://arxiv.org/abs/2609.12433",
    institutions: ["Peking University", "Galbot"], signal: "用 FEM 仿真、六种机器人和 12 万条折衣轨迹训练统一策略，再迁移到已见与未见本体。",
    tags: ["Garment Folding", "Multi-Embodiment", "Sim2Real"], classification: { research: "VLA", training: "Pre-training", data: "合成 / 仿真数据", platforms: ["机械臂", "夹爪"], deployment: "跨本体迁移" },
    motivation: "布料真机采集慢且不稳定，单本体仿真策略又难迁移到不同几何和控制接口。", methodSummary: "FoldNet++ 在 FEM 仿真中用状态规则生成展开与折叠示范，随机化服装、相机、机器人基座与环境，并以实时 chunking 执行统一策略。",
    architecture: "三视角、动作、本体和子任务标签；六种机器人，每种 20K episode，0.2 秒步长、每轨迹约 300 步。", data: "1,000 件 T-shirt、1,000 套桌面纹理/HDRI、六本体，共 120K episode，80/20 train/test。",
    experiments: "真实 Galbot 作为 ID、本体 ARX 作为 OOD；另用 1K 条遥操作示范比较全量微调与 grasp-segment 微调。", novelty: "论文报告端到端真实折叠成功率超过 90%；在 10 次微调试验中纯仿真 9/10、均匀全量微调 6/10、抓取段微调 9/10。",
    strengths: "数据规模、跨本体与真实微调反例说明‘加真机数据’并非自动变好。", limitations: "只覆盖 T-shirt 与单一折法；袖子、拉链、纽扣和其他衣物拓扑未验证。", transfer: "sim-to-real 微调应瞄准失败段而非均匀覆盖整条轨迹，否则少量真机数据可能破坏已学好的阶段。",
    technique: ["FEM、状态规则和大范围域随机化生成多本体长程布料轨迹。", "实时 chunking 与 grasp-segment fine-tuning 分别缓解长执行漂移和真实抓取差异。"], evaluation: ["真实评测同时覆盖 Galbot ID 和 ARX OOD；正文把端到端成功概括为超过 90%，精确柱状值仅见图中。", "1K 遥操作微调：纯仿真与抓取段微调均 9/10，但后者平均步数 626→458、失败抓取 2.2→1.8；全量微调反而 6/10。"], comparison: "不同本体、仅仿真、全量微调与抓取段微调。", reproducibilityStatus: "部分可复现", implementation: ["披露资产量、六本体 episode 数、步长、随机化和微调样本量。"], missing: ["数据/代码、主实验逐条件 trial 数和图表原始数值未公开。"], figureFile: "2609.12433-fig1.png", figureAlt: "FoldNet++ 大规模多本体仿真到真实折衣系统", figureCaption: "Figure 1 · 六种机器人、一千件服装和 12 万条 FEM 仿真轨迹组成的训练与部署流程。来源：arXiv 原图。",
  },
  {
    title: "DATAFARM: Distribution-Aligned Trajectory Augmentation for Few-Shot Robot Manipulation", arxivId: "2609.12316", url: "https://arxiv.org/abs/2609.12316",
    institutions: ["Stanford University", "Princeton University"], signal: "让 TAMP 合成轨迹在关节配置、轨迹风格和执行时序上对齐预训练数据分布，避免少样本后训练发生灾难遗忘。",
    tags: ["TAMP", "Few-Shot Adaptation", "Distribution Alignment"], classification: { research: "VLA", training: "Post-training", data: "数据增强", platforms: ["机械臂", "夹爪"], deployment: "真机部署优化" },
    motivation: "TAMP 能快速生成新任务示范，但轨迹几何、风格和速度与 VLA 预训练数据不匹配，会让后训练策略遗忘原能力。", methodSummary: "DATAFARM 从参考数据拟合关节配置密度与轨迹 latent 分布，对规划轨迹筛选/优化，再按参考速度重定时。",
    architecture: "DROID Franka、Robotiq 夹爪、ZED 相机与 π0.5-DROID；每个目标任务独立微调 checkpoint。", data: "三项目标任务各 20 条 DATAFARM 示范，并在一个未见布料折叠任务上检查原能力保持。",
    experiments: "每目标任务 20 个新场景试验；成功要求全部子目标完成，同时报告 7 子目标进度；折叠 OOD 另行评测。", novelty: "三任务平均成功：预训练 1.7%、原始 TAMP 8.3%、DATAFARM 56.7%、人类示范 61.7%；OOD 保持 85% 对基础模型 90%。",
    strengths: "同时检查新任务适配与旧能力保持，并用三项分布对齐消融定位收益来源。", limitations: "只验证一个 VLA、一个机器人和三个准静态 pick-place 任务，且需要访问参考预训练分布。", transfer: "合成数据是否有用取决于是否像模型见过的数据；动作正确但统计风格异常，仍会伤害后训练。",
    technique: ["用 GMM 对齐关节配置，用轨迹 encoder 对齐风格 latent，再按参考数据重定时。", "分布过滤发生在数据生成层，不改 VLA 架构，因此能复用现成 checkpoint。"], evaluation: ["20 条示范时 DATAFARM 平均 56.7%，接近人类 61.7%，远高于原始 TAMP 8.3%。", "去关节、去风格、去时序对齐分别降至 23.3%、15.0%、0%；几何任务扩到 80 条可达 85%。"], comparison: "预训练、原始 TAMP、人类示范、DATAFARM 及三项对齐消融。", reproducibilityStatus: "部分可复现", implementation: ["硬件、基座模型、20 条示范/20 次评测和三项对齐定义清楚。"], missing: ["规划器配置、参考数据访问方式与完整代码未确认公开。"], figureFile: "2609.12316-fig2.png", figureAlt: "DATAFARM 三层分布对齐与少样本后训练流程", figureCaption: "Figure 2 · 对关节配置、轨迹 latent 和执行时序进行分布对齐，再用于 VLA 后训练。来源：arXiv 原图。",
  },
];

export const paperDaily20260914 = entries.map(makePaper);
