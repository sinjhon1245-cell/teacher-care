// 경기도 — 지역 데이터
// 공식 자료로 확인한 내용만 적어요. 확인하지 못한 값은 비워 두면 화면에서 그 칸을 숨겨요(다른 지역 값으로 채우지 않아요).
// 내용을 고치면 그 항목의 verifiedAt(및 해당 sources 항목)을 함께 갱신하세요. 최신성 필드 설명은 data/common.js ‘최신성 관리’에 있어요.
// 경기 대표번호는 1600-8787(교권보호119 콜센터)이에요. 다른 번호는 공식 자료로 확인될 때만 추가하세요.

registerRegion({
  id: 'gyeonggi',
  short: '경기',
  name: '경기도',
  office: '경기도교육청',
  officeUrl: 'https://www.goe.go.kr',
  basis: '「경기도교육청 2026년도 교육활동 보호 종합대책」·「2026 경기형 교육활동 보호 길라잡이」',
  verifiedAt: '2026-10-03',
  reviewStatus: 'verified',
  // 대표번호·교육지원청 연락처·기관 연락처(orgs)를 마지막으로 확인한 날 / 교육지원청 관할(areas)을 마지막으로 확인한 날
  contactsVerifiedAt: '2026-09-24',
  areasVerifiedAt: '2026-09-24',
  // 2026학년도 매뉴얼·시행계획·공제 약관은 2027. 2.까지예요. 새 학년도 자료가 나오면 전체를 다시 확인해요
  reviewBy: '2027-03-01',
  // 경기도 시·군 수
  expectedAreas: 31,
  sources: [
    { title: '경기도교육청 2026년도 교육활동 보호 종합대책(요약)', url: 'https://www.goe.go.kr/resource/goe/na/bbs_2675/2026/03/e75532f7-cc69-48b8-abb7-ea9143081ff9.pdf', verifiedAt: '2026-10-03', region: 'gyeonggi', uses: ['guide', 'procedure', 'support'] },
    { title: '경기교육모아 — 교권보호119 콜센터(1600-8787)', url: 'https://more.goe.go.kr/eapc/subList/30300001942', verifiedAt: '2026-09-24', region: 'gyeonggi', uses: ['support'] },
    { title: '경기도학교안전공제회 — 교권보호119 콜센터 안내', url: 'https://www.gessia.or.kr/compe/tac.php', verifiedAt: '2026-10-03', region: 'gyeonggi', uses: ['support'] },
    { title: '경기도학교안전공제회 — 교원보호공제 분쟁조정·법률(소송비용) 지원', url: 'https://www.gessia.or.kr/compe/safe.php', verifiedAt: '2026-10-03', region: 'gyeonggi', uses: ['procedure', 'support'] },
    { title: '경기교육모아 — 경기교권보호지원센터 안내', url: 'https://more.goe.go.kr/eapc/subList/30300002114', verifiedAt: '2026-09-24', region: 'gyeonggi', uses: ['support'] },
    { title: '경기도교육청 보도자료(2026. 9. 23.) — 교육활동 침해에 신속 대응(교권보호전담관)', url: 'https://www.goe.go.kr/goe/na/ntt/selectNttInfo.do?mi=10102&nttSn=2375398', verifiedAt: '2026-09-25', sourceUpdatedAt: '2026-09-23', region: 'gyeonggi', uses: ['support'] },
    { title: '「경기도교육청 행정기구 설치 조례」 제3조의2·[별표 9] 교육지원청 관할구역', url: 'https://www.law.go.kr/자치법규/경기도교육청행정기구설치조례', verifiedAt: '2026-09-24', region: 'gyeonggi', uses: ['finder'] },
    { title: '경기도교육청 교육지원청 안내(대표번호·주소)', url: 'https://www.goe.go.kr/goe/cm/cntnts/cntntsView.do?mi=10311&cntntsId=1132', verifiedAt: '2026-09-24', region: 'gyeonggi', uses: ['finder'] },
    { title: '경기도교육청 「2026 경기형 교육활동 보호 길라잡이」(경기교권보호지원센터 업무 자료, 2026. 2. 25. 게시, PDF 첨부)', url: 'https://more.goe.go.kr/eapc/subList/20000000408?pmode=detail&nttSeq=1000000816', verifiedAt: '2026-10-03', sourceUpdatedAt: '2026-02-25', region: 'gyeonggi', uses: ['guide', 'procedure', 'care', 'support'] },
    // 2026-10-03 추가: 교원보호공제 항목별 안내·심리상담
    { title: '경기도학교안전공제회 — 교원보호공제 회복 지원(치료비·재산 피해·위로금)', url: 'https://www.gessia.or.kr/compe/recov.php', verifiedAt: '2026-10-03', region: 'gyeonggi', uses: ['procedure', 'support'] },
    { title: '경기도학교안전공제회 — 교원보호공제 위협대처(경호) 서비스', url: 'https://www.gessia.or.kr/compe/safety.php', verifiedAt: '2026-10-03', region: 'gyeonggi', uses: ['procedure', 'support'] },
    { title: '경기교권보호지원센터 — 심리상담(전문상담기관 10회기·치료비)', url: 'https://more.goe.go.kr/eapc/subList/30300002118', verifiedAt: '2026-10-03', region: 'gyeonggi', uses: ['procedure', 'support'] },
    { title: '경기도학교안전공제회 — 교원보호공제 개요(보장 대상)', url: 'https://www.gessia.or.kr/compe/int.php', verifiedAt: '2026-10-03', region: 'gyeonggi', uses: ['procedure', 'support'] }
  ],

  // ARS 세부 메뉴는 2026년 공식 자료에서 확인되지 않아 menu를 두지 않아요.
  hot: '1600-8787',
  hotName: '경기 교권보호119 콜센터',
  hotSummary: '교사 안심콜 탁(TAC)이에요. 평일 09:00~18:00 경기도학교안전공제회 교육활동안심지원단 전담 인력이 먼저 응대하고 전담 교권코디를 배정해요. 법률·보상은 안심지원단이, 행정·심리는 지역 교권보호지원센터가 이어서 지원해요.',
  menuNote: '연결 후 음성 안내에 따라 상담을 요청하세요.',
  // 지원 찾기 '지역 지원 허브'의 바로 이용하기(시·도교육청 홈페이지는 officeUrl로 자동 추가)
  links: [
    { type: 'apply', label: '교권보호119 온라인 상담(본인인증)', url: 'https://www.gessia.or.kr/compe/taconline.php' },
    { type: 'guide', label: '경기교권보호지원센터 안내', url: 'https://more.goe.go.kr/eapc/subList/30300002114' },
    { type: 'guide', label: '교권보호119 콜센터 안내', url: 'https://more.goe.go.kr/eapc/subList/30300001942' }
  ],

  terms: {
    HOT: '1600-8787', HOT1: '1600-8787', HOT2: '1600-8787',
    OFFICER: '교육활동 보호 업무 담당자',
    LEGAL: 'SOS! 경기교육법률지원단',
    MUTUAL: '경기도학교안전공제회',
    SOS: '교육지원청 학교민원대응지원팀',
    MEDIATE: '교원보호공제 분쟁조정 서비스'
  },

  // 25개 교육지원청(「경기도교육청 행정기구 설치 조례」 [별표 9]). 모든 교육지원청에서 경기교권보호지원센터를 운영해요.
  offices: [
    { name: '수원교육지원청', areas: ['수원시'], url: 'https://www.goesw.kr', guideUrl: 'https://www.goesw.kr/goesw/cm/cntnts/cntntsView.do?mi=18957&cntntsId=3887' },
    { name: '성남교육지원청', areas: ['성남시'], url: 'https://www.goesn.kr' },
    { name: '고양교육지원청', areas: ['고양시'], url: 'https://www.goegy.kr' },
    { name: '용인교육지원청', areas: ['용인시'], url: 'https://www.goeyi.kr', guideUrl: 'https://www.goeyi.kr/goeyi/cm/cntnts/cntntsView.do?mi=23006&cntntsId=3559' },
    { name: '부천교육지원청', areas: ['부천시'], url: 'https://www.goebc.kr' },
    { name: '안산교육지원청', areas: ['안산시'], url: 'https://www.goeas.kr', guideUrl: 'https://www.goeas.kr/goeas/cm/cntnts/cntntsView.do?mi=13150&cntntsId=1757' },
    { name: '안양과천교육지원청', areas: ['안양시', '과천시'], url: 'https://www.goeay.kr' },
    { name: '화성오산교육지원청', areas: ['화성시', '오산시'], url: 'https://www.goehs.kr' },
    { name: '시흥교육지원청', areas: ['시흥시'], url: 'https://www.goesh.kr' },
    { name: '평택교육지원청', areas: ['평택시'], url: 'https://www.goept.kr', guideUrl: 'https://www.goept.kr/goept/cm/cntnts/cntntsView.do?mi=14771&cntntsId=2787' },
    { name: '의정부교육지원청', areas: ['의정부시'], url: 'https://www.goeujb.kr' },
    { name: '광명교육지원청', areas: ['광명시'], url: 'https://www.goegm.kr' },
    { name: '군포의왕교육지원청', areas: ['군포시', '의왕시'], url: 'https://www.goegu.kr' },
    { name: '광주하남교육지원청', areas: ['광주시', '하남시'], url: 'https://www.goegh.kr' },
    { name: '구리남양주교육지원청', areas: ['구리시', '남양주시'], url: 'https://www.goegn.kr' },
    { name: '파주교육지원청', areas: ['파주시'], url: 'https://www.goepj.kr' },
    { name: '김포교육지원청', areas: ['김포시'], url: 'https://www.gpoe.kr' },
    { name: '이천교육지원청', areas: ['이천시'], url: 'https://www.goeic.kr' },
    { name: '여주교육지원청', areas: ['여주시'], url: 'https://www.goeyj.kr' },
    { name: '안성교육지원청', areas: ['안성시'], url: 'https://www.goean.kr' },
    { name: '양평교육지원청', areas: ['양평군'], url: 'https://www.goeyp.kr' },
    { name: '가평교육지원청', areas: ['가평군'], url: 'https://www.goegp.kr' },
    { name: '연천교육지원청', areas: ['연천군'], url: 'https://www.goeyc.kr' },
    { name: '포천교육지원청', areas: ['포천시'], url: 'https://www.goepc.kr' },
    { name: '동두천양주교육지원청', areas: ['동두천시', '양주시'], url: 'https://www.goedy.kr' }
  ].map(o => ({ ...o, dept: '경기교권보호지원센터' })), // 교육지원청별 교권 직통 번호는 2026 공식 자료에서 확인하지 못해 비워 둬요(대표 1600-8787로 안내)
  areaNote: '통합 교육지원청(안양과천·화성오산 등) 분리가 추진 중이에요. 관할이 바뀌면 이 안내도 갱신해요.',

  // 홈 ‘놓치기 쉬운 권리·지원’ 카드에 붙는 경기 한 줄(HOME_HIGHLIGHTS id). 숫자는 대상·조건과 함께 써요
  highlights: {
    'special-leave': '한 사안에 학생이 여럿이어도 특별휴가는 1회(5일 범위)예요',
    transfer: '교육지원청 세부기준에 따라 비정기전보를 요청할 수 있어요'
  },

  // 회복·보호 제도(BENEFITS id)의 경기 기준. 공통 문장에 섞지 않고 ‘경기 기준’ 상자로 따로 보여 줘요(문서 쪽수는 인쇄 쪽 기준)
  // 상담·치료·법률·공제·경호 같은 지원의 지역 세부는 programs(지원 찾기)에만 둬요
  benefits: {
    'transfer': {
      program: '피해교원 비정기전보',
      apply: '학교장이 각 교육지원청 세부기준에서 정한 비정기전보 절차·요건에 따라 요청',
      missed: ['비정기전보 요건은 교육지원청 세부기준마다 달라요. 소속 교육지원청에 확인하세요.'],
      verifiedAt: '2026-10-03',
      source: 8
    },
    'special-leave': {
      apply: '학교장 승인. 학교장은 특별한 사유가 없다면 심의 전에 허가할 수 있고, 서류는 나중에 갖출 수 있어요.',
      missed: [
        '한 사안에 침해 학생이 여럿이어도 하나의 사안으로 보아 특별휴가는 1회(5일 범위 내)예요.',
        '경기 길라잡이(2026. 2. 25.)는 추가 5일을 ‘입법예고 중’으로 적었지만, 2026. 2. 27. 시행된 교육부예규 제104호로 추가 부여가 가능해졌어요.'
      ],
      verifiedAt: '2026-10-03',
      source: 8
    }
  },

  // source: sources 배열의 번호(둘 이상이면 배열). amount·eligibility·timing·documents·caution은 지원 찾기 ‘신청 전 확인할 것’에 보여요
  programs: [
    { area: '신고·심의', status: '현재 시행 중', t: '교육활동 침해 신고·지역교권보호위원회 심의', verifiedAt: '2026-10-03', reviewStatus: 'verified', sum: '학교 보고를 거쳐 소속 교육지원청이 사안을 조사하고, 지역교권보호위원회가 침해 여부와 조치를 심의해요.', target: '교육활동 침해 피해 교원', org: '소속 교육지원청', apply: '학교 보고 → 교육지원청 보고', documents: '침해 신고서, 사안 발생보고서, 증거', contact: '1600-8787', source: 0, channels: [{ type: 'guide', label: '지역교권보호위원회 안내', url: 'https://more.goe.go.kr/eapc/subList/20000000413' }] },
    { area: '행정 지원', status: '현재 시행 중', t: '교권보호119 콜센터·안심콜 탁(TAC, 1600-8787)', verifiedAt: '2026-10-03', sourceUpdatedAt: '2026-02-25', reviewStatus: 'verified', sum: '교사 안심콜(Teachers Assistance Call)이에요. 경기도학교안전공제회 교육활동안심지원단 전담 인력이 먼저 응대하고 전담 교권코디를 배정해 법률·보상·행정·심리 상담을 원스톱으로 연결해요. 필요하면 변호사 콜백·현장 방문도 해요.', eligibility: '경기도교육청 소속 유·초·중·고·특수학교 및 각종학교 교원(온라인 상담은 휴대전화 본인인증)', timing: '전화 평일 09:00~18:00', caution: '전화 상담·연계 창구예요. 법률·보상은 안심지원단, 행정·심리는 지역 교권보호지원센터로 이어져요.', target: '경기 교원', org: '경기도학교안전공제회 교육활동안심지원단', apply: '전화 1600-8787 또는 온라인 상담', contact: '1600-8787', source: [2, 0, 8], channels: [{ type: 'apply', label: '온라인 상담 신청(본인인증)', url: 'https://www.gessia.or.kr/compe/taconline.php' }, { type: 'guide', label: '콜센터 안내', url: 'https://www.gessia.or.kr/compe/tac.php' }] },
    { area: '행정 지원', status: '현재 시행 중', t: '경기교권보호지원센터', verifiedAt: '2026-09-24', reviewStatus: 'verified', sum: '25개 교육지원청 모두에서 운영해요. 장학사·주무관과 교권전담상담사(13개 센터), 교육지원청 법무담당 변호사가 사안 대응을 지원해요.', target: '경기 교원', org: '소속 교육지원청', source: 4, channels: [{ type: 'guide', label: '센터 운영 안내', url: 'https://more.goe.go.kr/eapc/subList/30300002114' }] },
    { area: ['법률 상담·자문', '수사·소송 지원'], status: '현재 시행 중', t: 'SOS! 경기교육법률지원단', verifiedAt: '2026-10-03', sourceUpdatedAt: '2026-02-25', reviewStatus: 'verified', sum: '도교육청 교권전담 변호사, 경기교권보호지원센터 법무담당 변호사, 형사고발 자문 변호사 등이 법률 상담과 대응을 지원해요. 경찰 수사 개시 통보 전 초기 단계부터 지원해요.', amount: '공제 소송비용 사고당 최고 7천만 원 · 수사 단계 변호사 수임료 550만 원 한도 선지급(1심 한도에 포함)', eligibility: '교육활동과 관련해 법률 분쟁·수사·소송을 겪는 경기 교원', timing: '법무행정서비스 온라인 자문은 교육활동 침해 관련이면 3일 이내 회신', documents: '교육감 형사고발: 형사고발 요청서(길라잡이 서식20)를 학교장 → 교육지원청 → 도교육청으로', caution: '유죄(기소유예 제외) 판결이나 아동보호사건 등으로 범죄 혐의가 인정되면 소송비용을 지원하지 않아요. 친고죄(모욕 등)와 만 14세 미만 학생은 교육감 형사고발 대상이 아니에요. 교육감이 형사고발인이면 경찰 불송치 결정에 이의신청할 수 없어요(고소인만 가능).', target: '법률 지원이 필요한 교원', org: '경기도교육청', apply: '1600-8787(TAC 변호사 콜백) 또는 소속 교육지원청 경기교권보호지원센터', contact: '1600-8787', source: [8, 0, 3], channels: [{ type: 'apply', label: '법률자문 신청 게시판', url: 'https://more.goe.go.kr/eapc/subList/30300002122' }, { type: 'guide', label: '교원 지원 제도 안내', url: 'https://more.goe.go.kr/eapc/subList/30300002117' }] },
    { area: '심리상담', status: '현재 시행 중', t: '교원 마음건강 지원', verifiedAt: '2026-10-03', sourceUpdatedAt: '2026-02-25', reviewStatus: 'verified', sum: '교권전담상담사 상담과 전문상담기관 심리상담, 마음충전·심층치유·힐링성장·센터특화 프로그램과 교직원복지센터 연계 상담을 운영해요.', amount: '침해 피해 교원 전문상담기관 심리상담 10회기 · 직무 스트레스 교원 5회기', eligibility: '교육활동 침해 피해 교원(10회기), 침해가 확인되지 않은 직무 스트레스 교원(5회기)', timing: '학교의 사안 보고(24시간 이내) 뒤에는 위원회 심의 전에도 교권전담상담사 상담 가능', caution: '상담·조언 비용은 도교육청이 직접 지원하고, 병·의원 치료비·약제비는 경기도학교안전공제회로 청구해요.', target: '심리 지원이 필요한 교원', org: '경기교권보호지원센터·교직원복지센터', apply: '1600-8787 또는 소속 교육지원청 경기교권보호지원센터', contact: '1600-8787', source: [11, 0, 8], channels: [{ type: 'guide', label: '심리상담 안내', url: 'https://more.goe.go.kr/eapc/subList/30300002118' }] },
    { area: '치료·비용', status: '현재 시행 중', t: '보호조치 비용·교원보호공제 치료비', verifiedAt: '2026-10-03', sourceUpdatedAt: '2026-02-25', reviewStatus: 'verified', sum: '지역교권보호위원회에서 침해로 인정된 교원의 치료비·약제비를 지원해요. 병·의원 치료비는 경기도학교안전공제회에 청구해요.', amount: '도교육청 보호조치 비용 1인당 200만 원 한도(1년간) · 공제 치료비 200만 원 한도(2025. 8. 1. 이후 사안)', eligibility: '지역교권보호위원회 심의로 교육활동 침해가 인정된 피해 교원', timing: '사안 최초 발생일 또는 위원회 침해 인정일부터 1년 이내 치료비(공제는 치료 시작일 또는 위원회 결정일부터 1년 중 선택)', documents: '공제금 청구서, 진료비 영수증, 지역교권보호위원회 조치 결정 통지서(특수교육대상자로 인한 손해는 학교장 의견서로 대체 가능)', caution: '공적보험으로 이미 받은 금액(초과분만 지급), 보호자 합의금, 한약·첩약, 제증명 발급비는 빠져요. 두 한도가 별개인지는 1600-8787로 확인하세요.', target: '침해 인정 교원', org: '경기도교육청 · 경기도학교안전공제회', apply: '서류 스캔본을 이메일(ggssia77@ssif.or.kr)로 보내고 1600-8787로 접수 확인(심사 영업일 14일)', contact: '1600-8787', source: [8, 9], channels: [{ type: 'guide', label: '회복 지원(치료비) 안내', url: 'https://www.gessia.or.kr/compe/recov.php' }] },
    { area: '교원보호공제', status: '현재 시행 중', t: '교원보호공제', verifiedAt: '2026-10-03', reviewStatus: 'verified', sum: '경기도학교안전공제회가 위탁 운영해요(2026. 3. 1.~2027. 2. 28.). 배상책임, 소송비용, 재산 피해, 치료비, 경호, 위로금을 지원하고 공제 상담은 1600-8787로 해요.', amount: '배상책임 사고당 최고 2억 5천만 원(소 제기 전 합의 1억 원) · 소송비용 사고당 7천만 원 · 재산 피해 사고당 200만 원(안경 30만 원 포함) · 치료비 200만 원', eligibility: '경기도교육청 소속 정규·기간제 교원. 휴직자·퇴직자, 행정직·장학사·시간강사·방과후강사는 제외', timing: '심사는 영업일 기준 14일(보완 서류가 필요하면 연장)', documents: '공제금 청구서와 항목별 증빙(소송: 소장·선임계약서 등, 치료비: 진료비 영수증·조치 결정 통지서)', caution: '횟수·금액이 소진되면 그해 사업이 종료돼요. 위로금·위협대처는 2026년 ‘확대’로 예고됐지만 새 금액은 아직 공식 안내에서 확인되지 않아요. 강력범죄 피해 위로금(4주 이상 치료 신체피해 500만 원)과 중대 사안 피해 위로금(사고당 100만 원)도 있어요.', target: '경기 교원', org: '경기도학교안전공제회', apply: '청구서류 스캔본을 이메일(ggssia77@ssif.or.kr)로 보내고 1600-8787로 접수 확인', contact: '1600-8787 · 공제회 대표 1588-5255', source: [0, 9, 12], channels: [{ type: 'guide', label: '교원보호공제 안내', url: 'https://www.gessia.or.kr/compe/int.php' }] },
    { area: '갈등 중재', status: '현재 시행 중', t: '교원보호공제 분쟁조정 서비스·화해중재단', verifiedAt: '2026-10-03', sourceUpdatedAt: '2026-02-25', reviewStatus: 'verified', sum: '변호사 등 전문가가 현장을 방문해 교육활동 관련 분쟁의 조정(손해사정·합의금 검토 포함)을 지원해요. 화해중재단은 사안 접수 전 갈등 단계에도 학교를 방문해요.', eligibility: '양쪽 당사자가 모두 동의한 교육활동 관련 분쟁', caution: '이미 소송 중인 분쟁, 교원이 고의로 일으킨 분쟁, 교육활동과 무관한 분쟁은 대상이 아니에요. 교권보호위원회 분쟁조정으로 마무리되면 피해 교원 보호조치는 받을 수 없다고 안내돼요. 지역교권보호위원회 조정이 성립하지 않으면 불성립 통지를 받은 날부터 30일 이내 경기도교권보호위원회에 조정을 신청할 수 있어요.', target: '분쟁 조정이 필요한 교원', org: '경기도학교안전공제회 · 소속 교육지원청', apply: '공제 분쟁조정 1600-8787 / 화해중재단은 소속 교육지원청에 요청', contact: '1600-8787', source: [3, 8], channels: [{ type: 'guide', label: '분쟁조정 안내', url: 'https://www.gessia.or.kr/compe/safe.php' }] },
    { area: '학교민원·특이민원 지원', status: '현재 시행 중', t: '학교민원대응팀·학교민원대응지원팀', verifiedAt: '2026-10-03', reviewStatus: 'verified', sum: '학교마다 민원대응팀을, 교육지원청마다 교육장 직속 학교민원대응지원팀(옛 통합민원팀)을 두고 민원을 공식 창구로 일원화해요.', target: '민원 응대 부담이 있는 교원', org: '소속 학교·교육지원청', source: 0 },
    { area: '경호·신변 보호', status: '현재 시행 중', t: '위협대처(경호) 서비스', verifiedAt: '2026-10-03', reviewStatus: 'verified', sum: '교원보호공제로 난입·난동·폭행·상해·협박·부당한 보상 강요 등으로 신변 위협을 받은 교원에게 경호를 지원해요.', amount: '사고당 최대 20일', eligibility: '교육활동과 관련해 신변 위협을 받은 경기 교원', documents: '청구서, 학교장 의견서', caution: '교육활동과 무관한 위협, 긴급 피난에 든 개인 비용(교통·숙박·식사)은 지원하지 않아요. 지금 위험하면 112 신고가 먼저예요.', target: '신변 위협을 받는 교원', org: '경기도학교안전공제회', apply: '1600-8787 상담 후 공제회 청구', contact: '1600-8787', source: 10, channels: [{ type: 'guide', label: '위협대처 서비스 안내', url: 'https://www.gessia.or.kr/compe/safety.php' }] },
    { area: '행정 지원', status: '최신 정보 확인 필요', t: '교권보호전담관', verifiedAt: '2026-09-25', sourceUpdatedAt: '2026-09-23', reviewStatus: 'review-needed', sum: '도교육청이 교육활동 침해에 신속히 대응하기 위한 교권보호전담관 운영을 발표했어요. 세부 운영 방식과 이용 방법은 공식 안내를 확인하세요.', target: '경기 교원', org: '경기도교육청', source: 5, channels: [{ type: 'guide', label: '공식 발표(보도자료)', url: 'https://www.goe.go.kr/goe/na/ntt/selectNttInfo.do?mi=10102&nttSn=2375398' }] }
  ],

  // 교육지원청 카드는 offices에서 자동으로 만들어져요. 학교 내 기관·112는 공통 데이터에 있어요.
  orgs: [
    { cat: '교육청', name: '교권보호119 콜센터', region: '경기 전역', role: '첫 상담, 전담 교권코디 배정, 법률·보상·행정·심리 지원 연결', contact: '1600-8787' },
    { cat: '법률', name: 'SOS! 경기교육법률지원단', region: '경기 전역', role: '법률 상담·자문, 형사고발 자문', contact: '1600-8787' },
    { cat: '공제·민원', name: '경기도학교안전공제회', region: '경기 전역', role: '교원보호공제 위탁 운영(치료비·소송비·경호 등), 교권보호119 콜센터(안심콜 탁) 운영, 분쟁조정 서비스', contact: '1600-8787 · 대표 1588-5255' },
    { cat: '공제·민원', name: '학교민원대응지원팀', region: '각 교육지원청(교육장 직속)', role: '학교민원 대응 지원(옛 통합민원팀)', contact: '소속 교육지원청에 문의' }
  ]
});
