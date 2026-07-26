import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "关于",
  description: "具身智能观察站的收录范围与内容说明。",
};

export default function AboutPage() {
  return (
    <div className="page-shell">
      <section className="page-hero shell">
        <span className="section-index">ABOUT / METHODOLOGY</span>
        <h1>从论文摘要之后开始。</h1>
        <p>
          具身智能观察站是 Automated Paper Reader for Robotics 的公开展示端，
          帮助机器人研究者快速了解近期论文的方法、数据、实验与局限。
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
          <h2>收录</h2>
          <p>
            每期从近期 arXiv 论文中选择少量精读内容。筛选过程在本地完成，
            公开网站不展示内部评分。
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>实验核对</h2>
          <p>
            阅读时重点记录真机平台、任务、试验次数、消融、未见条件、对照设置与不确定性报告，
            并在论文信息不足时明确标注。
          </p>
        </article>
        <article>
          <span>04</span>
          <h2>公开边界</h2>
          <p>
            本地日报保留检索、运行与评分信息用于排查；公开网站只展示论文内容、
            原文结构图与可追溯来源。
          </p>
        </article>
      </section>
    </div>
  );
}
