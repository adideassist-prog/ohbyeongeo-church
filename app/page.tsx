import OpeningScreen from "./OpeningScreen";
import { ChurchFooter, ChurchHeader } from "./ChurchShell";
import {
  bulletinFromItem,
  newsFromItem,
  wordFromItem,
} from "../lib/church-content";
import { loadPublishedContent } from "../lib/load-content";
import HomeLiveContent from "./HomeLiveContent";

export const dynamic = "force-dynamic";

const naverMapUrl =
  "https://map.naver.com/p/search/%EC%98%A4%EB%B3%91%EC%9D%B4%EC%96%B4%20%EA%B5%90%ED%9A%8C/place/1732132056?placePath=?bk_query=%EC%98%A4%EB%B3%91%EC%9D%B4%EC%96%B4%20%EA%B5%90%ED%9A%8C&entry=pll&from=nx&fromNxList=true&searchType=place&c=15.00,0,0,0,dh";

function LogoMark() {
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

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M5 12h13M13 6l6 6-6 6" />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 3v3M17 3v3M4 9h16M5 5h14a1 1 0 0 1 1 1v13a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Z" />
      <path d="M8 13h3v3H8z" />
    </svg>
  );
}

function HeartIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20.8 5.8a5.1 5.1 0 0 0-7.2 0L12 7.4l-1.6-1.6a5.1 5.1 0 1 0-7.2 7.2L12 21l8.8-8a5.1 5.1 0 0 0 0-7.2Z" />
    </svg>
  );
}

function PinIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path d="M20 10c0 5.5-8 11-8 11S4 15.5 4 10a8 8 0 1 1 16 0Z" />
      <circle cx="12" cy="10" r="2.5" />
    </svg>
  );
}

function BreadFishMotif() {
  return (
    <div className="bread-fish" aria-hidden="true">
      <div className="bread-fish__loaves">
        <i />
        <i />
        <i />
        <i />
        <i />
      </div>
      <div className="bread-fish__fishes">
        <i />
        <i />
      </div>
    </div>
  );
}

export default async function Home() {
  const [[bulletinItem], [wordItem], [newsItem]] = await Promise.all([
    loadPublishedContent("bulletin"),
    loadPublishedContent("daily_word"),
    loadPublishedContent("news"),
  ]);
  const bulletin = bulletinFromItem(bulletinItem);
  const word = wordFromItem(wordItem);
  const news = newsFromItem(newsItem);

  const structuredData = {
    "@context": "https://schema.org",
    "@type": "Church",
    name: "오병이어교회",
    url: "https://ohbyeongeo-church.modoomoa365.chatgpt.site",
    image:
      "https://ohbyeongeo-church.modoomoa365.chatgpt.site/images/hero-warm-symbolic.webp",
    employee: {
      "@type": "Person",
      name: "서광봉",
      jobTitle: "담임목사",
    },
    sameAs: [naverMapUrl],
  };

  return (
    <main>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      <OpeningScreen />

      <ChurchHeader active="home" overlay />

      <section className="hero" id="top" aria-labelledby="hero-title">
        <div
          className="hero__media"
          role="img"
          aria-label="따뜻한 햇살과 오병이어를 상징하는 빵과 물고기 오브제"
        />
        <div className="hero__wash" />
        <div className="hero__content">
          <div className="hero__copy">
            <p className="eyebrow">Five loaves &amp; two fishes</p>
            <p className="pastor-kicker">서광봉 담임목사</p>
            <h1 id="hero-title">
              작은 나눔이
              <br />
              <span>큰 은혜가 되는 교회</span>
            </h1>
            <p className="hero__description">
              말씀으로 자라고, 사랑으로 나누며,
              <br className="desktop-break" /> 세상을 섬기는 믿음의 공동체
            </p>
            <div className="hero__actions">
              <a className="button button--primary" href="#worship">
                예배 안내
                <ArrowIcon />
              </a>
              <a className="button button--ghost" href="#newcomer">
                처음 오셨나요?
                <ArrowIcon />
              </a>
            </div>
          </div>

          <div className="hero__verse" aria-label="요한복음 6장 말씀">
            <span>JOHN 6</span>
            <p>
              한 아이의 작은 나눔이
              <br />모두를 풍성하게 했습니다.
            </p>
          </div>
        </div>

        <a className="scroll-cue" href="#quick" aria-label="아래 내용 보기">
          <span>Scroll</span>
          <i />
        </a>
      </section>

      <section className="quick-links" id="quick" aria-label="빠른 안내">
        <div className="quick-links__intro">
          <p className="section-label">Welcome home</p>
          <h2>
            오늘, 교회와
            <br />가까워지는 가장 쉬운 길
          </h2>
        </div>

        <div className="quick-links__grid">
          <a className="quick-card" href="#worship">
            <span className="quick-card__icon">
              <CalendarIcon />
            </span>
            <span className="quick-card__number">01</span>
            <strong>예배 안내</strong>
            <small>함께 예배드리는 시간</small>
            <ArrowIcon />
          </a>
          <a className="quick-card" href="#newcomer">
            <span className="quick-card__icon">
              <HeartIcon />
            </span>
            <span className="quick-card__number">02</span>
            <strong>새가족 안내</strong>
            <small>처음 오신 분을 위한 안내</small>
            <ArrowIcon />
          </a>
          <a
            className="quick-card"
            href={naverMapUrl}
            target="_blank"
            rel="noreferrer"
          >
            <span className="quick-card__icon">
              <PinIcon />
            </span>
            <span className="quick-card__number">03</span>
            <strong>오시는 길</strong>
            <small>네이버 지도에서 길찾기</small>
            <ArrowIcon />
          </a>
        </div>
      </section>

      <section className="about" id="about" aria-labelledby="about-title">
        <div className="about__top">
          <div className="about__heading">
            <p className="section-label section-label--light">Our calling</p>
            <h2 id="about-title">
              가진 것이 작아 보여도
              <br />
              사랑으로 내어놓을 때,
              <br />
              <em>하나님은 풍성하게 사용하십니다.</em>
            </h2>
          </div>
          <div className="about__symbol">
            <BreadFishMotif />
            <p>오병이어의 마음으로 이웃과 세상을 섬깁니다.</p>
          </div>
        </div>

        <div className="about__values">
          <article>
            <span>01</span>
            <h3>말씀으로 자라는 교회</h3>
            <p>
              말씀을 삶의 중심에 두고, 매일의 자리에서 믿음이 깊어지는
              공동체를 꿈꿉니다.
            </p>
          </article>
          <article>
            <span>02</span>
            <h3>사랑으로 나누는 교회</h3>
            <p>
              작지만 진실한 나눔이 한 사람과 한 가정을 살리는 은혜가 된다고
              믿습니다.
            </p>
          </article>
          <article>
            <span>03</span>
            <h3>세상을 섬기는 교회</h3>
            <p>
              교회 안에 머물지 않고 이웃의 필요를 살피며 세상의 빛과 소금으로
              살아갑니다.
            </p>
          </article>
        </div>

        <div className="pastor-note">
          <div className="pastor-note__mark">“</div>
          <p>
            한 사람의 작은 믿음과 나눔이
            <br />
            누군가에게는 다시 일어서는 큰 은혜가 되기를 바랍니다.
          </p>
          <div className="pastor-note__signature">
            <span>오병이어교회</span>
            <strong>서광봉 담임목사</strong>
          </div>
        </div>
      </section>

      <section className="worship" id="worship" aria-labelledby="worship-title">
        <div className="section-heading">
          <div>
            <p className="section-label">Worship &amp; prayer</p>
            <h2 id="worship-title">예배는 우리 삶의 중심입니다</h2>
          </div>
          <p>
            처음 오시는 분도 편안하게 예배드릴 수 있도록
            <br />
            따뜻한 마음으로 기다리고 있습니다.
          </p>
        </div>

        <div className="worship__grid">
          <article className="worship-card worship-card--featured">
            <div className="worship-card__top">
              <span>Sunday worship</span>
              <strong>01</strong>
            </div>
            <div>
              <h3>주일예배</h3>
              <p>온 세대가 함께 모여 찬양하고 말씀을 나누는 예배입니다.</p>
            </div>
            <small>예배 시간 · 교회 확인 후 안내</small>
          </article>

          <article className="worship-card">
            <div className="worship-card__top">
              <span>Weekday prayer</span>
              <strong>02</strong>
            </div>
            <div>
              <h3>평일예배와 기도</h3>
              <p>한 주의 삶을 말씀과 기도로 다시 세우는 시간입니다.</p>
            </div>
            <small>예배 시간 · 교회 확인 후 안내</small>
          </article>

          <article className="worship-card worship-card--blue">
            <div className="worship-card__top">
              <span>Next generation</span>
              <strong>03</strong>
            </div>
            <div>
              <h3>다음세대 예배</h3>
              <p>아이와 청소년이 기쁨으로 하나님을 만나는 예배입니다.</p>
            </div>
            <small>부서별 시간 · 교회 확인 후 안내</small>
          </article>
        </div>

        <div className="worship__notice">
          <span>예배 안내</span>
          <p>
            정확한 예배 시간과 장소는 교회 확인 후 업데이트됩니다. 방문 전
            네이버 지도 정보를 함께 확인해 주세요.
          </p>
          <a href={naverMapUrl} target="_blank" rel="noreferrer">
            지도에서 확인
            <ArrowIcon />
          </a>
        </div>
      </section>

      <section
        className="newcomer"
        id="newcomer"
        aria-labelledby="newcomer-title"
      >
        <div className="newcomer__visual">
          <div className="newcomer__halo" />
          <BreadFishMotif />
          <p>
            You are
            <br />
            always welcome.
          </p>
        </div>
        <div className="newcomer__content">
          <p className="section-label section-label--light">First visit</p>
          <h2 id="newcomer-title">
            처음이셔도 괜찮아요.
            <br />
            천천히 함께 걸어요.
          </h2>
          <p className="newcomer__lead">
            교회가 낯선 분, 신앙을 다시 시작하고 싶은 분,
            <br />
            누구든 편안한 마음으로 오실 수 있습니다.
          </p>

          <ol className="newcomer__steps">
            <li>
              <span>01</span>
              <div>
                <strong>편한 자리에서 예배드리기</strong>
                <p>별도의 준비 없이 예배 시작 전에 오시면 됩니다.</p>
              </div>
            </li>
            <li>
              <span>02</span>
              <div>
                <strong>새가족 안내받기</strong>
                <p>예배 후 안내를 원하시면 편안하게 말씀해 주세요.</p>
              </div>
            </li>
            <li>
              <span>03</span>
              <div>
                <strong>나에게 맞는 공동체 만나기</strong>
                <p>신앙과 삶을 함께 나눌 수 있는 모임을 안내해 드립니다.</p>
              </div>
            </li>
          </ol>

          <a
            className="button button--cream"
            href={naverMapUrl}
            target="_blank"
            rel="noreferrer"
          >
            방문 길찾기
            <ArrowIcon />
          </a>
        </div>
      </section>

      <section className="message" id="message" aria-labelledby="message-title">
        <div className="section-heading">
          <div>
            <p className="section-label">Message &amp; news</p>
            <h2 id="message-title">말씀으로 한 주를 살아갑니다</h2>
          </div>
          <p>
            예배의 은혜를 일상으로 이어갈 수 있도록
            <br />
            말씀과 교회 소식을 전합니다.
          </p>
        </div>

        <HomeLiveContent
          initialBulletin={bulletin}
          initialWord={word}
          initialNews={news}
        />
      </section>

      <section className="next" id="next" aria-labelledby="next-title">
        <div className="next__heading">
          <p className="section-label">Next generation</p>
          <h2 id="next-title">
            다음세대의 오늘을 사랑하고
            <br />
            믿음의 내일을 함께 세웁니다
          </h2>
          <p>
            나이에 맞는 예배와 활동 속에서 하나님을 기쁘게 만나고,
            <br />
            서로를 존중하며 건강하게 성장하도록 돕습니다.
          </p>
        </div>

        <div className="next__grid">
          <article className="next-card next-card--peach">
            <div className="next-card__art">
              <img
                src="/images/next-preschool.webp"
                alt="선생님과 함께 이야기책을 보며 손을 든 유아들"
                loading="lazy"
              />
              <span className="next-card__sun" />
              <i className="next-card__hill" />
              <b>LOVE</b>
            </div>
            <div className="next-card__copy">
              <span>01</span>
              <h3>영유아 · 유치</h3>
              <p>사랑받는 기쁨을 배우는 첫 예배</p>
            </div>
          </article>
          <article className="next-card next-card--sky">
            <div className="next-card__art">
              <img
                src="/images/next-children.webp"
                alt="친구들과 함께 박수치며 즐겁게 활동하는 어린이들"
                loading="lazy"
              />
              <span className="next-card__sun" />
              <i className="next-card__hill" />
              <b>GROW</b>
            </div>
            <div className="next-card__copy">
              <span>02</span>
              <h3>어린이</h3>
              <p>말씀과 친구 안에서 즐겁게 자라는 예배</p>
            </div>
          </article>
          <article className="next-card next-card--navy">
            <div className="next-card__art">
              <img
                src="/images/next-youth.webp"
                alt="함께 찬양하며 예배하는 청소년과 청년들"
                loading="lazy"
              />
              <span className="next-card__sun" />
              <i className="next-card__hill" />
              <b>DREAM</b>
            </div>
            <div className="next-card__copy">
              <span>03</span>
              <h3>청소년 · 청년</h3>
              <p>질문하고 꿈꾸며 믿음을 삶으로 잇는 예배</p>
            </div>
          </article>
        </div>
      </section>

      <section
        className="location"
        id="location"
        aria-labelledby="location-title"
      >
        <div className="location__map" aria-hidden="true">
          <img
            className="location__photo"
            src="/images/visit-church.webp"
            alt=""
            loading="lazy"
          />
          <div className="location__photo-wash" />
          <div className="map-lines">
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <span className="map-pin">
            <LogoMark />
          </span>
        </div>
        <div className="location__content">
          <p className="section-label">Visit us</p>
          <h2 id="location-title">
            오병이어교회에서
            <br />
            기다리고 있겠습니다
          </h2>
          <p>
            정확한 주소와 대중교통·주차 정보는
            <br />
            네이버 지도에서 바로 확인하실 수 있습니다.
          </p>
          <div className="location__actions">
            <a
              className="button button--primary"
              href={naverMapUrl}
              target="_blank"
              rel="noreferrer"
            >
              네이버 지도 열기
              <ArrowIcon />
            </a>
            <span>담임목사 서광봉</span>
          </div>
        </div>
      </section>

      <ChurchFooter />

    </main>
  );
}
