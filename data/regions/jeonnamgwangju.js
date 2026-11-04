// 전남광주통합특별시 — 2026-11-03 기준 공식자료 검증분만.
// 2026.7.1. 광주·전남 통합에 따라 시·도 선택은 하나지만, 2026 현재 지원 신청 창구는 광주권·전남권을 구분.
// 조직도(통합) 기준 교육지원청 24곳, 광주 5구 + 전남 22시군 = 시·군·구 27곳.
// 2026.10.1. 발표한 2027 교육활동보호담당관 신설·1시간/24시간 출동·AI 24시간 상담은 예정 정책으로서 현재 서비스에서 제외.
// 구 전남(2026.6.) 법률상담, 구 광주 2026 심리·법률상담 페이지와 기존 전남 공제 안내를 현행 원문으로 구분.
// 신청 서식, 지원 한도, 통합 이후 세부 계약·보장 범위는 원문으로 다시 확인하기 전 확정하지 않음.
registerRegion({
  id: 'jeonnamgwangju',
  short: '전남광주',
  name: '전남광주통합특별시',
  office: '전남광주통합특별시교육청',
  officeUrl: 'https://gen.go.kr/',
  basis: '「전남광주통합특별시 설치를 위한 특별법」(2026. 7. 1. 출범)·전남광주통합특별시교육청 통합 조직도·2026 광주권·전남권 교육활동보호센터 공식 안내·「교원지위법」·「초·중등교육법」 제37조',
  verifiedAt: '2026-11-03',
  reviewStatus: 'review-needed',
  contactsVerifiedAt: '2026-11-03',
  areasVerifiedAt: '2026-11-03',
  reviewBy: '2026-12-01',
  expectedAreas: 27,

  sources: [
    { title: '전남광주통합특별시교육청 공식 조직도(교육지원청 24곳)', url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02', region: 'jeonnamgwangju', verifiedAt: '2026-11-03', uses: ['finder','guide','procedure','support','care'] },
    { title: '광주권 교육활동보호센터 심리상담·홈페이지 신청 안내', url: 'https://forteacher.gen.go.kr/sub/page.php?page_code=support_07', region: 'jeonnamgwangju', verifiedAt: '2026-11-03', uses: ['guide','support','care'] },
    { title: '광주권 교권전담변호사 법률상담 안내·연락처', url: 'https://forteacher.gen.go.kr/sub/page.php?page_code=support_05', region: 'jeonnamgwangju', verifiedAt: '2026-11-03', uses: ['guide','support'] },
    { title: '전남권 교육활동보호센터 법률상담(2026. 6. 9. 갱신)·권역별 전담변호사 안내', url: 'https://www.jne.go.kr/thsupport/cm/cntnts/cntntsView.do?cntntsId=642&mi=1815', region: 'jeonnamgwangju', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-06-09', uses: ['guide','procedure','support'] },
    { title: '전남권 교육활동보호센터 업무자료실(2025년 개인상담·심리치료 신청서 양식 게시)', url: 'https://www.jne.go.kr/thsupport/na/ntt/selectNttList.do?mi=667&bbsId=339', region: 'jeonnamgwangju', verifiedAt: '2026-11-04', uses: ['guide','support','care'] },
    { title: '전남권 교육활동보호센터 심리상담 신청 안내(2026. 10. 15. 갱신, 2026년 신청서 서식 게시, 통합 뒤 접수처 재확인 대상)', url: 'https://www.jne.go.kr/thsupport/cm/cntnts/cntntsView.do?cntntsId=641&mi=1814', region: 'jeonnamgwangju', verifiedAt: '2026-11-04', sourceUpdatedAt: '2026-10-15', uses: ['guide','support','care'] },
    { title: '전남권 교원보호공제 주요 내용·신청 안내(2026. 4. 3. 갱신, 통합 뒤 적용 조건 확인 필요)', url: 'https://www.jne.go.kr/thsupport/cm/cntnts/cntntsView.do?cntntsId=646&mi=1813', region: 'jeonnamgwangju', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-04-03', uses: ['guide','support','care'] },
    { title: '「교원의 지위 향상 및 교육활동 보호를 위한 특별법」(교육활동 침해 신고·보호조치)', url: 'https://www.law.go.kr/법령/교원의지위향상및교육활동보호를위한특별법', region: 'jeonnamgwangju', verifiedAt: '2026-11-03', uses: ['guide','procedure','support','care'] },
    { title: '「초·중등교육법」 제37조(2026. 10. 29. 시행, 학교민원 대응)', url: 'https://www.law.go.kr/LSW/lsInfoP.do?lsiSeq=285599&chrClsCd=010202&urlMode=lsInfoP&efYd=20261029&ancYnChk=0', region: 'jeonnamgwangju', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-04-28', uses: ['guide','support'] },
    { title: '전남광주통합특별시 설치 특별법(행정구역 통합 시행)', url: 'https://www.law.go.kr/LSW/lsInfoP.do?ancYnChk=0&chrClsCd=010202&efYd=20261013&lsiSeq=291147', region: 'jeonnamgwangju', verifiedAt: '2026-11-03', uses: ['finder','guide','support'] },
    { title: '광주권 2026 교원보호공제사업 공식 안내(2026. 3. 24. 공지, 약관·공제금 청구서·위협 대처·분쟁조정 신청서 첨부)', url: 'https://forteacher.jge.go.kr/xboard/board.php?keyset=W_NAME&mode=view&number=1951&page=1&sCat=0&searchword=%EC%9A%B4%EC%98%81%EC%9E%90&tbnum=7', region: 'jeonnamgwangju', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-03-24', uses: ['guide','support','care'] },
    { title: '광주권 교육활동보호센터 법률지원단 이용 절차·법률지원신청서(학교 공문·광주지방변호사회 팩스)', url: 'https://forteacher.jge.go.kr/sub/page.php?page_code=support_06', region: 'jeonnamgwangju', verifiedAt: '2026-11-04', uses: ['guide','support','procedure'] },
    { title: '광주권 교육활동보호센터 심리상담 온라인 신청·처리결과 확인', url: 'https://forteacher.jge.go.kr/sub/page.php?mode=board&page_code=counsel_01_02&tbnum=2', region: 'jeonnamgwangju', verifiedAt: '2026-11-04', uses: ['guide','support','care'] }
  ],

  // 통합권 전체에 동일하게 적용되는 24시간 전화가 검증되지 않았으므로 공통 대표전화를 만들지 않음.
  // Gwangju 상담 대표와 Jeonnam 본청 법률 상담 전화는 담당 권역/역할을 명확히 분리해 표시.
  hot: '1644-9575',
  hotName: '근무 권역에 맞는 교육활동 보호 창구',
  hotContacts: [
    { label: '광주권 교육활동보호센터', value: '1644-9575' },
    { label: '전남권 본청 법률상담(변호사)', value: '061-260-0535' }
  ],
  hotSummary: '광주권과 전남권은 2026년 현재 공식 상담·법률 신청 경로가 달라요. 광주권은 교육활동보호센터 1644-9575, 전남권 법률상담은 교육활동보호센터 안내의 본청 전담변호사 061-260-0535 또는 권역별 전담변호사를 확인하세요. 전남권 침해 신고·심의는 학교와 관할 교육지원청으로 연락하세요. 두 번호를 통합권 전체의 24시간 긴급 출동 번호로 해석하지 마세요.',
  links: [
    { type: 'guide', label: '전남광주 통합 교육지원청 24곳 안내', url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { type: 'guide', label: '광주권 교육활동보호센터', url: 'https://forteacher.gen.go.kr/sub/page.php?page_code=support_07' },
    { type: 'guide', label: '전남권 교육활동보호센터', url: 'https://www.jne.go.kr/thsupport/main.do' }
  ],
  terms: {
    HOT: '근무 권역별 교육활동 보호 창구',
    HOT1: '광주권 교육활동보호센터 또는 전남권 전담변호사',
    HOT2: '소속 학교와 관할 교육지원청',
    OFFICER: '소속 학교 교육활동 보호 담당자',
    LEGAL: '광주권·전남권 전담변호사',
    MUTUAL: '전남광주통합특별시 교원보호공제 담당 기관(통합 이후 조건 확인)',
    SOS: '관할 교육지원청 학교민원대응지원팀',
    MEDIATE: '관할 교육지원청 교육활동 관련 분쟁조정 담당'
  },
  offices: [
    { name: '목포교육지원청', areas: ['목포시'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '여수교육지원청', areas: ['여수시'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '순천교육지원청', areas: ['순천시'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '나주교육지원청', areas: ['나주시'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '광양교육지원청', areas: ['광양시'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '광주동부교육지원청', areas: ['동구', '북구'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '광주서부교육지원청', areas: ['서구', '남구', '광산구'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '담양교육지원청', areas: ['담양군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '곡성교육지원청', areas: ['곡성군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '구례교육지원청', areas: ['구례군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '고흥교육지원청', areas: ['고흥군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '보성교육지원청', areas: ['보성군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '화순교육지원청', areas: ['화순군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '장흥교육지원청', areas: ['장흥군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '강진교육지원청', areas: ['강진군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '해남교육지원청', areas: ['해남군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '영암교육지원청', areas: ['영암군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '무안교육지원청', areas: ['무안군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '함평교육지원청', areas: ['함평군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '영광교육지원청', areas: ['영광군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '장성교육지원청', areas: ['장성군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '완도교육지원청', areas: ['완도군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '진도교육지원청', areas: ['진도군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' },
    { name: '신안교육지원청', areas: ['신안군'], url: 'https://gen.go.kr/sub/page.php?page_code=introduce_06_02' }
  ],
  areaNote: '전남광주통합특별시에는 교육지원청 24곳이 있어요. 광주권 5개 구는 광주동부(동구·북구), 광주서부(서구·남구·광산구)가 맡고, 전남권 22개 시·군은 각각의 교육지원청에서 안내해요. 교육지원청 링크는 통합교육청의 공식 교육지원청 목록으로 연결되며 개별 교육지원청 직통번호가 아니에요. 2026년 통합 뒤 상담·공제 신청 창구는 근무 권역에 따라 먼저 확인하세요.',

  programs: [
    { area: '신고·심의', status: '현재 시행 중', t: '교육활동 침해 신고·지역교권보호위원회 심의', verifiedAt: '2026-11-03', reviewStatus: 'verified', sum: '교육활동 침해가 발생하면 소속 학교에 사안을 알리고 관할 교육지원청을 통해 신고·지역교권보호위원회 절차를 확인할 수 있어요.', target: '교육활동 침해 피해 교원', org: '소속 학교 · 관할 교육지원청', apply: '학교 관리자와 교육활동 보호 담당자에게 신고하고 관할 교육지원청 교육활동 보호 부서의 사안 접수 절차를 확인하세요.', caution: '광주권·전남권 모두 지역교권보호위원회 제도를 적용하지만 접수 담당자·서식은 관할 교육지원청에서 최신 정보를 확인해야 해요.', source: [0,7,9] },
    { area: ['심리상담', '치유·회복 프로그램'], status: '현재 시행 중', t: '광주권 교육활동보호센터 심리상담', verifiedAt: '2026-11-03', reviewStatus: 'verified', sum: '광주권 교육활동보호센터에서 전문상담사의 심리상담·심리검사를 신청하고 필요한 경우 연계 기관을 안내받을 수 있어요.', eligibility: '광주권 소속 교원(상세 대상은 센터에서 확인)', target: '심리상담·회복 지원이 필요한 광주권 교원', org: '광주동부·광주서부 교육활동보호센터', apply: '교육활동보호센터 누리집에서 상담을 신청하거나 1644-9575로 문의해 전문상담사 상담과 연계기관 이용 절차를 확인하세요.', contact: '1644-9575', caution: '전남권 교원에게 광주권 상담 조건이 그대로 적용된다고 볼 수 없어요. 지원 회기·치료비·방문 시간은 2026 운영계획과 센터에서 확인하세요.', source: [1,12], channels: [{ type: 'apply', label: '광주권 심리상담 온라인 신청', url: 'https://forteacher.jge.go.kr/sub/page.php?mode=board&page_code=counsel_01_02&tbnum=2' }, { type: 'guide', label: '광주권 심리상담 이용 안내', url: 'https://forteacher.gen.go.kr/sub/page.php?page_code=support_07' }] },
    { area: ['법률 상담·자문', '수사·소송 지원'], status: '현재 시행 중', t: '광주권 교권전담변호사 법률상담', verifiedAt: '2026-11-03', reviewStatus: 'verified', sum: '광주권 교육활동 침해 등 교권 관련 사건에 관해 전담변호사의 법률상담과 법률자문을 안내받을 수 있어요.', eligibility: '광주권 교원 등 공식 상담 대상(세부 범위는 센터 확인)', target: '교육활동 관련 법률상담이 필요한 광주권 교원', org: '광주동부·광주서부 교육활동보호센터 교권전담변호사', apply: '전담변호사 상담은 1644-9575로 문의하세요. 별도의 법률지원단 지원은 학교 내부결재 후 교육지원청 학교지원센터에 공문을 보내고 광주지방변호사회에 신청서 팩스(062-222-1305)를 제출하는 공식 절차를 확인하세요.', contact: '1644-9575', caution: '전담변호사 상담과 법률지원단의 신청 절차는 서로 달라요. 법률상담과 실제 소송비용 지원도 별개이므로 비용·선임 조건은 신청 전에 확인하세요.', source: [2,11], channels: [{ type: 'guide', label: '광주권 교권전담변호사 안내', url: 'https://forteacher.gen.go.kr/sub/page.php?page_code=support_05' }, { type: 'guide', label: '광주권 법률지원단 신청 절차·서식', url: 'https://forteacher.jge.go.kr/sub/page.php?page_code=support_06' }] },
    { area: '법률 상담·자문', status: '현재 시행 중', t: '전남권 권역별 교육활동보호 전담변호사 법률상담', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-06-09', reviewStatus: 'verified', sum: '전남권 교육활동 침해 피해와 학교폭력 관련 교원 법률상담을 권역별 전담변호사에게 신청할 수 있어요.', eligibility: '전남권 유·초·중·고·특수·각종학교 교원(기간제 포함, 공식 안내 기준)', target: '교육활동 침해 관련 법률상담이 필요한 전남권 교원', org: '전남권 본청 및 목포·여수·순천·나주 권역별 전담변호사', apply: '공식 법률상담 안내에서 관할 권역의 전담변호사와 신청서를 확인한 뒤 업무 이메일 신청 또는 사전 연락 후 방문상담을 신청하세요. 본청 총괄 061-260-0535.', contact: '061-260-0535', timing: '평일 09:30~17:30(공식 안내의 전화상담 시간)', caution: '광주권은 별도 센터에서 안내해요. 권역별 전화·담당자·통합 후 처리 조직은 공식 안내와 상담 접수 시 재확인하세요.', source: [3], channels: [{ type: 'guide', label: '전남권 권역별 전담변호사 연락처·신청 서식', url: 'https://www.jne.go.kr/thsupport/cm/cntnts/cntntsView.do?cntntsId=642&mi=1815' }] },
    { area: ['심리상담', '치유·회복 프로그램'], status: '신청 전 확인', t: '전남권 교육활동보호센터 개인상담·심리치료 신청 안내', verifiedAt: '2026-11-04', reviewStatus: 'review-needed', sum: '전남권 교육활동보호센터의 개인상담·심리치료 신청 안내와 2026년 신청서 서식 위치를 안내해요.', eligibility: '전남권 교원(개별 신청 자격은 공식 심리상담 안내와 교육활동보호센터에서 확인)', target: '심리상담·치료 지원이 필요한 전남권 교원', org: '전남권 교육활동보호센터', apply: '공식 심리상담 신청 안내에서 2026년 신청서 서식을 확인한 뒤 소속 학교·교육활동보호센터에 현행 업무메일 접수 담당자와 신청 시기를 확인하세요.', caution: '상세 신청 페이지의 업무메일 담당자 정보는 통합 전 기관명(전라남도교육청)으로 안내돼 있어 확정하지 않았어요. 2026년 지원 금액·회기·신청 기한 및 광주권 확대 여부도 확인 전이므로 안내하지 않아요.', source: [4,5], channels: [{ type: 'guide', label: '전남권 교육활동보호센터 심리상담 신청 안내', url: 'https://www.jne.go.kr/thsupport/cm/cntnts/cntntsView.do?cntntsId=641&mi=1814' }] },
    { area: ['교원보호공제'], status: '신청 전 확인', t: '전남권 교원보호공제 기존 안내·신청 경로 확인', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-04-03', reviewStatus: 'review-needed', sum: '2026년 통합 이전 전남권 교원보호공제 공식 안내에서 보장 항목과 신청 출발점을 확인할 수 있어요.', target: '교육활동 관련 공제 지원을 문의하려는 전남권 교원', org: '전남권 학교안전공제·교원보호공제 담당', apply: '기존 전남권 교원보호공제 안내에서 신청절차·공제사업 바로가기를 확인한 뒤 통합 후 보장·접수 기관에 신청 자격을 문의하세요.', caution: '2026. 4. 3. 공지는 교육청 통합 전 자료예요. 2026. 7. 1. 이후 공제 계약 승계·지원 범위·청구 금액·중복지원 조건은 최신 약관을 확인하기 전이므로 확정하지 않아요. 광주권에도 동일하게 적용된다고 안내하지 않아요.', source: [6], channels: [{ type: 'guide', label: '전남권 2026 교원보호공제 안내', url: 'https://www.jne.go.kr/thsupport/cm/cntnts/cntntsView.do?cntntsId=646&mi=1813' }] },
    { area: '교원보호공제', status: '신청 전 확인', t: '광주권 교원보호공제(2026 약관·신청서)', verifiedAt: '2026-11-03', sourceUpdatedAt: '2026-03-24', reviewStatus: 'review-needed', sum: '광주권 교육활동보호센터에 게시된 2026년 교원보호공제 안내에서 보장 내용과 공제금 청구서, 위협 대처·분쟁조정 신청서를 확인할 수 있어요.', eligibility: '2026. 3. 24. 안내 기준 관내 유·초·중·고·특수교원(기간제교사·시간강사 포함, 휴직자 제외) 및 위기교실케어샘 위촉 봉사직', target: '교육활동 중 손해·법률비용·신변 위협 관련 공제 지원을 확인하려는 광주권 교원', org: '광주권 학교안전공제회(통합 이후 접수기관 재확인 필요)', timing: '2026. 3. 24. 공지상의 보험기간은 2026. 3. 1.~2027. 2. 28.(통합 이후 변경 여부는 문의)', apply: '광주권 공식 공지에서 약관과 공제금 청구서·서비스 신청서를 확인한 뒤 062-380-4158로 통합 이후 적용 범위와 제출처를 먼저 문의하세요.', contact: '062-380-4158', caution: '이 안내는 2026. 7. 1. 통합 이전에 공지됐어요. 통합 이후 계약 승계·청구 기한·금액 한도·지원 대상·접수처가 그대로 유지되는지는 확인되지 않았으므로 신청 전에 반드시 해당 공제회에 재확인하세요. 전남권 공제와 동일한 약관이라고 가정하지 않아요.', source: [10], channels: [{ type: 'guide', label: '광주권 2026 교원보호공제 공식 안내·청구서', url: 'https://forteacher.jge.go.kr/xboard/board.php?keyset=W_NAME&mode=view&number=1951&page=1&sCat=0&searchword=%EC%9A%B4%EC%98%81%EC%9E%90&tbnum=7' }] },
    { area: ['학교민원·특이민원 지원', '행정 지원'], status: '현재 시행 중', t: '학교민원대응팀·관할청 처리 지원 요청(법령 절차)', verifiedAt: '2026-11-03', reviewStatus: 'review-needed', sum: '학교민원은 학교 차원의 대응팀을 통해 처리하며, 학교장이 필요시 관할청에 처리 지원 또는 직접 처리를 요청할 수 있어요.', eligibility: '학교민원 대응에 도움이 필요한 교원·학교', target: '학교민원·특이민원 대응이 필요한 교원·학교', org: '소속 학교 · 관할 교육지원청', apply: '소속 학교 관리자·학교민원대응팀에 민원 내용과 대응 기록을 전달하세요. 학교장이 관할 교육지원청에 처리 지원 또는 직접 처리를 요청할 수 있어요.', caution: '2026. 10. 29. 시행 「초·중등교육법」 제37조 기준이에요. 통합 교육청의 권역별 학교민원 지원 전담팀 및 접수서식은 별도로 확인하세요.', source: [8] }
  ],
  orgs: [
    { cat: '교육청', name: '광주권 교육활동보호센터', region: '광주권(동구·북구·서구·남구·광산구)', role: '광주권 교원 심리상담·법률상담 접수 안내', contact: '1644-9575' },
    { cat: '교육청', name: '전남권 본청 교육활동보호 전담변호사', region: '전남권 22개 시·군', role: '전남권 권역별 법률상담 신청 안내·본청 총괄', contact: '061-260-0535' }
  ]
});
