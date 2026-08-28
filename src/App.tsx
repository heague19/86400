import { useEffect, useRef, useState } from 'react'
import './App.css'
// 워드마크 대신 쓰는 로고. 배경색에 맞춰 둘 중 하나를 고른다.
import logoWhite from './assets/86400white.png'
import logoBlack from './assets/86400black.png'
// 원본(6.8MB PNG / 1.9K 정사각)은 리포 루트에 그대로 두고, 카드 크기에 맞춰
// 줄인 웹용 사본만 번들에 넣는다.
import victorLeePhoto from './assets/VictorLeeProfile.jpg'
import seoHyeonJeonPhoto from './assets/SeoHyeonJeonProfile.jpg'
import juhwanCheonPhoto from './assets/JuhwanCheonProfile.jpg'
import seoHyeonJeonWork01 from './assets/SeoHyeonJeon-Work01.jpg'

type Page =
  | 'collection'
  | 'detail'
  | 'story'
  | 'voices'
  | 'exhibition'
  | 'artist'
  | 'artistDetail'
  | 'workDetail'
  | 'product'

const TEAM = [
  {
    role: 'Director',
    name: 'Victor Lee',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
    quote:
      '디자인을 그리지는 않는다. 그러나 어떤 옷이 86400의 이름으로 나갈지는 내가 결정한다.',
  },
  {
    role: 'Designer',
    name: 'Jo Yeon Ju',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=400&h=400&fit=crop&crop=faces',
    quote:
      '같은 패턴을 매일 다시 그렸다. 사라진 선들이 결국 이 한 벌을 완성했다.',
  },
]

/**
 * Artist 페이지 — Figma '86400artist' 시안.
 *
 * 시안 구조: 카드 3장 + 캡션 한 줄(Group 572)이 top 344 / 1052 / 1769 로
 * 세 번 반복된다(708px 피치). 캡션은 카드마다 "이름 + 역할" 이 번갈아
 * 놓이는데(Victor Lee · paint / SeoHyeon Jeon · paint / Juhwan Cheon · Toy),
 * 좌표상 역할은 앞 카드 이름 뒤에 붙는다.
 */
type Work = {
  image: string
  title: string
  year: string
  /** 작가가 준 표기 그대로 둔다. */
  size: string
  medium: string
  /** 원(KRW). 표시할 때 천 단위 구분자를 붙인다. */
  price: number
  /** 작품 노트. 첫 문단이 크게 나간다. */
  note: string[]
}

/** 실물과 화면은 같을 수 없으니 작품 상세마다 같은 문구로 알린다. */
const IMAGE_NOTICE =
  '실제 작품은 촬영 조건과 화면 환경에 따라 이미지와 다르게 보일 수 있습니다.'

type Artist = {
  name: string
  role: string
  photo: string | null
  /** 상세 페이지 소개글. 첫 문단이 스테이트먼트로 크게 나간다. */
  intro: string[]
  /** 인스타 핸들. @ 없이 저장하고 표시할 때 붙인다. */
  instagram: string | null
  works: Work[]
}

const ARTIST_ROW: Artist[] = [
  {
    name: 'Artist Victor Lee',
    role: 'paint',
    photo: victorLeePhoto,
    intro: [],
    instagram: null,
    works: [],
  },
  {
    name: 'SeoHyeon Jeon',
    role: 'paint',
    photo: seoHyeonJeonPhoto,
    intro: [
      '촘촘히 준비하다보면 설렘이 두려움을 압도합니다_',
      '저는 결국 예술이란 우리의 감정과 생각을 형상화하는 과정이고 이를 표현하고 공감받을 때 진정한 가치가 있다고 생각합니다.',
    ],
    instagram: 'i_m_i.v___y',
    works: [
      {
        image: seoHyeonJeonWork01,
        title: '녹차라떼 먹추가',
        year: '2024',
        size: '54x39cm',
        medium: 'In a korea paper, ink and light color',
        price: 800000,
        note: [
          '진정하기 위해 녹차를 마십니다. 집중하기 위해 카페인이 있는 걸로요. 아. 조금더 추가할까요? 먹??',
          '좋아하는 색감과 터치, 그리고 얹었을 때 모든 박자가 완벽히 맞을 만한 장지에 그림을 그렸습니다. 드로잉처럼 손이 가는데로요. 연구작이으로 시작했지만 앞으로 저의 작업에 도움이 될 순간이였습니다. 기분이 좋아여><',
        ],
      },
    ],
  },
  {
    name: 'Juhwan Cheon',
    role: 'Toy',
    photo: juhwanCheonPhoto,
    intro: [],
    instagram: null,
    works: [],
  },
]

// 시안(Figma) 'New Season Artist' 3인 — 캡션은 "역할 + 이름" 순.
// 메인에 쓰는 표기(이름·역할)는 Artist 페이지와 달라 여기 따로 두되,
// 사진과 상세 페이지 연결은 ARTIST_ROW 한 곳에서 끌어온다.
const SEASON_ARTISTS = [
  { role: 'paint', name: 'Victor Lee', artist: ARTIST_ROW[0] },
  { role: 'Designer', name: 'SeoHyeon Jeon', artist: ARTIST_ROW[1] },
  { role: 'Toy', name: 'Juhwan Cheon', artist: ARTIST_ROW[2] },
]

/**
 * COMING SOON 랜딩(시계 화면) 스위치.
 * false 면 진입 즉시 MAIN 으로 들어가고 좌상단 토글도 숨긴다.
 * 다시 열려면 이 값만 true 로 되돌리면 된다.
 */
const COMING_SOON = false

function App() {
  const ticks = Array.from({ length: 12 }, (_, i) => i)
  const [now, setNow] = useState(new Date())
  const [opened, setOpened] = useState(!COMING_SOON)
  const [page, setPage] = useState<Page>('collection')
  const [selectedProduct, setSelectedProduct] = useState<number | null>(null)
  const [selectedArtist, setSelectedArtist] = useState<number | null>(null)
  const [selectedWork, setSelectedWork] = useState<number | null>(null)
  const [detailTab, setDetailTab] = useState<'product' | 'director'>('director')

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const pad = (n: number) => n.toString().padStart(2, '0')
  const time = `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`

  const goCollection = () => {
    setPage('collection')
    setSelectedProduct(null)
  }
  const goStory = () => setPage('story')
  const goArtist = () => {
    setPage('artist')
    setSelectedArtist(null)
  }
  const openArtist = (i: number) => {
    setSelectedArtist(i)
    setSelectedWork(null)
    setPage('artistDetail')
  }
  const openWork = (i: number) => {
    setSelectedWork(i)
    setPage('workDetail')
  }
  const backToArtist = () => {
    setSelectedWork(null)
    setPage('artistDetail')
  }
  const goProduct = () => setPage('product')
  const goVoices = () => setPage('voices')
  const goExhibition = () => setPage('exhibition')
  const openProduct = (i: number) => {
    setSelectedProduct(i)
    setPage('detail')
    setDetailTab('director')
  }

  // 본문이 검정인 페이지는 전부 검은 네비를 쓴다. 흰 본문은 Voices 뿐이라
  // 그 한 장만 밝은 스킨으로 빠진다.
  const darkNav = opened && page !== 'voices'

  return (
    <div className="layout">
      {COMING_SOON && (
        <button
          type="button"
          className={`mode-toggle ${opened ? 'is-open' : ''} ${
            darkNav ? 'is-on-dark-nav' : ''
          }`}
          onClick={() => {
            setOpened((v) => !v)
            goCollection()
          }}
          aria-label={opened ? 'Close main page' : 'Open main page'}
        >
          <span className="mode-toggle-track">
            <span className="mode-toggle-thumb" />
          </span>
          <span className="mode-toggle-label">
            {opened ? 'MAIN' : 'COMING SOON'}
          </span>
        </button>
      )}

      {!opened ? (
        <section className="top">
          <svg
            className="curve"
            viewBox="0 0 1600 900"
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            <defs>
              <linearGradient id="glass-gradient" x1="0%" y1="100%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#ffffff" stopOpacity="0.1" />
                <stop offset="50%" stopColor="#ffffff" stopOpacity="0.7" />
                <stop offset="100%" stopColor="#ffffff" stopOpacity="0.1" />
              </linearGradient>
            </defs>
            <path
              className="curve-back"
              d="M -50 950 C 200 250 1400 1100 1700 -50"
            />
            <path
              className="curve-main"
              d="M -50 950 C 200 250 1400 1100 1700 -50"
            />
            <path
              className="curve-highlight"
              d="M -50 950 C 200 250 1400 1100 1700 -50"
            />
          </svg>
          <div className="clock-stage">
            <div className="clock-ring">
              {ticks.map((i) => (
                <div
                  key={i}
                  className="tick"
                  style={{ '--angle': `${i * 30}deg` } as React.CSSProperties}
                >
                  <span className="tick-trail" />
                  <span className="tick-face tick-front" />
                  <span className="tick-face tick-back" />
                  <span className="tick-face tick-top" />
                  <span className="tick-face tick-bottom" />
                  <span className="tick-face tick-left" />
                  <span className="tick-face tick-right" />
                </div>
              ))}
            </div>
            <div className="timer">{time}</div>
          </div>
        </section>
      ) : (
        <>
          <GlobalNav
            dark={darkNav}
            // 흰 본문(Product) 위에선 반투명 검정이 회색으로 비쳐 solid 로.
            solid={page === 'product'}
            onLogoClick={goCollection}
            onStoryClick={goStory}
            onArtistClick={goArtist}
            onProductClick={goProduct}
          />

          {page === 'collection' && (
            <section className="fig-main">
              {/* 시안: 로고 680×408 중앙 정렬 */}
              <div className="fig-hero">
                <div className="fig-hero-logo">
                  <h1 className="fig-hero-wordmark">
                    <img src={logoWhite} alt="86400" />
                  </h1>
                </div>
              </div>

              {/* 시안: 'New Season Artrist' 128px + 카드 3열 */}
              <div className="fig-section">
                <h2 className="fig-section-title">New Season Artist</h2>
                <div className="fig-grid">
                  {SEASON_ARTISTS.map((a, i) => (
                    <button
                      key={a.name}
                      type="button"
                      className="fig-card"
                      onClick={() => openArtist(ARTIST_ROW.indexOf(a.artist))}
                    >
                      <div className="fig-card-frame">
                        <CardMedia photo={a.artist.photo} alt={a.name} />
                        <span className="fig-card-index">
                          No.{String(i + 1).padStart(2, '0')}
                        </span>
                      </div>
                      <div className="fig-card-caption">
                        <span className="fig-card-role">{a.role}</span>
                        <span className="fig-card-name">{a.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* 시안 Frame 763: 흰 배경 Product 섹션 */}
              <div className="fig-section fig-product">
                <h2 className="fig-section-title">Product</h2>
                <div className="fig-grid">
                  {Array.from({ length: 3 }, (_, i) => (
                    <button
                      key={i}
                      type="button"
                      className="fig-card"
                      onClick={() => openProduct(i)}
                    >
                      <div className="fig-card-frame">
                        <div className="fig-card-media" />
                        <span className="fig-card-index">
                          No.{String(i + 1).padStart(3, '0')}
                        </span>
                      </div>
                      <div className="fig-card-caption">
                        <span className="fig-card-name">Product {i + 1}</span>
                      </div>
                    </button>
                  ))}
                </div>

                <VoicesSection onMore={goVoices} />
              </div>
            </section>
          )}

          {page === 'artist' && (
            <ArtistPage
              onOpenExhibition={goExhibition}
              onOpenArtist={openArtist}
            />
          )}

          {page === 'product' && <ProductPage onOpenProduct={openProduct} />}

          {page === 'artistDetail' && selectedArtist !== null && (
            <ArtistDetailPage
              artist={ARTIST_ROW[selectedArtist]}
              onBack={goArtist}
              onOpenWork={openWork}
            />
          )}

          {page === 'workDetail' &&
            selectedArtist !== null &&
            selectedWork !== null && (
              <WorkDetailPage
                artist={ARTIST_ROW[selectedArtist]}
                index={selectedWork}
                onBack={backToArtist}
              />
            )}

          {page === 'voices' && <VoicesPage />}

          {page === 'exhibition' && <ExhibitionPage />}

          {page === 'detail' && selectedProduct !== null && (
            <section className="product-detail is-dark">
              <button
                type="button"
                className="detail-back"
                onClick={goCollection}
                aria-label="Back to collection"
              >
                ← Back
              </button>

              <div className="detail-tabs">
                <button
                  type="button"
                  className={`detail-tab ${detailTab === 'director' ? 'is-active' : ''}`}
                  onClick={() => setDetailTab('director')}
                >
                  Director
                </button>
                <button
                  type="button"
                  className={`detail-tab ${detailTab === 'product' ? 'is-active' : ''}`}
                  onClick={() => setDetailTab('product')}
                >
                  Product
                </button>
              </div>

              {detailTab === 'product' ? (
                <div className="detail-grid">
                  <div className="detail-gallery">
                    <div className="detail-main-image">
                      <span className="product-no">
                        No.{String(selectedProduct + 1).padStart(3, '0')}
                      </span>
                    </div>
                    <div className="detail-thumbs">
                      {Array.from({ length: 4 }, (_, i) => (
                        <div key={i} className="detail-thumb" />
                      ))}
                    </div>
                  </div>
                  <div className="detail-info">
                    <p className="detail-tag">Vol.01 / Founders Edition</p>
                    <h1 className="detail-title">Product Name {selectedProduct + 1}</h1>
                    <p className="detail-edition">Edition of 100</p>
                    <p className="detail-price">₩ 129,000</p>

                    <div className="detail-section">
                      <h4>Size</h4>
                      <div className="detail-options">
                        {['XS', 'S', 'M', 'L', 'XL'].map((s) => (
                          <button key={s} type="button" className="detail-option">
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="detail-section">
                      <h4>Description</h4>
                      <p className="detail-desc">
                        불확실한 미래에 확실한 나를 표현하는 한 벌. 데뷔 시즌 한정
                        넘버링으로 제작된 Founders Edition은 시간이 흘러도 변하지 않는
                        코드를 담습니다.
                      </p>
                    </div>

                    <div className="detail-section">
                      <h4>Material</h4>
                      <p className="detail-desc">100% Cotton · Made in Korea</p>
                    </div>

                    <button type="button" className="detail-cta">
                      Add to Cart
                    </button>
                  </div>
                </div>
              ) : (
                <DirectorView productNo={selectedProduct + 1} />
              )}
            </section>
          )}

          {page === 'story' && <StoryPage />}

          <Footer />
        </>
      )}
    </div>
  )
}

const VOICES_DATA = [
  {
    author: 'minjun_w',
    role: 'Stylist',
    photo: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=faces',
    title: '옷이 사람을 결정하는 시대는 끝났다',
    excerpt:
      '브랜드가 사람을 만드는 게 아니라, 사람이 어떤 브랜드를 입을지 선택하는 시대. 86400은 후자의 편에 서 있다고 느꼈다.',
    tag: 'Essay',
    time: '4 min read',
    date: '2026.04.18',
  },
  {
    author: 'sora.k',
    role: 'Editor',
    photo: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=faces',
    title: '142일을 기다린다는 것',
    excerpt:
      '한 벌의 옷을 142일 동안 만들어내는 브랜드. 그 시간을 함께 기다린다는 건, 옷을 사는 게 아니라 시간을 사는 일이다.',
    tag: 'Note',
    time: '3 min read',
    date: '2026.04.10',
  },
  {
    author: 'jay.c',
    role: 'Photographer',
    photo: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=faces',
    title: '검은 배경, 빛 한 줄',
    excerpt:
      '룩북을 보고 처음 든 생각. 옷을 보여주는 게 아니라, 옷이 만들어진 시간을 보여주는 사진들이었다.',
    tag: 'Review',
    time: '5 min read',
    date: '2026.04.02',
  },
  {
    author: 'haneul.p',
    role: 'Reader',
    photo: 'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?w=200&h=200&fit=crop&crop=faces',
    title: '내 옷장의 No.047',
    excerpt:
      '도착한 박스를 열었을 때, 옷보다 먼저 본 건 손편지였다. 그 한 장이 이 브랜드의 모든 걸 말해준다.',
    tag: 'Letter',
    time: '2 min read',
    date: '2026.03.28',
  },
  {
    author: 'doyeon.s',
    role: 'Designer',
    photo: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=200&h=200&fit=crop&crop=faces',
    title: '패턴이 사라진 자리에 남는 것',
    excerpt:
      '디자인은 더하는 일이 아니라 지우는 일에 가깝다. 86400의 옷에는 지워진 흔적이 남아 있다.',
    tag: 'Essay',
    time: '6 min read',
    date: '2026.03.20',
  },
  {
    author: 'yejin.h',
    role: 'Stylist',
    photo: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=faces',
    title: '한 벌의 옷을 일년 내내 입는다는 것',
    excerpt:
      '계절을 가리지 않는 옷. 트렌드를 거스르지 않으면서도, 트렌드에 휘둘리지 않는 디자인이란 어떤 것인가.',
    tag: 'Note',
    time: '3 min read',
    date: '2026.03.12',
  },
  {
    author: 'wonho.l',
    role: 'Critic',
    photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=faces',
    title: '신생 브랜드의 시간을 산다는 것',
    excerpt:
      'Vol.01을 산다는 것은 옷을 사는 게 아니라 어떤 브랜드의 첫 페이지에 이름을 새기는 일이다.',
    tag: 'Review',
    time: '7 min read',
    date: '2026.03.05',
  },
  {
    author: 'sunwoo.j',
    role: 'Reader',
    photo: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&h=200&fit=crop&crop=faces',
    title: '내 첫 한정판',
    excerpt:
      '평생 한정판이라는 단어와 거리가 멀었다. 그런데 No.082가 도착했을 때, 그 숫자가 의미하는 게 무엇인지 알 것 같았다.',
    tag: 'Letter',
    time: '2 min read',
    date: '2026.02.27',
  },
]

const ROOMS = [
  {
    no: '01',
    title: 'Self',
    headline: '나는 미래의 시작점이다.',
    body: '내가 있기에 미래가 있다. 미래는 어딘가에서 갑자기 오는 것이 아니라, 지금 이 순간의 내가 쌓아온 현재와 과거의 결과로 만들어진다.',
    accent: 'linear-gradient(135deg, #2a2a2a 0%, #161616 100%)',
  },
  {
    no: '02',
    title: 'Series 00:00',
    headline: '새로운 86400은 00:00에서 시작된다.',
    body: '하루의 첫 좌표, 00:00. 어제와 오늘 사이, 과거와 미래 사이에 서 있는 그 한 점에서 매일의 86400초가 다시 펼쳐진다.',
    accent: 'linear-gradient(135deg, #1c1c20 0%, #101014 100%)',
  },
  {
    no: '03',
    title: 'Reflection',
    headline: '빛을 반사하는 순간, 우리는 시간을 거스른다.',
    body: '시간은 한 방향으로만 흐른다. 그것을 거스를 수 있는 유일한 존재는 빛이다. 빛을 받아 반사하는 순간, 우리는 그 찰나에 미래를 만들어낸다.',
    accent: 'linear-gradient(135deg, #20202a 0%, #0c0c14 100%)',
  },
  {
    no: '04',
    title: 'Process',
    headline: '한 벌의 옷에 새겨진 142일.',
    body: '첫 패턴이 그어지는 순간부터 마지막 단추가 달리는 순간까지. 모든 옷에는 시리얼 넘버와 그 142일의 기록이 함께 새겨진다.',
    accent: 'linear-gradient(135deg, #1a1a1a 0%, #0f0f0f 100%)',
  },
  {
    no: '05',
    title: 'Founders Edition',
    headline: '단 한 번, 100벌만.',
    body: 'Vol.01은 1번부터 100번까지의 한정 넘버링으로 제작된다. 시즌이 닫히면 그 숫자는 영원히 닫힌다.',
    accent: 'linear-gradient(135deg, #232318 0%, #0e0e08 100%)',
  },
  {
    no: '06',
    title: 'Beyond',
    headline: '매 시즌은 한 권의 책이 된다.',
    body: 'Vol.01 → Vol.02 → Vol.03. 시리즈는 시간을 따라 천천히 두꺼워지고, 그 안에서 86400이라는 이름의 시간이 만들어진다.',
    accent: 'linear-gradient(135deg, #1d1d24 0%, #0e0e16 100%)',
  },
  {
    no: '07',
    title: 'Studio',
    headline: '그리는 손, 보고 결정하는 눈.',
    body: '86400은 두 사람의 시선으로 만들어진다. 두 시선이 겹쳐지는 자리에 한 벌의 옷이 남는다.',
    accent: 'linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)',
  },
]

/**
 * 카드 이미지 자리. 사진이 없는 아티스트는 기존 플레이스홀더 그라데이션이
 * 그대로 보이므로, 사진이 들어오는 대로 photo 만 채워주면 된다.
 */
function CardMedia({ photo, alt }: { photo: string | null; alt: string }) {
  return (
    <div className="fig-card-media">
      {photo && <img src={photo} alt={alt} />}
    </div>
  )
}

function ArtistPage({
  onOpenExhibition,
  onOpenArtist,
}: {
  onOpenExhibition: () => void
  onOpenArtist: (index: number) => void
}) {
  // 시안은 같은 행을 3번 반복하지만 실제 아티스트는 3명뿐이라 한 행만 그린다.
  // 사람이 늘어나면 ARTIST_ROW 에 추가하는 것만으로 다음 줄이 채워진다.
  return (
    <section className="fig-main fig-artist-page">
      <div className="fig-artist-row">
        <div className="fig-grid">
          {ARTIST_ROW.map((a, i) => (
            <button
              key={a.name}
              type="button"
              className="fig-card"
              onClick={() => onOpenArtist(i)}
            >
              <div className="fig-card-frame">
                <CardMedia photo={a.photo} alt={a.name} />
                <span className="fig-card-index">
                  No.{String(i + 1).padStart(2, '0')}
                </span>
              </div>
              <div className="fig-card-caption">
                <span className="fig-card-name">{a.name}</span>
                <span className="fig-card-role">{a.role}</span>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* 시안 네비가 3개(Brand·Artist·Product)로 줄면서 Exhibition 이 진입점을
          잃어 여기에 남겨둔다. 시안엔 없는 요소라 조용한 텍스트 링크로. */}
      <div className="fig-artist-foot">
        <button type="button" className="fig-artist-exh" onClick={onOpenExhibition}>
          View Online Exhibition →
        </button>
      </div>
    </section>
  )
}

/**
 * Artist 상세 — Figma '86400artistDetail' 시안.
 *
 * 시안: 카드 526×567 (left 112, top 344) + 이름 48px (left 700, 같은 top).
 * 카드 오른쪽 끝이 638px 이므로 이름과의 간격은 62px.
 * 아래 Works 는 시안엔 없는 섹션이라 Artist 목록과 같은 카드 그리드를 그대로 쓴다.
 */
function ArtistDetailPage({
  artist,
  onBack,
  onOpenWork,
}: {
  artist: Artist
  onBack: () => void
  onOpenWork: (index: number) => void
}) {
  return (
    <section className="fig-main fig-artist-detail">
      <button type="button" className="fig-detail-back" onClick={onBack}>
        ← Artist
      </button>

      <div className="fig-detail-body">
        <div className="fig-card-frame fig-detail-frame">
          <CardMedia photo={artist.photo} alt={artist.name} />
        </div>

        <div className="fig-detail-info">
          <h1 className="fig-detail-name">{artist.name}</h1>
          <span className="fig-detail-role">{artist.role}</span>

          {artist.intro.length > 0 && (
            <div className="fig-detail-intro">
              {artist.intro.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          )}

          {artist.instagram && (
            <a
              className="fig-detail-handle"
              href={`https://www.instagram.com/${artist.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{artist.instagram}
            </a>
          )}
        </div>
      </div>

      {artist.works.length > 0 && (
        <div className="fig-detail-works">
          <h2 className="fig-section-title">Works</h2>
          <div className="fig-grid">
            {artist.works.map((work, i) => (
              <button
                key={work.title}
                type="button"
                className="fig-card"
                onClick={() => onOpenWork(i)}
              >
                <div className="fig-card-frame">
                  <CardMedia photo={work.image} alt={work.title} />
                  <span className="fig-card-index">
                    No.{String(i + 1).padStart(2, '0')}
                  </span>
                </div>
                <div className="fig-card-caption">
                  <span className="fig-card-name">{work.title}</span>
                  <span className="fig-card-role">{work.year}</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * 작품 상세 — Artist 상세와 같은 레이아웃(왼쪽 526 프레임 + 오른쪽 정보).
 */
function WorkDetailPage({
  artist,
  index,
  onBack,
}: {
  artist: Artist
  index: number
  onBack: () => void
}) {
  const work = artist.works[index]

  return (
    <section className="fig-main fig-artist-detail fig-work-detail">
      <button type="button" className="fig-detail-back" onClick={onBack}>
        ← {artist.name}
      </button>

      <div className="fig-detail-body">
        <div className="fig-card-frame fig-detail-frame">
          <CardMedia photo={work.image} alt={work.title} />
        </div>

        <div className="fig-detail-info">
          <h1 className="fig-detail-name">{work.title}</h1>
          <span className="fig-detail-role">{work.year}</span>

          <dl className="fig-work-spec">
            <div>
              <dt>Size</dt>
              <dd>{work.size}</dd>
            </div>
            <div>
              <dt>Medium</dt>
              <dd>{work.medium}</dd>
            </div>
            <div>
              <dt>Artist</dt>
              <dd>{artist.name}</dd>
            </div>
            <div>
              <dt>Price</dt>
              <dd className="is-price">
                ₩ {work.price.toLocaleString('ko-KR')}
              </dd>
            </div>
          </dl>

          <p className="fig-work-notice">※ {IMAGE_NOTICE}</p>

          {work.note.length > 0 && (
            <div className="fig-detail-intro">
              {work.note.map((p) => (
                <p key={p}>{p}</p>
              ))}
            </div>
          )}

          {artist.instagram && (
            <a
              className="fig-detail-handle"
              href={`https://www.instagram.com/${artist.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{artist.instagram}
            </a>
          )}
        </div>
      </div>
    </section>
  )
}

/**
 * Product 페이지 — Figma '86400artistDetail'(Frame 770) 시안.
 *
 * 시안: 네비(152px)는 검은 배경 그대로, 그 아래 Frame 770 이 흰 배경으로 깔리고
 * 카드 526×567 3열(x=107·692·1277, 간격 59px)이 놓인다.
 * Group 575 / Frame 764~767 은 좌표·크기가 같은 복제 레이어라 3열 한 벌로 통합.
 */
function ProductPage({ onOpenProduct }: { onOpenProduct: (index: number) => void }) {
  return (
    <section className="fig-product-page">
      <div className="fig-grid">
        {Array.from({ length: 3 }, (_, i) => (
          <button
            key={i}
            type="button"
            className="fig-card"
            onClick={() => onOpenProduct(i)}
          >
            <div className="fig-card-frame">
              <div className="fig-card-media" />
              <span className="fig-card-index">
                No.{String(i + 1).padStart(3, '0')}
              </span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

function ExhibitionPage() {
  const [active, setActive] = useState(0)
  const roomsWrapRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const wrap = roomsWrapRef.current
    if (!wrap) return
    const rooms = Array.from(wrap.querySelectorAll<HTMLElement>('.room'))
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio > 0.6) {
            const idx = rooms.indexOf(entry.target as HTMLElement)
            if (idx !== -1) setActive(idx)
          }
        })
      },
      { threshold: [0.6] }
    )
    rooms.forEach((r) => obs.observe(r))
    return () => obs.disconnect()
  }, [])

  const scrollToRoom = (idx: number) => {
    const wrap = roomsWrapRef.current
    if (!wrap) return
    const rooms = wrap.querySelectorAll<HTMLElement>('.room')
    rooms[idx]?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <section className="exhibition-page">
      <header className="exh-header">
        <div className="exh-header-left">
          <span className="exh-tag">Online Exhibition · Vol.01</span>
          <span className="exh-divider" />
          <span className="exh-current">
            Room {String(active + 1).padStart(2, '0')} —{' '}
            <strong>{ROOMS[active].title}</strong>
          </span>
        </div>
        <div className="exh-header-right">
          <span className="exh-progress">
            {String(active + 1).padStart(2, '0')} / {String(ROOMS.length).padStart(2, '0')}
          </span>
        </div>
      </header>

      <aside className="exh-rail" aria-label="Room navigation">
        {ROOMS.map((r, i) => (
          <button
            key={r.no}
            type="button"
            className={`exh-rail-dot ${active === i ? 'is-active' : ''}`}
            onClick={() => scrollToRoom(i)}
            aria-label={`Go to Room ${r.no} ${r.title}`}
          >
            <span className="exh-rail-num">{r.no}</span>
            <span className="exh-rail-line" />
            <span className="exh-rail-title">{r.title}</span>
          </button>
        ))}
      </aside>

      <div className="exh-rooms" ref={roomsWrapRef}>
        {ROOMS.map((r, i) => (
          <Room key={r.no} room={r} index={i} total={ROOMS.length} />
        ))}
      </div>

      <footer className="exh-foot">
        <p>
          이 전시는 온라인에서만 열립니다. <br />
          Founders Edition 멤버에게는 다음 전시의 초대장이 가장 먼저 도착합니다.
        </p>
      </footer>
    </section>
  )
}

function Room({
  room,
  index,
  total,
}: {
  room: (typeof ROOMS)[number]
  index: number
  total: number
}) {
  const ref = useRef<HTMLDivElement | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setShown(entry.intersectionRatio > 0.4)
        })
      },
      { threshold: [0.4] }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return (
    <article
      ref={ref}
      className={`room ${shown ? 'is-active' : ''}`}
      data-room={room.no}
    >
      <div className="room-bg" style={{ background: room.accent }} />

      <div className="room-stage">
        <div className="room-piece" aria-hidden="true">
          <div className="room-piece-frame" />
          <span className="room-piece-label">No.{room.no}</span>
        </div>
      </div>

      <div className="room-info">
        <div className="room-info-top">
          <span className="room-info-no">Room {room.no}</span>
          <span className="room-info-title">{room.title}</span>
        </div>

        <h2 className="room-headline">{room.headline}</h2>
        <p className="room-body">{room.body}</p>

        <div className="room-info-bottom">
          <span className="room-position">
            {String(index + 1).padStart(2, '0')} / {String(total).padStart(2, '0')}
          </span>
          {index < total - 1 ? (
            <span className="room-next">↓ Next room</span>
          ) : (
            <span className="room-next">— End of Exhibition</span>
          )}
        </div>
      </div>
    </article>
  )
}

function VoicesPage() {
  const [filter, setFilter] = useState<string>('All')
  const tags = ['All', 'Essay', 'Note', 'Review', 'Letter']
  const filtered =
    filter === 'All'
      ? VOICES_DATA
      : VOICES_DATA.filter((v) => v.tag === filter)

  return (
    <section className="voices-page">
      <header className="voices-page-hero">
        <p className="voices-eyebrow">Journal</p>
        <h1 className="voices-page-title">Voices</h1>
        <p className="voices-page-lede">
          패션을 사랑하는 사람들이 86400에 대해 남긴 기록.
          한 벌의 옷이 한 사람의 이야기로 이어지는 자리.
        </p>
      </header>

      <div className="voices-filter">
        {tags.map((t) => (
          <button
            key={t}
            type="button"
            className={`voices-chip ${filter === t ? 'is-active' : ''}`}
            onClick={() => setFilter(t)}
          >
            {t}
          </button>
        ))}
      </div>

      <div className="voices-page-grid">
        {filtered.map((v) => (
          <article key={v.author + v.title} className="voice voice-page-card">
            <div className="voice-meta">
              <span className="voice-tag">{v.tag}</span>
              <span className="voice-time">{v.time}</span>
              <span className="voice-date">{v.date}</span>
            </div>
            <h3 className="voice-title">{v.title}</h3>
            <p className="voice-excerpt">{v.excerpt}</p>
            <div className="voice-author">
              <div className="voice-avatar">
                <img src={v.photo} alt={v.author} />
              </div>
              <div className="voice-author-info">
                <span className="voice-author-name">@{v.author}</span>
                <span className="voice-author-role">{v.role}</span>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function VoicesSection({ onMore }: { onMore: () => void }) {
  const voices = VOICES_DATA.slice(0, 4)

  return (
    <section className="voices">
      <header className="voices-header">
        <div>
          <p className="voices-eyebrow">Journal</p>
          <h2 className="voices-title">Voices</h2>
        </div>
        <p className="voices-sub">
          패션을 사랑하는 사람들이 86400에 대해 남긴 기록
        </p>
      </header>

      <div className="voice-feed">
        {voices.map((v) => (
          <article key={v.author} className="feed-tile">
            <span className="feed-tile-tag">{v.tag}</span>
            <h3 className="feed-tile-title">{v.title}</h3>
            <span className="feed-tile-arrow">→</span>
          </article>
        ))}
      </div>

      <div className="voices-cta">
        <button type="button" className="voices-more" onClick={onMore}>
          More Voices →
        </button>
      </div>
    </section>
  )
}

function DirectorView({ productNo }: { productNo: number }) {
  const credits = [
    {
      role: 'Director',
      name: 'Victor Lee',
      handle: '@victor.lee',
      photo: TEAM[0].photo,
      quote:
        '이 옷이 86400의 이름으로 나가도 좋은가. 모든 한 벌은 결국 그 질문을 통과한 결과다.',
    },
    {
      role: 'Designer',
      name: 'Jo Yeon Ju',
      handle: '@jo.yeonju',
      photo: TEAM[1].photo,
      quote:
        '이 옷을 만드는 동안, 매일 같은 패턴을 다시 그렸습니다. 사라진 선들이 결국 이 한 벌을 완성했어요.',
    },
    {
      role: 'Photographer',
      name: 'Lee Sungho',
      handle: '@sungho.lee',
      photo: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&h=400&fit=crop&crop=faces',
      quote:
        '광원을 일부러 줄였습니다. 옷의 디테일이 어둠 속에서 천천히 드러나는 순간, 시간을 찍는다는 느낌이 들었어요.',
    },
    {
      role: 'Model',
      name: 'Park Yuna',
      handle: '@yuna.p',
      photo: 'https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=400&h=400&fit=crop&crop=faces',
      quote:
        '입자마자 자세가 바뀌었어요. 옷이 사람을 잡아주는 게 아니라, 사람을 더 또렷하게 보여주는 옷이라고 생각했습니다.',
    },
  ]

  return (
    <div className="director">
      <header className="director-hero">
        <p className="director-eyebrow">
          Director's Note · No.{String(productNo).padStart(3, '0')}
        </p>
        <h2 className="director-title">
          한 벌의 옷이 만들어진<br />142일의 기록
        </h2>
        <p className="director-lede">
          이 옷이 완성되기까지의 시간을 기록합니다. 패턴, 원단, 봉제,
          마지막 단추까지 — 이 페이지는 옷의 이력서입니다.
        </p>
      </header>

      <div className="director-shots">
        <figure className="shot shot-large">
          <div className="shot-img" />
          <figcaption>01 / Pattern Study</figcaption>
        </figure>
        <figure className="shot">
          <div className="shot-img" />
          <figcaption>02 / Fabric</figcaption>
        </figure>
        <figure className="shot">
          <div className="shot-img" />
          <figcaption>03 / Sewing</figcaption>
        </figure>
        <figure className="shot shot-wide">
          <div className="shot-img" />
          <figcaption>04 / Editorial</figcaption>
        </figure>
        <figure className="shot">
          <div className="shot-img" />
          <figcaption>05 / Detail</figcaption>
        </figure>
        <figure className="shot">
          <div className="shot-img" />
          <figcaption>06 / Final</figcaption>
        </figure>
      </div>

      <div className="director-credits">
        <h3 className="director-section-title">Credits</h3>
        <div className="credit-list">
          {credits.map((c) => (
            <article key={c.role} className="credit">
              <div className="credit-avatar">
                <img src={c.photo} alt={c.name} />
              </div>
              <div className="credit-body">
                <div className="credit-head">
                  <span className="credit-role">{c.role}</span>
                  <span className="credit-name">{c.name}</span>
                </div>
                <p className="credit-handle">{c.handle}</p>
                <p className="credit-quote">“{c.quote}”</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  )
}

function useReveal<T extends HTMLElement>() {
  const ref = useRef<T | null>(null)
  const [shown, setShown] = useState(false)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true)
            obs.disconnect()
          }
        })
      },
      { threshold: 0.15 }
    )
    obs.observe(el)
    return () => obs.disconnect()
  }, [])

  return { ref, shown }
}

function RevealChapter({
  num,
  title,
  className = '',
  children,
}: {
  num: string
  title: string
  className?: string
  children: React.ReactNode
}) {
  const { ref, shown } = useReveal<HTMLElement>()
  return (
    <article
      ref={ref}
      className={`story-chapter ${className} reveal ${shown ? 'is-visible' : ''}`}
    >
      <div className="chapter-num">{num}</div>
      <div className="chapter-body">
        <h2>{title}</h2>
        {children}
      </div>
    </article>
  )
}

function StoryPage() {
  const [tab, setTab] = useState<'story' | 'member'>('story')

  return (
    <section className="story-page">
      <header className="story-hero">
        <h1 className="story-title">
          <img src={logoWhite} alt="86400" />
        </h1>
        <p className="story-subtitle">Find Your, Lead Future</p>

        <div className="story-manifesto">
          <p className="manifesto-line">하루는 86400초.</p>
          <p className="manifesto-line">단 한 번도 같지 않은 순간들.</p>
          <p className="manifesto-line emphasis">그 모든 순간이 ‘나’가 된다.</p>
        </div>

        <div className="story-hero-meta">
          <span>2026 — Ongoing</span>
          <span>Seoul</span>
          <span>by 86400</span>
        </div>
      </header>

      <div className="story-tabs">
        <button
          type="button"
          className={`story-tab ${tab === 'story' ? 'is-active' : ''}`}
          onClick={() => setTab('story')}
        >
          Story
        </button>
        <button
          type="button"
          className={`story-tab ${tab === 'member' ? 'is-active' : ''}`}
          onClick={() => setTab('member')}
        >
          Member
        </button>
      </div>

      {tab === 'member' ? (
        <MemberView />
      ) : (
      <>

      <RevealChapter num="01" title="Self">
        <p className="chapter-headline">나는 미래의 시작점이다.</p>
        <div className="chapter-detail">
          <p>
            내가 있기에 미래가 있다. 미래는 어딘가에서 갑자기 오는 것이
            아니라, 지금 이 순간의 내가 쌓아온 현재와 과거의 결과로
            만들어진다.
          </p>
          <p>
            그러므로 86400은 ‘나’를 가장 먼저 본다. 옷이 사람을 만드는
            것이 아니라, 사람이 옷을 통해 자신을 더 또렷하게 드러내는 일.
            그 출발점에 내가 있다.
          </p>
        </div>
      </RevealChapter>

      <RevealChapter num="02" title="Series 00:00">
        <p className="chapter-headline">
          새로운 86400은 00:00에서 시작된다.
        </p>
        <div className="chapter-detail">
          <p>
            하루의 첫 좌표, 00:00. 어제와 오늘 사이, 과거와 미래 사이에
            서 있는 그 한 점에서 매일의 86400초가 다시 펼쳐진다.
          </p>
          <p>
            시리즈 00:00은 그 시작의 순간을 위한 옷이다. 새로운 하루를
            가장 또렷한 ‘나’로 마주하기 위한 한 벌. 옷이 아니라, 매일의
            시작을 의식하게 만드는 도구다.
          </p>
        </div>
      </RevealChapter>

      <RevealChapter num="03" title="Reflection" className="story-chapter-feature">
        <p className="chapter-headline big">
          빛을 반사하는 순간,<br />우리는 시간을 거스른다.
        </p>
        <div className="chapter-detail">
          <p>
            시간은 한 방향으로만 흐른다. 그것을 거스를 수 있는 유일한
            존재는 빛이다. 그러나 그 빛조차 시간 위를 흐르는 한 요소일
            뿐이다.
          </p>
          <p>
            빛을 받아 반사하는 순간, 흐름은 잠시 멈추고 방향을 바꾼다.
            우리는 그 찰나에 시간을 거스르고, 미래를 만들어낸다. 반사된
            빛으로 ‘나’를 다시 비춘다.
          </p>
          <p>
            86400의 모든 옷에는 그 반사의 코드가 새겨져 있다. 단순한
            디테일이 아닌, 브랜드가 시간을 다루는 방식 그 자체다.
          </p>
        </div>
      </RevealChapter>

      <RevealChapter num="04" title="Process">
        <p className="chapter-headline">한 벌의 옷에 새겨진 142일.</p>
        <div className="chapter-detail">
          <p>
            한 벌의 옷이 만들어지기까지 걸리는 시간, 142일. 첫 패턴이
            그어지는 순간부터 원단이 선택되고, 봉제가 시작되고, 마지막
            단추가 달리는 순간까지의 기록이다.
          </p>
          <p>
            모든 옷에는 시리얼 넘버가 새겨지고, 그 옷이 만들어진 142일의
            과정이 함께 전달된다. 옷을 산다는 것은 곧, 그 시간을 함께
            산다는 의미다.
          </p>
        </div>
      </RevealChapter>

      <RevealChapter num="05" title="Founders Edition">
        <p className="chapter-headline">단 한 번, 100벌만.</p>
        <div className="chapter-detail">
          <p>
            Vol.01은 1번부터 100번까지, 한정 넘버링으로 제작된다. 단 한
            번 만들어지고 다시 생산되지 않는다. 시즌이 닫히면 그 숫자는
            영원히 닫힌다.
          </p>
          <p>
            브랜드의 첫 페이지에 이름을 새기는 자리. Founders Edition은
            이 시즌의 시작을 함께한 이들에게만 주어진다.
          </p>
        </div>
      </RevealChapter>

      <RevealChapter num="06" title="Beyond">
        <p className="chapter-headline">매 시즌은 한 권의 책이 된다.</p>
        <div className="chapter-detail">
          <p>
            Vol.01 다음에는 Vol.02, 그 다음에는 Vol.03. 86400은 매 시즌을
            한 권의 책처럼 쌓아간다. 시리즈는 시간을 따라 천천히 두꺼워지고,
            그 안에서 브랜드의 역사가 만들어진다.
          </p>
          <p>
            우리가 살아낸 86400초가 모여 하루가 되고, 일 년이 되듯이.
            한 시즌, 한 시즌이 모여 86400이라는 이름의 시간이 된다.
          </p>
        </div>
      </RevealChapter>

      <div className="story-finale">
        <p className="finale-line">나는 시간을 거스를 수 없다.</p>
        <p className="finale-line big">
          그러나 나의 86400은 만들어낼 수 있다.
        </p>
        <span className="story-signature">— 86400</span>
      </div>
      </>
      )}
    </section>
  )
}

function MemberView() {
  return (
    <div className="member-view">
      <header className="member-hero">
        <p className="member-eyebrow">Studio · Two Eyes</p>
        <h2 className="member-title">그리는 손, 보고 결정하는 눈.</h2>
        <p className="member-lede">
          86400은 두 사람의 시선으로 만들어진다. 하나는 디자인을 그리는
          손, 하나는 그것을 보고 어떤 옷이 86400의 이름으로 나갈지
          결정하는 눈. 두 시선이 겹쳐지는 자리에 한 벌의 옷이 남는다.
        </p>
      </header>

      <div className="member-team">
        {TEAM.map((m, idx) => (
          <RevealMember key={m.role} index={idx}>
            <article className="member-card">
              <div className="member-photo">
                <img src={m.photo} alt={m.name} />
              </div>
              <div className="member-info">
                <span className="member-role">{m.role}</span>
                <span className="member-name">{m.name}</span>
                <p className="member-quote">“{m.quote}”</p>
              </div>
            </article>
          </RevealMember>
        ))}
      </div>
    </div>
  )
}

function RevealMember({
  index,
  children,
}: {
  index: number
  children: React.ReactNode
}) {
  const { ref, shown } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'is-visible' : ''}`}
      style={{ transitionDelay: `${index * 0.12}s` }}
    >
      {children}
    </div>
  )
}

function GlobalNav({
  dark = false,
  solid = false,
  onLogoClick,
  onStoryClick,
  onArtistClick,
  onProductClick,
}: {
  dark?: boolean
  solid?: boolean
  onLogoClick: () => void
  onStoryClick: () => void
  onArtistClick: () => void
  onProductClick: () => void
}) {
  // 좁은 화면에선 메뉴가 숨겨지므로 오른쪽에서 나오는 서랍으로 대신한다.
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = prev
    }
  }, [menuOpen])

  useEffect(() => {
    if (!menuOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMenuOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [menuOpen])

  const navigate = (go: () => void) => {
    go()
    setMenuOpen(false)
  }

  const menu = [
    { label: 'Brand', go: onStoryClick },
    { label: 'Artist', go: onArtistClick },
    { label: 'Product', go: onProductClick },
  ]

  return (
    <>
    <nav
      className={`global-nav ${dark ? 'is-dark' : ''} ${
        solid ? 'fig-nav-solid' : ''
      }`}
    >
      <button
        type="button"
        className="nav-logo"
        onClick={onLogoClick}
        aria-label="Home"
      >
        {/* 네비는 밝은 스킨/어두운 스킨 두 가지라 로고도 같이 반전시킨다. */}
        <img src={dark || solid ? logoWhite : logoBlack} alt="86400" />
      </button>
      {/* 시안 Frame 768: Brand · Artist · Product */}
      <ul className="nav-menu">
        {menu.map((m) => (
          <li key={m.label}>
            <button type="button" className="nav-link" onClick={m.go}>
              {m.label}
            </button>
          </li>
        ))}
      </ul>
      <div className="nav-actions">
        <button type="button" className="nav-icon" aria-label="Search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="7" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </button>
        <button type="button" className="nav-icon" aria-label="Account">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
            <circle cx="12" cy="7" r="4" />
          </svg>
        </button>
        <button type="button" className="nav-icon nav-cart" aria-label="Cart">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="9" cy="21" r="1" />
            <circle cx="20" cy="21" r="1" />
            <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6" />
          </svg>
          <span className="nav-cart-count">0</span>
        </button>
        <button
          type="button"
          className="nav-icon nav-burger"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen(true)}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
      </div>
    </nav>

    <div
      className={`nav-drawer-backdrop ${menuOpen ? 'is-open' : ''}`}
      onClick={() => setMenuOpen(false)}
      aria-hidden="true"
    />
    {/* 닫혀 있을 땐 visibility:hidden 이라 탭 순서에서도 빠진다. */}
    <aside
      className={`nav-drawer ${menuOpen ? 'is-open' : ''}`}
      aria-label="Menu"
      aria-hidden={!menuOpen}
    >
      <button
        type="button"
        className="nav-drawer-close"
        onClick={() => setMenuOpen(false)}
        aria-label="Close menu"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
          <line x1="5" y1="5" x2="19" y2="19" />
          <line x1="19" y1="5" x2="5" y2="19" />
        </svg>
      </button>

      <ul className="nav-drawer-menu">
        {menu.map((m) => (
          <li key={m.label}>
            <button
              type="button"
              className="nav-drawer-link"
              onClick={() => navigate(m.go)}
            >
              {m.label}
            </button>
          </li>
        ))}
      </ul>
    </aside>
    </>
  )
}

function Footer() {
  const year = new Date().getFullYear()
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <h2 className="footer-logo">
            <img src={logoWhite} alt="86400" />
          </h2>
          <p className="footer-tagline">
            불확실한 미래에 확실한 나를 보여주는
          </p>
        </div>

        <div className="footer-cols">
          <div className="footer-col">
            <h4>Shop</h4>
            <ul>
              <li><a href="#archive">Archive</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>About</h4>
            <ul>
              <li><a href="#story">Story</a></li>
              <li><a href="#process">Process</a></li>
              <li><a href="#contact">Contact</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Help</h4>
            <ul>
              <li><a href="#shipping">Shipping</a></li>
              <li><a href="#returns">Returns</a></li>
              <li><a href="#faq">FAQ</a></li>
            </ul>
          </div>
          <div className="footer-col">
            <h4>Follow</h4>
            <ul>
              <li><a href="#instagram">Instagram</a></li>
              <li><a href="#wadiz">Wadiz</a></li>
              <li><a href="#newsletter">Newsletter</a></li>
            </ul>
          </div>
        </div>
      </div>

      <div className="footer-team">
        {TEAM.map((m) => (
          <div key={m.role} className="footer-team-item">
            <span className="footer-team-role">{m.role}</span>
            <span className="footer-team-name">{m.name}</span>
          </div>
        ))}
      </div>

      <div className="footer-bottom">
        <p>© {year} 86400. All rights reserved.</p>
        <p className="footer-meta">
          사업자등록번호 000-00-00000 · 통신판매업 신고 제0000-호
        </p>
      </div>
    </footer>
  )
}

export default App
