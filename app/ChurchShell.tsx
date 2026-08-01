import Link from "next/link";
import VisitorCounter from "./VisitorCounter";

type Section = "home" | "bulletin" | "today" | "news" | "about";

export function LogoMark() {
  return (
    <svg className="logo-mark" viewBox="0 0 86 38" aria-hidden="true">
      <g className="logo-mark__loaves">
        <ellipse cx="10" cy="11" rx="7" ry="5" />
        <ellipse cx="25" cy="9" rx="7" ry="5" />
        <ellipse cx="40" cy="10" rx="7" ry="5" />
        <ellipse cx="55" cy="9" rx="7" ry="5" />
        <ellipse cx="70" cy="11" rx="7" ry="5" />
        <path d="M7 11c2-3 4-4 6-5M22 10c2-3 4-4 6-5M37 11c2-3 4-4 6-5M52 10c2-3 4-4 6-5M67 11c2-3 4-4 6-5" />
      </g>
      <g className="logo-mark__fish">
        <path d="M9 29c9-8 18-8 27 0-9 8-18 8-27 0Z" />
        <path d="m9 29-6-6v12l6-6Z" />
        <path d="M48 29c9-8 18-8 27 0-9 8-18 8-27 0Z" />
        <path d="m48 29-6-6v12l6-6Z" />
      </g>
    </svg>
  );
}

const navItems: Array<{ href: string; label: string; section: Section }> = [
  { href: "/", label: "홈", section: "home" },
  { href: "/bulletin", label: "이번 주 주보", section: "bulletin" },
  { href: "/today", label: "오늘의 말씀", section: "today" },
  { href: "/news", label: "교회소식", section: "news" },
  { href: "/#about", label: "교회안내", section: "about" },
];

export function ChurchHeader({
  active = "home",
  overlay = false,
}: {
  active?: Section;
  overlay?: boolean;
}) {
  return (
    <header
      className={`site-header${overlay ? "" : " site-header--subpage"}`}
      aria-label="주요 메뉴"
    >
      <Link className="brand" href="/" aria-label="오병이어교회 처음으로">
        <LogoMark />
        <span>오병이어교회</span>
      </Link>

      <nav className="desktop-nav" aria-label="주요 메뉴">
        {navItems.map((item) => (
          <Link
            href={item.href}
            key={item.section}
            className={active === item.section ? "is-active" : undefined}
            aria-current={active === item.section ? "page" : undefined}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <details className="mobile-nav">
        <summary aria-label="메뉴 열기">
          <span />
          <span />
        </summary>
        <nav aria-label="모바일 주요 메뉴">
          {navItems.map((item) => (
            <Link
              href={item.href}
              key={item.section}
              className={active === item.section ? "is-active" : undefined}
              aria-current={active === item.section ? "page" : undefined}
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </details>
    </header>
  );
}

export function ChurchFooter() {
  return (
    <footer className="footer content-footer">
      <div className="footer__brand">
        <LogoMark />
        <div>
          <strong>오병이어교회</strong>
          <span>Five Loaves &amp; Two Fishes Church</span>
        </div>
      </div>
      <nav aria-label="하단 메뉴">
        <Link href="/bulletin">이번 주 주보</Link>
        <Link href="/today">오늘의 말씀</Link>
        <Link href="/news">교회소식</Link>
        <Link href="/#location">오시는 길</Link>
      </nav>
      <VisitorCounter />
      <p>© {new Date().getFullYear()} 오병이어교회. All rights reserved.</p>
    </footer>
  );
}

export function ArrowIcon() {
  return (
    <svg className="inline-arrow" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

export function PageNotice() {
  return (
    <div className="sample-notice" role="note">
      <span>자동 업데이트</span>
      <p>관리 화면에서 게시한 내용은 이 화면에 자동으로 반영됩니다.</p>
    </div>
  );
}
