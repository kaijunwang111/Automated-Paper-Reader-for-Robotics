import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="site-header">
      <div className="shell header-inner">
        <Link className="brand" href="/" aria-label="具身智能观察站首页">
          <span className="brand-mark" aria-hidden="true">
            EO
          </span>
          <span>
            <strong>具身智能观察站</strong>
            <small>Embodied Observatory</small>
          </span>
        </Link>
        <nav className="main-nav" aria-label="主导航">
          <Link href="/reports">论文日报</Link>
          <Link href="/papers">论文数据库</Link>
          <Link href="/companies">公司动态</Link>
          <Link href="/about">关于</Link>
        </nav>
        <a
          className="header-github"
          href="https://github.com/kaijunwang111/Automated-Paper-Reader-for-Robotics"
          target="_blank"
          rel="noreferrer"
        >
          GitHub ↗
        </a>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="site-footer">
      <div className="shell footer-inner">
        <div>
          <strong>具身智能观察站</strong>
          <p>具身智能论文概览与行业动态。</p>
        </div>
        <div className="footer-meta">
          <span>论文源：arXiv</span>
          <span>日报：周一 / 周五</span>
          <span>公司动态：每周一</span>
        </div>
      </div>
    </footer>
  );
}

export function ArrowIcon() {
  return (
    <span className="arrow-icon" aria-hidden="true">
      ↗
    </span>
  );
}
