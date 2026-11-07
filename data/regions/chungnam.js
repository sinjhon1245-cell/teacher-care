// 충청남도 — 2026-11-03 공식 자료 직접 확인분만 등록하는 1차 지역 안내.
// 핵심: 충남교육청 공식 채널(2026. 9. 7.)은 교원안심 온콜 1588-9331에 대해
// '연중 24시간 신고 접수'라고 명시함. 24시간 상담·현장 출동이나 1시간 내 출동 보장과 혼동하지 않음.
// 공제 약관·교권법률동행단 신청·치료비 200만 원·신설 센터 개소 세부는 교육청 최신 원문 미확보로 제외.
// 교육지원청 14곳/관할 시·군 15곳: 지방교육자치법 시행령 2026. 5. 12. 부칙 제2조 및 종전 별표 2.
// 현재 충남 조례가 새 관할구역을 따로 정했는지 최신 공포 자료를 다음 점검에서 재확인해야 함.
// 교육지원청 직통 번호는 공식 교권 담당 업무분장으로 확인되지 않아 적지 않음.
// 내부 검토 기록: docs/chungnam-regional-review-2026-11-03.md (PR #17, 별도 검토용).

registerRegion({
  id: 'chungnam',
  short: '충남',
  name: '충청남도',
  office: '충청남도교육청',
  officeUrl: 'https://www.cne.go.kr',
  basis: '충청남도교육청 교원안심 온콜 공식 안내(2026. 9. 7.)·「교원지위법」·「초·중등교육법」 제37조(2026. 10. 29. 시행)·교육지원청 관할 경과규정',
  verifiedAt: '2026-11-03',
  reviewStatus: 'review-needed',
  contactsVerifiedAt: '2026-11-03',
  areasVerifiedAt: '2026-11-03',
  reviewBy: '2026-12-01',
  expectedAreas: 15,

  sources: [
    { title: '충청남도교육청 공식 채널 — 2026. 9. 7. 교원안심 온콜(1588-9331), 연중 24시간 신고 접수 안내', url: 'https://pf.kakao.com/_xgxmBuT/posts', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-09-07', region: 'chungnam', uses: ['guide', 'procedure', 'care', 'support'] },
    { title: '충청남도교육청 교육활동보호 공식 카카오톡 채널(1588-9331)', url: 'https://pf.kakao.com/_xgeTTX', verifiedAt: '2026-11-03', region: 'chungnam', uses: ['guide', 'support'] },
    { title: '한국교육개발원 교육활동보호센터 — 충남 센터 목록(구 자료, 현행 전화번호는 충남교육청 2026 안내로 확인)', url: 'https://forteacher.kedi.re.kr/web/mapBoard/list.do?mId=40&page=2', verifiedAt: '2026-11-03', region: 'chungnam', uses: ['support'] },
    { title: '「교원의 지위 향상 및 교육활동 보호를 위한 특별법」(지역교권보호위원회)', url: 'https://www.law.go.kr/법령/교원의지위향상및교육활동보호를위한특별법', verifiedAt: '2026-11-03', region: 'chungnam', uses: ['guide', 'procedure', 'support'] },
    { title: '「초·중등교육법」 제35조·제37조(2026. 10. 29. 시행 학교민원대응팀·지원 요청)', url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=285599&chrClsCd=010202&urlMode=lsInfoP&efYd=20261029&ancYnChk=0', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-04-28', region: 'chungnam', uses: ['guide', 'support'] },
    { title: '「초·중등교육법 시행령」 제65조(2026. 10. 29. 시행 학교민원 필요 조치)', url: 'https://www.law.go.kr/법령/초ㆍ중등교육법시행령', verifiedAt: '2026-11-03', region: 'chungnam', uses: ['support'] },
    { title: '「지방교육자치에 관한 법률 시행령」(2026. 5. 12. 시행) 부칙 제2조(교육지원청 관할 경과조치)', url: 'https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&chrClsCd=010202&efYd=20260512&lsiSeq=285789', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-05-06', region: 'chungnam', uses: ['finder','support'] },
    { title: '「지방교육자치에 관한 법률 시행령」 종전 [별표 2](2023. 6. 27. 개정, 충남 교육지원청 14곳·관할 15개 시·군)', url: 'https://www.law.go.kr/LSW/flDownload.do?bylClsCd=110201&flSeq=129700305', verifiedAt: '2026-11-03', sourceUpdatedAt: '2023-06-27', region: 'chungnam', uses: ['finder','support'] },
    { title: '충청남도교육청 교육활동보호센터 — 교원치유지원 신청(심리상담·치료비, 피해교원 의결일부터 6개월 이내 신청 표기)', url: 'https://www.cne.go.kr/boardCnts/list.do?boardID=11093&m=031703&s=cne', verifiedAt: '2026-11-07', region: 'chungnam', uses: ['support'] },
    { title: '충청남도교육청 교육활동보호센터 — 심리상담(치료) 안내(10회기·1인당 100만 원 이내, 6개월 이내 신청 표기)', url: 'https://www.cne.go.kr/sub/info.do?m=031706&page=031706&s=cne', verifiedAt: '2026-11-07', region: 'chungnam', uses: ['support'] },
    { title: '「2026 교육활동보호 기본 계획」(충청남도교육청, 2026. 4. 1. 게시 — 기본 10회기 100만 원, 초과 포함 총 200만 원 한도, 의결일부터 1년 이내 신청)', url: 'https://www.cne.go.kr/boardCnts/fileDown.do?m=031702&s=cne&fileSeq=5131aaf294240c382515eaf54e5a247c', verifiedAt: '2026-11-07', sourceUpdatedAt: '2026-04-01', region: 'chungnam', uses: ['support'] },
    { title: '「교육활동 보호 길라잡이」 개정판(충청남도교육청, 2026. 10. 14. 게시 — 1588-9331 3번 전문상담사 교원치유지원 접수, 의결일부터 1년 이내 신청)', url: 'https://www.cne.go.kr/boardCnts/fileDown.do?m=031702&s=cne&fileSeq=22b3cc517033630c46f19d438614c8ee', verifiedAt: '2026-11-07', sourceUpdatedAt: '2026-10-14', region: 'chungnam', uses: ['support'] }
  ],

  hot: '1588-9331',
  hotName: '교원안심 온콜 — 교육활동 침해 신고 접수',
  hotSummary: '충남교육청 교원안심 온콜 1588-9331은 교육활동 침해 관련 신고를 연중 24시간 접수해요. 접수 뒤 상담·대응·지원·회복을 연결한다고 안내해요. 신고 접수 시간과 상담·현장 출동 가능 시간은 다를 수 있으니 접수 시 확인하세요.',
  links: [
    { type: 'guide', label: '교원안심 온콜 이용 안내(충남교육청 공식 채널)', url: 'https://pf.kakao.com/_xgxmBuT/posts' },
    { type: 'guide', label: '충남 교육활동보호 공식 문의 채널', url: 'https://pf.kakao.com/_xgeTTX' }
  ],
  terms: {
    HOT: '1588-9331',
    HOT1: '1588-9331', CARE: '1588-9331(3번 전문상담사)',
    HOT2: '1588-9331',
    OFFICER: '교육활동 보호 업무 담당자',
    LEGAL: '충남교육청 교육활동 보호 법률 지원 담당',
    MUTUAL: '충청남도학교안전공제회',
    SOS: '관할 교육지원청 학교민원대응지원팀',
    MEDIATE: '관할 교육지원청 교육활동 관련 분쟁조정 담당'
  },

  offices: [
    { name: '천안교육지원청', areas: ['천안시'], url: 'https://www.cncae.go.kr/' },
    { name: '공주교육지원청', areas: ['공주시'], url: 'https://www.cngje.go.kr/' },
    { name: '아산교육지원청', areas: ['아산시'], url: 'https://www.cnased.go.kr/' },
    { name: '보령교육지원청', areas: ['보령시'], url: 'https://www.cnbre.go.kr/' },
    { name: '서산교육지원청', areas: ['서산시'], url: 'https://www.cnssed.go.kr/' },
    { name: '금산교육지원청', areas: ['금산군'], url: 'https://www.cngse.go.kr/' },
    { name: '논산계룡교육지원청', areas: ['논산시', '계룡시'], url: 'https://www.cnnse.go.kr/' },
    { name: '부여교육지원청', areas: ['부여군'], url: 'https://www.cnbye.go.kr/' },
    { name: '서천교육지원청', areas: ['서천군'], url: 'https://www.cnsce.go.kr/' },
    { name: '청양교육지원청', areas: ['청양군'], url: 'https://www.cncyed.go.kr/' },
    { name: '홍성교육지원청', areas: ['홍성군'], url: 'https://www.cnhsed.go.kr/' },
    { name: '예산교육지원청', areas: ['예산군'], url: 'https://www.cnyse.go.kr/' },
    { name: '태안교육지원청', areas: ['태안군'], url: 'https://www.cntae.go.kr/' },
    { name: '당진교육지원청', areas: ['당진시'], url: 'https://www.cndje.go.kr/' }
  ],
  areaNote: '충남은 14개 교육지원청이 15개 시·군을 맡아요. 논산시와 계룡시는 모두 논산계룡교육지원청 관할이에요. 교육활동 침해 사안은 소속 학교와 관할 교육지원청에 먼저 알리고, 교육지원청별 교권 업무 담당 연락처는 해당 기관의 공식 누리집에서 확인하세요.',

  // 전국 공통 제도 자체를 충남 고유의 신청·금액 지원처럼 설명하지 않고, 확인된 접수·연결 경로만 안내.
  programs: [
    { area: '신고·심의', status: '현재 시행 중', t: '교육활동 침해 신고·지역교권보호위원회 심의', verifiedAt: '2026-11-07', reviewStatus: 'verified', checks: { exists: '2026-11-07', terms: '2026-11-07', route: '2026-11-07' }, sum: '충남은 2026. 10. 개정 길라잡이부터 도교육청 교권보호관이 신고를 접수해 사안조사관을 배정하고, 관할 교육지원청 지역교권보호위원회가 침해 여부와 조치를 심의해요.', target: '교육활동 침해 피해 교원(동료·관리자 등 사실을 안 사람도 신고할 수 있어요)', org: '충청남도교육청 교권보호관(접수·조사) · 관할 교육지원청(지역교권보호위원회)', apply: '① 업무포털 하단 배너로 온라인 신고(권장) ② 통합신고 전화 1588-9331(온콜, 24시간·연중 접수) ③ 학교 관리자·교육활동 보호 책임관에게 신고(학교 담당자가 온라인으로 접수). 지금 위험하면 112·119가 먼저예요', timing: '사안 조사: 사안 접수 후 5일 이내(토·일·공휴일 제외) → 지역교권보호위원회: 사안발생보고서 접수 후 21일 이내 개최(토·일·공휴일 포함, 불가피하면 연장) → 심의결과 통지: 14일 이내(토·일·공휴일 포함)', documents: '사안 신고서(서식1, 온라인 신고로 대체 가능)', caution: '1588-9331의 24시간은 신고 접수 시간이에요. 심리상담·법률상담은 평일 09:00~18:00(수·금 17:30까지) 운영해요. 위원회 개최를 원하지 않아 사안 종결 확인서를 내면 같은 사안으로 위원회 심의를 다시 요청할 수 없어요. 교육활동 침해 인정 여부는 심의 결과에 따라 달라져요.', contact: '1588-9331', source: [11, 0, 3, 6, 7] },
    { area: ['긴급 지원', '행정 지원'], status: '현재 시행 중', t: '교원안심 온콜(교육활동 침해 신고·대응 지원)', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-09-07', reviewStatus: 'verified', sum: '1588-9331에서 교육활동 침해 신고를 연중 24시간 접수하고, 상담·신속 대응·지원·회복을 연결해요.', eligibility: '교육활동 중 침해 상황을 겪은 충남 교원', timing: '연중 24시간 신고 접수', apply: '1588-9331로 연락하여 소속 학교, 사안의 긴급성, 필요한 보호조치를 알려 주세요.', caution: '24시간은 신고 접수 시간이에요. 상담·현장 지원이 24시간 즉시 가능하거나 1시간 내 출동한다는 뜻은 아니에요. 즉각적인 신변 위험은 112 신고가 우선이에요.', target: '교육활동 침해 피해 교원', org: '충청남도교육청 교원안심 온콜', contact: '1588-9331', source: [0, 1], channels: [{ type: 'guide', label: '충남교육청 교원안심 온콜 공식 안내', url: 'https://pf.kakao.com/_xgxmBuT/posts' }] },
    { area: ['심리상담', '치유·회복 프로그램'], status: '현재 시행 중', t: '교육활동 침해 상담·회복 지원 연결', verifiedAt: '2026-11-07', sourceUpdatedAt: '2026-09-07', reviewStatus: 'review-needed', checks: { exists: '2026-11-07', route: '2026-11-07', conflict: '피해교원 신청 기한 — 도교육청 신청 페이지 6개월, 2026 기본계획·개정 길라잡이 1년' }, sum: '교원안심 온콜에서 교육활동 침해 신고 이후 상담과 회복 지원을 연결한다고 안내해요.', eligibility: '교육활동 침해와 관련하여 상담·회복 지원이 필요한 충남 교원', apply: '도교육청 누리집 교원치유지원 신청(교직원 로그인) 또는 1588-9331(3번 전문상담사) → 교육활동보호센터 검토 → 상담전문가 연계', amount: '상담 기본 10회기 이내(1인당 100만 원 이내, 1회 10만 원 이내), 초과하면 교육활동보호센터와 사전 협의. 2026 기본계획은 초과분을 포함해 총 200만 원 한도로 적어요', timing: '피해교원 신청 기한이 공식 자료마다 달라요. 도교육청 신청 페이지는 지역교권보호위원회 의결일부터 6개월 이내, 2026 기본계획과 개정 길라잡이(2026. 10.)는 1년 이내로 적어요. 기한을 놓치지 않도록 6개월 안에 신청하거나 먼저 1588-9331(3번 전문상담사)에 확인하세요', documents: '교원치유지원신청서, 지역교권보호위원회 조치결과 통보서(피해교원)', caution: '심리적 소진 교원은 기본 지원 뒤 개인 부담이에요. 금액 한도와 신청 기한은 공식 문서끼리 표기가 달라 신청 전에 교육활동보호센터에 확인하세요.', target: '교육활동 침해 관련 상담·회복 지원이 필요한 교원', org: '충청남도교육청 교육활동 보호 지원', contact: '1588-9331', source: [0, 1, 2, 8, 9, 10, 11] },
    { area: '학교민원·특이민원 지원', status: '현재 시행 중', t: '학교민원대응팀·관할청 처리 지원 요청(법령 절차)', verifiedAt: '2026-11-03', reviewStatus: 'review-needed', sum: '학교민원은 학교 차원의 민원대응팀이 접수·처리하고, 학교장이 필요하면 관할청에 처리 지원이나 직접 처리를 요청할 수 있어요.', eligibility: '학교민원·반복·특이민원으로 학교 차원의 대응이 필요한 교원', apply: '학교 관리자·학교 민원대응팀에 상황과 대응 기록을 알리세요. 학교장이 관할청의 처리 지원 또는 직접 처리를 요청할 수 있어요.', caution: '근거는 2026. 10. 29. 시행 「초·중등교육법」 제37조예요. 충남 교육지원청별 전용 접수처·서식은 아직 확인되지 않았으니 관할청에 먼저 확인하세요.', target: '학교민원 대응이 필요한 교원·학교', org: '소속 학교 · 관할 교육지원청', source: [4, 5] }
  ],

  orgs: [
    { cat: '교육청', name: '충남 교원안심 온콜', region: '충남 전역', role: '교육활동 침해 관련 연중 24시간 신고 접수(상담·현장 지원 시간은 별도 확인)', contact: '1588-9331' }
  ]
});
