// 부산광역시 — 지역 데이터
// 공식 자료로 확인한 내용만 적어요. 확인하지 못한 값은 비워 두면 화면에서 그 칸을 숨겨요(다른 지역 값으로 채우지 않아요).
// 내용을 고치면 그 항목의 verifiedAt(및 해당 sources 항목)을 함께 갱신하세요. 최신성 필드 설명은 data/common.js ‘최신성 관리’에 있어요.
// 교육활동보호센터 업무별 내선 번호는 2026 계획·매뉴얼(2026. 2.~3.)과 센터 누리집 안내가 서로 달라요.
// 확인이 일치한 심리상담(내선 3~4)만 적고, 나머지는 대표번호 051-862-1122로 안내해요(tools/data/regional-gaps.js extras 참고).

registerRegion({
  id: 'busan',
  short: '부산',
  name: '부산광역시',
  office: '부산광역시교육청',
  officeUrl: 'https://www.pen.go.kr',
  basis: '「2026 교육활동 보호 매뉴얼」·「2026학년도 교육활동 보호 계획」·교원보호공제 표준약관(2026. 3. 1. 시행)',
  verifiedAt: '2026-10-06',
  reviewStatus: 'verified',
  // 대표번호·교육지원청 연락처·기관 연락처(orgs)를 마지막으로 확인한 날 / 교육지원청 관할(areas)을 마지막으로 확인한 날
  contactsVerifiedAt: '2026-10-07',
  areasVerifiedAt: '2026-10-07',
  // 2026학년도 계획·매뉴얼과 교원보호공제 운영기간(2026. 3. 1.~2027. 2. 28.)이 끝나면 전체를 다시 확인해요
  reviewBy: '2027-03-01',
  // 부산광역시 15구 1군
  expectedAreas: 16,
  sources: [
    { title: '부산광역시교육청 「2026 교육활동 보호 매뉴얼」·「2026 학교민원 처리 매뉴얼」(교육활동보호센터 자료실, 2026. 3. 26. 게시)', url: 'https://home.pen.go.kr/forteacher/na/ntt/selectNttInfo.do?mi=18208&nttSn=986253', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-26', region: 'busan', uses: ['guide', 'procedure', 'care', 'support'] },
    { title: '부산광역시교육청 「2026학년도 교육활동 보호 계획」(교육활동보호센터 자료실, 2026. 3. 26. 게시)', url: 'https://home.pen.go.kr/forteacher/na/ntt/selectNttInfo.do?mi=18208&nttSn=986321', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-26', region: 'busan', uses: ['guide', 'procedure', 'care', 'support'] },
    { title: '부산광역시교육청 교육활동보호센터 — 교육지원청 교육활동보호센터 소개(2026. 9. 1. 설치, 현장 지원·사안 심의 연락처)', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18480&cntntsId=4215', verifiedAt: '2026-10-07', region: 'busan', uses: ['support', 'finder'] },
    { title: '부산광역시교육청 보도자료(2026. 8. 12.) — 교육지원청마다 ‘교육활동보호센터’ 9월부터 운영', url: 'https://www.pen.go.kr/main/na/ntt/selectNttInfo.do?mi=30397&bbsId=2286&nttSn=1177765', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-08-12', region: 'busan', uses: ['support'] },
    { title: '부산광역시교육청 교육활동보호센터 — 개인심리상담 지원', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18202&cntntsId=4093', verifiedAt: '2026-10-06', region: 'busan', uses: ['support'] },
    { title: '부산광역시교육청 교육활동보호센터 — 치료비·치유비(재산상 피해·위협 대처·분쟁조정 포함)', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18214&cntntsId=4101', verifiedAt: '2026-10-06', region: 'busan', uses: ['procedure', 'support'] },
    { title: '부산광역시교육청 교육활동보호센터 — 법률지원단 안내(지원 금액·신청 절차)', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18205&cntntsId=4095', verifiedAt: '2026-10-06', region: 'busan', uses: ['procedure', 'support'] },
    { title: '부산광역시교육청 교육활동보호센터 — One-Stop 지원단', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18194&cntntsId=4087', verifiedAt: '2026-10-06', region: 'busan', uses: ['support'] },
    { title: '부산광역시교육청 교원인사과 공고 제2026-162호 「교원보호공제 약관 개정 공고」(표준약관 2026. 3. 1. 시행, 2026. 3. 4. 게시)', url: 'https://www.pen.go.kr/main/na/ntt/selectNttInfo.do?mi=30361&bbsId=2342&nttSn=1165028', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-01', region: 'busan', uses: ['procedure', 'support'] },
    { title: '부산광역시교육청 교육활동보호센터 — 교원보호공제 안내', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18215&cntntsId=4102', verifiedAt: '2026-10-06', region: 'busan', uses: ['support'] },
    { title: '부산광역시교육청 교육활동보호센터 — 민원 해결 요청 게시판(악성민원 지원)', url: 'https://www.pen.go.kr/main/na/ntt/selectNttList.do?mi=31539&bbsId=2634', verifiedAt: '2026-10-06', region: 'busan', uses: ['support'] },
    { title: '지방교육자치에 관한 법률 시행령 부칙(대통령령 제36292호) 제2조 — 조례 제정 전까지 종전 [별표 2] 관할 적용', url: 'https://www.law.go.kr/법령/지방교육자치에관한법률시행령', verifiedAt: '2026-10-06', region: 'busan', uses: ['finder'] },
    { title: '종전 [별표 2] 교육지원청의 명칭·위치 및 관할구역(2023. 6. 27. 개정) — 부산 5개 교육지원청', url: 'https://www.law.go.kr/LSW/flDownload.do?flSeq=129700305&bylClsCd=110201', verifiedAt: '2026-10-06', sourceUpdatedAt: '2023-06-27', region: 'busan', uses: ['finder'] },
    { title: '부산광역시교육청 교육활동보호센터 — 이용방법 안내(운영 시간·신청 방법)', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18191&cntntsId=4084', verifiedAt: '2026-10-06', region: 'busan', uses: ['support'] },
    { title: '부산광역시교육청 교육활동보호센터 — 치유예방 프로그램 안내', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18192&cntntsId=4085', verifiedAt: '2026-10-06', region: 'busan', uses: ['support'] }
  ],

  // 051-862-1122: 교육활동보호센터 대표전화(센터 누리집·2026 매뉴얼). 051-1395는 교육활동 보호 직통번호로 센터에 연결돼요(2026 계획·매뉴얼)
  hot: '051-862-1122',
  hotName: '부산 교육활동보호센터 대표번호',
  hotSummary: 'One-Stop 지원단이 법률 지원, 심리 치유 상담, 현장 컨설팅, 치료비·치유비, 악성 민원 대응을 연결해요. 월~목 09:00~18:00, 금 08:00~17:00(공휴일 휴무). 교육활동 보호 직통번호 051-1395로 걸어도 센터로 연결돼요.',
  // 지원 찾기 '지역 지원 허브'의 바로 이용하기(시·도교육청 홈페이지는 officeUrl로 자동 추가)
  links: [
    { type: 'apply', label: '심리상담 온라인 신청', url: 'https://home.pen.go.kr/forteacher/na/ntt/selectNttList.do?mi=18203&bbsId=5489' },
    { type: 'apply', label: '법률상담 온라인 신청', url: 'https://home.pen.go.kr/forteacher/na/ntt/selectNttList.do?mi=18206&bbsId=5490' },
    { type: 'guide', label: '교육활동보호센터 누리집', url: 'https://home.pen.go.kr/forteacher/main.do' }
  ],

  terms: {
    HOT: '051-862-1122', HOT1: '051-862-1122', HOT2: '051-862-1122',
    OFFICER: '교육활동 보호 업무 담당자',
    LEGAL: '교육활동보호센터 교원법률지원단',
    MUTUAL: '부산광역시학교안전공제회(교원보호공제)',
    SOS: '교육지원청 학교민원대응지원팀',
    MEDIATE: '교원보호공제 분쟁조정 서비스'
  },

  // 5개 교육지원청(종전 시행령 [별표 2], 교육청 누리집 교육지원청 안내와 같음). 2026. 9. 1.부터 교육지원청마다 교육활동보호센터가 있어요.
  // 연락처는 교육지원청 교육활동보호센터의 ‘현장 지원’·‘사안 심의’ 번호(센터 누리집). 서부는 현장 지원 번호가 둘이에요(051-710-9511 병기)
  offices: [
    { name: '서부교육지원청', areas: ['중구', '서구', '영도구', '사하구'], contact: '현장 지원 051-250-0435 · 051-710-9511 / 사안 심의 051-710-9512', url: 'https://home.pen.go.kr/seobu/' },
    { name: '남부교육지원청', areas: ['남구', '동구', '부산진구'], contact: '현장 지원 051-640-0233 / 사안 심의 051-640-0235', url: 'https://home.pen.go.kr/nambu/' },
    { name: '북부교육지원청', areas: ['북구', '사상구', '강서구'], contact: '현장 지원 051-330-1234 / 사안 심의 051-330-1236', url: 'https://home.pen.go.kr/bukbu/' },
    { name: '동래교육지원청', areas: ['동래구', '금정구', '연제구'], contact: '현장 지원 051-550-0157 / 사안 심의 051-550-0136', url: 'https://home.pen.go.kr/dongnae/' },
    { name: '해운대교육지원청', areas: ['해운대구', '수영구', '기장군'], contact: '현장 지원 051-709-0490 / 사안 심의 051-709-0347', url: 'https://home.pen.go.kr/haeundae/' }
  ].map(o => ({ ...o, dept: '교육활동보호센터' })),
  areaNote: '2026. 9. 1.부터 5개 교육지원청마다 교육활동보호센터가 있어요. ‘현장 지원’과 ‘사안 심의’는 센터 공식 안내의 연락처 구분이에요.',

  // 홈 ‘놓치기 쉬운 권리·지원’ 카드에 붙는 부산 한 줄(HOME_HIGHLIGHTS id). 숫자는 대상·조건과 함께 써요
  highlights: {
    transfer: '침해 피해 교원은 교육(지원)청 심의를 거쳐 긴급 전보를 지원받을 수 있어요'
  },

  // 회복·보호 제도(BENEFITS id)의 부산 기준. 공통 문장에 섞지 않고 ‘부산 기준’ 상자로 따로 보여 줘요
  // 상담·치료·법률·공제·경호 같은 지원의 지역 세부는 programs(지원 찾기)에만 둬요
  benefits: {
    'transfer': {
      program: '피해 교원 긴급 전보',
      who: '교육활동 침해 피해 교원',
      apply: '소속 교육(지원)청 심의 후 결정돼요. 희망하면 학교장에게 알리세요.',
      verifiedAt: '2026-10-06',
      source: 1
    }
  },

  // source: sources 배열의 번호(둘 이상이면 배열). amount·eligibility·timing·documents·caution은 지원 찾기 ‘신청 전 확인할 것’에 보여요
  // 법률지원·치료비·상담비는 교육청이 교원보호공제를 통해 지급해요. 같은 한도를 공제 카드에 다시 적지 않아요(중복 지급처럼 보이지 않게)
  programs: [
    { area: '신고·심의', status: '현재 시행 중', t: '교육활동 침해 신고·지역교권보호위원회 심의', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-26', reviewStatus: 'verified', sum: '학교 보고를 거쳐 소속 교육지원청 교육활동보호센터가 사안을 조사하고, 지역교권보호위원회가 침해 여부와 조치를 심의해요.', target: '교육활동 침해 피해 교원', org: '소속 교육지원청 교육활동보호센터', apply: '학교 보고 → 소속 교육지원청 보고(사안 심의 번호는 ‘내 교육지원청 찾기’)', documents: '침해 신고서, 사안 발생보고서, 증거', timing: '사안 접수 후 24시간 이내 보고, 사안 보고 후 5일 이내 발생보고서(주말·공휴일 제외)', contact: '051-862-1122', source: [0, 2] },
    { area: '행정 지원', status: '현재 시행 중', t: '교육활동보호센터 One-Stop 지원단', verifiedAt: '2026-10-06', reviewStatus: 'verified', sum: '교육활동 침해 초기 대응과 일상적인 교육활동 중 상담·조언을 지원해요. 법률 지원, 심리 치유 상담, 현장 컨설팅, 치료비·치유비, 악성 민원 대응, 힐링·치유 프로그램을 한 창구에서 연결해요.', eligibility: '부산광역시교육청 소속 희망 교원', timing: '월~목 09:00~18:00, 금 08:00~17:00(공휴일 휴무)', caution: '교육활동 보호 직통번호 051-1395로 걸어도 교육활동보호센터로 연결돼요. 업무별 내선은 안내 자료마다 달라 대표번호로 연결한 뒤 안내를 받으세요.', target: '부산 교원', org: '부산광역시교육청 교육활동보호센터', apply: '전화 051-862-1122, 방문(연제구 중앙대로 1077, 10층), 이메일(healing2016@korea.kr)', contact: '051-862-1122', source: [7, 13, 1], channels: [{ type: 'guide', label: 'One-Stop 지원단 안내', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18194&cntntsId=4087' }] },
    { area: ['행정 지원', '긴급 지원'], status: '현재 시행 중', t: '교육지원청 교육활동보호센터', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-08-12', reviewStatus: 'verified', sum: '2026. 9. 1.부터 5개 교육지원청(서부·남부·북부·동래·해운대)마다 운영해요. 교육활동 침해 사안 조사와 지역교권보호위원회 운영, 법률·심리상담 연계, 현장 지원과 악성 민원 대응을 맡아요.', eligibility: '관할 학교의 교원·학교', caution: '센터마다 센터장, 장학사, 주무관, 변호사가 배치돼 있어요. 연락처(현장 지원·사안 심의)는 ‘내 교육지원청 찾기’에서 확인하세요.', target: '부산 교원·학교', org: '소속 교육지원청 교육활동보호센터', apply: '소속 교육지원청 교육활동보호센터(현장 지원)', source: [2, 3], channels: [{ type: 'guide', label: '교육지원청 센터 연락처', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18480&cntntsId=4215' }] },
    { area: ['법률 상담·자문', '수사·소송 지원'], status: '현재 시행 중', t: '교원법률지원단(법률상담·변호사 선임)', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-26', reviewStatus: 'verified', sum: '60명 이상의 외부 변호사 인력풀로 법률상담, 교권보호위원회 대리·동행, 민·형사 재판 대응, 무고한 아동학대 고소·고발 관련 수사 대응을 지원해요. 상습 악성민원은 사안에 따라 교육감 명의 고발도 검토해요.', amount: '법률상담 건당 20만 원(12회 범위, 총 200만 원 한도) · 형사 피고발·피소 심급별 1,000만 원 한도(수사 단계 종결 시 330만 원) · 고소·고발 330만 원 · 민사 심급별 소송물가액에 따라 330만~1,000만 원 · 교권보호위원회 대리·동행 50만 원', eligibility: '교육활동과 관련된 법적 분쟁이 생긴 교원(침해 피해 교원이 아니어도 돼요. 참고인·증인으로 출석하는 교원 포함)', timing: '언제든 신청할 수 있지만 사안 발생(인지) 직후 신청을 권장해요', documents: '법률지원이 끝난 뒤 학교가 법률지원 비용 신청 공문을 교육지원청과 시교육청 교원인사과로 보내요', caution: '변호사를 선임하기 전에 반드시 교육활동보호센터와 먼저 논의하세요(미논의 시 비용 지급 불가). 비용은 교원보호공제 약관 한도 안에서 지급되고 초과분은 교원 부담이에요. 교원의 귀책 사유가 있으면 지원하지 않고, 유죄(기소유예·선고유예 포함)가 확정되면 돌려받아요(과실 제외).', target: '법률 지원이 필요한 교원', org: '교육활동보호센터 교원법률지원단', apply: '전화 051-862-1122 또는 법률상담 온라인 신청 → 센터가 지원 여부 판단·외부 변호인단 추천', contact: '051-862-1122', source: [6, 8, 1], channels: [{ type: 'apply', label: '법률상담 온라인 신청', url: 'https://home.pen.go.kr/forteacher/na/ntt/selectNttList.do?mi=18206&bbsId=5490' }, { type: 'guide', label: '법률지원단 안내', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18205&cntntsId=4095' }] },
    { area: '심리상담', status: '현재 시행 중', t: '개인 심리상담(교육활동보호센터)', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-26', reviewStatus: 'verified', sum: '센터 전문상담사의 접수 상담 뒤 외부 상담전문가를 맞춤 연계하고, 필요하면 정신건강의학과 전문의 상담을 이어서 지원해요. 상담비는 시교육청이 부담해요.', amount: '외부상담사 개인상담 기본 10회(연장 5회) · 정신건강전문의 상담 필요 시 6회까지', eligibility: '교육활동 침해 피해 교원뿐 아니라 직무스트레스·대인관계·정신건강 문제로 상담을 원하는 부산 교원', timing: '접수 상담 월~목 09:00~18:00, 금 08:00~17:00', caution: '침해 피해와 관계없이 이용하는 센터 상담이에요. 침해 피해 교원이 외부 심리상담센터에서 받은 상담비 지원은 ‘치료비·심리상담비·치유비 지원’의 별도 제도예요. 2026학년도 계획에는 외부상담 11~15회는 상담비의 50%를 지원한다고 적혀 있어요.', target: '심리 지원이 필요한 교원', org: '부산광역시교육청 교육활동보호센터', apply: '전화 051-862-1122(내선 3~4), 이메일(healing2016@korea.kr) 또는 심리상담 온라인 신청', contact: '051-862-1122(내선 3~4)', source: [4, 1], channels: [{ type: 'apply', label: '심리상담 온라인 신청', url: 'https://home.pen.go.kr/forteacher/na/ntt/selectNttList.do?mi=18203&bbsId=5489' }, { type: 'guide', label: '개인심리상담 안내', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18202&cntntsId=4093' }] },
    { area: '치료·비용', status: '현재 시행 중', t: '치료비·심리상담비·치유비 지원', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-26', reviewStatus: 'verified', sum: '요건을 갖추면 교육활동 침해로 생긴 치료비와 외부 심리상담비, 교육활동 소진에 따른 정신건강 치료비, 침해 뒤 심리·정서 치유에 쓴 비용(치유비)을 한도 안에서 지원해요. 세부 기준은 공식 안내를 확인하세요.', amount: '침해 피해 교원 치료비 1사고당 200만 원 한도(장애교원 400만 원) · 외부 심리상담센터 상담비 최대 15회·150만 원 범위 · 소진 교원 정신건강 치료비 연 100만 원 한도 · 치유비 50만 원 한도', eligibility: '치료비·상담비: 교육활동 침해 피해 교원(교권보호위원회를 열지 않았으면 학교장 의견서로 신청 가능) / 소진 교원 치료비: 교육활동 중 소진으로 정신건강의료기관 치료를 받은 교원 / 치유비: 교권보호위원회에서 침해가 인정된 교원', timing: '치료비는 사안 발생 시부터 1년 이내 청구 · 치유비는 교권보호위원회 침해 인정 통보일부터 6개월 이내 쓴 금액만 인정', documents: '학교가 교육지원청과 시교육청 교원인사과로 지원 요청 공문(계획 서식 21~26) · 진료비 영수증·진료비세부산정내역서·상담비 납부 확인서 등 증빙', caution: '치유비는 쓰기 전에 교육활동보호센터와 유선 협의가 필요하고, 본인 신용카드로 쓴 운동·여행·문화공연 등 심리·정서 치유 비용만 인정돼요. 치료비·상담비는 교원보호공제를 통해 지급되고, 보호자 등에게서 같은 비용을 받으면 지원되지 않아요. 12월 10일 이후 공문을 보내려면 센터와 먼저 협의하세요.', target: '침해 피해 교원·소진 교원', org: '부산광역시교육청 교육활동보호센터', apply: '교육활동보호센터(051-862-1122)에 먼저 문의 → 학교가 공문으로 신청', contact: '051-862-1122', source: [5, 1, 8], channels: [{ type: 'guide', label: '치료비·치유비 안내', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18214&cntntsId=4101' }] },
    { area: '교원보호공제', status: '현재 시행 중', t: '교원보호공제(부산광역시학교안전공제회 위탁)', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-01', reviewStatus: 'verified', sum: '교육청이 부산광역시학교안전공제회에 맡겨 운영해요(2026. 3. 1.~2027. 2. 28.). 배상책임, 소송비용, 치료비·상담비, 재산상 피해, 위협 대처(경호), 분쟁조정을 보장해요. 위 법률지원·치료비 지원도 이 공제를 통해 지급되는 같은 제도예요.', amount: '배상책임 확정판결 1사고당 2억 원·소 제기 전 합의 1억 원 · 재산상 피해 물품당 100만 원(안경 30만 원, 특수교육대상자로 인한 피해 30만 원) · 중대사안 치유비(위로금) 50만 원 · 소송비·치료비 한도는 법률·치료비 항목과 같아요', eligibility: '부산 관내 국·공·사립 유치원·학교와 학력인정 평생교육시설 교원(기간제 포함). 교원의 고의·중과실로 생긴 손해는 보장하지 않아요', timing: '공제금을 받을 권리는 사고 발생일부터 3년 안에 행사해야 해요. 공제회는 청구(서류 보완 시 보완 완료) 후 14일 이내 지급 여부를 결정해요', documents: '공제금·서비스 청구서, 손해·피해 입증자료, 교권보호위원회 결과 통보서(개최 시), 학교장 보호조치통보서 또는 의견서, 개인정보 동의서, 통장 사본', caution: '중대사안 위로금은 같은 사고로 교육청 치유비를 받았다면 지급되지 않아요. 교원끼리의 소송은 보장하지 않아요. 공제 문의도 교육활동보호센터로 해요.', target: '부산 교원', org: '교육활동보호센터 · 부산광역시학교안전공제회', apply: '교육활동보호센터(051-862-1122)에 문의 → 센터 직접 지원 또는 공제 연계', contact: '051-862-1122', source: [8, 9, 1], channels: [{ type: 'guide', label: '교원보호공제 안내', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18215&cntntsId=4102' }, { type: 'guide', label: '2026 약관 개정 공고', url: 'https://www.pen.go.kr/main/na/ntt/selectNttInfo.do?mi=30361&bbsId=2342&nttSn=1165028' }] },
    { area: '경호·신변 보호', status: '현재 시행 중', t: '위협 대처 보호 서비스(긴급 경호)', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-01', reviewStatus: 'verified', sum: '교원보호공제로 교육활동과 관련해 신변 위협을 받는 중대 사안의 교원에게 출·퇴근을 포함해 긴급 경호를 지원해요.', amount: '1사고당 최대 20일(1인×20회) · 2인 경호 시 10일(2인×10회)', eligibility: '교육활동과 관련한 폭행·상해·성폭력·난입·난동·협박·부당한 보상 강요 등으로 위협받는 교원(학교 안에서 제3자에게 위협받은 경우 포함)', documents: '공제금·서비스 청구서, 학교장 의견서, 중대사안 판단 증빙자료, 개인정보 동의서', caution: '지금 위험하면 112 신고가 먼저예요. 위협을 피해 집 밖으로 피난하며 개인이 쓴 교통·숙박·식사비는 지원하지 않아요.', target: '신변 위협을 받는 교원', org: '교육활동보호센터 · 부산광역시학교안전공제회', apply: '교육활동보호센터(051-862-1122)에 요청', contact: '051-862-1122', source: [8, 5] },
    { area: '갈등 중재', status: '현재 시행 중', t: '분쟁조정 서비스(교원보호공제)', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-01', reviewStatus: 'verified', sum: '교육활동과 관련해 분쟁이 예상될 때 변호사·공제회 담당자 등 전문가가 조언·상담하고, 손해배상 청구 건은 배상액의 적정성을 검토해 조정안을 제시해요.', eligibility: '교육활동과 관련해 제3자와 분쟁이 예상되는 부산 교원', documents: '공제금·서비스 청구서, 학교장 의견서(법률상담비 청구 시 제외), 손해액 산정·조정안 협의에 필요한 증빙', caution: '교원의 고의·중과실 분쟁, 소송 중인 분쟁, 교육활동과 무관한 분쟁은 제외돼요. 이 서비스의 법률 상담비는 교원법률지원단 항목의 법률상담 한도와 같은 것이에요. 지역교권보호위원회 분쟁조정(학교를 거쳐 신청)과는 별개예요.', target: '분쟁 조정이 필요한 교원', org: '교육활동보호센터 · 부산광역시학교안전공제회', apply: '교육활동보호센터(051-862-1122)에 요청', contact: '051-862-1122', source: [8, 5] },
    { area: '학교민원·특이민원 지원', status: '현재 시행 중', t: '학교민원대응팀·학교민원대응지원팀·악성민원 법률 대응', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-26', reviewStatus: 'verified', sum: '학교 민원대응팀이 먼저 접수·대응하고, 해결이 어려우면 교육지원청 학교민원대응지원팀에 지원을 요청하거나 이첩해요. 특이(악성) 민원은 교육활동보호센터 교원법률지원단에 대응을 요청할 수 있어요.', eligibility: '특이(악성) 민원: 정당한 사유 없이 3회 이상 반복되는 전화·면담 요구, 폭언·모욕·협박 등 인격모독, 폭력·스토킹·신상공개 등 위법 행위', documents: '민원신청서(게시판 서식)와 민원 대응 기록', caution: '중대하거나 심각한 위법 사안은 교육(지원)청이 법률지원단과 협의해 고소·고발 등 법적 대응을 추진해요.', target: '반복·특이민원을 겪는 교원', org: '소속 학교·교육지원청 학교민원대응지원팀·교육활동보호센터', apply: '학교 민원대응팀 → 소속 교육지원청 학교민원대응지원팀 → 교육활동보호센터(민원 해결 요청 게시판)', contact: '051-862-1122', source: [1, 10], channels: [{ type: 'apply', label: '민원 해결 요청 게시판', url: 'https://www.pen.go.kr/main/na/ntt/selectNttList.do?mi=31539&bbsId=2634' }] },
    { area: '치유·회복 프로그램', status: '현재 시행 중', t: '치유·회복 프로그램', verifiedAt: '2026-10-06', sourceUpdatedAt: '2026-03-26', reviewStatus: 'verified', sum: '학교로 찾아가는 집단상담, 회복탄력성 집단상담, 저경력교사 Step by step, 교원 힐링캠프(1박 2일), 교원 힐링 아카데미, 심리검사의 날, 전문가 특강을 운영해요.', timing: '프로그램마다 행사 2~4주 전 공문으로 안내돼요', caution: '찾아가는 집단상담은 학교 교원 6명 이상이 동의해야 신청할 수 있어요.', target: '침해 피해 교원, 직무스트레스 교원 등 희망 교원', org: '부산광역시교육청 교육활동보호센터', apply: '공문 안내에 따라 신청(이메일 healing2016@korea.kr 등)', contact: '051-862-1122', source: [14, 1], channels: [{ type: 'guide', label: '프로그램 안내', url: 'https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18192&cntntsId=4085' }] }
  ],

  // 교육지원청 카드는 offices에서 자동으로 만들어져요. 학교 내 기관·112는 공통 데이터에 있어요.
  orgs: [
    { cat: '교육청', name: '부산광역시교육청 교육활동보호센터(One-Stop 지원단)', region: '부산 전역', role: '법률·심리 상담, 현장 컨설팅, 치료비·치유비, 악성 민원 대응 연결', contact: '051-862-1122', hours: '월~목 09:00~18:00, 금 08:00~17:00' },
    { cat: '교육청', name: '교육지원청 교육활동보호센터', region: '서부·남부·북부·동래·해운대 교육지원청', role: '사안 조사·지역교권보호위원회 운영, 현장 지원, 법률·심리 연계', contact: '소속 교육지원청(내 교육지원청 찾기)' },
    { cat: '법률', name: '교원법률지원단', region: '부산 전역', role: '법률상담, 변호사 선임, 수사·소송 대응 지원', contact: '051-862-1122' },
    { cat: '공제·민원', name: '부산광역시학교안전공제회(교원보호공제)', region: '부산 전역', role: '교원보호공제 위탁 운영(배상·소송비·치료비·재산 피해·경호·분쟁조정)', contact: '교육활동보호센터 051-862-1122로 문의' },
    { cat: '공제·민원', name: '학교민원대응지원팀', region: '각 교육지원청', role: '학교에서 해결이 어려운 민원 지원·이첩 처리', contact: '소속 교육지원청에 문의' }
  ]
});
