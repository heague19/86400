import { COMPANY, SHIPPING, won } from './company'
import { LegalLayout, Pending } from './legal'

/**
 * 고객 안내 페이지 — 배송 안내 · 교환/반품 · FAQ · Contact.
 * 법정 고지 페이지(legal.tsx)와 같은 틀을 쓰고, 숫자는 company.ts 의 SHIPPING 에서 가져온다.
 * 교환/반품 기준은 전자상거래법 제17조·제18조(청약철회)를 따른다.
 */

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rn-legal-article">
      <h2>{title}</h2>
      {children}
    </section>
  )
}

const freeShipping = SHIPPING.freeOver > 0

/* ---------- 배송 안내 ---------- */

export function ShippingPage() {
  return (
    <LegalLayout
      eyebrow="Shipping"
      title="배송 안내"
      lead="주문하신 상품과 작품이 어떻게, 언제 도착하는지 안내합니다. 작품(원화)은 일반 상품과 포장·배송 방식이 다르니 아래 내용을 확인해 주세요."
    >
      <Block title="배송비">
        <table>
          <tbody>
            <tr><th>기본 배송비</th><td>{won(SHIPPING.fee)}{freeShipping && <> · {won(SHIPPING.freeOver)} 이상 주문 시 무료</>}</td></tr>
            <tr><th>제주 · 도서산간</th><td>{won(SHIPPING.remoteExtra)} 추가 (무료 배송 주문도 추가 배송비는 부과됩니다)</td></tr>
            <tr><th>택배사</th><td>{SHIPPING.carrier || <Pending label="택배사" />}</td></tr>
            <tr><th>해외 배송</th><td>현재 국내 배송만 지원합니다. 해외 배송은 이메일로 개별 문의해 주세요.</td></tr>
          </tbody>
        </table>
      </Block>

      <Block title="배송 기간">
        <ul>
          <li><strong>출고</strong> — {SHIPPING.dispatch}</li>
          <li><strong>수령</strong> — {SHIPPING.transit}</li>
          <li>천재지변, 택배사 사정, 명절 연휴 등으로 지연될 수 있으며 지연이 예상되면 주문 시 남기신 연락처로 먼저 안내드립니다.</li>
          <li>출고 전에는 배송지 변경이 가능합니다. 출고 후에는 택배사 정책에 따라 변경이 어려울 수 있으니 주문 시 주소를 다시 확인해 주세요.</li>
        </ul>
      </Block>

      <Block title="작품(원화) 배송">
        <p>작가의 원화는 한 점뿐인 작품입니다. 크기와 재질에 따라 전용 완충 포장 후 발송하며, 대형 작품이나 액자 작품은 일반 택배 대신 미술품 운송 또는 직접 전달로 진행할 수 있습니다.</p>
        <ul>
          <li>작품 주문이 확인되면 배송 방법, 예상 일정, 배송비를 이메일로 개별 안내드립니다.</li>
          <li>수령 즉시 포장을 열어 작품 상태를 확인해 주세요. 운송 중 파손이 확인되면 <strong>수령 당일</strong> 포장 상태와 작품 사진을 함께 보내 주시면 교환·환불 절차를 바로 진행합니다.</li>
          <li>작품은 받으신 날로부터 7일 이내 청약철회가 가능합니다. 자세한 내용은 교환·반품 안내를 확인해 주세요.</li>
        </ul>
      </Block>

      <Block title="86400 Keyring 예약 주문">
        <p>Vol.01 Keyring은 현재 출시 준비 중(Coming Soon)입니다. 예약 주문을 받는 경우 결제 시점의 안내에 따라 출고 일정이 별도로 정해지며, 출고 전까지 언제든 취소할 수 있습니다.</p>
      </Block>

      <Block title="문의">
        <p>배송 관련 문의는 {COMPANY.email} 또는 {COMPANY.phone} ({COMPANY.hours})로 연락 주세요. 주문번호 또는 주문자 성함을 함께 알려 주시면 더 빠르게 확인할 수 있습니다.</p>
      </Block>
    </LegalLayout>
  )
}

/* ---------- 교환 · 반품 안내 ---------- */

export function ReturnsPage() {
  const roundTrip = won(SHIPPING.fee * 2)
  return (
    <LegalLayout
      eyebrow="Returns"
      title="교환 · 반품 안내"
      lead="「전자상거래 등에서의 소비자보호에 관한 법률」 제17조·제18조에 따른 청약철회 기준을 그대로 적용합니다. 단순 변심도 7일 이내라면 가능합니다."
    >
      <Block title="신청 기간">
        <table>
          <thead>
            <tr><th>사유</th><th>기간</th><th>배송비 부담</th></tr>
          </thead>
          <tbody>
            <tr>
              <td>단순 변심 · 사이즈/색상 교환</td>
              <td>상품을 받은 날로부터 <strong>7일 이내</strong></td>
              <td>고객 부담 (왕복 {roundTrip}{freeShipping && <>, 무료 배송으로 받으신 경우도 왕복 배송비가 부과됩니다</>})</td>
            </tr>
            <tr>
              <td>상품 하자 · 오배송 · 표시/광고와 다른 경우</td>
              <td>받은 날로부터 <strong>3개월 이내</strong>, 또는 그 사실을 안 날로부터 30일 이내</td>
              <td>회사 부담</td>
            </tr>
          </tbody>
        </table>
      </Block>

      <Block title="교환·반품이 어려운 경우">
        <p>다음의 경우에는 법 제17조 제2항에 따라 청약철회가 제한될 수 있습니다.</p>
        <ul>
          <li>고객의 책임 있는 사유로 상품이 멸실되거나 훼손된 경우 (내용 확인을 위해 포장을 개봉한 경우는 제외)</li>
          <li>사용 또는 일부 소비로 상품의 가치가 현저히 감소한 경우 (착용 흔적, 향, 오염, 세탁 등)</li>
          <li>시간이 지나 다시 판매하기 어려울 정도로 가치가 떨어진 경우</li>
          <li>고객의 요청에 따라 개별 제작된 상품 (주문 제작 작품, 각인 등)으로 사전에 안내하고 동의를 받은 경우</li>
          <li>작품의 경우, 액자 분리·재설치나 보관 환경(직사광선, 습기)으로 인한 변색·손상이 확인된 경우</li>
        </ul>
      </Block>

      <Block title="신청 방법">
        <ol>
          <li><strong>접수</strong> — {COMPANY.email} 또는 인스타그램 DM으로 주문자 성함, 상품명, 사유를 보내 주세요. 하자·파손은 사진을 함께 첨부해 주세요.</li>
          <li><strong>회수 안내</strong> — 영업일 기준 1~2일 내 회수 방법(택배 회수 또는 직접 발송)과 반품 주소를 안내드립니다. 안내 전에 임의로 발송하신 경우 분실 시 확인이 어려울 수 있습니다.</li>
          <li><strong>검수</strong> — 상품이 도착하면 상태를 확인합니다. 교환은 동일 상품의 다른 옵션으로 진행하며 재고가 없으면 환불로 전환됩니다.</li>
          <li><strong>환불</strong> — 상품 반환이 확인된 날로부터 <strong>3영업일 이내</strong>에 환불합니다. 신용카드 결제는 카드사 취소 요청까지 완료하며, 실제 승인 취소 반영은 카드사 일정에 따라 3~7일이 걸릴 수 있습니다.</li>
        </ol>
      </Block>

      <Block title="반품 주소">
        <table>
          <tbody>
            <tr><th>받는 곳</th><td>{COMPANY.legalName} · {COMPANY.address}</td></tr>
            <tr><th>연락처</th><td>{COMPANY.phone} · {COMPANY.email}</td></tr>
          </tbody>
        </table>
        <p>작품(원화)은 받으셨을 때의 포장재를 그대로 사용해 포장해 주세요. 포장재가 없으면 안내드리는 방법으로 포장하거나 회수 서비스를 이용할 수 있습니다.</p>
      </Block>

      <Block title="알아 두실 것">
        <ul>
          <li>청약철회 기간과 환불 기한은 법에서 정한 최소 기준이며, 회사는 이를 약관으로 줄이거나 없애지 않습니다.</li>
          <li>환불 금액은 상품 대금에서 고객 부담 배송비를 뺀 금액이며, 결제 시 사용한 수단으로 돌려드립니다.</li>
          <li>분쟁이 생기면 소비자분쟁해결기준(공정거래위원회 고시)에 따라 처리하며, 한국소비자원(국번 없이 1372)에 피해구제를 신청하실 수 있습니다.</li>
        </ul>
      </Block>
    </LegalLayout>
  )
}

/* ---------- FAQ ---------- */

type Faq = { q: string; a: React.ReactNode }

const FAQ_GROUPS: { title: string; items: Faq[] }[] = [
  {
    title: '브랜드',
    items: [
      {
        q: '86400은 무슨 뜻인가요?',
        a: '하루는 86,400초입니다. 86400은 매일 똑같이 주어지는 그 시간 위에서 "불확실한 미래에 확실한 나를 보여주는" 것을 이야기하는 브랜드입니다. 매 시즌이 Vol.01, Vol.02처럼 한 권의 책으로 쌓입니다.',
      },
      {
        q: 'Works에는 무엇이 올라오나요?',
        a: '참여 작가의 작품(회화 등)과 86400이 만든 오브제가 한 그리드에 함께 올라옵니다. 작품은 작가 상세 페이지에서, 오브제는 상품 상세 페이지에서 자세히 볼 수 있습니다.',
      },
    ],
  },
  {
    title: '주문 · 결제',
    items: [
      {
        q: '어떻게 구매하나요?',
        a: (
          <>
            온라인 결제는 준비 중입니다. 그 전까지는 원하시는 작품·상품명을 {COMPANY.email} 또는 인스타그램 DM으로 보내 주시면 재고와 결제 방법(계좌이체)을 안내드립니다.
          </>
        ),
      },
      {
        q: '86400 Keyring은 언제 살 수 있나요?',
        a: 'Vol.01 Keyring(Black / Silver)은 출시 준비 중입니다. 출시 일정과 가격은 인스타그램과 이 사이트에서 먼저 공개합니다.',
      },
      {
        q: '작품 가격에 액자가 포함되어 있나요?',
        a: '작품마다 다릅니다. 작품 상세에 표기된 사이즈와 재료를 확인해 주시고, 액자 포함 여부는 주문 문의 시 함께 안내드립니다.',
      },
      {
        q: '현금영수증이나 세금계산서를 받을 수 있나요?',
        a: '네. 결제 안내 시 요청해 주시면 발급해 드립니다.',
      },
    ],
  },
  {
    title: '배송',
    items: [
      {
        q: '배송은 얼마나 걸리나요?',
        a: `${SHIPPING.dispatch}하고, ${SHIPPING.transit}이 걸립니다. 작품(원화)은 포장과 운송 방식이 달라 주문 확인 후 개별로 일정을 안내드립니다.`,
      },
      {
        q: '배송비는 얼마인가요?',
        a: `기본 ${won(SHIPPING.fee)}${freeShipping ? `, ${won(SHIPPING.freeOver)} 이상 주문 시 무료` : ''}입니다. 제주·도서산간은 ${won(SHIPPING.remoteExtra)}이 추가됩니다.`,
      },
      {
        q: '해외 배송도 되나요?',
        a: '지금은 국내 배송만 하고 있습니다. 해외 배송은 이메일로 문의해 주시면 가능 여부와 비용을 확인해 드립니다.',
      },
    ],
  },
  {
    title: '교환 · 반품',
    items: [
      {
        q: '단순 변심도 반품할 수 있나요?',
        a: '네. 상품을 받은 날로부터 7일 이내에 신청하시면 됩니다. 이 경우 왕복 배송비는 고객 부담입니다. 하자나 오배송은 3개월 이내 회사 부담으로 처리합니다.',
      },
      {
        q: '환불은 언제 되나요?',
        a: '반품 상품이 도착해 확인된 날로부터 3영업일 이내에 환불합니다. 카드 결제는 카드사 반영까지 며칠 더 걸릴 수 있습니다.',
      },
      {
        q: '작품이 파손되어 도착했어요.',
        a: '수령 당일 포장 상태와 작품 사진을 이메일로 보내 주세요. 확인 즉시 교환 또는 전액 환불로 진행하며 회수 비용은 회사가 부담합니다.',
      },
    ],
  },
  {
    title: '작가 · 협업',
    items: [
      {
        q: '작가로 참여하고 싶어요.',
        a: (
          <>
            포트폴리오 또는 인스타그램 링크와 함께 {COMPANY.email}로 보내 주세요. 다음 시즌 라인업을 구성할 때 검토 후 연락드립니다.
          </>
        ),
      },
      {
        q: '입점 · 전시 · 제휴 문의는 어디로 하나요?',
        a: (
          <>
            {COMPANY.email}로 보내 주시면 영업일 기준 2일 내 회신드립니다.
          </>
        ),
      },
    ],
  },
  {
    title: '개인정보',
    items: [
      {
        q: '회원가입이 필요한가요?',
        a: '아니요. 회원가입 없이 둘러보고 주문할 수 있습니다. 주문 시 받은 정보는 개인정보처리방침에 적힌 기간 동안만 보관합니다.',
      },
      {
        q: '쿠키는 무엇에 쓰나요?',
        a: '화면 설정과 쿠키 동의 여부를 저장하는 필수 쿠키, 방문 통계를 위한 분석 쿠키 두 가지입니다. 분석 쿠키는 동의한 경우에만 쓰이고, 사이트 하단 "쿠키 설정"에서 언제든 바꿀 수 있습니다.',
      },
    ],
  },
]

export function FaqPage() {
  return (
    <LegalLayout
      eyebrow="FAQ"
      title="자주 묻는 질문"
      lead="주문, 배송, 교환·반품, 작품과 협업에 대해 자주 받는 질문을 모았습니다. 여기 없는 내용은 Contact로 문의해 주세요."
    >
      {FAQ_GROUPS.map((group) => (
        <section key={group.title} className="rn-legal-article rn-faq">
          <h2>{group.title}</h2>
          {group.items.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <div className="rn-faq-a">{item.a}</div>
            </details>
          ))}
        </section>
      ))}
    </LegalLayout>
  )
}

/* ---------- Contact ---------- */

export function ContactPage() {
  const handle = COMPANY.instagram.replace(/\/$/, '').split('/').pop()
  return (
    <LegalLayout
      eyebrow="Contact"
      title="Contact"
      lead="주문과 배송, 작품 구매, 작가 협업과 제휴까지 모든 문의를 한 곳에서 받습니다. 영업일 기준 1~2일 안에 회신드립니다."
    >
      <section className="rn-legal-article">
        <dl className="rn-contact">
          <div>
            <dt>이메일</dt>
            <dd><a href={`mailto:${COMPANY.email}`}>{COMPANY.email}</a></dd>
          </div>
          <div>
            <dt>전화</dt>
            <dd><a href={`tel:${COMPANY.phone.replace(/-/g, '')}`}>{COMPANY.phone}</a><small>{COMPANY.hours}</small></dd>
          </div>
          <div>
            <dt>인스타그램</dt>
            <dd><a href={COMPANY.instagram} target="_blank" rel="noopener noreferrer">@{handle} ↗</a></dd>
          </div>
          <div>
            <dt>주소</dt>
            <dd>{COMPANY.address}<small>방문은 사전 예약 후 가능합니다.</small></dd>
          </div>
        </dl>
      </section>

      <Block title="문의 종류별 안내">
        <table>
          <tbody>
            <tr><th>주문 · 배송 · 교환/반품</th><td>주문자 성함과 상품명을 함께 적어 주세요. 하자·파손은 사진을 첨부해 주세요.</td></tr>
            <tr><th>작품 구매 · 커미션</th><td>작품명 또는 작가명을 알려 주시면 재고, 액자 여부, 배송 방법을 안내드립니다.</td></tr>
            <tr><th>작가 참여 · 협업</th><td>포트폴리오 또는 인스타그램 링크를 보내 주세요. 시즌 라인업 구성 시 검토합니다.</td></tr>
            <tr><th>입점 · 전시 · 제휴 · 언론</th><td>제안 내용과 일정을 간단히 적어 주시면 담당자가 회신드립니다.</td></tr>
            <tr><th>개인정보</th><td>열람·정정·삭제 요청은 개인정보 보호책임자 {COMPANY.privacyOfficer.name}({COMPANY.privacyOfficer.contact})에게 보내 주세요.</td></tr>
          </tbody>
        </table>
      </Block>
    </LegalLayout>
  )
}
