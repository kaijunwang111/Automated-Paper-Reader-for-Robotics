import type { Paper } from "./site-data";

const paperCandidates20260801: Paper[] = [
  {
    rank: 1,
    title: "τ0-VLA: a Hierarchical Robot Foundation Model with World-Model-Guided Test-Time Computation",
    arxivId: "tau0-vla",
    source: "official",
    url: "https://tau0-vla.github.io/tau0-vla.pdf",
    institutions: ["Shanghai Innovation Institute", "Agibot Finch", "The Chinese University of Hong Kong"],
    signal: "在长时任务的子任务边界按不确定性分配推理预算，用世界模型预测候选后果后再决定下一步",
    tags: ["Hierarchical VLA", "Test-time Computation", "Execution Memory"],
    classification: { research: "Subtask", training: "Post-training", data: "跨本体数据", platforms: ["Humanoid", "轮式底盘", "机械臂", "夹爪"], deployment: "跨本体迁移" },
    detailAttributes: { memoryImplementation: "可纠正的文本 execution memory", memoryHorizon: "单个长时 episode 内跨 13–25 个步骤持续更新" },
    resources: [
      { label: "项目页", url: "https://tau0-vla.github.io/" },
      { label: "GitHub", url: "https://github.com/sii-research/tau-0-vla" },
      { label: "模型", url: "https://huggingface.co/sii-research/tau-0-vla" },
    ],
    motivation: "长时任务中的主要错误不一定来自低层动作，而可能来自在错误阶段选择了错误子任务；常见分层 VLA 又通常用一次前向直接提交决定。",
    methodSummary: "高层策略维护 execution memory；置信度足够时直接输出子任务，不确定时由 proposal model 生成候选、world model 预测完成后的图像、value model 评分，并通过 beam search 与 reflection 决定最终子任务。",
    architecture: "高层使用 Qwen3.5-9B 系列的 proposal/value/reflection 模块和 Step1X-Edit 初始化的 world model；低层由 Qwen3.5-2B 视觉语言 backbone 与 MoT action expert 组成，通过统一 40 维状态/动作接口控制固定、双臂和移动平台。",
    optimization: "低层先做 knowledge-isolated 多模态与机器人数据协同训练，再端到端协同训练并面向目标平台后训练；高层用任务阶段、可执行子任务和分段示范自动构造监督，并加入 memory perturbation 学习进度纠正。",
    data: "低层训练使用 40,115 小时异构真机数据，包含人工示范、自主 policy rollout 和 UMI 记录，覆盖固定、移动与双臂本体；同时混合视觉语言、空间、深度和机器人感知数据。",
    experiments: "四项 13–25 步长时真机任务每个方法-任务组合 10 次；分层 Plan Once 的平均成功率为 45.0%，直接执行为 27.5%。TTC 在三项闭环任务上分别把成功次数从 5/10、6/10、5/10 提至 7/10、9/10、7/10。",
    novelty: "相对一次性高层预测或只做一步 Best-of-N，它在提交子任务前递归预测多条候选路径的物理后果，并把真实执行结果重新写回可纠正 memory。",
    experimentDetails: [
      {
        title: "分层执行与长时真机任务",
        setup: "AGIBOT G1 上的 Clean Room、Prepare Ingredients、Tomato and Egg Stir Fry 与 Make Milk Tea，分别包含 25、14、22、13 个里程碑；每格 10 次独立真机试验。",
        comparisons: "直接执行与分层 Plan Once 固定相同低层 policy、观察和动作接口；同时列出 GR00T N1.7、LingBot-VLA 与 π0.5 的直接执行结果。",
        results: ["τ0-VLA 直接执行平均成功率 27.5%、进度 80.10%；分层 Plan Once 为 45.0%、87.85%。", "分层版本在 Stir Fry 上从 0/10 提升到 4/10，在 Prepare Ingredients 上从 2/10 提升到 4/10。", "四项任务的最长试验时限为 10–20 分钟，成功必须完成全部必需里程碑。"],
        evidenceNote: "Plan Once 对照用于隔离显式子任务与进度记忆的作用；该组实验未启用 beam search。",
      },
      {
        title: "世界模型引导的测试时计算",
        setup: "在 Make Milk Tea、Clean Room 和 Book Organization 上比较 open-loop next-subtask accuracy 与闭环真机结果；闭环每格 10 次。",
        comparisons: "Plan Once、使用同一 world/value model 的一步 Best-of-N，以及多步 beam expansion + reflection 的 TTC。",
        results: ["OOD Book Organization 的 next-subtask accuracy：50.0%（Plan Once）、57.5%（Best-of-N）、74.0%（TTC）。", "闭环 Milk Tea：5/10→7/10；Book Organization：6/10→9/10；Clean Room：5/10→7/10。", "增加计算量后 accuracy 先快速上升再趋于饱和，支持按置信度选择性触发。"],
        evidenceNote: "TTC 的收益在固定低层 policy 下验证；每格 10 次仍不足以精确估计较小的成功率差异。",
      },
    ],
    reproducibilityDetails: {
      status: "资源较完整",
      verifiedResources: ["官方 GitHub 已公开训练、部署与 open-loop evaluation 代码，Hugging Face 提供模型权重，并附 AgiBot World 示例数据和 post-training 配置。"],
      implementation: ["官方参考环境为 Python 3.11、CUDA 12.8、PyTorch 2.7.1；低层 action horizon H=30，推理使用 10 次均匀 Euler 更新；统一动作接口通过 mask 屏蔽不同本体未使用的维度。"],
      missing: ["完整 40,115 小时训练语料没有随仓库公开；公开 v1 serving 仅支持 joint-control checkpoint，EEF serving 尚未提供。"],
    },
    deepDive: {
      lead: "τ0-VLA 把子任务选择从一次分类变成可按难度扩展预算的决策过程，并用执行后的真实观察持续校正进度记录。",
      sections: [
        { title: "高层决策闭环", paragraphs: ["proposal model 根据任务、当前多视角观察、上一子任务与 execution memory 生成直接候选，并用 token confidence 决定走快速路径还是 TTC 路径。", "TTC 对每条保留分支生成候选子任务，world model 预测终止图像，value model 以全局任务、候选和预测结果评分；Top-B 分支递归展开到深度 D，reflection model 最终提交子任务。搜索内部 memory 只属于各自分支，不覆盖真实执行 memory。"] },
        { title: "低层执行与跨本体接口", paragraphs: ["低层 policy 接收多视角 RGB、本体状态、子任务和 embodiment/control metadata，MoT action expert 用 conditional flow matching 生成 action chunk。", "40 维接口覆盖双臂末端位姿、夹爪、腰部、底盘速度和双臂关节；不同机器人使用状态与动作 mask 激活可用槽位。AGIBOT G1、ARX AC One 与双 Franka 平台据此共享接口。"] },
      ],
      equations: [{ name: "候选后果预测与评分", expression: "ô = W(õ, z),   v = V(ℓ, z, ô)", explanation: "world model W 根据当前或分支预测图像 õ 与候选子任务 z 生成终止图像 ô；value model V 再根据全局任务 ℓ、候选与预测后果输出分支分数 v。" }],
      experimentReading: ["Plan Once 与直接执行的差异来自是否显式提供有界子任务和进度记忆；TTC 对照则进一步固定高层输入，只改变决策时推理过程。", "OOD Book Organization 与三项闭环试验共同表明，next-subtask accuracy 的提升能够传递到实际执行，但每格 10 次限制了统计精度。"],
      reflections: [],
    },
    strengths: "同一低层 policy 下分别验证层级接口、memory、TTC 与跨本体执行，并公开了代码、权重和后训练示例。",
    limitations: "每个真机条件仅 10 次；完整预训练数据未公开，45.0% 的长时任务平均成功率也说明接触执行与高层决策仍有明显失败空间。",
    transfer: "可借鉴的核心是把 subtask 作为低频推理接口：只在不确定边界调用世界模型搜索，常规阶段继续由高频 VLA 执行。",
    figures: [{ src: "/report-assets/2026-08-01/tau0-vla-overview.png", alt: "τ0-VLA 的高层 execution memory、世界模型引导搜索和低层 MoT VLA 执行架构", caption: "Figure 2 · τ0-VLA 分层架构与 world-model-guided test-time computation。图片来自官方论文与项目页。" }],
  },
  {
    rank: 2,
    title: "HiFi-UMI: Learning Deployable Manipulation Policies from High-Fidelity UMI Data Alone",
    arxivId: "2607.25895",
    url: "https://arxiv.org/abs/2607.25895",
    institutions: ["Simple AI"],
    signal: "把高保真、无机器人 UMI 数据从预训练来源推进为可直接部署的后训练数据",
    tags: ["UMI", "Cross-embodiment Data", "VLA / WAM"],
    classification: { research: "VLA", training: "Post-training", data: "UMI / Ego / Human Video", platforms: ["机械臂", "夹爪"], deployment: "跨本体迁移" },
    resources: [{ label: "项目页", url: "https://cloud.simpleai.tech/simple-world-lab/hifi-umi/" }],
    motivation: "机器人自由采集易扩展，但轨迹漂移、双手相对位姿误差和异步传感长期迫使方法在后训练阶段加入真机数据。",
    methodSummary: "头戴式离线双目惯性 SLAM、原生双夹爪相对位姿、微秒级 GPIO 同步和每手双广角相机构成高保真 UMI；同一数据引擎完成重建、仿真回放和自动质检。",
    architecture: "采集端产生六视角同步轨迹，数据端重建并筛除无效 episode；策略端分别在 StarVLA-QwenPI、OpenPI-π0.5 与 LingBot-VA 上进行纯 UMI 后训练。",
    optimization: "主结论属于 Post-training；另用 4,000 小时 HiFi-UMI 做大规模预训练，再在相同任务数据量下比较初始化。",
    data: "每任务 3,200 条、约 10–20 小时 UMI 示范，对照为约 300 条、3–7 小时真机遥操作；发布 HiFi-UMI-2K 的 2,000 小时子集。",
    experiments: "四项双臂真机任务、三种 backbone、每个任务-策略组合 40 次；UMI 与遥操作聚合差分别为 -2.5、+3.1、-0.6 个百分点。",
    novelty: "区别于缩小真机数据占比的路线，这项工作测试的是能否完全移除目标任务的真机后训练锚点。",
    experimentDetails: [{ title: "三 backbone 真机对照", setup: "Stain Wiping、Shirt Folding、Remote Insertion、Produce Sorting；对象随机放置，UMI 数据来自不同场景。", comparisons: "每个 backbone 内固定初始化、优化、动作表示与部署栈，只切换 HiFi-UMI 或同场景真机遥操作数据。", results: ["StarVLA-QwenPI：51.3% 对 53.8%。", "OpenPI-π0.5：77.5% 对 74.4%。", "LingBot-VA：56.9% 对 57.5%；总计 960 次真机 rollout。"], evidenceNote: "UMI 数量约是真机示范十倍，结论是 practical pipeline parity，不是等样本效率。" }],
    reproducibilityDetails: { status: "资源较完整", verifiedResources: ["项目页与 HiFi-UMI-2K 数据链接已在论文中确认。"], implementation: ["正文披露同步、视场、重建精度、训练数据量和 rollout 协议。"], missing: ["未逐因素消融轨迹精度、同步、视场与相对位姿的边际贡献。"] },
    deepDive: { lead: "论文最强的证据不是单项最高分，而是三个不同 VLA/WAM backbone 在控制变量下都没有因移除真机后训练而系统性下降。", sections: [{ title: "从采集保真度到部署", paragraphs: ["离线双目惯性优化把长时漂移与低纹理失败留到采集后修复，GPIO 则避免动作、相机和夹爪状态错位。", "自动仿真回放把可执行性加入数据质检，使重建成功并不等同于可部署轨迹。"] }], experimentReading: ["每格 40 次意味着 2.5 个百分点只对应一次成功，论文据此把小差异解释为近似持平。", "预训练收益只在 StarVLA-QwenPI 上验证，不能外推到全部 backbone。"], reflections: ["后续最关键的实验是等采集成本、等 episode 数和逐项降质三组对照。"] },
    strengths: "数据生产、三 backbone 控制变量、960 次真机测试和数据量消融形成完整证据链。",
    limitations: "后训练对照不等样本；任务均为桌面双臂，跨本体范围和保真因素贡献仍未分解。",
    transfer: "适合把 UMI 视为部署级数据产品，并用回放有效性而非单纯重建误差做数据筛选。",
    figures: [{ src: "/report-assets/2026-08-01/2607.25895-overview.png", alt: "HiFi-UMI 从高保真采集、数据引擎到 VLA 与 WAM 真机部署的完整流程", caption: "Figure 1 · HiFi-UMI 数据生产与零真机后训练流程。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 2, title: "DC-WAM: Dynamic-Centric Visual Supervision and Reasoning for World-Action Models", arxivId: "2607.25918", url: "https://arxiv.org/abs/2607.25918", institutions: ["Tsinghua University", "Dense-AI", "University of Michigan"], signal: "让 WAM 的视频分支优先学习交互动态，而不是追求背景和纹理重建", tags: ["World-Action Model", "Dynamics", "OOD"],
    classification: { research: "WAM", training: "BC", modalities: ["Mask / Segmentation"], platforms: ["机械臂", "夹爪"] },
    motivation: "RGB future prediction 容易把容量耗在光照、纹理和背景上，PSNR 高并不保证动作更好。", methodSummary: "时间差 flow matching 提供稠密变化监督，轨迹引导权重突出夹爪、物体与接触区，DynaRoute 再把逐 token 动态相关性转成视觉注意偏置。", architecture: "在 FastWAM 的 RGB 视频分支上加入 dense/sparse 动态目标与 key-side attention bias；部署时只保留 action path，不需要 tracker 或动态图。", optimization: "2,000 条 LIBERO clean 示范训练；真机每任务 100 条示范，均为 BC/WAM 联合训练。", data: "LIBERO 与 LIBERO-Plus；AgileX Piper 双臂三项长时任务，每项 100 条成功示范。", experiments: "真机每任务 × clean/light/background 组合各 100 次；DC-WAM 在九个条件均优于匹配的 FastWAM-AC。", novelty: "把视觉生成质量与控制效用明确拆开，并用受控路由和 stop-gradient 消融定位视觉监督如何影响动作。",
    experimentDetails: [{ title: "外观扰动与真机长时操作", setup: "堆三只碗、把盘子放上架、开篮放土豆再关篮；clean、聚光灯和背景色块三条件。", comparisons: "FastWAM-AC 与 DC-WAM 使用相同 Wan2.2、示范、动作空间和评估。", results: ["LIBERO-Plus 平均 60.9%，FastWAM-AC 为 53.8%。", "Pile-Plates 在光照扰动下为 71% 对 41%，背景扰动为 69% 对 46%。", "动态监督与 DynaRoute 消融分别下降，action-query routing 明显劣于 key-side routing。"], evidenceNote: "扰动主要是外观级；尚未覆盖几何、动力学或严重遮挡变化。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["arXiv 正文给出训练目标、匹配基线和完整表格。"], implementation: ["tracker 动态图仅用于离线训练监督；部署不增加输入模块。"], missing: ["未确认代码与权重公开状态。"] },
    deepDive: { lead: "DC-WAM 的核心判断是：可控未来的表示价值高于可观看未来的像素质量。", sections: [{ title: "动态中心的信息流", paragraphs: ["稠密时间差覆盖全局变化，稀疏 tracker 权重集中到交互区，两者共同改变视频分支的训练梯度。", "DynaRoute 把相关性加到视觉 key，避免直接扰动 action query；stop-gradient 结果说明视觉目标确实沿共享计算图影响动作学习。"] }], experimentReading: ["PSNR 与 success 不单调，是反对外观重建代理指标的直接证据。", "100 次/格使 8–30 点真机差异比常见小样本更可信。"], reflections: ["可进一步把接触事件、失败恢复和物体状态变化作为动态监督，而不是依赖外部 tracker。"] },
    strengths: "匹配基线、九格真机 OOD、结构消融和梯度路径审计都很完整。", limitations: "只验证外观扰动和一个双臂平台；动态图质量依赖离线 tracker。", transfer: "可将视频分支目标从像素 PSNR 改为 interaction-change token，并在 action path 上验证因果贡献。", figures: [{ src: "/report-assets/2026-08-01/2607.25918-overview.png", alt: "DC-WAM 的稠密与稀疏动态监督、DynaRoute 和训练目标结构", caption: "Figure 2 · DC-WAM 动态中心监督与路由框架。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 3, title: "πR²: Reactive Real-time Flow Policies", arxivId: "2607.26055", url: "https://arxiv.org/abs/2607.26055", institutions: ["Carnegie Mellon University"], signal: "用快慢条件通道和延迟自适应 flow schedule 把大策略闭环频率提高到 25 Hz", tags: ["Flow Policy", "Reactive Control", "Latency"], classification: { research: "VLA", training: "Post-training", modalities: ["State / Proprioception", "Force / Torque"], platforms: ["机械臂", "灵巧手"], deployment: "真机部署优化" }, resources: [{ label: "项目页", url: "https://pi-r2-flow.github.io/" }],
    motivation: "action chunk 在执行期间开环，大 backbone 和多步去噪又让频繁重规划不可行。", methodSummary: "视觉语言作为异步慢通道，本体作为每 tick 更新的快通道；把正在执行的动作作为 inpainting 条件，并按实测延迟调整逐位置噪声。", architecture: "GR00T-N1.7 backbone + proprioceptive diffusion forcing；每次调用只生成一个可立即执行的动作，视觉特征异步刷新。", optimization: "从预训练 GR00T-N1.7 后训练；四项任务分别用 200/300/300/100 条遥操作示范。", data: "xArm6 + XHand，包含 Don't Spill、Tidy Up Book、Insert Box、Catch Book。", experiments: "每任务每方法 20 次，πR² 在全部成功率和阶段进度指标上优于同步、naive async 与 train-time RTC。", novelty: "不是压缩 backbone，而是重新设计 chunk 内条件更新和延迟契约。",
    experimentDetails: [{ title: "接触与动态反应", setup: "25 Hz 采集和部署，RTX A5000；动作延迟约 1–2 tick，基线约 4–5 tick。", comparisons: "相同 GR00T 初始化与预算下的同步 flow、naive asynchronous + temporal ensemble、train-time RTC。", results: ["Don't Spill 10/20，最强基线 9/20。", "Insert Box 16/20，最强基线 10/20；Catch Book 11/20，最强基线 5/20。", "Tidy Up Book 的阶段进度为 24/40，最强基线 18/40。"], evidenceNote: "每格 20 次，适合判断大差异；小于 10 点的差异仍不稳定。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["项目页可核验。"], implementation: ["论文明确延迟 tick、控制频率、示范数和 fast/slow condition。"], missing: ["未确认完整训练代码、权重与硬件同步实现已公开。"] }, deepDive: { lead: "πR² 把延迟当作策略输入契约的一部分，而不是部署后的系统补丁。", sections: [{ title: "为什么本体需要快通道", paragraphs: ["视觉适合提供较慢的场景和目标指引，接触后的动作修正却依赖最新关节、力矩与指尖力。", "in-flight action 进入条件后，新预测可在不产生 chunk 边界跳变的情况下覆盖陈旧计划。"] }], experimentReading: ["最大收益出现在 Catch Book 与 Insert Box，和实时反应假设一致。", "真实平台仍依赖 A5000，不等同于低功耗端侧部署。"], reflections: ["同一思路可用于把 force event 放入每 tick 快通道，而让 VLM 只异步更新语义。"] }, strengths: "训练预算匹配，任务确实要求快速反应，并报告成功与部分进度。", limitations: "视觉仍可能陈旧，外部感知和通信延迟未解决，样本量为 20 次/格。", transfer: "适合改造 VLA action chunk 的执行器，使本体与力觉能在 chunk 内持续闭环。", figures: [{ src: "/report-assets/2026-08-01/2607.26055-overview.png", alt: "πR2 的逐位置扩散噪声和延迟自适应动作前缀", caption: "Figure 1 · πR² 延迟自适应 diffusion forcing。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 4, title: "TurboVLA: Real-Time Vision-Language-Action Model at 32 Hz on an RTX 4090 with <1 GB VRAM", arxivId: "2607.27205", url: "https://arxiv.org/abs/2607.27205", institutions: ["Huazhong University of Science and Technology", "Huawei Technologies"], signal: "用直接 V+L→A 交互替代 LLM 中心执行路径", tags: ["Efficient VLA", "32 Hz", "Low VRAM"], classification: { research: "VLA", training: "BC", platforms: ["机械臂", "夹爪"], deployment: "真机部署优化" }, resources: [{ label: "GitHub", url: "https://github.com/H-EmbodVis/TurboVLA" }, { label: "项目页", url: "https://H-EmbodVis.github.io/TurboVLA" }],
    motivation: "LLM-centered VLA 每次调用都让视觉先进入大语言模型表示空间，造成参数、显存和延迟负担。", methodSummary: "DINOv3 与轻量文本编码器独立编码视觉和指令，双向 cross-attention 直接交换信息，紧凑 action decoder 生成连续 chunk。", architecture: "0.2B 单臂配置，视觉-语言交互层输出 action-ready features，再与 robot state 一起进入 chunk decoder。", optimization: "LIBERO 无额外 embodied pretraining；真机从 LIBERO checkpoint 用四任务各 65 条示范微调 12.5k steps。", data: "LIBERO、RoboTwin2.0 的 50 个双臂任务，以及 AgileX Piper 四项真机任务。", experiments: "RTX 4090 上 31.2 ms、0.9 GB；真机每任务 40 次，成功率 92.5%、80%、90%、87.5%，均高于同协议 π0.5。", novelty: "效率来自移除执行期 LLM 中心瓶颈，而不是只缩短 action decoder。",
    experimentDetails: [{ title: "能力-效率联合评测", setup: "LIBERO 2,000 次 rollout、RoboTwin 50×100 次 clean rollout、AgileX Piper 四任务各 40 次。", comparisons: "官方实现统一在 RTX 4090 batch 1 测延迟/显存；真机与 π0.5 同数据同协议。", results: ["LIBERO 平均 97.7%，31.2 ms、0.9 GB、0.2B 参数。", "RoboTwin 平均 60.2%，π0.5 为 57.0%。", "四项真机成功率均为 80% 以上。"], evidenceNote: "RoboTwin 只用 clean 数据；真机平台算力并非嵌入式设备。" }],
    reproducibilityDetails: { status: "资源较完整", verifiedResources: ["GitHub 与项目页已在论文首页确认。"], implementation: ["公开模型规模、交互层、chunk 长度、训练步数和评估协议。"], missing: ["未给端侧低功耗 GPU 的能耗与热约束。"] }, deepDive: { lead: "TurboVLA 的结果说明执行层语言条件并不必然需要生成式 LLM 全程在线。", sections: [{ title: "直接跨模态交互", paragraphs: ["instruction-to-visual 与 visual-to-instruction cross-attention 交替，使语言约束视觉、视觉反向修正指令表征。", "融合后的 token 不再进入大语言模型，而是直接变成动作条件，因此参数、显存和 latency 同时下降。"] }], experimentReading: ["真机对照保持数据一致，效率指标也用同一 GPU 重测。", "开放词汇推理能力没有被独立验证，不能把 execution success 等同于通用语言理解。"], reflections: ["适合把 LLM 降为低频规划器，把轻量 cross-modal policy 作为高频执行层。"] }, strengths: "规模、延迟、显存、仿真和真机结果同时报告。", limitations: "端侧能耗未测，语言泛化和 OOD 真机范围有限。", transfer: "可将大 VLA 拆成低频语义模块与高频 V+L→A 执行器。", figures: [{ src: "/report-assets/2026-08-01/2607.27205-overview.png", alt: "TurboVLA 的视觉语言双向交互和 action chunk decoder", caption: "Figure 3 · TurboVLA 直接 V+L→A 架构。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 5, title: "SAM3D-Guided Object-Centric Representation Alignment for Vision-Language-Action Models", arxivId: "2607.25912", url: "https://arxiv.org/abs/2607.25912", institutions: ["University of Hong Kong", "Shenzhen Institutes of Advanced Technology, CAS", "Huazhong University of Science and Technology", "Beihang University", "Infiforce"], signal: "训练时用目标物体 3D teacher 对齐 VLA，部署仍只输入 RGB 与语言", tags: ["3D Alignment", "Object-centric", "VLA"], classification: { research: "表征学习", training: "Post-training", modalities: ["Point Cloud / 3D", "Mask / Segmentation"], platforms: ["机械臂", "轮式底盘", "夹爪"] },
    motivation: "2D VLA 在遮挡、尺度和精确空间关系下容易丢失目标物体的 3D 结构。", methodSummary: "LLM 将长指令拆成子任务，检测与 SAM2 生成目标 mask，冻结 SAM3D teacher 提取 object-centric 3D feature 并对齐中间视觉 token。", architecture: "3D teacher、mask 与子任务只存在训练期；部署恢复 π0 的 RGB-language-action 路径。", optimization: "π0 supervised fine-tuning，加中间表示对齐损失。", data: "LIBERO、CALVIN；Piper-X cooking、flower arrangement、block stacking 等三类长任务。", experiments: "真机 standard 平均从 50.2% 到 65.2%，occlusion/distractor 从 21.3% 到 44.3%。", novelty: "相对把深度或点云加入测试输入的方法，这里把 3D 当作可蒸馏训练监督。",
    experimentDetails: [{ title: "目标物体 3D 先验", setup: "Piper-X 双臂移动平台，basic 与三项长时任务；canonical 与遮挡/干扰两条件。", comparisons: "π0 与 SAM3D-VLA 使用相同部署输入和机器人设置。", results: ["Cook：standard 40% 对 15%，occlusion 26% 对 5%。", "Flower：62% 对 30%，occlusion 45% 对 13%。", "Stack：54% 对 23%，occlusion 38% 对 10%。"], evidenceNote: "正文未明确报告每格 trial count，且只验证一个平台。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["arXiv 给出数据处理、teacher 对齐和完整真机表格。"], implementation: ["Grounding DINO/YOLO + SAM2 + frozen SAM3D，仅训练期使用。"], missing: ["未确认代码/权重；trial count 未在主文明确。"] }, deepDive: { lead: "这是一种 teacher-only modality：3D 改变训练表征，但不改变部署传感器栈。", sections: [{ title: "子任务级对象对齐", paragraphs: ["长任务中，同一高层指令对应的目标对象会随阶段变化，因此对齐监督也按 subtask 切换。", "SAM3D feature 经空间重采样与投影后对齐 π0 中间视觉特征，让 action expert 间接获得对象形状和布局先验。"] }], experimentReading: ["遮挡条件增益大于 canonical，方向符合 object-centric 假设。", "透明物体、严重遮挡和错误分解会直接污染 teacher supervision。"], reflections: ["可扩展为时序/多视角 3D teacher，并检查对 contact-rich 任务的真实贡献。"] }, strengths: "训练期 3D、部署期 RGB 的边界清楚，长时真机 OOD 提升明显。", limitations: "自动分解和 mask 误差会级联；未跨 backbone 和平台验证。", transfer: "适合在不增加部署传感器的前提下，用离线 3D teacher 蒸馏 VLA。", figures: [{ src: "/report-assets/2026-08-01/2607.25912-overview.png", alt: "SAM3D-VLA 的子任务 mask、3D teacher 对齐和 RGB 语言部署流程", caption: "Figure 1 · SAM3D-VLA 训练期对象中心 3D 对齐。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 6, title: "A Causality-aware Infer-diagnose-refine Framework for Test-time Modality Adaptation in VLA Models", arxivId: "2607.25516", url: "https://arxiv.org/abs/2607.25516", institutions: ["Beijing Institute of Technology", "AInnovation", "Beijing Innovation Center of Humanoid Robotics"], signal: "对冻结 VLA 做事实/反事实推理，按阶段选择性修正视觉贡献", tags: ["Test-time Adaptation", "Counterfactual", "VLA"], classification: { research: "VLA", training: "Test-time Adaptation", platforms: ["机械臂", "夹爪"], deployment: "真机部署优化" },
    motivation: "视觉与本体的重要性随接近、接触和长距离移动阶段变化，固定融合可能在关键阶段失灵。", methodSummary: "对原图与 zero-padded 反事实图分别推理，以动作差估计视觉因果效应，再用 gated residual、clip 和本体正则选择性修正动作。", architecture: "不更新权重；每步三次 forward pass，诊断值超过阈值才触发 refinement。", optimization: "纯测试时适配；基线真机 VLA 使用约 130 小时示范训练。", data: "LIBERO/CALVIN 与 ARX5 双臂四类真机任务。", experiments: "真机平均成功率 56.5%→75.3%，成功试验平均时间 53.6s→41.5s；五步整理任务 full completion 0→33.3%。", novelty: "把 modality importance 从解释性分析转成冻结策略的在线动作修正信号。",
    experimentDetails: [{ title: "四类真机任务", setup: "Grab Cola 与 Fold Clothes 各三难度×12 次，Sweep Trash 16 次，Organize Table 6 次。", comparisons: "同一 Qwen3-VL-4B action policy，比较 frozen baseline 与 IDR。", results: ["总体 +18.8 个百分点。", "Fold Clothes L3 与 Grab Cola L2 各 +25 点，Sweep Trash +21.9 点。", "Organize Table 平均完成步数 2.17→4.00。"], evidenceNote: "测试时三次 forward 增加计算；完成时间下降来自更少无效动作，并非推理更快。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["正文包含干预、阈值、方向和模块消融。"], implementation: ["zero-padding、norm causal effect、α=0.08 附近和 selective gate。"], missing: ["项目页链接在 PDF 文本中为占位“here”，未作为公开资源。"] }, deepDive: { lead: "IDR 的关键不是遮挡图像本身，而是用干预前后的动作差作为当前阶段的视觉依赖诊断。", sections: [{ title: "诊断再修正", paragraphs: ["若移除视觉后动作几乎不变，系统不应强行注入视觉修正；差异大且方向稳定时才残差融合。", "clip、adaptive proprioceptive weight 与 selective gate 共同避免大幅修正破坏闭环。"] }], experimentReading: ["反向干预方向跌破基线，说明收益不只是多算几次。", "三次 forward 对高频控制仍是主要部署限制。"], reflections: ["可把在线诊断蒸馏成轻量 gating head，保留阶段性而减少推理成本。"] }, strengths: "真机任务覆盖变形、接触、双臂和长时序，模块消融完整。", limitations: "三倍 forward 开销，因果效应来自人工干预近似而非严格结构因果模型。", transfer: "适合做冻结 VLA 的守门式测试时修正，并可蒸馏成低开销门控。", figures: [{ src: "/report-assets/2026-08-01/2607.25516-overview.png", alt: "IDR 对 VLA 进行事实和反事实推理、诊断视觉因果效应并修正动作", caption: "Figure 1 · IDR infer-diagnose-refine 流程。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 7, title: "Explicit Kinematic Guidance from Analytic Concepts for Vision-Language-Action Models", arxivId: "2607.26513", url: "https://arxiv.org/abs/2607.26513", institutions: ["Zhejiang University", "Shanghai Innovation Institute", "Fudan University", "Westlake University", "Shanghai Jiao Tong University"], signal: "把可执行解析概念转成 VLA 的空间监督和稠密奖励", tags: ["Analytic Concepts", "3D Kinematics", "VLA-RL"], classification: { research: "VLA", training: "Post-training", modalities: ["Point Cloud / 3D"], platforms: ["机械臂", "夹爪"] }, resources: [{ label: "项目页", url: "https://sunmmyy.github.io/sage/" }],
    motivation: "2D VLA 必须从数据重新发现抽屉轴、铰链和容器开口等结构，导致精密操作学习低效。", methodSummary: "Concept Expert 用 VFM/3D encoder 初始化对象的结构与运动参数，VLA 在执行中跟踪参数；解析概念生成方向监督、空间引导与 concept-derived reward。", architecture: "初始化阶段建立 structural blueprint 与 kinematic parameters；动态阶段由 VLM feature adapter 跟踪变化，action expert 接收 guidance。", optimization: "SAGE-SFT 与 SAGE-CQL/PPO/GRPO 两条路径，主分类按 VLA 后训练。", data: "SimplerEnv、ShapeNet Mobility 六类关节物体；AGILE PiPER 双臂五项真机任务。", experiments: "真机每任务 20 次，π0.5+SAGE 在五任务分别达到 85%、90%、80%、100%、90%。", novelty: "相对隐式 3D embedding，它把对象结构写成可执行、可计算奖励的概念。",
    experimentDetails: [{ title: "监督与 RL 双路径", setup: "Open Drawer 消融、六类 ShapeNet-Mobility RL、五项 PiPER 真机多步操作。", comparisons: "OpenVLA-OFT/π0 的 SFT，对 PPO/GRPO 的 SAGE 增强，以及 π0.5 真机基线。", results: ["SAGE-SFT 把 OpenVLA-OFT 平均 54.3% 提至 69.0%。", "真机五任务相对 π0.5 提升 10–30 点。", "去掉 alignment loss 或使用估计/真值参数的消融表明估计误差不是主要收益来源。"], evidenceNote: "真机仅测试 SFT 路径，RL 的收益来自仿真。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["项目页可访问，正文给出结构与任务表。"], implementation: ["Concept Expert、VGGT/3D encoder、adapter、direction loss 与 concept reward。"], missing: ["未确认完整代码、训练资源和真实概念构建工具链。"] }, deepDive: { lead: "SAGE 把 3D 结构从输入模态提升为可执行的中间程序。", sections: [{ title: "解析概念如何进入策略", paragraphs: ["对象被表示为结构 blueprint 与随时间变化的运动参数，VLA 不必直接从像素猜测全部约束。", "同一概念一端形成空间 action guidance，另一端形成连续奖励，因此 SFT 与 RL 能共享结构先验。"] }], experimentReading: ["真机每任务 20 次，提升方向一致但仍是单平台。", "RL 只在仿真验证，不能据此声称真实 RL 已解决。"], reflections: ["适合研究可验证概念 token，但需测试概念估计错误时的安全降级。"] }, strengths: "SFT、offline/online RL、组件消融与真机验证覆盖面广。", limitations: "概念系统依赖可靠 3D/VFM；真机没有验证 RL 与概念失配。", transfer: "可将对象铰链、滑轨、开口和接触方向写成 VLA 后训练的结构化监督。", figures: [{ src: "/report-assets/2026-08-01/2607.26513-overview.png", alt: "SAGE 的 Concept Expert、结构参数、VLA guidance 和 concept reward", caption: "Figure 2 · SAGE 解析概念引导架构。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 8, title: "DLAM: Distributional Latent Actions with Temporal Constraints", arxivId: "2607.27138", url: "https://arxiv.org/abs/2607.27138", institutions: ["Zhejiang University", "Amap, Alibaba Group", "Nanjing University", "Shanghai Jiao Tong University", "Shenzhen University of Advanced Technology", "Xi'an Jiaotong University", "Chery Auto"], signal: "用高斯 latent action 和组合/反演约束学习可跨时间合成的动作自由视频表征", tags: ["Latent Action", "Temporal Composition", "Action-free Video"], classification: { research: "表征学习", training: "Pre-training", data: "UMI / Ego / Human Video", platforms: ["机械臂", "夹爪"] },
    motivation: "重建型 latent action 可预测下一帧，却未必能递归组合；确定性点表示也会把局部误差沿长时间传播。", methodSummary: "每个视觉 transition 编码为对角高斯；均值和方差都受 equal-gap composition 与 reversal 约束，相邻 transition 用共享相关系数建模依赖。", architecture: "冻结 DLAM encoder 后，flow policy 联合生成 posterior mean transition sequence 与机器人动作；方差只在预训练结构中使用。", optimization: "动作自由视频预训练 + 下游 flow-matching BC。", data: "MetaWorld MT50、LIBERO 与 Piper 6-DoF 四项真机操作。", experiments: "π0+DLAM 真机平均 73.8%，π0+ALAM 63.8%、π0.5 53.8%、π0 40.0%。", novelty: "把 latent action 的时间代数从确定性点扩展到带相关性的分布。",
    experimentDetails: [{ title: "时间结构与下游控制", setup: "held-out 3k–5k transition span、MetaWorld、LIBERO 和四项 Piper 真机任务。", comparisons: "LAM、ALAM、动作-only π0/π0.5，以及移除 relation/variance/correlation 的控制消融。", results: ["LIBERO 平均 99.0%，Long 为 97.1%。", "完整 DLAM 在 MetaWorld 87.6%，无 temporal relation 为 76.6%。", "真机四任务平均较 ALAM 高 10 点。"], evidenceNote: "真机 trial count 未在主文段落明确；下游只使用均值，不能宣称方差已校准。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["正文给出组合、反演和相关方差公式。"], implementation: ["frozen encoder + mean sequence auxiliary target。"], missing: ["未确认代码；方差校准与长于训练跨度的保证不存在。"] }, deepDive: { lead: "DLAM 希望 latent action 不只会重建，还能在时间上近似相加和反向。", sections: [{ title: "分布式 transition", paragraphs: ["均值描述观测变化中心，方差记录 transition 的维度级分散度；共享相关系数处理相邻段共享中间帧。", "composition/reversal 约束让短 transition 的关系能作为长 span 的结构先验，而下游仍只把均值交给动作策略。"] }], experimentReading: ["消融显示大部分收益来自 normalized mean constraints，方差和相关项是增量贡献。", "方差可能塌缩近常数，论文没有做 uncertainty calibration。"], reflections: ["可把 contact event 或 embodiment change 纳入 transition composition 的条件。"] }, strengths: "公式、held-out span、控制消融和真机迁移互相支撑。", limitations: "只约束等间隔局部 triplet，长时结构无保证；方差未用于下游控制。", transfer: "适合作为 action-free video 预训练的结构化 latent target。", figures: [{ src: "/report-assets/2026-08-01/2607.27138-overview.png", alt: "LAM、ALAM 和 DLAM 从点 transition 到分布 transition 的比较", caption: "Figure 1 · DLAM 分布式 latent action 组合与反演。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 9, title: "When Does Legacy Data Start to Help? Emergent Transfer in Cross-Configuration Robot Learning", arxivId: "2607.25593", url: "https://arxiv.org/abs/2607.25593", institutions: ["Huazhong University of Science and Technology", "Spirit AI", "Peking University", "Shanghai Jiao Tong University", "Harbin Institute of Technology", "Tsinghua University"], signal: "跨硬件旧数据只有在新配置跨过任务能力阈值后才产生显著收益", tags: ["Legacy Data", "Hardware Iteration", "Data Strategy"], classification: { research: "表征学习", training: "BC", data: "跨本体数据", platforms: ["Humanoid", "轮式底盘", "机械臂", "夹爪"], deployment: "跨本体迁移" },
    motivation: "硬件换相机或夹爪后，昂贵旧示范是否有用并非单调；低能力新域可能连任务阶段都无法解码。", methodSummary: "用 standalone success 作为阶段指标，提出 representation vacuum、synergistic bloom、diminishing saturation 三阶段，并据此决定先采新数据还是混入旧数据。", architecture: "同一 action-chunk transformer 不接收硬件标签；Gen-1/Gen-2 使用统一归一化动作，底层控制器吸收执行差异。", optimization: "单配置 BC 与等概率跨配置 co-training。", data: "两代轮式 humanoid 硬件、花与笔的抓取/插入，另有 held-out 移动双臂浇水。", experiments: "每条件 60 次真机；flower insertion 低基线 10→10%，跨阈值后 23.3→86.7%，高基线 pen insertion 85→93.3%。", novelty: "不是提出新的融合网络，而是给跨配置数据复用建立可操作的阶段判断。",
    experimentDetails: [{ title: "三阶段数据复用", setup: "相机和夹爪均改变的两代硬件；每条件 60 次，报告 Fisher exact 与 Wilson 95% CI。", comparisons: "只用新硬件数据 vs 新旧数据等概率 co-training。", results: ["早期 Gen-2 flower insertion 10% 时旧数据无收益。", "质量改进使 baseline 到 23.3% 后，co-training 达 86.7%。", "高 baseline 的新增收益缩小，部分近饱和任务略为负但不显著。"], evidenceNote: "阈值来自有限任务的经验模式，不是跨平台普适常数。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["论文披露小时数、采集质量变化、60 次协议和统计检验。"], implementation: ["60-step chunk、30 Hz、无硬件 ID 的等概率 co-training。"], missing: ["数据与代码未确认公开；阶段阈值需新任务自行估计。"] }, deepDive: { lead: "旧数据不是越早加入越好：新域需要先形成最基本的阶段结构，旧域梯度才可能对齐。", sections: [{ title: "从真空到协同", paragraphs: ["低 baseline 时，新硬件表征无法可靠区分 approach、grasp、insert，旧数据只强化不匹配的视觉/执行模式。", "跨过阈值后，旧数据提供共享阶段结构；接近饱和时剩余误差变小，边际收益自然下降。"] }], experimentReading: ["每格 60 次且有置信区间，比只看单次训练曲线更可信。", "数据质量与 baseline 同时变化，阶段解释仍可能混入 operator/scene 因素。"], reflections: ["实际采集应先用少量新域数据估计阶段可解码性，再决定旧数据采样比。"] }, strengths: "负结果、显著大收益和饱和三种区间都在真机出现。", limitations: "只有两代相近 morphology；理论阈值依赖不可直接观测的 stage decodability。", transfer: "可用于硬件升级或跨本体训练的数据配比与采集停止决策。", figures: [{ src: "/report-assets/2026-08-01/2607.25593-overview.png", alt: "跨配置硬件数据复用的三阶段相变示意", caption: "Figure 1 · Legacy data 三阶段复用规律。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 10, title: "Enfold: Folding World-Generator Computation into Predictive Representations for Efficient Embodied Control", arxivId: "2607.26657", url: "https://arxiv.org/abs/2607.26657", institutions: ["Shanghai Jiao Tong University", "South China University of Technology", "Qilu University of Technology"], signal: "把 world generator 的中间计算蒸馏到当前帧表征，控制时不再运行视频生成器", tags: ["World Model", "Predictive Representation", "Efficient Control"], classification: { research: "WM", training: "Pre-training", platforms: ["机械臂", "夹爪"], deployment: "真机部署优化" }, resources: [{ label: "项目页", url: "https://zwl666666.github.io/enfold/" }],
    motivation: "world generator 能组织未来变化，但每步生成视频代价高；真正可复用的可能是其多层内部状态。", methodSummary: "generator 处理真实未来时暴露多层 hidden states，current-only predictive encoder 学习预测这些状态；encoder 表征又反向条件生成器，task gradient 不回写 encoder。", architecture: "G2R 用 generator state 监督表示，R2G 用表示条件 future generation；控制头直接读 representation，部署完全移除 generator。", optimization: "future modeling 与 representation learning 预训练，任务头独立 readout；Enfold-Flash 加 TensorRT。", data: "LIBERO 40 任务、RoboTwin 50 双臂任务、四项 AgileX 双臂真机。", experiments: "真机 ID completion 89.7%，FastWAM 77.8%、π0.5 86.1%；OOD 76.6%，低于 π0.5 的 83.3%但高于 FastWAM 70.0%。", novelty: "不是输出 future video 再行动，而是把生成器的未来组织能力折叠进当前表示。",
    experimentDetails: [{ title: "效率、控制与 intervention", setup: "四项真机双臂任务，另有人为移动物体后的 OOD/intervention split。", comparisons: "FastWAM、π0.5、Motus 与 Enfold/Enfold-Flash。", results: ["LIBERO 97.8%，action latency 134 ms；Flash 49 ms。", "真机 ID 平均 89.7%，OOD 76.6%。", "移动物体后，想象与动作均转向新状态，排除固定轨迹重放的简单解释。"], evidenceNote: "真机以阶段化 completion score 为主，主文未明确每格试验次数。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["项目页与 generator/encoder 信息流可核验。"], implementation: ["Cosmos-Predict 2.5 2B + DINOv3 ViT-H+/16；multi-level state target。"], missing: ["未确认代码与 checkpoint；真机 trial count 不明确。"] }, deepDive: { lead: "Enfold 把生成器从在线规划器变成离线教师。", sections: [{ title: "双向但非对称", paragraphs: ["G2R 让当前表征预测 generator 处理未来时的多层状态，压缩可预见的变化并丢弃不可预测噪声。", "R2G 再检查该表征是否仍能帮助生成器；任务梯度被隔离，避免 encoder 退化成只服务一个 action head。"] }], experimentReading: ["multi-level state 比 pixel、action-only 和 single-level target 更好。", "OOD 仍落后 π0.5，说明高效表示没有解决所有视觉分布变化。"], reflections: ["可把生成器 teacher 替换为更小的 interaction-centric model，降低预训练成本。"] }, strengths: "性能、延迟、双向消融、表示 probe 和 intervention 行为均有证据。", limitations: "teacher 很大，真机统计披露不足，OOD 不是最佳。", transfer: "适合将昂贵 world model 作为训练期教师，部署只保留预测表征。", figures: [{ src: "/report-assets/2026-08-01/2607.26657-overview.png", alt: "Enfold 的 generator-to-representation 与 representation-to-generator 双向耦合", caption: "Figure 4 · Enfold 预测表征与 world generator 信息流。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 11, title: "RL²-VLA: Adaptive RL Latent Compositional Steering with Test-Time Scaling for Vision-Language-Action Models", arxivId: "2607.26991", url: "https://arxiv.org/abs/2607.26991", institutions: ["National University of Singapore", "University of Toronto", "Singapore Technologies Engineering"], signal: "只在 VLA 预计失败时，用轻量 offline RL latent flow 改变 action sample 分布", tags: ["Offline RL", "Test-time Scaling", "Failure Detection"], classification: { research: "VLA", training: "RL", platforms: ["机械臂", "夹爪"] }, resources: [{ label: "项目页", url: "https://rl2-vla.github.io" }],
    motivation: "重复采样或 prompt rephrase 产生的动作仍高度相关，且统一 steering 会破坏本来正确的动作。", methodSummary: "轻量 offline RL policy 以 action expert latent 为条件，将其 flow velocity 与冻结 VLA 的 flow 组合；SAFE failure detector 触发时才启用。", architecture: "π0 base + QAM steering + CoVer verifier + conformal failure detector；VLA 权重冻结。", optimization: "offline RL 复用 VLA fine-tuning 数据，failure detector 还需 rollout 数据。", data: "SIMPLER、PolaRiS、BridgeV2；PiperX 四项真机 OOD/重提示任务。", experiments: "真机四任务每个 3 seeds×10 次，adaptive RL² 平均比 Rephrase 高 17.5 点，比 non-adaptive 高 14.2 点。", novelty: "把 test-time scaling 的采样预算与失败状态绑定，并在 latent flow 空间组合 RL 与 imitation prior。",
    experimentDetails: [{ title: "失败状态选择性 steering", setup: "Carrot/Cube base-prompt 变化，以及未见 tape/screwdriver toolbox 场景。", comparisons: "vanilla π0、Rephrase、non-adaptive RL² 与 adaptive RL²。", results: ["四任务共 120 次真机测试。", "adaptive 对最强 Rephrase 平均 +17.5 点。", "adaptive 对全程 steering 平均 +14.2 点，支持只在失败时增加多样性。"], evidenceNote: "SAFE 在仿真训练后不能直接泛化，作者额外采集真机 rollout 训练 detector。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["项目页可核验，正文给出 steering、detector 和 verifier 组成。"], implementation: ["π0 latent、QAM、CoVer、conformal threshold。"], missing: ["代码声明 final paper 发布，当前未确认；detector 数据量披露有限。"] }, deepDive: { lead: "RL² 的重点不是无限采样，而是先判断当前动作分布是否值得被扰动。", sections: [{ title: "两种 flow 的组合", paragraphs: ["冻结 VLA 提供模仿学习的高概率动作，offline RL flow 把样本推向示范主模态之外的高价值区域。", "failure detector 让成功状态沿用 base VLA，失败状态才支付 steering 与 verifier 成本。"] }], experimentReading: ["non-adaptive 变差是关键反例，说明多样性并非总有益。", "效果依赖 detector 与 verifier，任何一环 OOD 都可能失效。"], reflections: ["更实用的方向是联合校准 failure risk、steering strength 与 verifier budget。"] }, strengths: "模拟规模、消融、四项真机 OOD 和负向 non-adaptive 对照完整。", limitations: "依赖在线 rollout 训练 detector 和强 verifier，系统链路较长。", transfer: "可作为冻结 VLA 的按需 RL steering 层。", figures: [{ src: "/report-assets/2026-08-01/2607.26991-overview.png", alt: "RL2-VLA 在失败状态启用 latent compositional steering 的流程", caption: "Figure 1 · RL²-VLA 自适应 test-time steering。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 12, title: "Route by Kinematics, Act by Observation: Kinematics-Supervised Expert Routing in MoE-Augmented VLA", arxivId: "2607.26807", url: "https://arxiv.org/abs/2607.26807", institutions: ["Tsinghua University", "Pengcheng Laboratory"], signal: "训练期按动作运动学聚类监督 MoE router，推理期仅凭视觉语言路由", tags: ["Mixture of Experts", "Kinematics", "VLA"], classification: { research: "VLA", training: "Post-training", platforms: ["机械臂", "夹爪"] },
    motivation: "语义相似不等于运动学相似，隐式 MoE router 会把稀有双臂或精细动作压在主流模式中。", methodSummary: "用 action+velocity trajectory 聚类成 kinematic archetypes，把 cluster ID 作为 router 标签；推理时 router 从观察中预测 archetype，shared branch 始终激活。", architecture: "VLA backbone + always-on shared expert + Top-1 routed expert；balanced sampling 改善稀有 archetype。", optimization: "在 π0/π0.5/OpenVLA/AdaMoE 上做 supervised post-training。", data: "RoboTwin 与低成本 DIYRobot 五项真机任务。", experiments: "DIYRobot 每任务以 100 次计数，KinRT-Full 平均 35.6，π0.5-Full 29.6、最佳隐式 MoE 21.4。", novelty: "把只在训练期可见的动作运动学蒸馏成推理期观察路由。",
    experimentDetails: [{ title: "运动学路由", setup: "RoboTwin clean/random 与 DIYRobot 的 handover、reorient、press、pull、rotate。", comparisons: "dense VLA、implicit MoE、不同 backbone 和 router label 来源。", results: ["RoboTwin KinRT-LoRA 40.8/38.8，π0.5-LoRA 33.1/34.1。", "DIYRobot KinRT-Full 35.6，π0.5-Full 29.6。", "action+velocity label 40.8，VLM feature label 21.8。"], evidenceNote: "论文用 success count 汇总，任务数和平台仍有限；开源为未来时表述。" }],
    reproducibilityDetails: { status: "信息不足", verifiedResources: ["正文给出 router、聚类和 DIYRobot 硬件图。"], implementation: ["Top-1 四专家、α=0.5 balanced sampling、action+velocity clustering。"], missing: ["代码和平台文件尚未确认公开。"] }, deepDive: { lead: "KinRT 用动作空间定义专家分工，再训练观察空间去预测这种分工。", sections: [{ title: "不对称路由桥", paragraphs: ["训练时动作与速度能明确区分 lift、rotate、handover 等 archetype，cluster ID 直接监督 router。", "推理时动作尚未产生，router 只能从视觉语言预测 cluster，因此 shared branch 保留通用能力、routed expert 承担专门运动。"] }], experimentReading: ["VLM feature clustering 明显失败，直接支持语义/运动学错位假设。", "DIY 平台数据域偏离预训练时 full fine-tuning 优于 LoRA，说明 adaptation capacity 仍关键。"], reflections: ["可把接触相位、控制频率与 embodiment 参数加入 archetype，而非只聚类动作轨迹。"] }, strengths: "跨 backbone、label source 消融和真机计数完整。", limitations: "固定专家数与离线 k-means 可能不适合持续新增任务。", transfer: "适合多任务 VLA 的运动学专家划分与稀有模式重采样。", figures: [{ src: "/report-assets/2026-08-01/2607.26807-overview.jpg", alt: "KinRT 从动作与速度聚类运动学原型、监督 MoE router 到 DIYRobot 评测的完整框架", caption: "Figure 2 · KinRT 训练期运动学监督、推理期观察路由与 DIYRobot 平台。图片来自 arXiv HTML 提供的原论文独立 Figure。" }],
  },
  {
    rank: 13, title: "Practice Makes Policies: Bootstrapping and Consolidating Robotic Capabilities from Zero Human Demonstrations", arxivId: "2607.26809", url: "https://arxiv.org/abs/2607.26809", institutions: ["Shanghai Jiao Tong University", "University of Sussex"], signal: "把零样本推理、经验迁移和闭环策略组织成自主采集与能力固化循环", tags: ["Self-improving", "Zero Human Demonstrations", "Orchestration"], classification: { research: "Subtask", training: "BC", data: "在线数据 / 人工纠正", platforms: ["机械臂", "夹爪"] }, resources: [{ label: "项目页", url: "https://hero-agent.github.io/" }],
    motivation: "foundation-model reasoning 能零样本启动但慢且不稳定，固定策略高效却无法覆盖新任务。", methodSummary: "HERO 分三层：L1 heuristic reasoning 采首个经验，L2 exemplar reuse 做一次性迁移，L3 把重复经验训练成 closed-loop visuomotor policy；orchestrator 监控、重规划和 fallback。", architecture: "autonomous data evolution loop 与 adaptive execution loop 共用经验库和三层 capability。", optimization: "自主收集 rollout 后训练 L3 policy；不使用人工示范。", data: "四类真机任务，系统分析覆盖 120 次 task execution。", experiments: "三层全开平均成功率 86.0%；去掉重规划时各单层成功率均下降；41 次中间失败中恢复 30 次。", novelty: "把一次性 VLM reasoning 逐渐固化为可复用轨迹和闭环 muscle memory。",
    experimentDetails: [{ title: "能力演化与恢复", setup: "四项真机长时任务，比较 L1/L2/L3 组合与 replanning。", comparisons: "单层、两层和三层 HERO，以及无重规划版本。", results: ["L1+L2+L3 平均 86.0%，成功任务时间 3.9 min。", "成功 subtask 中 86.7% 由 L3 完成，6.5% fallback 到 L2，6.8% 使用 L1。", "120 次任务中最终完成 103 次；中间失败恢复率 30/41。"], evidenceNote: "预定义 primitive space 仍由人设计；不同能力层的训练/计算预算并不对称。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["项目页可核验，正文给出失败统计与 latency 分解。"], implementation: ["VLM keypoint/3D grounding、trajectory transfer、closed-loop L3 policy。"], missing: ["完整系统代码、数据和模型未确认。"] }, deepDive: { lead: "HERO 的价值在于把通用但昂贵的 reasoning 当作数据引擎，而不是永远留在控制回路。", sections: [{ title: "从经验到 muscle memory", paragraphs: ["首次任务由 L1 通过视觉推理和 primitive 执行生成经验，近似场景由 L2 变换已有轨迹。", "当经验积累到可训练程度后，L3 接管高频闭环；监控器发现失败再向上 fallback。"] }], experimentReading: ["恢复统计把系统可靠性拆成执行与 orchestrator 两类失败。", "零人工示范不等于零人工先验，primitive 与 task decomposition 仍由设计者约束。"], reflections: ["下一步应报告每单位成功经验的机器人时间与推理成本，而不仅是最终成功率。"] }, strengths: "真实闭环、自主数据、能力 fallback 和失败恢复均有量化。", limitations: "系统模块多，依赖深度/点云与预定义 primitive；VLM 延迟明显。", transfer: "可把大模型推理限定在冷启动和失败恢复，把常见技能蒸馏为闭环策略。", figures: [{ src: "/report-assets/2026-08-01/2607.26809-overview.png", alt: "HERO 从 heuristic reasoning、exemplar reuse 到 reflexive policy 的能力演化", caption: "Figure 1 · HERO 自主经验积累与能力固化。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 14, title: "Decompose and Reorganize: Planning with Primitives and Visuomotor Policies Learned from Demonstrations", arxivId: "2607.25397", url: "https://arxiv.org/abs/2607.25397", institutions: ["University of Hong Kong", "JD.com", "Nanyang Technological University", "Southern University of Science and Technology", "Huawei Technologies", "The Chinese University of Hong Kong"], signal: "按接触关系拆示范，把 visuomotor policy、对象中心 primitive 与规划动作重组为长时任务", tags: ["TAMP", "Visuomotor Policy", "Long Horizon"], classification: { research: "Subtask", training: "BC", modalities: ["Depth / RGB-D", "Point Cloud / 3D"], platforms: ["机械臂", "夹爪"] }, resources: [{ label: "项目页", url: "https://dr-lfd.github.io/DR-LfD-website" }],
    motivation: "端到端模仿难跨长时序和空间约束，纯 TAMP 又在接触操作与感知误差下脆弱。", methodSummary: "VLM 辅助按 contact graph 变化切分技能；接触段学 visuomotor policy 或 SO(3)-equivariant object-centric primitive，非接触段规划，再把 initiation/termination/constraint 写入 TAMP。", architecture: "Decompose 构建符号 skill repertoire，Reorganize 用 TAMP 与 perceive-plan-act 闭环重组，并检查 reachability/safety。", optimization: "每个 contact skill 用少量示范做 diffusion policy/对象中心学习。", data: "多项双臂真机、LIBERO、DexMimicGen；长任务包含 19 与 21 步 plan skeleton。", experiments: "真机每任务/设置 20 次；OOD object placement 下优于 Diffusion Policy 与 π0.5，19/21 步任务分别报告 50% 等完整成功。", novelty: "示范负担从技能序列组合规模转成 distinct skill type 数量。",
    experimentDetails: [{ title: "OOD、约束与长时组合", setup: "五项真机技能、不可达/不安全场景，以及 Three-Tapes 与 Cup-Sponge-Screwdriver。", comparisons: "DP、π0.5、generic grasp primitive、open-loop/closed-loop DR-LfD。", results: ["OOD placement 下 DR-LfD 一致优于 DP 与 π0.5。", "不可达与不安全场景为 55%/70%，端到端基线为 0%。", "DexMimicGen 用 100 demos 达 70%/90%，超过 DP 1000 demos 的 45%/70%。"], evidenceNote: "TAMP 搜索随对象数快速增长；部分长任务成功率仍只有 50%。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["项目页可核验，正文给出 PDDL/TAMP、技能类型与公开 benchmark 表。"], implementation: ["depth object crop、SO(3) equivariance、focused solver、online replan。"], missing: ["完整代码与全部真机数据未确认；定制 goal 仍需人工。"] }, deepDive: { lead: "DR-LfD 把学习策略放进规划器可以验证和重组的接口，而不是让策略负责全部时序逻辑。", sections: [{ title: "接触图驱动的技能边界", paragraphs: ["attach/detach 事件定义技能切分，避免只按固定时间窗分段。", "接触段保留视觉反馈，非接触段交给可检查的规划器；每个技能还带 initiation、termination 和 constraint。"] }], experimentReading: ["constraint 场景的非零成功直接说明重规划价值。", "搜索时间随障碍/目标数呈指数增长，长时能力仍受符号规模限制。"], reflections: ["更可扩展的方向是学习 planner heuristic 和自动 goal grounding，而保留安全 stream 的可验证性。"] }, strengths: "真实 OOD、约束、长时组合和公开 benchmark 都有对照。", limitations: "依赖深度与 TAMP，目标定义和搜索成本较重。", transfer: "适合把 VLA 技能封装成可验证 subtask，并在失败时局部重规划。", figures: [{ src: "/report-assets/2026-08-01/2607.25397-overview.png", alt: "DR-LfD 从示范分解技能、重组规划到长时执行的流程", caption: "Figure 1 · DR-LfD 技能分解与重组框架。图片截取自 arXiv 原论文。" }],
  },
  {
    rank: 15, title: "MoMo: Dial Motion Mode in Robot Manipulation with Spatiotemporal Action Tokenization", arxivId: "2607.26315", url: "https://arxiv.org/abs/2607.26315", institutions: ["Apple"], signal: "把动作分成空间/时间 token，用连续 motion-mode 条件跨任务调节执行风格", tags: ["Action Tokenization", "Behavior Factor", "Compositional Generalization"], classification: { research: "表征学习", training: "BC", modalities: ["State / Proprioception"], platforms: ["机械臂", "夹爪"] },
    motivation: "策略通常把任务和执行方式一起学习，新任务若缺少某种速度/平滑风格示范就无法迁移。", methodSummary: "Stage 1 residual-VQ 分别编码绝对关节轨迹的空间结构与关节差分 DCT 的时间动态；Stage 2 BC transformer 以任务和连续 mode scaler 预测两类 code 与残差。", architecture: "spatial/temporal code stacks 融合后解码 action chunk，offset head 做连续修正，50 Hz temporal aggregation 执行。", optimization: "两阶段 imitation learning，加入 contrastive、adversarial 与 swap loss 促进因素分离。", data: "六项单臂真机任务；四项双 mode，两项只示范一个 mode。", experiments: "每任务在三个 scaler 下各 20 次；速度、加速度和 approach pitch 单调变化，三名盲评专家也能识别 mode。", novelty: "学习的是可跨任务复用的 execution-level factor，而不是一个新的任务 primitive。",
    experimentDetails: [{ title: "未见 task-mode 组合", setup: "pick/pour/look/avoid 双 mode，push 只见 dynamic，highfive 只见 steady；初始位置与朝向扰动。", comparisons: "mode A、interpolated、mode B；客观动力学与三名专家盲评。", results: ["六任务速度/加速度与 scaler 的 Spearman 相关均显著。", "未见 push/highfive mode 的 token 向目标 mode 区域移动。", "任务成功大多接近上限，但 push 的未见 steady mode 接触可靠性下降。"], evidenceNote: "只有一个 embodiment、两个 prototype mode；人评和任务成功不是完全独立。" }],
    reproducibilityDetails: { status: "部分可复现", verifiedResources: ["正文给出 20 rollout/格、50 Hz、三项动力学指标和盲评协议。"], implementation: ["absolute-joint spatial stream、DCT-delta temporal stream、residual VQ。"], missing: ["代码/数据未确认；mode label 仍需示范者定义。"] }, deepDive: { lead: "MoMo 尝试把“做什么”和“怎么做”分开，但论文也承认这种分解并不完全。", sections: [{ title: "双 token 流", paragraphs: ["空间流保留任务几何，时间流强调速度、加速度和平滑性；两者最终仍共同决定动作。", "连续 scaler 不是简单混合输出动作，而是改变 code 选择，使未见 task-mode 组合向已学 mode 分布移动。"] }], experimentReading: ["单调动力学、latent 可视化和盲评三种证据方向一致。", "push 的接触退化说明 style transfer 可能破坏任务约束。"], reflections: ["可把 mode 扩展为安全/柔顺/快速等有物理含义的控制条件，并加入成功约束。"] }, strengths: "360 次真机 rollout、盲评和未见组合实验清楚。", limitations: "模式空间只有两个原型，一个机器人；因素分离是近似的。", transfer: "可把 VLA 动作 token 分成任务几何与执行动态，用于可控速度、平滑度和接触方式。", figures: [{ src: "/report-assets/2026-08-01/2607.26315-overview.png", alt: "MoMo 的空间时间动作 tokenizer、mode 插值和跨任务 mode 迁移", caption: "Figure 1 · MoMo 时空动作 token 与 mode 控制。图片截取自 arXiv 原论文。" }],
  },
];

const correctedFigures20260801: Partial<Record<string, Paper["figures"]>> = {
  "2607.25516": [{
    src: "/report-assets/2026-08-01/2607.25516-overview.png",
    alt: "IDR 对冻结 VLA 进行事实与反事实推理、诊断视觉因果效应并以门控残差修正动作",
    caption: "Figure 2 · IDR infer-diagnose-refine 完整流程。图片来自 arXiv HTML 提供的原论文独立 Figure。",
  }],
  "2607.25593": [{
    src: "/report-assets/2026-08-01/2607.25593-overview.png",
    alt: "跨硬件配置协同训练收益随新配置独立成功率变化的三阶段曲线",
    caption: "Figure 2 · Legacy data 从 representation vacuum 到 synergistic bloom，再到 diminishing saturation 的三阶段结果。图片来自 arXiv HTML 提供的原论文独立 Figure。",
  }],
  "2607.26807": [{
    src: "/report-assets/2026-08-01/2607.26807-overview.jpg",
    alt: "KinRT 从动作与速度聚类运动学原型、监督 MoE router 到 DIYRobot 评测的完整框架",
    caption: "Figure 2 · KinRT 训练期运动学监督、推理期观察路由与 DIYRobot 平台。图片来自 arXiv HTML 提供的原论文独立 Figure。",
  }],
  "2607.26809": [
    {
      src: "/report-assets/2026-08-01/2607.26809-bootstrap.png",
      alt: "HERO 的 L1 从 VLM 标注、三维 grounding 到机器人 primitive 执行的冷启动流程",
      caption: "Figure 1 · HERO L1 heuristic bootstrapper 的四类 primitive 与执行流程。图片来自 arXiv HTML 提供的原论文独立 Figure。",
    },
    {
      src: "/report-assets/2026-08-01/2607.26809-overview.png",
      alt: "HERO 随自主训练数据增加从 L1 reasoning、L2 exemplar 到 L3 policy 的能力演化",
      caption: "Figure 4 · HERO 通过自主经验积累提升 subtask coverage 与 L3 task success。图片来自 arXiv HTML 提供的原论文独立 Figure。",
    },
  ],
  "2607.26991": [{
    src: "/report-assets/2026-08-01/2607.26991-overview.png",
    alt: "RL²-VLA 提取 action expert latent、检测失败状态、组合 RL 与 VLA flow 并用 verifier 选动作",
    caption: "Figure 4 · RL²-VLA 的 latent compositional steering、failure detection 与 candidate verification。图片来自 arXiv HTML 提供的原论文独立 Figure。",
  }],
  "2607.25397": [{
    src: "/report-assets/2026-08-01/2607.25397-overview.png",
    alt: "DR-LfD 离线拆解示范并训练技能流，在线转换 PDDL、规划、执行和接触触发验证的完整流程",
    caption: "Figure 2 · DR-LfD 的离线 skill acquisition 与在线 TAMP 重组流程。图片来自 arXiv HTML 提供的原论文独立 Figure。",
  }],
  "2607.26315": [{
    src: "/report-assets/2026-08-01/2607.26315-overview.png",
    alt: "MoMo 两阶段训练中的空间与时间编码器、独立 RVQ、融合解码器和条件 code prediction",
    caption: "Figure 2 · MoMo 时空 action tokenization 与 motion-mode 条件策略训练。图片来自 arXiv HTML 提供的原论文独立 Figure。",
  }],
};

const selectedPaperIds20260801 = [
  "2607.25895",
  "tau0-vla",
  "2607.25918",
  "2607.26055",
  "2607.27205",
  "2607.25912",
  "2607.25516",
  "2607.26513",
  "2607.27138",
  "2607.25593",
  "2607.26657",
  "2607.26991",
  "2607.26807",
  "2607.26809",
  "2607.25397",
];

export const paperDaily20260801: Paper[] = selectedPaperIds20260801.map((paperId, index) => {
  const paper = paperCandidates20260801.find((candidate) => candidate.arxivId === paperId);
  if (!paper) throw new Error(`Missing selected paper: ${paperId}`);
  return {
    ...paper,
    rank: index + 1,
    figures: correctedFigures20260801[paper.arxivId] ?? paper.figures,
  };
});
