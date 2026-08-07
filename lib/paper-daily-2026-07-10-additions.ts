import type { Paper } from "./site-data";

export const paperDaily20260710Additions: Paper[] = [
  {
    rank: 1,
    title: "SkillPlug: Unsupervised Skill Mining for Few-Shot Adaptation in Robotic Manipulation",
    arxivId: "2607.08354",
    url: "https://arxiv.org/abs/2607.08354",
    institutions: ["Nanyang Technological University"],
    signal: "从多任务示范中无监督挖掘可复用技能库，只微调轻量路由器和动作头即可适配少样本新任务",
    tags: ["Skill Mining", "Few-shot Adaptation", "Imitation Learning"],
    classification: {
      research: "Subtask",
      training: "BC",
      platforms: ["机械臂", "夹爪"],
    },
    motivation:
      "端到端 visuomotor policy 往往把跨任务共有的 approach、grasp、transport 等行为隐含在网络权重里；面对只有少量示范的新任务时，策略难以显式复用这些结构。",
    methodSummary:
      "SkillPlug 在原策略的视觉特征与动作头之间插入共享技能库、skill interactor 和 router；训练期用只读取动作片段的 posterior encoder 挖掘行为级技能，适配期冻结主干和技能，仅更新 router 与 action head。",
    architecture:
      "K 个可学习 skill embeddings 分别通过 cross-attention 调制同一场景特征，router 为每个 action chunk 生成混合权重。训练期额外使用 trajectory-skill VAE posterior；部署时移除 posterior，只保留确定性技能、轻量 interactor 与 router。",
    optimization:
      "以 action-chunk L1 行为克隆为主目标，并加入 KL bottleneck、行为—技能对齐和技能去冗余三项自监督损失；新任务不重训视觉 backbone，也不使用 RL。",
    data:
      "DISCOVERSE 上以 7 个任务、每任务 300 条示范学习技能，再用 4 个未见任务各 10 条示范适配；LIBERO 从 Long 套件迁移到 Object、Goal、Spatial，每个新任务仅 5 条示范。真机先训练 6 个接触操作，再以 3 个未见任务各 5 条示范适配。",
    experiments:
      "DISCOVERSE 和 LIBERO 均报告 3 个训练种子；LIBERO 五示范迁移平均从 44.9% 提升到 83.2%。Galaxea A1 真机上，六个训练任务平均从 9.7/20 提至 15.7/20，三个五示范新任务从 6.0/20 提至 11.7/20。",
    novelty:
      "相对人工分段、VLM 标签或只靠 MoE 自发分工，SkillPlug 用动作片段自监督约束技能的紧凑性、行为一致性和相互差异，并把这些技能作为固定先验迁移到新任务。",
    strengths:
      "同一插件在 ACT 和 OpenVLA-OFT 两种规模的主干上验证；仿真包含多种子、逐项损失消融，真机还用未见任务和固定五示范预算检查迁移。",
    limitations:
      "消融变体多为单训练种子；真机每任务 20 次且只覆盖单臂桌面操作。技能库在多任务训练后固定，如果新任务需要完全未见的行为原语，路由器无法自行扩充技能集合。",
    transfer:
      "可把 skill library 作为 VLA action head 前的轻量可复用接口，让新任务优先学习已有技能的组合；同时应保留可扩展或拒绝机制，避免固定技能库强行解释新行为。",
    experimentDetails: [
      {
        title: "跨主干少样本迁移",
        setup:
          "DISCOVERSE：7 个训练任务、4 个未见任务，训练任务各 300 demos、未见任务各 10 demos、每任务 50 次评估；LIBERO：从 Long 迁移到其他三套件，每任务 5 demos、每套件 500 次评估。",
        comparisons:
          "ACT 与 ACT+SkillPlug；OpenVLA-OFT 与 OpenVLA-OFT+SkillPlug。两组基线使用相同少样本协议，基线只微调 action head，SkillPlug 额外微调 router。",
        results: [
          "DISCOVERSE 四个未见任务平均从 29.7% 提升到 47.8%，完整模型报告 3-seed mean±SE。",
          "LIBERO 五示范迁移：Object 47.4→79.6、Goal 45.4→83.2、Spatial 42.0→86.8。",
          "LIBERO 多任务训练已接近饱和，完整模型在 Spatial 从 96.4 降到 95.6，说明技能插件并非所有设置都单调增益。",
        ],
        evidenceNote:
          "多种子和大规模 rollout 支持迁移方向；LIBERO 饱和任务的轻微回退也需要与少样本增益一并阅读。",
      },
      {
        title: "技能目标消融与真机",
        setup:
          "DISCOVERSE 逐步加入 KL、skill disentanglement 和 behavioral skill alignment；Galaxea A1 + 平行夹爪上训练 6 个任务，并以 3 个未见任务各 5 demos 适配，每任务 20 trials。",
        comparisons:
          "仅重建、+KL、+去冗余、+行为对齐，以及真机 ACT 与 ACT+SkillPlug。",
        results: [
          "DISCOVERSE few-shot 平均依次为 27.5、36.0、41.0、47.8；完整目标的 47.8±1.5 为三种子结果，消融行是单种子诊断。",
          "真机六个已见任务平均成功数 9.7/20→15.7/20。",
          "三个未见任务五示范适配平均 6.0/20→11.7/20，其中 stand cup 为 3→12。",
        ],
        evidenceNote:
          "真实实验直接检验固定技能库的少样本复用，但每格 20 次且没有独立训练种子，适合判断大幅方向而非精确差值。",
      },
    ],
    reproducibilityDetails: {
      status: "部分可复现",
      verifiedResources: [
        "arXiv HTML 公开完整网络、损失、两个仿真协议、真机平台与每任务 trial 数。",
      ],
      implementation: [
        "DISCOVERSE 使用 ACT、K=4、chunk 25、batch 16、学习率 1×10⁻⁴；LIBERO 使用 OpenVLA-OFT、K=8。",
        "总目标为 Lrec + λKL LKL + λBSA LBSA + λSD LSD；适配时冻结 backbone 与 skill embeddings。",
      ],
      missing: [
        "论文页面未提供可核验的代码或权重链接；真实数据、训练时长和硬件配置未公开。",
        "消融 checkpoint 多为单训练种子。",
      ],
    },
    deepDive: {
      lead:
        "SkillPlug 的重点不是给轨迹事后贴技能标签，而是在动作策略内部建立一组可组合、可跨场景复用的行为基向量。",
      sections: [
        {
          title: "从动作片段挖技能",
          paragraphs: [
            "posterior encoder 只读取 action chunk 与 skill embedding，不读取图像，因此更难把背景、物体纹理等场景信息写进技能。KL bottleneck 限制每个技能吸收过多轨迹细节。",
            "behavioral alignment 让与同一动作片段相容的技能得分更高；去冗余目标则压低不同技能调制后特征的余弦相似度，避免所有 skill embeddings 收敛为近似行为。",
          ],
        },
        {
          title: "适配时只重学组合",
          paragraphs: [
            "每个技能通过 interactor 调制场景特征，router 在一个 action chunk 内给出共享混合权重。输出维度与原特征一致，所以 ACT、VLA 等不同主干都可以继续使用原 action head。",
            "新任务冻结视觉主干和技能库，只更新 router 与 action head；这把少样本学习的重点从重新发现低层行为转为选择、组合已有技能并校准动作输出。",
          ],
        },
      ],
      equations: [
        {
          name: "联合技能学习目标",
          expression: "L = Lrec + λKL·LKL + λBSA·LBSA + λSD·LSD",
          explanation:
            "重建保证动作可执行，KL 控制容量，BSA 让技能对齐行为片段，SD 减少技能间冗余。",
        },
      ],
      experimentReading: [
        "LIBERO 少样本增益远大于多任务饱和设置，说明该方法的主要价值是迁移效率，而不是无条件抬高强基线。",
        "真机和两个仿真主干方向一致，但固定技能库仍可能成为全新动作原语的瓶颈。",
      ],
      reflections: [],
    },
    figures: [
      {
        src: "/report-assets/2026-07-10/2607.08354-overview.png",
        alt: "SkillPlug 的共享技能库、skill interactor、router 和训练期 trajectory-skill posterior 结构",
        caption:
          "Figure 2 · SkillPlug 架构与训练流程：从多任务动作片段挖掘技能，部署时移除 posterior encoder。图片来自 arXiv HTML 原图。",
      },
    ],
  },
];
