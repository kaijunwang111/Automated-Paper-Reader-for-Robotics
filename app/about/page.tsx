import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "具身智能观察站的方法、评分与更新说明。",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <section className="page-hero shell">
        <span className="section-index">ABOUT / METHODOLOGY</span>
        <h1>从论文摘要之后开始。</h1>
        <p>
          具身智能观察站是 Automated Paper Reader for Robotics 的公开展示端，
          面向需要快速判断研究价值、实验可信度与迁移可能性的机器人研究者。
        </p>
      </section>
      <section className="shell about-grid">
        <article>
          <span>01</span>
          <h2>范围</h2>
          <p>
            当前论文源仅使用 arXiv，重点覆盖 VLA、world/action model、manipulation、
            tactile/force learning、机器人表征与真机部署。
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>评分</h2>
          <p>
            综合分同时考虑方法相关性、启发价值、迁移性、实验可信度、论文质量、
            新颖性与可行动性。机构知名度不参与加分。
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>实验判断</h2>
          <p>
            真机只是起点。充分消融、未见条件、任务复杂度、评测次数、对照公平性与不确定性报告，
            共同决定实验是否可信。
          </p>
        </article>
        <article>
          <span>04</span>
          <h2>公开边界</h2>
          <p>
            本地日报保留检索与运行信息用于排查；公开网站只展示论文内容、评分判断、
            原文结构图与可追溯来源。
          </p>
        </article>
      </section>
    </div>
  );
}
