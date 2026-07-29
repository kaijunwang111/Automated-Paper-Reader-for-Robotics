import type { Paper } from "./site-data";

export const paperEditorialSupplements = {
  "2607.20683": {
    classification: {
      research: "表征学习",
      modalities: ["Tactile"],
      data: "数据增强",
      platforms: ["机械臂", "夹爪"],
      deployment: "真机部署优化",
    },
    experiments:
      "论文同时验证“触觉能否预测”和“预测触觉是否真的帮助控制”。FELT 在独立 xArm 测试集上取得 0.816 的接触帧准确率；四项真机任务每种方法各运行 20 次，FELT latent 将 Triangle Peg 最终插入成功率从视觉基线的 50% 提升到 90%，但不同任务上的优势并不完全一致。",
    experimentDetails: [
      {
        title: "触觉生成质量",
        setup:
          "生成器在 2,700+ 条 UMI 示范、约 2.6M 对 RGB-触觉帧上训练，并在独立采集的 30 条 xArm 轨迹、约 72K 帧上测试。测试对象、任务和机器人本体不出现在生成器训练数据中。",
        comparisons:
          "对比 DINOv2 特征最近邻检索、全触觉 token 遮蔽的 MAE，以及移除左右指面交互、双分支 decoder、卷积读出头的三组结构消融。",
        results: [
          "FELT 的 LPIPS 为 0.191、Energy Ratio 为 1.123、接触帧准确率为 0.816；MAE 的接触帧准确率为 0.746，但总压力被放大到 4.597 倍。",
          "移除双分支 decoder 后，接触帧准确率降至 0.616，左右压力不对称误差升至 2.225；说明按两个指面分别解码不是装饰性结构。",
          "移除跨指交互后，左右压力不对称误差从 0.738 增至 1.175，主要损失发生在非对称接触模式。",
        ],
        evidenceNote:
          "生成指标能说明压力图更像真实传感器输出，但不能单独证明它对策略有用，因此论文又进行了下游真机评测。",
      },
      {
        title: "四项真机策略评测",
        setup:
          "xArm7 上的 Tube Insertion、Cup Nesting、Eraser Wiping、Triangle Peg Insertion 各采集 60 条示范。所有策略使用相同 RGB 流和 CLIP 编码器，训练 60 epochs，以 10 Hz 部署；每个方法在每项任务上交错执行 20 次。",
        comparisons:
          "视觉-only、真实触觉、部署时用 FELT 生成压力图、训练和部署都只用 FELT latent 四种配置；此外在两项任务上部署生成器结构消融。",
        results: [
          "四项任务的视觉-only 最终成功率依次为 40%、25%、65%、50%；FELT latent 对应为 50%、45%、85%、90%。",
          "真实触觉对应为 55%、35%、90%、70%。FELT 并非每项都超过真实触觉，但在所有最终指标上都超过视觉-only。",
          "Triangle Peg 中，完整 FELT 压力图达到 70%，去掉跨指交互或双分支 decoder 后均降到 55%；结构消融与触觉生成指标的下降方向一致。",
          "单张 RTX 4090 上生成延迟约 20 ms，满足论文的 10 Hz 控制频率。",
        ],
        evidenceNote:
          "每格只有 20 次试验，对应二项分布标准误约 7–11 个百分点。可以相信跨任务一致趋势，不宜过度解释 5–10 个百分点的小差异。",
      },
    ],
    reproducibilityDetails: {
      status: "部分可复现",
      verifiedResources: [
        "arXiv 正文含 26 页正文与补充材料，项目页可访问。",
        "论文明确给出将公开四项任务的真实触觉与 FELT 生成触觉数据；本次核验未确认完整训练代码和权重已公开。",
      ],
      implementation: [
        "冻结 DINOv2-B/14，平均第 3、7、11 层的 256 个 patch token；每个指面使用 12×32 个 query。",
        "两个独立的 2-layer、8-head decoder 之间加入 gated cross-panel attention，卷积读出通道数为 256。",
        "策略数据、传感器频率、时间同步偏移、训练 epoch、控制频率和主要损失都在补充材料中给出。",
      ],
      missing: [
        "未确认可直接运行的代码、预训练生成器和策略 checkpoint。",
        "尚未给出跨触觉传感器、跨相机视角或严重遮挡条件下的复现结果。",
      ],
    },
    deepDive: {
      lead:
        "FELT 不是用视觉替代真实触觉的通用方案，而是在“夹爪、物体和接触区能够被腕部鱼眼相机看到”这一前提下，把视觉中隐含的接触几何恢复成压力表征。论文的价值在于把跨模态生成、真实控制收益和部署代价放进了同一条证据链。",
      sections: [
        {
          title: "从单帧 RGB 到双指压力图",
          paragraphs: [
            "输入图像先经过冻结的 DINOv2-B/14。作者没有只取最后一层，而是平均第 3、7、11 层的 patch token，试图同时保留纹理、几何和语义信息。左右两个触觉面分别拥有与 12×32 物理网格一一对应的可学习 query，独立 cross-attention 读取视觉 token。",
            "独立分支之后并非完全隔离：每层 decoder 后都有 gated cross-panel exchange，让左指面能够参考右指面。最后的 panel-aware 卷积读出头保留二维邻域结构，并分别输出接触概率和接触强度。中间的 256 维 feature map 也可以不解码成压力图，直接作为 FELT latent 送进策略。",
          ],
        },
        {
          title: "训练目标与三种使用方式",
          paragraphs: [
            "接触区域非常稀疏，因此接触头使用 focal loss 与 dice loss 处理正负样本不平衡；压力强度头使用 value-weighted Huber loss，让高压力单元获得更大权重。生成器训练完成后可以离线补齐视觉数据、在线生成压力图，或完全绕开像素级触觉，以 latent feature 条件化 Diffusion Policy。",
            "下游策略并不是一个统一多任务模型，而是四个任务分别训练的 visuo-tactile Diffusion Policy。因此实验能回答“生成触觉是否帮助低数据接触任务”，但不能说明 FELT 已经在通用 VLA 上成立。",
          ],
        },
        {
          title: "实验结果应该怎样理解",
          paragraphs: [
            "最有说服力的不是某个单格最高，而是三个层面的结果方向一致：完整结构能更好地恢复接触强度；破坏指面拓扑会同时损害生成指标和 Triangle Peg 部署；FELT 两种表示在四项最终成功率上都超过视觉-only。",
            "FELT latent 在 Triangle Peg 上达到 90%，高于真实触觉的 70%。作者认为低数据条件下，预训练生成器提供的平滑表征可能比带噪真实传感器更容易学习，但正文明确把这当作假设而非已证实机制。样本量只有 20 次，因此不能把该差异理解为生成触觉普遍优于真实触觉。",
          ],
        },
      ],
      equations: [
        {
          name: "触觉生成联合目标",
          expression: "L = E[L_contact(ĉ, c) + L_intensity(p̂, p)]",
          explanation:
            "L_contact 由 focal loss 与 dice loss 组成，负责稀疏接触检测；L_intensity 是对高压力单元加权的 Huber loss，负责压力幅值。该拆分避免背景像素主导训练。",
        },
        {
          name: "视觉到触觉映射",
          expression: "Gφ : I_vis(t) → Ĩ_tac(t)",
          explanation:
            "同一个生成器既可输出左右指面压力图，也可在最终预测头之前输出 12×32×256 的空间 latent。",
        },
      ],
      experimentReading: [
        "实验覆盖生成质量、策略成功率、结构消融和运行延迟，证据维度相对完整。",
        "真正的泛化只发生在生成器从 UMI 数据迁移到独立 xArm 对象和任务；下游策略仍按任务训练，不是跨任务零样本。",
        "视觉不可见接触、严重遮挡、跨传感器与跨相机设置仍未解决。",
      ],
      reflections: [
        "如果研究重点是 VLA 接触能力，更可迁移的做法可能不是重建完整压力图，而是让生成器预测 contact phase、slip risk、左右力不平衡和失败风险等直接服务动作的低维状态。",
        "下一步值得做的关键对照是：在相同策略容量下，将 FELT latent 与真实力/触觉历史、纯视觉时序特征以及联合蒸馏表征进行跨物体测试。",
      ],
    },
  },
  "2607.20912": {
    classification: {
      research: "其他",
      training: "BC",
      modalities: ["Force / Torque"],
      platforms: ["机械臂", "夹爪"],
    },
    resources: [{ label: "项目页", url: "https://jiyou384.github.io/urf_project_page/" }],
    experiments:
      "URF 在两项刚性接触真机任务中，每个方法各执行 20 次。Box Flipping 成功率为 90%，而 force-DP、ACP 和固定切换比例版本分别为 0%、25%、50–60%；Line Pressing 达到 100%，固定比例为 70%，ACP 为 0%。结果同时报告了危险失败、力增长率、接触维持率和力振荡。",
    experimentDetails: [
      {
        title: "Box Flipping：接触建立与安全性",
        setup:
          "Franka Research 3、腕部 RealSense D405、六轴力/力矩传感器；100 条直接拖动示范。低层控制器以 1 kHz 运行，策略在 RTX 4060 上推理。每个方法 20 次，初始物体位姿随试验变化。",
        comparisons:
          "相同力输入的标准 Diffusion Policy、只用 admittance 的 Adaptive Compliance Policy，以及将切换比例固定为 n=0.5 或 n=0 的两个消融。",
        results: [
          "完整 URF 成功率 90%，force-DP 为 0%，ACP 为 25%，固定 n=0.5 和 n=0 分别为 60% 与 50%。",
          "ACP 的危险失败率为 86.7%，峰值力增长率为 48.5±15.5 N/s；三个 URF 版本危险失败率均为 0%，完整 URF 的力增长率为 23.1±5.7 N/s。",
          "固定为 impedance-dominant 虽能抑制力增长，却会牺牲自由空间接近精度。完整 URF 在接近阶段保持 tracking，在接触前主动降低 n 和接触方向刚度。",
        ],
        evidenceNote:
          "该消融把“接触稳定”和“接近精度”分开，支持自适应切换而不是只证明 impedance 控制有效。",
      },
      {
        title: "Line Pressing：持续接触与轨迹跟踪",
        setup:
          "50 条直接拖动示范。成功要求沿线完成至少 85%，且接触阶段始终保持 5 N 以上；每个方法 20 次。",
        comparisons:
          "与 Box Flipping 相同的 force-DP、ACP 和固定 n 消融，并额外报告接触维持率和去趋势后的力振荡 RMS。",
        results: [
          "完整 URF 成功率 100%、接触维持率 100%、力振荡 0.96±0.36 N。",
          "两个固定 n 版本都能 100% 维持接触，但成功率均只有 70%，说明仅把力稳定住仍可能偏离轨迹。",
          "ACP 成功率 0%、危险失败率 100%，力在接近 0 N 与约 50 N 之间振荡并触发安全停机。",
        ],
        evidenceNote:
          "两项任务都偏向刚性接触，这是作者刻意选择的压力测试；结论不能直接外推到柔性工具、软物体或复杂插接。",
      },
    ],
    reproducibilityDetails: {
      status: "信息不足",
      verifiedResources: [
        "arXiv 给出 8 页正文、两张定量表和主要控制公式。",
        "项目页可访问，但仍保留模板占位文本；Code/Data 链接未核验为可用资源。",
      ],
      implementation: [
        "相机 60 Hz，六轴力信号 1 kHz 采集后低通并降采样到 100 Hz；低层 torque controller 为 1 kHz。",
        "策略联合预测 virtual target、刚度矩阵和 n∈[0,1] 的 impedance-admittance duty ratio，并用 receding horizon 执行动作 chunk。",
        "论文给出示范数量、控制硬件、基线刚度和 force-bound 标签构造。",
      ],
      missing: [
        "未公开可运行代码、训练数据、权重和完整超参数。",
        "force bounds 依赖人工设定，尚无跨工具、材料和控制轴的默认配置。",
      ],
    },
    deepDive: {
      lead:
        "URF 关注的不是“是否把力输入策略”，而是策略输出能否与低层交互控制器匹配。论文展示了一个很具体的失败：同样有力觉的 Diffusion Policy，如果最终仍由固定位置控制器执行，在刚性接触中可能完全失败。",
      sections: [
        {
          title: "把控制模式写进动作空间",
          paragraphs: [
            "高层策略不再只预测末端位姿，而是预测 virtual target xᵛᵗ、刚度矩阵 K 和切换比例 n。virtual target 是阻抗关系的平衡点，不要求机器人精确跟踪；K 决定位姿误差如何转换为交互力；n 决定一个控制周期中 admittance 与 impedance 两个阶段的占比。",
            "n=1 表示完全偏向 admittance，适合自由空间和弱接触中的轨迹跟踪；n=0 表示完全偏向 impedance，适合刚性接触稳定。两种控制器切换时通过 state mapping 保持命令力及其变化连续。",
          ],
        },
        {
          title: "示范如何产生控制标签",
          paragraphs: [
            "直接拖动示范只记录运动与力，并没有环境刚度真值。作者沿用 Adaptive Compliance Policy 的方法从力和运动反推 virtual target 与 K，再把测得的力幅值映射成 n 的监督标签：低于 f_min 时偏 admittance，高于 f_max 时偏 impedance。",
            "因此 URF 并不是线上比较两个控制器再做离散选择，而是 Diffusion Policy 一次预测整段 xᵛᵗ、K、n 序列。策略可根据视觉、位姿与力历史，在大力真正出现前降低 n。",
          ],
        },
        {
          title: "为什么两个任务的结果互相补充",
          paragraphs: [
            "Box Flipping 的难点是先准确接触，再避免力快速堆积。固定 impedance 能降低危险，却容易接触位置不准；ACP 跟踪准，却会在刚性接触后持续追 virtual target，造成工具断裂。完整 URF 在两个要求间切换。",
            "Line Pressing 则要求长时间保持接触并沿轨迹运动。固定 n 的力振荡已经很小，但仍因切向跟踪误差只有 70% 成功率；完整模型达到 100%。这组结果比只报告成功率更能说明控制模式预测的作用。",
          ],
        },
      ],
      equations: [
        {
          name: "阻抗阶段的目标动力学",
          expression: "M_d ë_t + D_d ė_t + K_t e_t = F_ext(t)",
          explanation:
            "e_t=x_t−xᵛᵗ_t。K_t 将实际位姿与 virtual target 的差转换成期望接触行为，外力直接进入闭环。",
        },
        {
          name: "策略的扩散训练目标",
          expression: "L = E[||ε − ε_θ(A_t^τ, τ, c)||²]",
          explanation:
            "动作 chunk A 同时包含 virtual target、刚度和切换比例，三个量不是独立后处理，而是在同一扩散目标下联合预测。",
        },
      ],
      experimentReading: [
        "证据对刚性接触很强：两个任务、明确危险失败、控制消融和力曲线互相对应。",
        "证据对任务多样性仍弱：只有两种固定工装，且 n 对所有控制轴共享。",
        "当前标签依赖 f_min/f_max，模型是否学习了可迁移接触状态，还是主要复现特定阈值附近的策略，尚未被跨任务验证。",
      ],
      reflections: [
        "对 VLA 更有价值的接口可能不是直接预测完整刚度矩阵，而是预测少量 controller-mode token，再由可验证低层控制器映射到轴向刚度与阻尼。",
        "下一步最关键的实验是插入、卡扣和柔顺装配：这些任务需要不同轴同时采用不同控制模式，正好检验共享标量 n 的上限。",
      ],
    },
  },
  "2607.21049": {
    classification: {
      research: "表征学习",
      training: "BC",
      platforms: ["机械臂", "夹爪"],
    },
    experiments:
      "三项仿真和三项真机任务共同评估位置、外观及组合 OOD。仿真最难的 Pos+App-OOD 中，默认 GuidedAttention 从 34.4% 提升到一次人工纠正后的 67.8%，普通 DP 为 28.9%；真机每个条件使用 3 个随机种子、每种子 10 次，人工纠正带来约 20–40 个百分点的额外提升。",
    experimentDetails: [
      {
        title: "仿真 OOD 与关键点纠正",
        setup:
          "MuJoCo 中 Cable、Ring、Particle 三项任务，各采集 30 条遥操作示范；每条示范只在首帧人工标两个关键点，后续由 Co-Tracker 传播。",
        comparisons:
          "默认 DP-GA、直接用坐标作为 feature 的变体、普通 Diffusion Policy、ACT，以及是否允许用户在 rollout 首帧纠正关键点。",
        results: [
          "ID 条件下默认 DP-GA 为 83.3%，普通 DP 为 67.8%，ACT 为 53.3%。",
          "Pos+App-OOD 下，默认 DP-GA 自主执行为 34.4%，一次纠正后为 67.8%；普通 DP 为 28.9%，ACT 为 8.9%。",
          "显式把纠正后的 attention feature 路由到动作模型很关键；只把点或框画在输入图像上，Pos+App-OOD 只有 3.3%–33.3%，而 DP-GA 为 83.3%。",
        ],
        evidenceNote:
          "人工纠正并不是免费泛化：它把 OOD 下“模型找错对象”的问题转化为一次用户点击。网站将自主结果与纠正后结果分开呈现。",
      },
      {
        title: "三项真机任务",
        setup:
          "UR5e、两个 RealSense D435 RGB 相机；Cup Insertion、Chain Pick-and-Place、Towel Fold 各 32 条示范。每个方法在每个条件下使用 3 个随机种子，每个种子 10 次 rollout。",
        comparisons:
          "ID、位置 OOD；Towel Fold 额外加入彩色积木造成的外观 OOD。比较 DP-GA 两种表示、DP、ACT，并分别测试自主与首帧纠正。",
        results: [
          "ID 下默认 DP-GA 比 ACT 高约 15–30 个百分点，比普通 DP 高约 5–15 个百分点。",
          "位置 OOD 下，自主 DP-GA 已略高于基线；首帧纠正再带来约 20–40 个百分点提升，具体幅度随任务而变。",
          "对跟踪关键点加入中等噪声时成功率较稳定，但噪声继续增大后逐步下降；作者也观察到严重形变场景中的 tracker 失败。",
        ],
        evidenceNote:
          "真机图表给出均值与随机种子，但正文没有逐任务数字表。这里仅保留正文明确报告的百分点区间，不从柱状图反推精确数值。",
      },
    ],
    reproducibilityDetails: {
      status: "部分可复现",
      verifiedResources: [
        "项目页可访问，论文给出仿真与真机任务、关键点定义和主要结果。",
        "全部实验基于公开的 RoboManipBaselines 框架；本次未确认论文专用代码和数据已经发布。",
      ],
      implementation: [
        "ResNet-18 patch feature + DETR-style Transformer encoder-decoder，输出预设数量的二维关键点及对应 feature。",
        "首帧人工标注，Co-Tracker 生成后续监督；rollout 时可只纠正部分关键点或部分相机。",
        "论文明确给出每项示范数量、真机 3 seeds × 10 rollouts 和 keypoint/feature alignment loss。",
      ],
      missing: [
        "未确认训练配置、checkpoint 和标注工具的一键复现。",
        "策略依赖人工预先定义“应该关注哪些点”，开放任务中的关键点发现没有解决。",
      ],
    },
    deepDive: {
      lead:
        "GuidedAttention 的核心不是新的视觉 backbone，而是把端到端策略里不可见的 attention 变成一个可检查、可替换的中间接口。它接受 OOD 下模型可能看错位置这一现实，用一次人工点击把错误从动作空间前移到感知表征层。",
      sections: [
        {
          title: "显式 attention 如何进入 Diffusion Policy",
          paragraphs: [
            "每个相机图像先由 ResNet-18 提取 patch feature，再由 DETR 风格的 encoder-decoder 使用若干 learnable query 预测关键点。decoder 的 attention feature 与 proprioception 拼接后，条件化 U-Net Diffusion Policy。",
            "模型既能把 feature 线性映射成二维坐标，也能用伪逆从用户给定坐标恢复 feature，并通过 feature-space alignment 让预测路径和 override 路径对动作模型保持一致。这样，部署时替换坐标不会突然把策略送入完全陌生的 feature 分布。",
          ],
        },
        {
          title: "标注、跟踪与 rollout 交互",
          paragraphs: [
            "训练数据只需在每条示范首帧点击关键点，动态点由 Co-Tracker 逐帧传播，固定环境点保持不变。训练时随机在预测 feature 和 ground-truth override feature 之间路由，让两条路径都能产生合理动作。",
            "部署时默认可以全自动。如果观察到关键点漂移，用户只在首帧纠正选中的点；随后 tracker 在整个 rollout 中传播它们。这个机制降低了交互频率，但把可靠性的一部分交给 tracker。",
          ],
        },
        {
          title: "实验真正支持的结论",
          paragraphs: [
            "仿真中，自主 DP-GA 在 ID 与 OOD 下已经优于普通 DP，说明显式任务点本身提供了表征约束；最困难条件下从 34.4% 到 67.8% 的提升则主要来自人工纠正。两种收益应分开理解。",
            "Marker Overlay Prompting 明显落后，说明把点画在图像上不等于让策略真正使用这个中间变量。另一方面，论文没有解决用户如何知道应该点击哪里，二维点也不能完整表达深度、遮挡和可变形物体状态。",
          ],
        },
      ],
      equations: [
        {
          name: "关键点监督",
          expression: "L_kp = (1/N_k) Σ_i ||p_i − p_i^gt||²",
          explanation:
            "该损失强迫 attention feature 保留可读的二维位置，而不是任意隐变量。",
        },
        {
          name: "关键点时序传播",
          expression: "p_i^gt[t] = G(p_i^gt[t−1], I[t], I[t−1])",
          explanation:
            "G 在论文中使用 Co-Tracker。人工只标首帧，但监督质量和部署可靠性都依赖跟踪器。",
        },
      ],
      experimentReading: [
        "位置与外观 OOD、仿真与真机、噪声敏感性和提示基线覆盖较完整。",
        "“纠正后结果”是人机协同系统结果，不应写成模型自身 OOD 泛化。",
        "所有任务都只使用两个预定义关键点，任务复杂度上升后交互成本与表示容量仍不清楚。",
      ],
      reflections: [
        "这个接口可以从二维点扩展成可编辑的 object token、mask、接触区域或 subgoal pose，让人类纠正更接近任务语义。",
        "对自主系统而言，更值得研究的是让模型输出 attention uncertainty，仅在不确定度高且会影响动作时请求纠正。",
      ],
    },
  },
  "2607.21582": {
    classification: {
      research: "VLA",
      training: "Post-training",
      data: "数据质量 / 筛选",
      platforms: ["机械臂", "夹爪"],
    },
    experiments:
      "论文先在六种 VLA/WAM backbone 上用 400 次 OOD rollout/因素对测量语言捷径，再在 π0、π0.5、GR00T-N1.7 上验证定向采集。真机 UR5 的三个任务中，每个 checkpoint 评估 48 次；V 策略平均比 L 高 28.7 个百分点、比随机采样高 16.7 个百分点，并在 Bun 上用 100 条示范超过两个使用 200 条示范的基线。",
    experimentDetails: [
      {
        title: "语言因素偏置诊断",
        setup:
          "将指令拆成 verb、color、object、size、spatial attribute 五个因素，共 6,480 种组合；训练时人为关联两个因素，测试未见的 off-diagonal 组合。",
        comparisons:
          "π0.5、π0、OpenVLA-OFT、GR00T-N1.7、XVLA、Genie-Envisioner 六个 backbone；每个因素对用 300 条示范训练、400 次 OOD rollout 评估。",
        results: [
          "除 OpenVLA-OFT 外，多数模型呈现 color ≥ object ≥ spatial ≥ verb ≥ size 的近似层级。",
          "例如 color-size 的 FDR 在六个模型上均为正，范围约 30.9%–56.0%，说明颜色比相对尺寸更容易成为捷径。",
          "rollout 由 Gemini-2.5-Flash 判定跟随了哪个冲突因素，附录报告与人工标注的一致性；这仍是评估管线的一项外部依赖。",
        ],
        evidenceNote:
          "FDR 衡量的是特定冲突构造中的相对偏置，不是语言理解总分，也不能直接跨数据集比较绝对数值。",
      },
      {
        title: "定向采集是否改善组合泛化",
        setup:
          "在仿真中比较 V（向弱因素分配样本）、L、Random 和 Complete；控制 demonstration budget 与 factor-change cost。真机使用 UR5、GR00T-N1.7，在 Bun、Pizza、Cup 上各构造 4×4 指令网格。",
        comparisons:
          "仿真覆盖 π0、π0.5、GR00T-N1.7；真机在 n=100/200 预算下比较 V、L、Random，每个 checkpoint 在 16 条指令上各执行 3 次，共 48 次。",
        results: [
          "仿真 Color-Object、Color-Spatial 上，V 比最好基线分别高 10 和 7 个百分点；All-Factor 中 n=400 超过基线 n=800。",
          "真机 n=100 时，V 在 Bun/Pizza/Cup 上分别为 54.2%、62.5%、66.7%；Random 为 37.5%、50.0%、47.9%，L 为 22.9%、35.4%、37.5%。",
          "Bun 上 V 的 100 条示范结果 54.2%，仍高于 L 与 Random 使用 200 条示范时的 37.5% 和 47.9%。",
        ],
        evidenceNote:
          "策略在受控桌面因素空间中有效，但 V 是按全局层级手工设计的一种采样方案，并非自动学习出的最优课程。",
      },
    ],
    reproducibilityDetails: {
      status: "信息不足",
      verifiedResources: [
        "arXiv 含 20 页正文与补充材料，公开了因素词表、采样算法伪代码、训练/评估组合和 VLM judge prompt。",
        "本次核验未找到论文专用代码、数据或 checkpoint 链接。",
      ],
      implementation: [
        "因素空间、FDR/FDH 计算、tie threshold τ=5% 和每个实验的 rollout 数量均有明确说明。",
        "真机硬件、相机、GELLO 采集、示范预算及每条指令的重复次数已报告。",
        "附录给出 Gemini-2.5-Flash 的输入格式、输出解析和人类一致性检查。",
      ],
      missing: [
        "没有可直接运行的评估与数据采集代码。",
        "完整训练超参数、各 backbone 的统一适配细节和真机数据未公开。",
      ],
    },
    deepDive: {
      lead:
        "这篇论文不提出新 VLA 结构，而是追问一个更实际的问题：当策略在新指令组合上失败时，究竟是哪个语言因素被忽略，以及下一批昂贵的机器人示范应该采在哪里。",
      sections: [
        {
          title: "把组合泛化失败拆成因素冲突",
          paragraphs: [
            "训练分布故意把两个因素绑定，例如某种 verb 总与某个 object 同时出现。测试时构造冲突场景：目标对象要求遵循其中一个因素，另一个候选对象只满足训练时的捷径关联。机器人最终对哪个对象执行什么动作，就暴露它更依赖哪个因素。",
            "FDR 用两种过拟合失败的计数差除以计数和，正负号给出偏向方向，绝对值表示偏置强度。再用 Copeland ranking 把所有因素对合成 FDH。该设计比总成功率更能定位失败，但依赖受控因素空间和 VLM 视频判别器。",
          ],
        },
        {
          title: "从诊断到数据分配",
          paragraphs: [
            "V 策略并不搜索整个组合空间，而是优先改变 FDH 排名较低的因素，同时保留对角与次对角组合。在三因素以上的设置中，会为多个弱因素增加采样列。目标是在相同示范数和环境切换成本下，提高弱因素的覆盖密度。",
            "这里的核心假设是不同 backbone 共享近似因素层级，因此不用为每个模型重跑全部 FDR。实验总体支持这一点，但 OpenVLA-OFT 已经显示例外，说明实际部署时仍可能需要小规模重新诊断。",
          ],
        },
        {
          title: "为什么真机结果有参考价值",
          paragraphs: [
            "真机不是只比较一个平均分，而是在三类因素对、两档预算和 48 次 rollout/checkpoint 下评估。V 在 100 条示范时稳定领先，并在 Bun 上超过使用双倍数据的随机与 L 基线，直接支持“分布设计优先于盲目加量”。",
            "不过三个任务仍是 4×4 的封闭组合，动作短、物体少。开放词汇、多步任务和自然语言改写中，因素并不一定可手工正交拆分，FDR 层级也可能随视觉 backbone、数据来源和任务阶段改变。",
          ],
        },
      ],
      equations: [
        {
          name: "Factor Dominance Rate",
          expression: "FDR(f₁,f₂) = (N_f₁ − N_f₂) / (N_f₁ + N_f₂ + ε)",
          explanation:
            "N_f₁ 与 N_f₂ 是两种冲突因素过拟合模式的次数。接近 0 表示两因素较平衡，符号表示主导方向。",
        },
        {
          name: "Factor Dominance Hierarchy",
          expression: "C(f_i) = Σ_{j≠i} 1[FDR(f_i,f_j) > τ],  τ=5%",
          explanation:
            "Copeland score 将两两偏置转成全局排序；论文的 V 采集策略按该排序优先补较弱因素。",
        },
      ],
      experimentReading: [
        "六个 backbone 的诊断、三个 backbone 的仿真采集和 GR00T 真机形成了较完整的验证链。",
        "VLM judge 使大规模失败归因可行，但也可能把视频理解误差带进 FDR。",
        "结论是“在该受控因素空间内，定向补弱项更有效”，不是颜色偏置在所有机器人数据中都永远最强。",
      ],
      reflections: [
        "对真实数据管线，可把因素从人工词表扩展为模型可观测的 failure slice，例如接触阶段、物体尺度、相机遮挡、动作速度和恢复行为。",
        "更进一步可以把 FDR 与主动学习结合：先用小规模 rollout 估计偏置和不确定度，再动态分配下一轮人工示范。",
      ],
    },
  },
  "2607.20653": {
    classification: {
      research: "WM",
      modalities: ["Depth / RGB-D", "Point Cloud / 3D"],
      data: "合成 / 仿真数据",
      platforms: ["机械臂", "夹爪"],
    },
    experiments:
      "在 12 条真实可变形物体轨迹上，PhysCoRe 用前半段识别材料、预测后半段。相对逐物体优化的 PhysTwin，弹性/弹塑性对象的 Chamfer 距离分别降低 43.7%/30.5%，识别时间从 930 s 降至 11.4 s；RfD 消融再带来 13.1%/17.8% 的 Chamfer 改善。真机主动探索仅展示置信度随局部形变上升，并未闭环比较探索策略。",
    experimentDetails: [
      {
        title: "未来形变预测",
        setup:
          "12 条真实 RGB-D 轨迹，包含绳、毛巾、毛绒熊和 Play-Doh；动作包括抬起、推动、拉伸和挤压。三台 RealSense D455 提供点云，CoTracker3 跟踪表面点，Grounded SAM2 给掩码。",
        comparisons:
          "PhysTwin、PGND 与 PhysCoRe。每种方法都用前 50% 轨迹识别材料，并在材料固定后预测剩余 50%。",
        results: [
          "相对 PhysTwin，弹性对象 Chamfer 距离降低 43.7%，tracking loss 降低 15.2%；弹塑性对象分别降低 30.5% 和 8.3%。",
          "弹性/弹塑性 Chamfer 由 PhysTwin 的 0.01617/0.00778 降到 0.00910/0.00541。",
          "材料识别/优化耗时：PhysCoRe 11.4 s，PhysTwin 930 s，PGND 8,280 s；PhysCoRe 测试 rollout 为 11.3 s。",
        ],
        evidenceNote:
          "真实数据规模只有 12 条轨迹，且对象类别有限。速度优势明确，类别级零样本泛化仍未验证。",
      },
      {
        title: "残差与置信度消融",
        setup:
          "固定 MfM 的材料预测，只比较 MPM rollout 与加入 RfD 网格速度残差；另在 KUKA + Robotiq Hand-E 上探测绳、毛巾和毛绒物体。",
        comparisons:
          "MfM-only 与 MfM+RfD；观察 per-particle confidence 是否随被形变区域变化。",
        results: [
          "加入 RfD 后，弹性对象 Chamfer 再下降 13.1%，弹塑性对象下降 17.8%，后者受未建模摩擦和不可逆形变影响更大。",
          "被机械臂主动形变的局部区域置信度上升，未交互区域保持较低，说明置信度至少与观测覆盖相关。",
          "论文没有让机器人根据置信度自动选择下一个动作，因此“confidence-guided exploration”目前是信号演示，不是策略收益实验。",
        ],
        evidenceNote:
          "这里主动区分了已完成的材料/残差预测验证与尚未完成的闭环主动探索。",
      },
    ],
    reproducibilityDetails: {
      status: "信息不足",
      verifiedResources: [
        "arXiv 采用 CC BY 4.0，17 页正文与附录包含 MPM、网络和训练损失细节。",
        "本次核验未找到代码、真实轨迹、合成数据或模型权重链接。",
      ],
      implementation: [
        "MfM 在合成材料增强数据上预训练，输出逐粒子材料、塑性类别和置信度；随后冻结 MfM，在真实轨迹上训练 RfD。",
        "附录给出输入编码、backbone、输出头、per-cell feature 和训练窗口设置。",
        "真实数据的相机、跟踪与分割工具、对象类型和评估切分均已报告。",
      ],
      missing: [
        "只有 12 条真实轨迹，数据划分与对象实例无法公开复核。",
        "MPM 默认参数、渲染与材料增强虽有描述，但缺少可执行工程和 checkpoint。",
      ],
    },
    deepDive: {
      lead:
        "PhysCoRe 试图在纯物理和纯学习之间做明确分工：MPM 保留连续介质的结构，MfM 从短时运动反推材料，RfD 只修正解析模型无法解释的剩余误差。它的重点是可变形对象 world model，而不是直接输出机器人动作。",
      sections: [
        {
          title: "Material from Motion",
          paragraphs: [
            "输入是分割后的多视角 RGB-D 观测和一段已发生的形变。MfM 为每个 MPM 粒子预测材料参数、弹性/塑性标签和置信度，避免像 PhysTwin 那样为每个新对象进行数百秒的逐对象优化。",
            "MfM 先在材料增强的仿真 rollout 上监督训练。置信度既乘在材料 Smooth-L1 误差上，又受到 −log(c) 正则约束，防止网络把置信度无限降到零来逃避误差。",
          ],
        },
        {
          title: "Residual from Dynamics",
          paragraphs: [
            "MPM 先按预测材料进行 particle-to-grid、grid update 和 grid-to-particle。RfD 不直接生成未来点云，而是在网格速度上加入 Δv，补偿离散化、摩擦、接触与简化本构模型的系统误差。",
            "训练 RfD 时冻结 MfM，并对多个 MPM substep 反向传播。监督同时使用从观测点云到模拟粒子的单向 Chamfer 距离，以及可见跟踪粒子的 L2 误差。",
          ],
        },
        {
          title: "结果与尚未闭合的环节",
          paragraphs: [
            "11.4 s 对 930 s 的材料识别速度差是最直接的工程收益；RfD 在弹塑性对象上贡献更大，也符合“解析模型越不完整，残差越重要”的设计预期。",
            "但所谓主动探索还没有闭环：实验只是显示机器人碰过的区域置信度变高，没有与随机探测、最大形变或信息增益策略比较。把它作为未来规划信号是合理启发，不能写成已经证明的控制能力。",
          ],
        },
      ],
      equations: [
        {
          name: "材料与置信度联合损失",
          expression: "L_refine = E[(1/N)Σ_p(c_p·SL1(φ̄_p,φ̄*_p) − λ log c_p)] + β·BCE(π,π*)",
          explanation:
            "置信度对材料误差加权，−log(c) 防止退化；BCE 负责弹性/塑性类别不平衡。",
        },
        {
          name: "真实轨迹残差监督",
          expression: "L_corr(t) = w_C·Chamfer(Ŷ_t,X_t) + w_L2·(1/|T_t|)Σ_{p∈T_t}||x_p(t)−x̂_p(t)||²",
          explanation:
            "点云项约束整体几何，跟踪点项约束同一表面点的运动；梯度穿过 MPM rollout 更新 RfD。",
        },
      ],
      experimentReading: [
        "相对基线、速度、几何指标和残差消融都较清楚。",
        "“generalization”主要是同类可变形对象的新实例，不是跨材料机制或类别级零样本。",
        "主动探索目前没有成功率、预测误差下降曲线或策略基线。",
      ],
      reflections: [
        "若要服务 manipulation planning，应进一步验证 world model 的误差降低是否真的改善动作选择，而不只改善未来点云。",
        "置信度可以与 MPC 或主动数据采集结合，但需要校准：高置信是否对应低 rollout error，而不只是“这块区域看过更多次”。",
      ],
    },
  },
  "2607.20665": {
    classification: {
      research: "其他",
      training: "RL",
      data: "合成 / 仿真数据",
      platforms: ["其他平台"],
      deployment: "Sim2Real",
    },
    experiments:
      "策略只在 2D 抽象仿真中训练，并零样本部署到 3–6 架 Crazyflie。训练团队规模为 3–5 架，真机额外测试未见的 6 架编队；除一个 6 机 Hard 场景停在目标附近外均完成。两组 5+3 架无人机还能把对方视作动态障碍完成各自运输，但论文未报告大规模重复次数。",
    experimentDetails: [
      {
        title: "仿真安全与规模泛化",
        setup:
          "将悬挂载荷压缩成平面刚体，虚拟弹簧连接各无人机与载荷；每个 agent 只使用局部图观测。训练时随机 3、4、5 架无人机，并随机弹簧刚度和物理参数。",
        comparisons:
          "DGPPO 与其他多智能体策略 backbone；额外测试感知/通信噪声、不同团队规模和 safety margin。",
        results: [
          "共享策略和图控制障碍函数在局部观测下联合训练，仿真显示对团队规模和传感/通信扰动的稳定性。",
          "连续时间分析通过收紧安全边界吸收低层 waypoint tracking error，而不是假设离散策略输出能被硬件精确执行。",
        ],
        evidenceNote:
          "仿真定量图较多，但网站不从图中估算未列成表格的精确数值，只保留作者明确报告的硬件完成情况。",
      },
      {
        title: "Crazyflie 零样本部署",
        setup:
          "Crazyflie 2.1 + thrust upgrade，0.5 m 绳、约 27 g 刚性载荷；策略 10 Hz 输出平面加速度，低层 PID 跟踪 waypoint。中心额外 Crazyflie 用于载荷定位。",
        comparisons:
          "4、5、6 机 Easy/Hard 场景，以及 5 机组与 3 机组相互作为动态障碍的多组运输。",
        results: [
          "训练只见 3–5 机，未见的 6 机编队能够零样本绕障；一个 6 机 Hard 场景未满足终点阈值，但没有发生安全失败。",
          "6 机 Hard 为容纳更大编队而降低了障碍密度，论文明确说明该场景不能与小团队 Hard 直接比较。",
          "5+3 机双组实验中，两组把对方通过 LiDAR 当作动态障碍并完成各自载荷运输。",
        ],
        evidenceNote:
          "硬件验证展示了规模和动态障碍泛化，但没有给出每种配置的大样本成功率或置信区间。",
      },
    ],
    reproducibilityDetails: {
      status: "信息不足",
      verifiedResources: [
        "arXiv 给出 2D 动力学、安全分析、domain randomization 范围和硬件参数。",
        "本次核验未找到代码、仿真环境、策略权重或硬件日志。",
      ],
      implementation: [
        "训练团队规模从 {3,4,5} 采样，虚拟弹簧刚度从 [0.05,0.30] N/m 采样。",
        "每个 agent 使用共享参数策略、局部图观测和 GRU；DGPPO 同时学习策略与离散图 CBF。",
        "硬件动作输出、频率、绳长、载荷质量和 safety tightening 思路均有说明。",
      ],
      missing: [
        "缺少可运行代码和安全约束实现细节的工程复现。",
        "硬件每个场景的重复次数、碰撞最小距离分布和 tracking-error 上界实测未完整报告。",
      ],
    },
    deepDive: {
      lead:
        "这篇工作的关键不是把完整无人机动力学塞进 RL，而是找到一个足够小的决策层模型，再用低层跟踪和 safety margin 承担 2D 抽象到 3D 硬件之间的误差。",
      sections: [
        {
          title: "最小平面抽象",
          paragraphs: [
            "载荷被建模为平面刚体，无人机是与载荷边缘连接的点质量，绳索作用用虚拟弹簧表示。对决策层而言，载荷姿态主要由各无人机平面位置产生的合力与力矩决定，因此策略只输出 x-y 加速度。",
            "这个抽象牺牲了摆动、姿态和三维绳动力学，但显著提高了多机训练吞吐。真实系统由 onboard PID 跟踪 waypoint，抽象误差通过闭环和收紧后的障碍约束处理。",
          ],
        },
        {
          title: "DGPPO 与安全桥接",
          paragraphs: [
            "策略在局部图观测上运行，GRU 补偿部分可观测。DGPPO 学习一个离散图控制障碍函数，对可能违反安全约束的策略更新进行过滤；共享参数让同一策略可用于不同团队规模。",
            "论文进一步给出离散安全到连续执行的条件：如果低层 tracking error 有界，就把 CBF 安全距离预先收紧 ε_trk。这样，真实轨迹即使偏离 waypoint，也仍留在原安全集合内。",
          ],
        },
        {
          title: "硬件泛化应怎样解读",
          paragraphs: [
            "未见 6 机与 5+3 机动态相遇是有价值的结构泛化证据，说明局部图策略没有把 agent 数写死。作者也诚实说明 6 机 Hard 调低了障碍密度，因此它不能作为“团队越大越稳”的直接比较。",
            "另一方面，硬件实验主要给代表性完成情况，没有按配置报告大量重复和安全裕度分布。它证明方案可运行，但还不足以统计性证明复杂环境中的安全概率。",
          ],
        },
      ],
      equations: [
        {
          name: "平面虚拟弹簧耦合",
          expression: "T_i = K[p_i − (p_payload + r·[cos(2πi/N), sin(2πi/N)]ᵀ)]",
          explanation:
            "该力近似保留了无人机位置、载荷中心和挂点间的主要耦合，是低成本仿真的核心。",
        },
        {
          name: "连续执行安全直觉",
          expression: "tracking error ≤ ε_trk  ⇒  在 ε_trk 收紧后的 DGCBF 安全集内规划",
          explanation:
            "论文不是宣称 RL 自动满足连续安全，而是把低层跟踪误差显式计入安全边界。",
        },
      ],
      experimentReading: [
        "真机数量、未见团队规模和动态多组场景都比常见两三机演示更有说服力。",
        "安全结论依赖 tracking error 有界、集中式状态估计与平面决策层假设。",
        "6 机 Hard 的障碍密度变化和缺少重复统计，需要在阅读结论时保留。",
      ],
      reflections: [
        "这一思路可迁移到多机械臂搬运：学习低维协同 wrench 或 object-centric waypoint，再由每个机械臂的可验证控制器跟踪。",
        "若要面向开放环境，应把安全裕度从固定上界扩展为随速度、通信延迟和团队几何变化的在线估计。",
      ],
    },
  },
  "2607.21341": {
    classification: {
      research: "Subtask",
      modalities: ["Point Cloud / 3D"],
      platforms: ["机械臂", "夹爪"],
    },
    experiments:
      "60 个仿真重定向任务覆盖 easy/medium/hard。BiCompoDiff-HO 在 200 个抓取对设置下成功率 70.0%，NoEBM 为 41.7%；与改造的 ReorientBot 比较时为 81.7% 对 58.3%。两组双 UR12e 真机场景只报告轨迹关节位移改善 59.7%/46.4%，且假设物体位姿与几何完全已知。",
    experimentDetails: [
      {
        title: "60 个仿真任务与能量消融",
        setup:
          "20 easy、20 medium、20 hard 的双臂 pick-handover-regrasp-place 任务；hard 包含 bin picking 与狭窄货架。默认每个场景评估 200 个 grasp pairs。",
        comparisons:
          "无 EBM、Full joint optimization、只重点优化 handover 的 HO 模式、移除 MCMC，以及不同能量梯度步数 k。",
        results: [
          "NoEBM 成功率 41.7%，Full 为 63.3%，HO 为 70.0%；Full 的总关节位移从 7.293 rad 降到 4.569 rad。",
          "Full 相对 NoEBM 将关节位移、末端路径长度、执行时间和 regrasp cost 分别降低约 37%、20%、23%、84%。",
          "去掉 MCMC 后成功率为 57.8%；增加梯度步数 k 的主要收益在 5–6 步附近饱和，计算时间继续上升。",
        ],
        evidenceNote:
          "Full 最平滑，HO 成功率最高，说明把所有目标都同时优化并非在每个指标上占优。",
      },
      {
        title: "基线与真机验证",
        setup:
          "与适配到双臂任务的 ReorientBot 在 100 grasp pairs 下比较；真机使用两台 UR12e 与 Robotiq Hand-E，执行预计算轨迹。",
        comparisons:
          "NoEBM、ReorientBot、BiCompoDiff-Full，以及移除 grasp collision gradient 的消融。",
        results: [
          "BiCompoDiff 成功率 81.7%，ReorientBot 为 58.3%；关节位移低 12.5%，执行时长低 7.0%。",
          "真机 T-shape brick 的关节位移从 10.850 rad 降至 4.371 rad，cup 从 10.126 rad 降至 5.427 rad。",
          "真机只覆盖两个代表场景，未报告成功次数；系统假设 perfect perception，重点验证轨迹效率而非端到端鲁棒性。",
        ],
        evidenceNote:
          "因此本文更适合作为 inference-time compositional optimization 参考，不应写成已解决开放场景双臂重定向。",
      },
    ],
    reproducibilityDetails: {
      status: "信息不足",
      verifiedResources: [
        "arXiv 公开完整方法、Algorithm 1、60 个任务划分、能量项和主要参数表。",
        "方法依赖公开的 GraspGen checkpoint 与 cuRobo，但本次未确认 BiCompoDiff 代码、任务资产或 SubnetIK 权重公开。",
      ],
      implementation: [
        "GraspGen 生成 initial/target 6-DoF grasp prior，planning EBM 提供碰撞、平滑、handover 和 regrasp 梯度。",
        "默认 M=5 次 MCMC refinement，只在最后 k=3 个 denoising steps 注入 planning gradient。",
        "真实平台、抓取器和执行方式已报告。",
      ],
      missing: [
        "没有公开工程以复现能量权重、场景几何和 SubnetIK。",
        "perfect perception 假设下没有给位姿噪声、遮挡或执行失败恢复参数。",
      ],
    },
    deepDive: {
      lead:
        "BiCompoDiff 把“先采抓取，再过滤，再做运动规划”的串行流程改写成一个联合采样问题：预训练抓取 diffusion 提供可抓取先验，多个可微能量在反向扩散中持续把样本推向双臂可执行区域。",
      sections: [
        {
          title: "三个关键位姿与组合能量",
          paragraphs: [
            "系统联合优化 pick grasp g_PK、place grasp g_PL 和 handover pose g_HO。GraspGen 分别在初始和目标物体点云上提供多模态 6-DoF grasp prior；handover pose 从预定义区域初始化。",
            "planning EBM 包含抓取碰撞、双臂碰撞、轨迹平滑、handover 对齐与 regrasp 安全等项。SubnetIK 提供可微逆运动学近似，使完整双臂关节路径的代价能够反传到关键位姿。",
          ],
        },
        {
          title: "为什么还需要 annealed MCMC",
          paragraphs: [
            "在前期 denoising 中只依赖抓取 prior，最后 k 步才加入任务能量，避免过早把样本拉离可抓取流形。每个受约束步再进行 M 次带噪梯度更新，在组合能量景观中探索多个局部可行解。",
            "实验显示 MCMC 同时改善大多数指标，但也增加推理时间；k 增大到 5–6 后收益趋于饱和。默认 k=3 是作者选择的质量-时间折中，而不是理论最优。",
          ],
        },
        {
          title: "实验的强弱边界",
          paragraphs: [
            "60 个仿真场景和多个能量消融充分说明联合优化能减少碰撞与关节运动；与 ReorientBot 的比较也支持其优于枚举式 sample-and-filter。",
            "真机只证明在已知几何和位姿下，预计算轨迹更短。没有感知、在线重规划、执行反馈和成功率统计，因此不能把仿真的 81.7% 直接理解为真机完成率。",
          ],
        },
      ],
      equations: [
        {
          name: "组合能量采样",
          expression: "E_total(g,t) = E_grasp(g,t) + Σ_i λ_i c_i(g)",
          explanation:
            "预训练 diffusion 的隐式抓取能量与碰撞、平滑、handover 等 planning cost 相加，负梯度在反向扩散中共同引导样本。",
        },
        {
          name: "末段梯度注入",
          expression: "t > k：标准 reverse diffusion；t ≤ k：执行 M 次带 planning gradient 的 MCMC refinement",
          explanation:
            "先保持 grasp prior，多数任务约束只在低噪声末段介入，避免把样本拉出可行抓取分布。",
        },
      ],
      experimentReading: [
        "仿真证据完整，真机证据是轨迹效率而不是任务成功统计。",
        "方法收益依赖准确 scene point cloud、物体几何和位姿。",
        "Full 与 HO 的取舍提醒我们：统一目标函数并不保证所有子指标同时最优。",
      ],
      reflections: [
        "对真实双臂系统，最值得加入的是执行后状态验证与局部重采样，而不是一次性把整条轨迹算完。",
        "能量接口可以接入 learned collision risk、接触稳定性和语言约束，使 diffusion prior 与可验证几何约束分工。",
      ],
    },
  },
  "2607.20679": {
    classification: {
      research: "表征学习",
      modalities: ["Depth / RGB-D"],
      platforms: ["轮式底盘", "其他平台"],
    },
    experiments:
      "CAT 在人工轨迹与机器人真实执行轨迹两种协议上评估，并对同一场景切换平台能力。held-out 轨迹 AUROC 为 0.945，最强基线为 0.851；真机 Spot 森林绕障 10/10，TerraSentia 楼梯规避 7/10。三次轮式失败来自贪心 pure-pursuit 穿过已正确标出的危险区，显示感知提升不等于系统端到端安全。",
    experimentDetails: [
      {
        title: "稠密可通行性预测",
        setup:
          "共同训练 wheeled、legged、differential、ATV 四种 robot profile；differential 没有真实轨迹，只由 Qwen3-VL 生成能力向量。训练 35 epochs，单张 L40S 约 8 小时。",
        comparisons:
          "WayFAST RGB/RGB-D、W-RIZZ；分别在 NaviTrace 人工安全轨迹和按序列 held-out 的真实机器人执行轨迹上评估。",
        results: [
          "held-out 轨迹上 CAT 的 AUROC/AUPRC 为 0.945/0.832；最强基线分别为 0.851/0.641。",
          "NaviTrace 上 CAT 的 AUPRC 为 0.169，最强基线为 0.146；AUROC 0.794，与 WayFAST RGB-D 的 0.791 接近。",
          "切换到 legged profile 时，legged-specific path 平均可通行性增加 14.2%，wheeled path 只增加 2.8%，支持能力条件化而非统一地图后过滤。",
        ],
        evidenceNote:
          "轨迹外像素是“未标注”而非真实障碍，AUROC/AUPRC 应理解为 path alignment，不是像素级安全分类准确率。",
      },
      {
        title: "两种本体的真机部署",
        setup:
          "Spot 使用机身 RGB-D，TerraSentia 使用 ZED 2i；Jetson Orin Nano 上端到端 4.8 Hz，输出交给简单的 greedy pure-pursuit planner。",
        comparisons:
          "legged profile 在树林绕树，wheeled profile 在楼梯前规避不可通行高度变化。",
        results: [
          "Spot 森林路线 10/10，TerraSentia 楼梯规避 7/10。",
          "DINOv3 RGB+depth 两次前向约 96.9 ms，异步 CLIPSeg 约 53.4 ms，trainable projection+SPADE 约 18.8 ms。",
          "TerraSentia 的 3 次失败由 planner 追逐远处 waypoint、切过已被感知模块标红的危险区域造成。",
        ],
        evidenceNote:
          "论文很好地区分了 perception error 与 planner error；这也是为什么本条目不标为“真机部署优化”。",
      },
    ],
    reproducibilityDetails: {
      status: "信息不足",
      verifiedResources: [
        "arXiv 给出完整网络、loss、训练超参数、数据切分、运行时分解和两平台试验次数。",
        "基线使用其公开 checkpoint；本次未确认 CAT 代码、标注工具、robot profile 或权重公开。",
      ],
      implementation: [
        "冻结 DINOv3 与 CLIPSeg，RGB/depth feature 拼接后投影；4 个 SPADE block 从 14×14 上采样到 224×224。",
        "每个 robot profile 维护单位范数 prototype，以 EMA 更新；可通行性为局部 feature 与 prototype 的 cosine similarity。",
        "训练使用 trajectory 与 dense mask 两种 InfoNCE，权重 ω=0.05，batch size 128。",
      ],
      missing: [
        "交互标注、Qwen3-VL 能力向量生成和 profile 数据未开放。",
        "没有 planner-aware 训练或动态障碍的大规模真机测试。",
      ],
    },
    deepDive: {
      lead:
        "CAT 的出发点是：同一块地形对轮式、足式和 ATV 并没有统一的“可通行”标签。它把机器人能力提前注入视觉表征，而不是先生成一张通用地图、最后再按平台规则过滤。",
      sections: [
        {
          title: "视觉、语义与 robot profile 如何融合",
          paragraphs: [
            "RGB 与复制成三通道的 depth 分别通过冻结 DINOv3，feature 拼接并线性投影。CLIPSeg 根据 terrain prompt 输出多类语义概率，再与 robot traversability vector 逐通道相乘，压低该本体不适合的地形类别。",
            "调制后的语义图进入四层 SPADE decoder，在每个空间位置生成 γ 和 β，改变视觉 feature 的归一化结果。同一张 RGB-D 因 robot vector 不同而得到不同 dense feature。",
          ],
        },
        {
          title: "prototype 与正负样本",
          paragraphs: [
            "每个 robot profile 有一个 EMA 更新的 traversability prototype。每个像素的可通行性就是局部 feature 与该 prototype 的 cosine similarity。",
            "监督来自两部分：机器人真实轨迹像素，以及用 zero-shot segmentation、时序传播和人工低置信修正产生的 dense mask。轨迹和 mask 都采用 InfoNCE，把正像素拉向 prototype，负像素推远。",
          ],
        },
        {
          title: "从感知指标到系统表现",
          paragraphs: [
            "held-out 轨迹上的提升很明显，profile 切换实验也支持能力条件化。两种真机都能运行在边缘设备上，说明架构不是纯离线评测。",
            "但 TerraSentia 的失败表明正确地图仍可能被简单 planner 破坏。论文把原因归到 pure-pursuit 是合理的，同时也意味着整套系统尚未形成可验证安全闭环。",
          ],
        },
      ],
      equations: [
        {
          name: "SPADE 能力条件化",
          expression: "SPADE(u,Ŝ_r) = γ(Ŝ_r) ⊙ BN(u) + β(Ŝ_r)",
          explanation:
            "Ŝ_r 是按机器人能力调制后的语义图；它在每个空间位置改变视觉 feature，而非只在输出端乘一个 mask。",
        },
        {
          name: "联合对比学习",
          expression: "L = (1−ω)L_traj + ωL_mask",
          explanation:
            "真实执行轨迹提供物理可行的稀疏正样本，人工修正的 dense mask 补充空间覆盖；两项都是像素级 InfoNCE。",
        },
      ],
      experimentReading: [
        "跨 profile、离线指标、结构消融、运行时与两平台真机构成了合理证据链。",
        "differential profile 没有真实轨迹，四 profile 共同训练不等于对未见本体零样本迁移。",
        "固定 terrain prompts 和 semantic grouping error 是主要上限。",
      ],
      reflections: [
        "这类 capability token 可以从平台类别扩展成连续参数，例如宽度、离地间隙、最大坡度和可承受冲击，从而避免每个平台一个离散 profile。",
        "感知输出最好与 risk-aware planner 联合校准，让远处高分 waypoint 不能穿越中间的低可通行区域。",
      ],
    },
  },
  "2607.21571": {
    classification: {
      research: "Memory",
      modalities: ["Point Cloud / 3D"],
      platforms: ["其他平台"],
    },
    experiments:
      "Sequential-EQA 保持模型参数和环境不变，只让同一场景的多问题连续执行。3D-Mem 的仿真答题成功率从 25.5% 提升到 58.8%，路径长度从 5.6 降到 2.6；其他三种记忆结构的准确率增益都低于 3%。Unitree Go2 真机中 3D-Mem 从 20% 提升到 40%，但每种环境只有一组 episodic/sequential trial，统计很弱。",
    experimentDetails: [
      {
        title: "Sequential-EQA 仿真评估",
        setup:
          "把同一 3D 场景的问题按固定随机种子组成序列；episodic 每题清空 memory，sequential 在问题间保留 memory。模型权重和环境不变。",
        comparisons:
          "ExploreEQA 的 2D occupancy/frontier、MemoryEQA 的 RGB+pose+描述事件库、3D-Mem 的 point cloud+visual embedding、UniNavid 的隐式 Transformer state。",
        results: [
          "3D-Mem 成功率从 25.5% 到 58.8%，Memory Advantage +33.3%；路径长度从 5.6 到 2.6，Step Advantage +53.3%。",
          "ExploreEQA、MemoryEQA、UniNavid 的准确率增益分别为 2.7%、1.4%、0.9%，并未随更长问题序列稳定上升。",
          "只有 3D-Mem 同时提高答案准确率与减少导航；其他 memory 可能只是减少移动，甚至因为过早停止而看起来更高效。",
        ],
        evidenceNote:
          "这是一篇评估协议与架构诊断论文，不训练新的 memory model。",
      },
      {
        title: "Unitree Go2 真机复核",
        setup:
          "Go2 + RealSense D435i + LiDAR L2；室内实验室、开放大厅、长走廊，UniNavid 额外测试室外露台。每组 trial 有 5 个问题。",
        comparisons:
          "四种方法都各执行 episodic 与 sequential trial，问题间机器人回到相同起点，但 sequential 保留内部状态。",
        results: [
          "3D-Mem 成功率从 20% 到 40%，MemoryEQA 从 40% 到 47%。",
          "ExploreEQA 从 33% 降到 26%，UniNavid 在两种设置都为 15%。",
          "真实环境结果方向与仿真一致，但每环境试验很少，论文自己也提醒 ExploreEQA 的下降可能来自小样本。",
        ],
        evidenceNote:
          "真机适合确认失败模式存在，不足以对方法间差距做强统计结论。",
      },
    ],
    reproducibilityDetails: {
      status: "资源较完整",
      verifiedResources: [
        "项目页与 GitHub 均可访问，论文承诺发布 sequential sequences、split code 和 evaluation configuration。",
        "arXiv 给出四类 memory 的存储内容、检索方式、评估公式、仿真表格与真机协议。",
      ],
      implementation: [
        "不修改原模型参数，仅控制问题序列、memory reset 和跨问题状态保留，因而较容易隔离架构因素。",
        "同一场景问题顺序使用固定随机种子，对所有方法保持一致。",
        "真机平台、传感器、环境类型和每个 trial 的问题数量均已报告。",
      ],
      missing: [
        "真机每个环境只做少量对照，没有多随机种子与置信区间。",
        "不同原方法的工程依赖和 VLM API 仍可能使端到端复现成本较高。",
      ],
    },
    deepDive: {
      lead:
        "这篇论文问的是一个容易被忽略的问题：把 memory 在 episode 之间“留着不清空”，是否真的等于积累知识。答案是否定的；memory 的存储结构和训练时序必须允许后续问题检索到之前看到的视觉语义证据。",
      sections: [
        {
          title: "协议如何隔离 memory 架构",
          paragraphs: [
            "episodic 设置对每个问题把 m 重置为空；sequential 设置把上一个问题结束时的 m_i 交给下一问题。环境、问题和模型参数都不变，因此性能差异主要来自 retained state 是否可复用。",
            "指标同时观察答案成功率和路径长度。只减少路径并不一定更好：agent 可能因为错误地相信旧 memory 而提前停止，所以必须看到准确率与效率同时提升。",
          ],
        },
        {
          title: "四种 memory 为什么表现不同",
          paragraphs: [
            "ExploreEQA 只存 occupancy 与 frontier score，知道走过哪里，却没有保留物体外观。MemoryEQA 存 RGB、pose、描述和 embedding，但条目彼此独立，序列变长后检索噪声增加。",
            "UniNavid 的 hidden state 在短 episode 上训练，跨问题长历史对它是 OOD 输入；3D-Mem 则把视觉 embedding 绑定到 metric 3D 坐标，多视角观测融合到同一空间结构，后续问题可以按位置检索已经看到的证据。",
          ],
        },
        {
          title: "结果的意义与边界",
          paragraphs: [
            "3D-Mem 同时得到 +33.3% accuracy advantage 和 +53.3% path reduction，是论文最核心的证据。它说明结构化空间 memory 不只是压缩轨迹，而是让前一次探索真正改变后续答案。",
            "但任务是 EQA，不是 manipulation；真机样本也很少。对操作策略的可迁移结论应是“状态必须可索引、可合并、可验证”，而不是直接照搬完整 3D map。",
          ],
        },
      ],
      equations: [
        {
          name: "Episodic 评估",
          expression: "τ_i ~ π(q_i, m₀),  m₀=∅",
          explanation:
            "每个问题都从空 memory 开始，无法复用之前探索到的证据。",
        },
        {
          name: "Sequential 评估",
          expression: "τ_{i+1} ~ π(q_{i+1}, m_i)",
          explanation:
            "下一问题继承上一问题终止时的 memory；协议只改变 memory 连续性，不重新训练 agent。",
        },
      ],
      experimentReading: [
        "仿真对照清楚地揭示“保留状态”与“积累知识”的区别。",
        "3D-Mem 初始 episodic 成功率较低，增益很大不等于绝对性能在所有方法中最高。",
        "真机结果只有少量 trial，应视作趋势复核。",
      ],
      reflections: [
        "操作策略的 memory 可以采用事件-对象双索引：对象状态绑定 3D/object token，接触、完成和失败绑定 episode event，而不是无限堆叠帧。",
        "评估 memory 时应同时看任务收益、重复动作减少和错误记忆带来的负迁移，避免只报告 context length。",
      ],
    },
  },
} satisfies Record<string, Partial<Paper>>;
