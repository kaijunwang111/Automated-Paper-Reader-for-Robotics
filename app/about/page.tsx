import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "具身智能观察站的论文范围、分类体系、内容结构与公开边界。",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <section className="page-hero shell">
        <span className="section-index">ABOUT / METHODOLOGY</span>
        <h1>范围、分类与公开边界。</h1>
        <p>
          具身智能观察站整理近期 arXiv 论文与机器人公司的官方动态，
          用可检索的结构化概览呈现方法、训练阶段、数据、实验与局限。
        </p>
      </section>
      <section className="shell about-grid">
        <article>
          <span>01</span>
          <h2>论文范围</h2>
          <p>
            当前论文源仅使用 arXiv，覆盖 VLA、WAM、world model、RL、memory、subtask、
            humanoid、多模态感知、Real2Sim2Real 与真机部署优化等方向。
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>分类体系</h2>
          <p>
            数据库同时标注 CoT、Pre-training、Post-training、数据质量、数据增强与
            UMI / Ego 数据；“其他”用于收录可迁移的 LLM、VLM 等领域外工作。
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>内容结构</h2>
          <p>
            每篇概览整理研究出发点、模型结构、预训练或后训练方式、数据组成、实验结果、
            亮点、局限、迁移价值，以及项目页、GitHub 或模型链接。
          </p>
        </article>
        <article>
          <span>04</span>
          <h2>核对与公开边界</h2>
          <p>
            本地日报保留检索、运行与评分信息用于排查，公开网站不展示内部评分。公司动态只采用
            官网、官方博客或官方仓库，并把公告中的计划与性能主张视为公司口径。
          </p>
        </article>
      </section>
    </div>
  );
}
