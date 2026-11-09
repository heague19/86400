import { useEffect, useRef, useState } from 'react'
import './App.css'
import './renewal.css'
// 워드마크 대신 쓰는 로고. 배경색에 맞춰 둘 중 하나를 고른다.
import logoWhite from './assets/86400white.png'
import logoBlack from './assets/86400black.png'
// 원본(6.8MB PNG / 1.9K 정사각)은 리포 루트에 그대로 두고, 카드 크기에 맞춰
// 줄인 웹용 사본만 번들에 넣는다.
import victorLeePhoto from './assets/VictorLeeProfile.jpg'
import seoHyeonJeonPhoto from './assets/SeoHyeonJeonProfile.jpg'
import juhwanCheonPhoto from './assets/JuhwanCheonProfile.png'
import leeJiMinPhoto from './assets/LeeJiMinProfile.png'
import leeJiMinWork01 from './assets/LeeJiMin-Work01.png'
import leeJiMinWork02 from './assets/LeeJiMin-Work02.png'
import seoHyeonJeonWork01 from './assets/SeoHyeonJeon-Work01.jpg'
import seoHyeonJeonWork02 from './assets/SeoHyeonJeon-Work02.jpg'
import seoHyeonJeonWork03 from './assets/SeoHyeonJeon-Work03.jpg'

type Page =
  | 'collection'
  | 'detail'
  | 'story'
  | 'exhibition'
  | 'artist'
  | 'artistDetail'
  | 'workDetail'
  | 'product'

const TEAM = [
  {
    role: 'Director',
    name: 'Victor Lee',
    photo: victorLeePhoto,
    quote:
      '디자인을 그리지는 않는다. 그러나 어떤 옷이 86400의 이름으로 나갈지는 내가 결정한다.',
  },
  {
    role: 'Designer',
    name: 'Lee Ji Min',
    photo: leeJiMinPhoto,
    quote:
      '같은 패턴을 매일 다시 그렸다. 사라진 선들이 결국 이 한 벌을 완성했다.',
  },
]

/**
 * 이미지 말고는 전부 선택 항목이다. 아직 안 받은 정보를 지어내지 않고
 * 비워둘 수 있게 두되, 채워지는 대로 상세 페이지에 그대로 붙는다.
 */
type Work = {
  image: string
  title: string | null
  year: string | null
  /** 작가가 준 표기 그대로 둔다. */
  size: string | null
  medium: string | null
  /** 원(KRW). 표시할 때 천 단위 구분자를 붙인다. */
  price: number | null
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
  /** 사진이 여백 없는 누끼컷이면 cover 대신 패널 위 contain 으로 세운다. */
  cutout?: boolean
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
      {
        image: seoHyeonJeonWork02,
        title: '상',
        year: '2026',
        size: '272mm × 394mm',
        medium: 'Watercolor paint on can tape paper',
        price: 2000000,
        note: [
          "물결이 이르는 곳에 도달하니 물의 잔상만 남았다. 이것이 허'상'일지 환'상'일지 아님, 초'상'일지 모르겠어서 더 마음이 복잡해졌다.",
          // 작가가 끊어 쓴 줄바꿈을 그대로 살린다(.rn-work-note 가 pre-line).
          '마음이 복잡할 때는 물결을 그립니다.\n이것이 어떠한 잔상인지 구체적으로 그리는 것보다도 마음가는데로, 손길가는데로 이어갑니다. 저희도 마찬가지입니다.\n인생을 살아가는데 뚜렷한 목표가 있던, 흐르는 대로 살아가던 어느 순간 어딘가에 닿아있습니다.\n그것만으로 충분히 가치 있는 삶 아닐까요?',
        ],
      },
      {
        image: seoHyeonJeonWork03,
        title: '어월',
        year: '2024',
        size: '72.7x53.0cm',
        medium: 'Acrylic on canvas',
        price: 2000000,
        note: [
          "현대 국어 '응어리'의 옛말 '어월'은 16세기 문헌에서부터 나타난다. '어월'에 접사 '-이'가 결합하면 '어워리'가 되는데 어중에 종성 '○'을 첨가하면 '엉워리'가 될 수 있다. '엉워리'는 제2음절의 이중 모음이 단모음으로 단순화하여 '엉어리'가 될 수 있는데 이 '엉어리'가 19세기 문헌에 나타난다. 중간 단계인 '어워리'와 '엉워리'는 문헌에서 찾기 힘들다. 그러므로 먼저 '어워리'가 '어어리'가 되고 '엉어리'로 변화하였다고 설명하는 것이 가능하다. 20세기 이후어 제1음절의 모음이 어 '에서 '-'로 바뀐 것은 일종의 이화라 할 수 있을 것이다. 20세기 이후에 나타난 '응어리'는 현재에 이어지게 되었다.",
          '저도 모르겠습니다. 눈에서 눈물이 하염없이 흘러 또다른 나에게로 연결됩니다. 눈물의 모양이 마음의 모양처럼 이리저리 변하는데 무엇이 진짜 나 자신인지 헷갈립니다. 마음이 쓰라려 참고 견뎌야 하니 속만 미어집니다. 이것이 응어리가 되어 결국 내가 됩니다.',
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
  {
    name: 'Lee Ji Min',
    role: 'Designer',
    photo: leeJiMinPhoto,
    intro: [
      '같은 패턴을 매일 다시 그렸다. 사라진 선들이 결국 이 한 벌을 완성했다.',
    ],
    instagram: null,
    // 86400 펜던트 오브제 — 블랙/실버. 제목·연도·가격은 아직 못 받아 비워둔다.
    works: [
      {
        image: leeJiMinWork01,
        title: null,
        year: null,
        size: null,
        medium: null,
        price: null,
        note: [],
      },
      {
        image: leeJiMinWork02,
        title: null,
        year: null,
        size: null,
        medium: null,
        price: null,
        note: [],
      },
    ],
  },
]

type Product = {
  name: string
  /** null 이면 가격 미정 — 상세의 CTA 가 COMING SOON 으로 바뀐다. */
  price: string | null
  meta: string
  /** 제품 화보. 비어 있으면 넘버링 플레이스홀더가 나간다. */
  images: string[]
  optionLabel: string
  options: string[]
  defaultOption: string
  desc: string | null
  material: string | null
}

const SIZES = ['XS', 'S', 'M', 'L', 'XL']

/** Vol.01 제품. 화보·스펙이 없는 항목은 비워두면 상세에서 알아서 숨는다. */
const PRODUCTS: Product[] = [
  {
    name: '86400 Pendant',
    price: null,
    meta: 'Object · Designed by Lee Ji Min',
    images: [leeJiMinWork01, leeJiMinWork02],
    optionLabel: 'Finish',
    options: ['Black', 'Silver'],
    defaultOption: 'Black',
    desc: null,
    material: null,
  },
  {
    name: 'Series 00:00 Shirt',
    price: '₩ 129,000',
    meta: '142일의 기록',
    images: [],
    optionLabel: 'Size',
    options: SIZES,
    defaultOption: 'M',
    desc: '불확실한 미래에 확실한 나를 표현하는 한 벌. 데뷔 시즌 한정 넘버링으로 제작된 Founders Edition은 시간이 흘러도 변하지 않는 코드를 담습니다.',
    material: '100% Cotton · Made in Korea',
  },
  {
    name: 'Reflection Tee',
    price: '₩ 98,000',
    meta: 'Edition of 100',
    images: [],
    optionLabel: 'Size',
    options: SIZES,
    defaultOption: 'M',
    desc: '불확실한 미래에 확실한 나를 표현하는 한 벌. 데뷔 시즌 한정 넘버링으로 제작된 Founders Edition은 시간이 흘러도 변하지 않는 코드를 담습니다.',
    material: '100% Cotton · Made in Korea',
  },
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

  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  // 페이지 전환은 라우터 없이 state 로 하니 스크롤을 직접 올려준다.
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [page])

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
  const goExhibition = () => setPage('exhibition')
  const openProduct = (i: number) => {
    setSelectedProduct(i)
    setPage('detail')
  }

  // 리뉴얼은 전 페이지 다크 본문이라 네비도 항상 다크 스킨.
  const darkNav = opened

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
            onLogoClick={goCollection}
            onStoryClick={goStory}
            onArtistClick={goArtist}
            onProductClick={goProduct}
          />

          {page === 'collection' && (
            <HomePage
              onOpenArtist={openArtist}
              onOpenArtistList={goArtist}
              onOpenProduct={openProduct}
            />
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
              index={selectedArtist}
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

          {page === 'exhibition' && <ExhibitionPage />}

          {page === 'detail' && selectedProduct !== null && (
            <ProductDetailPage index={selectedProduct} onBack={goCollection} />
          )}

          {page === 'story' && <BrandPage />}

          <Footer />
        </>
      )}
    </div>
  )
}

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
 * 홈 — A안 '풀블리드 에디토리얼'.
 * 풀스크린 히어로(키 비주얼 = 전서현 '상') 아래 아티스트 에디토리얼 밴드가
 * 좌우 교차로 이어지고, 제품은 비대칭 스태거 배치.
 */
/**
 * 홈 히어로 — 광고 배너 캐로셀.
 * 1번: 아티스트/브랜드 배너(기존 히어로 그대로), 2번: 제품 배너(86400 Pendant).
 * 배너를 더 올리려면 slides 배열에 추가하면 된다. 6초마다 자동 전환.
 */
function HomeHero({
  onOpenArtistList,
  onOpenArtist,
  onOpenProduct,
}: {
  onOpenArtistList: () => void
  onOpenArtist: (index: number) => void
  onOpenProduct: (index: number) => void
}) {
  const slides = [
    {
      key: 'artist',
      image: seoHyeonJeonWork02,
      label: '아티스트 배너',
      cta: { label: 'NEW SEASON ARTIST →', go: onOpenArtistList },
      body: (
        <>
          <span className="rn-eyebrow">
            Vol.01 — New Season · Founders Edition
          </span>
          <img className="rn-hero-logo" src={logoWhite} alt="86400" />
          <span className="rn-hero-tagline">
            불확실한 미래에 확실한 나를 보여주는
          </span>
        </>
      ),
    },
    {
      key: 'art',
      image: seoHyeonJeonWork01,
      label: '아트 배너',
      // ARTIST_ROW[1] = SeoHyeon Jeon — 작품을 가진 작가의 상세로 보낸다.
      cta: { label: 'VIEW WORKS →', go: () => onOpenArtist(1) },
      body: (
        <>
          <span className="rn-eyebrow">
            Vol.01 — New Season Works · SeoHyeon Jeon
          </span>
          <h2 className="rn-hero-title">녹차라떼 먹추가</h2>
          <span className="rn-hero-tagline">
            In a korea paper, ink and light color · 2024
          </span>
        </>
      ),
    },
    {
      key: 'pendant',
      image: leeJiMinWork02,
      label: '상품 배너',
      cta: { label: 'VIEW PRODUCT →', go: () => onOpenProduct(0) },
      body: (
        <>
          <span className="rn-eyebrow">
            Vol.01 — Product No.001 · Coming Soon
          </span>
          <h2 className="rn-hero-title">86400 Pendant</h2>
          <span className="rn-hero-tagline">
            Object — Designed by Lee Ji Min
          </span>
        </>
      ),
    },
  ]

  const [cur, setCur] = useState(0)

  // cur 가 바뀔 때마다 타이머를 다시 걸어, 수동 전환 직후 바로 넘어가는 걸 막는다.
  useEffect(() => {
    const id = window.setInterval(
      () => setCur((c) => (c + 1) % slides.length),
      6000
    )
    return () => window.clearInterval(id)
  }, [cur, slides.length])

  const prev = () => setCur((c) => (c - 1 + slides.length) % slides.length)
  const next = () => setCur((c) => (c + 1) % slides.length)

  return (
    <div className="rn-hero">
      {slides.map((s, i) => (
        <div
          key={s.key}
          className={`rn-slide ${i === cur ? 'is-active' : ''}`}
          aria-hidden={i !== cur}
        >
          <img className="rn-hero-bg" src={s.image} alt="" aria-hidden="true" />
          <div className="rn-hero-scrim" />
          <div className="rn-hero-center">
            {s.body}
            <button type="button" className="rn-hero-cta" onClick={s.cta.go}>
              {s.cta.label}
            </button>
          </div>
        </div>
      ))}

      <button
        type="button"
        className="rn-hero-arrow is-prev"
        onClick={prev}
        aria-label="이전 배너"
      >
        ←
      </button>
      <button
        type="button"
        className="rn-hero-arrow is-next"
        onClick={next}
        aria-label="다음 배너"
      >
        →
      </button>

      <div className="rn-hero-nav">
        {slides.map((s, i) => (
          <button
            key={s.key}
            type="button"
            className={i === cur ? 'is-active' : ''}
            onClick={() => setCur(i)}
            aria-label={`${s.label}로 이동`}
          />
        ))}
      </div>

      <div className="rn-hero-foot">
        <span>ONE DAY = 86400 SECONDS</span>
        <span>SCROLL ↓</span>
      </div>
    </div>
  )
}

function HomePage({
  onOpenArtist,
  onOpenArtistList,
  onOpenProduct,
}: {
  onOpenArtist: (index: number) => void
  onOpenArtistList: () => void
  onOpenProduct: (index: number) => void
}) {
  // 홈에 세우는 에디토리얼 밴드. 소개글이 있는 아티스트만 올라간다.
  const bands = ARTIST_ROW.map((artist, index) => ({ artist, index })).filter(
    ({ artist }) => artist.intro.length > 0
  )

  return (
    <section className="rn-home">
      <HomeHero
        onOpenArtistList={onOpenArtistList}
        onOpenArtist={onOpenArtist}
        onOpenProduct={onOpenProduct}
      />

      {bands.map(({ artist, index }, i) => (
        <Reveal key={artist.name}>
        <article className={`rn-band ${i % 2 === 1 ? 'is-reverse' : ''}`}>
          <button
            type="button"
            className={`rn-band-media ${artist.cutout ? 'is-panel' : ''}`}
            onClick={() => onOpenArtist(index)}
            aria-label={`${artist.name} 아티스트 페이지로`}
          >
            {artist.photo && <img src={artist.photo} alt={artist.name} />}
          </button>
          <div className="rn-band-info">
            <span className="rn-eyebrow">
              Artist — No.{String(index + 1).padStart(2, '0')}
            </span>
            <h2 className="rn-band-name">{artist.name}</h2>
            <p className="rn-band-quote">{artist.intro[0]}</p>
            <button
              type="button"
              className="rn-link"
              onClick={() => onOpenArtist(index)}
            >
              VIEW ARTIST →
            </button>
          </div>
        </article>
        </Reveal>
      ))}

      <div className="rn-products">
        <div className="rn-products-head">
          <h2>Product</h2>
          <span>VOL.01 — EDITION OF 100</span>
        </div>
        {PRODUCTS.slice(0, 2).map((p, i) => (
          <Reveal key={p.name}>
          <button
            type="button"
            className={`rn-prod-row ${i % 2 === 1 ? 'is-reverse' : ''}`}
            onClick={() => onOpenProduct(i)}
          >
            <span className="rn-prod-caption">
              <span className="rn-prod-no">
                No.{String(i + 1).padStart(3, '0')}
              </span>
              <span className="rn-prod-name">{p.name}</span>
              <span className="rn-prod-meta">
                {p.price ?? '가격 미정'} · {p.meta}
              </span>
            </span>
            <span className="rn-prod-ph">
              {p.images[0] ? (
                <img src={p.images[0]} alt={p.name} />
              ) : (
                <>No.{String(i + 1).padStart(3, '0')}</>
              )}
            </span>
          </button>
          </Reveal>
        ))}
      </div>
    </section>
  )
}

/**
 * 소개글·작품 노트 공용 본문.
 *
 * 첫 문단이 짧으면 스테이트먼트로 읽히니 크게 세우고, 인용문처럼 긴 글이
 * 먼저 오면 본문 톤 그대로 둔다. 큰 활자로 400자를 깔면 읽히지 않는다.
 */
const LEAD_MAX = 120

function Prose({ paragraphs }: { paragraphs: string[] }) {
  return (
    <>
      {paragraphs.map((p, i) => (
        <p
          key={p}
          className={i === 0 && p.length <= LEAD_MAX ? 'is-lead' : ''}
          style={{ whiteSpace: 'pre-line' }}
        >
          {p}
        </p>
      ))}
    </>
  )
}

/**
 * Artist 목록 — 대안 '아코디언'.
 * 화면 전체를 작가 수만큼 세로 패널로 나누고, 호버/포커스한 패널이
 * 넓게 펼쳐진다. 비활성 패널은 흑백 + 세로 이름 라벨.
 */
function ArtistPage({
  onOpenExhibition,
  onOpenArtist,
}: {
  onOpenExhibition: () => void
  onOpenArtist: (index: number) => void
}) {
  return (
    <section className="rn-acc-page">
      <div className="rn-acc">
        {ARTIST_ROW.map((a, i) => (
          <button
            key={a.name}
            type="button"
            className="rn-acc-panel"
            onClick={() => onOpenArtist(i)}
          >
            {a.photo && <img src={a.photo} alt={a.name} />}
            <span className="rn-acc-vert">
              {a.name} — No.{String(i + 1).padStart(2, '0')}
            </span>
            <span className="rn-acc-cap">
              <span className="rn-eyebrow">
                No.{String(i + 1).padStart(2, '0')} · {a.role}
              </span>
              <strong>{a.name}</strong>
              {a.intro[0] && <span>{a.intro[0]}</span>}
            </span>
          </button>
        ))}
      </div>
      <div className="rn-acc-foot">
        <span>NEW SEASON ARTIST — VOL.01</span>
        <button type="button" className="rn-link" onClick={onOpenExhibition}>
          VIEW ONLINE EXHIBITION →
        </button>
      </div>

      <div className="rn-agrid">
        <div className="rn-agrid-head">
          <div className="rn-agrid-title">
            <span className="rn-eyebrow">Index</span>
            <h2>All Artists</h2>
          </div>
          <span className="rn-agrid-count">
            {ARTIST_ROW.length} ARTISTS
          </span>
        </div>
        <div className="rn-agrid-grid">
          {ARTIST_ROW.map((a, i) => (
            <Reveal key={a.name} delay={i * 0.08}>
            <button
              type="button"
              className="rn-agrid-tile"
              onClick={() => onOpenArtist(i)}
            >
              {a.photo && <img src={a.photo} alt={a.name} />}
              <span className="rn-agrid-cap">
                <strong>{a.name}</strong>
                <span>
                  No.{String(i + 1).padStart(2, '0')} · {a.role}
                  {a.works.length > 0 && ` · ${a.works.length} works`}
                </span>
              </span>
            </button>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  )
}

/**
 * Artist 상세 — 대안 '풀블리드'.
 * 작가 사진이 화면 전체를 덮는 히어로 위에 대형 이름 타이포,
 * 아래 스테이트먼트, Works 는 가로 스크롤 필름스트립.
 */
function ArtistDetailPage({
  artist,
  index,
  onBack,
  onOpenWork,
}: {
  artist: Artist
  index: number
  onBack: () => void
  onOpenWork: (index: number) => void
}) {
  return (
    <section className="rn-ad">
      <div className={`rn-ad-hero ${artist.cutout ? 'is-panel' : ''}`}>
        {artist.photo && <img src={artist.photo} alt={artist.name} />}
        <div className="rn-ad-scrim" />
        <button type="button" className="rn-ad-back" onClick={onBack}>
          ← Artist
        </button>
        <div className="rn-ad-title">
          <div>
            <span className="rn-eyebrow">
              Artist — No.{String(index + 1).padStart(2, '0')} ·{' '}
              {artist.role}
            </span>
            <h1 className="rn-ad-name">{artist.name}</h1>
          </div>
          {artist.instagram && (
            <a
              className="rn-ad-handle"
              href={`https://www.instagram.com/${artist.instagram}/`}
              target="_blank"
              rel="noopener noreferrer"
            >
              @{artist.instagram}
            </a>
          )}
        </div>
      </div>

      {artist.intro.length > 0 && (
        <Reveal>
        <div className="rn-ad-statement">
          <span className="rn-eyebrow">Statement</span>
          <div className="rn-ad-statement-body">
            <Prose paragraphs={artist.intro} />
          </div>
        </div>
        </Reveal>
      )}

      {artist.works.length > 0 && (
        <div className="rn-strip">
          <div className="rn-strip-head">
            <h2>Works</h2>
            <span>DRAG TO SCROLL →</span>
          </div>
          <div className="rn-strip-track">
            {artist.works.map((work, i) => (
              <button
                key={work.image}
                type="button"
                className="rn-strip-card"
                onClick={() => onOpenWork(i)}
              >
                <img
                  src={work.image}
                  alt={work.title ?? `${artist.name} — Work ${i + 1}`}
                />
                <span className="rn-strip-cap">
                  <strong>{work.title ?? `No.${String(i + 1).padStart(2, '0')}`}</strong>
                  <span>
                    {[work.year, work.price !== null ? `₩${work.price.toLocaleString('ko-KR')}` : null]
                      .filter(Boolean)
                      .join(' · ')}
                  </span>
                </span>
              </button>
            ))}
          </div>
        </div>
      )}
    </section>
  )
}

/**
 * 작품 상세 — 대안 '갤러리 월'.
 * 스포트라이트 조명 아래 작품만 크게 걸고, 스펙과 노트는 오른쪽 패널로.
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
  const no = `No.${String(index + 1).padStart(2, '0')}`

  return (
    <section className="rn-work">
      <div className="rn-work-stage">
        <button type="button" className="rn-work-back" onClick={onBack}>
          ← {artist.name}
        </button>
        <img
          className="rn-work-img rn-anim-fade"
          src={work.image}
          alt={work.title ?? `${artist.name} — Work ${index + 1}`}
        />
        <div className="rn-work-caption">
          <div className="rn-work-caption-left">
            <span className="rn-eyebrow">
              Work {no} — {artist.name}
            </span>
            <span className="rn-work-title-row">
              <strong>{work.title ?? no}</strong>
              {work.year && <span>{work.year}</span>}
            </span>
          </div>
          <div className="rn-work-caption-right">
            {work.price !== null && (
              <span className="rn-work-price">
                ₩ {work.price.toLocaleString('ko-KR')}
              </span>
            )}
            <span className="rn-work-index">
              {String(index + 1).padStart(2, '0')} /{' '}
              {String(artist.works.length).padStart(2, '0')}
            </span>
          </div>
        </div>
      </div>

      <aside className="rn-work-panel">
        <span className="rn-eyebrow">Details</span>
        <dl className="rn-spec">
          {work.size && (
            <div>
              <dt>Size</dt>
              <dd>{work.size}</dd>
            </div>
          )}
          {work.medium && (
            <div>
              <dt>Medium</dt>
              <dd>{work.medium}</dd>
            </div>
          )}
          <div>
            <dt>Artist</dt>
            <dd>{artist.name}</dd>
          </div>
          {work.price !== null && (
            <div>
              <dt>Price</dt>
              <dd className="is-price">
                ₩ {work.price.toLocaleString('ko-KR')}
              </dd>
            </div>
          )}
        </dl>

        {work.note.length > 0 && (
          <div className="rn-work-note" style={{ whiteSpace: 'pre-line' }}>
            {work.note.map((p) => (
              <p key={p}>{p}</p>
            ))}
          </div>
        )}

        <p className="rn-work-notice">※ {IMAGE_NOTICE}</p>

        {artist.instagram && (
          <a
            className="rn-ad-handle"
            href={`https://www.instagram.com/${artist.instagram}/`}
            target="_blank"
            rel="noopener noreferrer"
            style={{ marginTop: 'auto' }}
          >
            @{artist.instagram}
          </a>
        )}
      </aside>
    </section>
  )
}

/**
 * Product 목록 — 흰 배경 카드 3열(기존 레이아웃 유지).
 */
function ProductPage({ onOpenProduct }: { onOpenProduct: (index: number) => void }) {
  return (
    <section className="fig-product-page">
      <div className="fig-grid">
        {PRODUCTS.map((p, i) => (
          <button
            key={p.name}
            type="button"
            className="fig-card"
            onClick={() => onOpenProduct(i)}
          >
            <div className="fig-card-frame">
              <div className="fig-card-media">
                {p.images[0] && <img src={p.images[0]} alt={p.name} />}
              </div>
              <span className="fig-card-index">
                No.{String(i + 1).padStart(3, '0')}
              </span>
            </div>
            <div className="fig-card-caption">
              <span className="fig-card-name">{p.name}</span>
            </div>
          </button>
        ))}
      </div>
    </section>
  )
}

/**
 * Product 상세 — 대안 '50:50 스플릿'.
 * 왼쪽 고정 이미지 + 오른쪽 정보 컬럼(접이식 섹션), 하단 고정 CTA 바.
 * Director's Note 는 접이 섹션 안에 통째로 들어간다.
 */
function ProductDetailPage({
  index,
  onBack,
}: {
  index: number
  onBack: () => void
}) {
  const product = PRODUCTS[index]
  const [option, setOption] = useState(product.defaultOption)
  const [imgIdx, setImgIdx] = useState(0)
  const no = `No.${String(index + 1).padStart(3, '0')}`

  // Finish(Black/Silver)처럼 옵션과 화보가 1:1 이면 옵션 선택이 화보도 넘긴다.
  const pickOption = (s: string, i: number) => {
    setOption(s)
    if (product.images.length === product.options.length) setImgIdx(i)
  }

  return (
    <section className="rn-pd">
      <div className="rn-pd-media">
        {product.images.length > 0 ? (
          <img
            key={imgIdx}
            className="rn-anim-fade"
            src={product.images[imgIdx]}
            alt={`${product.name}${
              product.options[imgIdx] ? ` — ${product.options[imgIdx]}` : ''
            }`}
          />
        ) : (
          <span>{no}</span>
        )}
        <span className="rn-pd-media-label">
          PRODUCT IMAGE
          {product.images.length > 1 && product.options[imgIdx]
            ? ` — ${product.options[imgIdx].toUpperCase()}`
            : ''}
        </span>
        {product.images.length > 1 ? (
          <div className="rn-pd-dots">
            {product.images.map((src, i) => (
              <button
                key={src}
                type="button"
                className={i === imgIdx ? 'is-active' : ''}
                onClick={() => setImgIdx(i)}
                aria-label={`제품 이미지 ${i + 1}`}
              />
            ))}
          </div>
        ) : (
          <div className="rn-pd-dots" aria-hidden="true">
            <span className="is-active" />
            <span />
            <span />
            <span />
          </div>
        )}
      </div>

      <div className="rn-pd-info">
        <div className="rn-pd-body">
          <button type="button" className="rn-pd-back" onClick={onBack}>
            ← Back
          </button>
          <span className="rn-eyebrow">Vol.01 / Founders Edition</span>
          <h1 className="rn-pd-title">{product.name}</h1>
          <div className="rn-pd-pricerow">
            <span className="rn-pd-price">{product.price ?? '가격 미정'}</span>
            <span className="rn-pd-edition">
              {no} · {product.meta}
            </span>
          </div>

          <div className="rn-pd-sizes">
            <span className="rn-eyebrow">{product.optionLabel}</span>
            <div className="rn-size-row">
              {product.options.map((s, i) => (
                <button
                  key={s}
                  type="button"
                  className={`rn-size ${option === s ? 'is-active' : ''}`}
                  onClick={() => pickOption(s, i)}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          {product.desc && (
            <details className="rn-pd-details" open>
              <summary>DESCRIPTION</summary>
              <p>{product.desc}</p>
            </details>
          )}
          {product.material && (
            <details className="rn-pd-details">
              <summary>MATERIAL</summary>
              <p>{product.material}</p>
            </details>
          )}
          <details className="rn-pd-details">
            <summary>DIRECTOR'S NOTE — 142일의 기록</summary>
            <div className="rn-pd-director">
              <DirectorView productNo={index + 1} />
            </div>
          </details>
        </div>

        <div className="rn-pd-cta">
          <button type="button" className="rn-cta-ghost">
            WISHLIST
          </button>
          {product.price ? (
            <button type="button" className="rn-cta-main">
              ADD TO CART — {product.price}
            </button>
          ) : (
            <button type="button" className="rn-cta-main is-soon" disabled>
              COMING SOON
            </button>
          )}
        </div>
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
      name: 'Lee Ji Min',
      handle: '@lee.jimin',
      photo: TEAM[1].photo,
      quote:
        '이 옷을 만드는 동안, 매일 같은 패턴을 다시 그렸습니다. 사라진 선들이 결국 이 한 벌을 완성했어요.',
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

/** 스크롤 리빌 공용 래퍼 — .reveal 스타일(App.css)을 그대로 쓴다. */
function Reveal({
  children,
  delay = 0,
}: {
  children: React.ReactNode
  delay?: number
}) {
  const { ref, shown } = useReveal<HTMLDivElement>()
  return (
    <div
      ref={ref}
      className={`reveal ${shown ? 'is-visible' : ''}`}
      style={delay ? { transitionDelay: `${delay}s` } : undefined}
    >
      {children}
    </div>
  )
}

/** Brand 챕터 — 거대 타이포 레이아웃용. ghost 는 배경 워터마크 문자. */
const BRAND_CHAPTERS = [
  {
    no: '01',
    tag: 'SELF',
    ghost: '01',
    title: '나는 미래의 시작점이다.',
    body: '미래는 어딘가에서 갑자기 오는 것이 아니라, 지금 이 순간의 내가 쌓아온 현재와 과거의 결과로 만들어진다. 그러므로 86400은 ‘나’를 가장 먼저 본다.',
  },
  {
    no: '02',
    tag: 'SERIES 00:00',
    ghost: '00:00',
    title: '새로운 86400은\n00:00에서 시작된다.',
    body: '어제와 오늘 사이, 과거와 미래 사이에 서 있는 그 한 점에서 매일의 86400초가 다시 펼쳐진다. 시리즈 00:00은 그 시작의 순간을 위한 옷이다.',
  },
  {
    no: '03',
    tag: 'REFLECTION',
    ghost: '03',
    title: '빛을 반사하는 순간,\n우리는 시간을 거스른다.',
    body: '시간을 거스를 수 있는 유일한 존재는 빛이다. 빛을 받아 반사하는 순간, 우리는 그 찰나에 미래를 만들어낸다. 86400의 모든 옷에는 그 반사의 코드가 새겨져 있다.',
  },
  {
    no: '04',
    tag: 'PROCESS',
    ghost: '142',
    title: '한 벌의 옷에\n새겨진 142일.',
    body: '첫 패턴부터 마지막 단추까지. 모든 옷에는 시리얼 넘버와 그 142일의 기록이 함께 새겨진다. 옷을 산다는 것은 곧, 그 시간을 함께 산다는 의미다.',
  },
  {
    no: '05',
    tag: 'FOUNDERS EDITION',
    ghost: '100',
    title: '단 한 번, 100벌만.',
    body: 'Vol.01은 1번부터 100번까지, 한정 넘버링으로 제작된다. 시즌이 닫히면 그 숫자는 영원히 닫힌다. 브랜드의 첫 페이지에 이름을 새기는 자리.',
  },
  {
    no: '06',
    tag: 'BEYOND',
    ghost: 'VOL',
    title: '매 시즌은\n한 권의 책이 된다.',
    body: 'Vol.01 → Vol.02 → Vol.03. 시리즈는 시간을 따라 천천히 두꺼워지고, 그 안에서 86400이라는 이름의 시간이 만들어진다.',
  },
]

/**
 * Brand — 대안 '거대 타이포'.
 * 사진 없이 타이포 스케일로 끌고 간다. 배경에 숫자 고스트 워터마크,
 * 챕터마다 좌/우 정렬 교차. Member 탭은 기존 뷰 유지.
 */
function BrandPage() {
  const [tab, setTab] = useState<'story' | 'member'>('story')

  return (
    <section className="rn-brand">
      <div className="rn-brand-tabs">
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
          <header className="rn-brand-hero">
            <span className="rn-ghost" aria-hidden="true">
              86400
            </span>
            <div className="rn-brand-hero-inner">
              <span className="rn-eyebrow">Find Your, Lead Future</span>
              <h1>
                하루는 86400초.
                <br />그 모든 순간이
                <br />'나'가 된다.
              </h1>
              <span className="rn-brand-meta">
                2026 — Ongoing · Seoul · by 86400
              </span>
            </div>
          </header>

          {BRAND_CHAPTERS.map((c, i) => (
            <BrandChapter key={c.no} chapter={c} right={i % 2 === 0} />
          ))}

          <div className="rn-brand-finale">
            <p>
              나는 시간을 거스를 수 없다.
              <br />
              그러나 나의 86400은 만들어낼 수 있다.
            </p>
            <img src={logoWhite} alt="86400" />
          </div>
        </>
      )}
    </section>
  )
}

function BrandChapter({
  chapter,
  right,
}: {
  chapter: (typeof BRAND_CHAPTERS)[number]
  right: boolean
}) {
  const { ref, shown } = useReveal<HTMLElement>()
  return (
    <article
      ref={ref}
      className={`rn-chapter ${right ? 'is-right' : ''} reveal ${
        shown ? 'is-visible' : ''
      }`}
    >
      <span className="rn-ghost" aria-hidden="true">
        {chapter.ghost}
      </span>
      <div className="rn-chapter-inner">
        <span className="rn-eyebrow">
          {chapter.no} — {chapter.tag}
        </span>
        <h2 style={{ whiteSpace: 'pre-line' }}>{chapter.title}</h2>
        <p>{chapter.body}</p>
      </div>
    </article>
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
