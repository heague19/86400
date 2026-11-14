/**
 * 사업자 표시 정보 · 법정 고지 페이지(이용약관, 개인정보처리방침).
 *
 * 전자상거래법 제10조(사이버몰 운영자의 신원정보 표시)와 개인정보보호법 제30조
 * (개인정보 처리방침 공개)에 맞춰 푸터와 두 페이지에서 함께 쓴다.
 * 빈 문자열인 항목은 화면에 '입력 필요'로 표시되니, 값이 정해지면 여기만 채우면 된다.
 */
export const COMPANY = {
  /** 사업자등록증상 상호. 브랜드명과 다르면 여기를 바꾼다. */
  legalName: '86400',
  brand: '86400',
  ceo: '성인순',
  bizNo: '691-78-00601',
  /** 통신판매업 신고번호와 신고기관 (예: '2026-인천부평-0000', '인천광역시 부평구청'). 비어 있으면 '신고 준비 중'으로 표시. */
  mailOrderNo: '',
  mailOrderOffice: '',
  /** 영업소 주소. 소비자 불만 처리 및 반품 접수 주소를 겸한다. */
  address: '인천광역시 부평구 길주로 623 (대덕리치아노 오피스텔, 102동 913호)',
  phone: '010-8245-8318',
  email: '86400company@gmail.com',
  /** 전화·이메일 응대 시간. */
  hours: '평일 10:00 – 18:00 (주말·공휴일 휴무)',
  instagram: 'https://www.instagram.com/_86400_official/',
  /** 사이트를 올려 두는 호스팅 서비스 제공자 상호 (GitHub Pages). */
  hosting: 'GitHub, Inc.',
  privacyOfficer: { name: '이해규', role: '개인정보 보호책임자', contact: '86400company@gmail.com' },
  /** 약관·처리방침 시행일. 배포하는 날짜로 맞춘다. */
  effectiveDate: '2026년 11월 14일',
}

/** 공정위 '사업자정보확인' 팝업. 사업자등록번호로 통신판매업 신고 내역을 보여준다. */
export const FTC_BIZ_INFO_URL = `https://www.ftc.go.kr/bizCommPop.do?wrkr_no=${COMPANY.bizNo.replace(/-/g, '')}`

/**
 * 배송·반품 안내에 쓰는 운영 기준. 아직 정식 택배 계약 전이라 일반적인 국내 소규모 쇼핑몰
 * 기준으로 잡아 둔 초기값이다. 바뀌면 여기만 고치면 배송 안내·교환/반품 안내·FAQ에 같이 반영된다.
 */
export const SHIPPING = {
  /** 기본 택배비(원). */
  fee: 3000,
  /** 이 금액 이상 주문 시 무료 배송(원). 0이면 무료 배송 없음. */
  freeOver: 50000,
  /** 제주·도서산간 추가 배송비(원). */
  remoteExtra: 3000,
  /** 택배사. 계약 후 입력. */
  carrier: '',
  /** 결제 확인 후 출고까지. */
  dispatch: '결제 확인 후 1~3영업일 이내 출고',
  /** 출고 후 수령까지. */
  transit: '출고 후 1~3일 (주말·공휴일 제외, 도서산간은 1~2일 추가)',
}

export const won = (n: number) => `${n.toLocaleString('ko-KR')}원`
