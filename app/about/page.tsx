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
            当前论文源仅使用 arXiv，优先关注 manipulation、全身控制与通用机器人学习。
            医疗、矿山、实验室自动化等场景型系统工作通常不收录；相邻领域论文需要给出
            明确、可迁移的方法贡献。
          </p>
        </article>
        <article>
          <span>02</span>
          <h2>分类体系</h2>
          <p>
            分类拆为研究方向、训练与优化、创新模态、数据方法、机器人平台、部署与迁移。
            研究方向保留 VLA、WAM、WM、表征学习、Memory、CoT、Subtask 与其他；
            每个维度按主要贡献归类。Memory 的实现形式与时间跨度只放在详情属性中。
          </p>
        </article>
        <article>
          <span>03</span>
          <h2>内容结构</h2>
          <p>
            每篇概览整理研究出发点、模型结构、主要训练方式、数据组成、实验结果、相对
            直接基线的新颖性、复现信息、亮点与局限，并尽量附原论文方法图、项目页、
            GitHub 或模型链接。
          </p>
        </article>
        <article>
          <span>04</span>
          <h2>核对与公开边界</h2>
          <p>
            收录数量不设最低值，不为凑满固定篇数降低标准。本地日报保留检索、运行和内部
            评分用于排查，公开网站不展示评分或处理过程。公司动态只采用官网、官方博客或
            官方仓库；公告中的计划和性能主张仍按公司口径呈现。
          </p>
        </article>
      </section>
    </div>
  );
}
