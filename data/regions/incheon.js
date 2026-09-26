// 인천광역시 — 지역 데이터
// 공식 자료로 확인한 내용만 적어요. 확인하지 못한 값은 비워 두면 화면에 '공식 안내 확인 필요'로 표시돼요.
// 내용을 고치면 verifiedAt(및 해당 sources 항목)을 함께 갱신하세요.

registerRegion({
  id: 'incheon',
  short: '인천',
  name: '인천광역시',
  office: '인천광역시교육청',
  officeUrl: 'https://www.ice.go.kr',
  basis: '「2026 교육활동보호 매뉴얼」·「2026년 인천 교육활동 보호 시행계획」',
  verifiedAt: '2026-09-24',
  // 2026. 7. 1. 행정체제 개편 후 2군 9구(인천광역시 행정구역 안내)
  expectedAreas: 11,
  sources: [
    { title: '인천광역시교육청 「2026 교육활동보호 매뉴얼」', url: 'https://www.ice.go.kr/upload/ice/na/bbs_1711/2026/04/0ecf770cd5d1443260ec865a554c116b.pdf', verifiedAt: '2026-09-24', uses: ['guide', 'procedure', 'support'] },
    { title: '「2026년 인천 교육활동 보호 시행계획」(2026. 2. 13. 게시)', url: 'https://www.ice.go.kr/ice/na/ntt/selectNttInfo.do?mi=11822&bbsId=1711&nttSn=3360999', verifiedAt: '2026-09-24', uses: ['guide', 'support'] },
    { title: '인천광역시교육청 부서안내 — 교육활동보호담당관', url: 'https://www.ice.go.kr/ice/ad/ofcrk/ofcrkDeptInfo.do?mi=12097&deptSn=1120', verifiedAt: '2026-09-24', uses: ['support'] },
    { title: '인천광역시 행정구역(2026. 7. 1. 2군 9구)', url: 'https://www.incheon.go.kr/IC040102', verifiedAt: '2026-09-24', uses: ['finder'] },
    { title: '지방교육자치에 관한 법률 시행령 부칙(대통령령 제36292호) 제2조 — 조례 제정 전까지 종전 [별표 2] 관할 적용', url: 'https://www.law.go.kr/법령/지방교육자치에관한법률시행령', verifiedAt: '2026-09-24', uses: ['finder'] },
    { title: '교육지원청 관할 조례 개정 입법예고(교육청공고 제2026-385호, 2027. 3. 1. 시행 예정)', url: 'https://www.ice.go.kr/law/na/ntt/selectNttInfo.do?nttSn=3385048&mi=12782', verifiedAt: '2026-09-24', uses: ['finder'] },
    { title: '인천광역시교육청 교육활동보호담당관 안내', url: 'https://www.ice.go.kr/ice/cm/cntnts/cntntsView.do?mi=11819&cntntsId=855', verifiedAt: '2026-09-24', uses: ['support'] },
    { title: '인천광역시교육청 기관별 조직도 — 교육지원청 대표전화', url: 'https://www.ice.go.kr/ice/cm/cntnts/cntntsView.do?mi=12059&cntntsId=1034', verifiedAt: '2026-09-25', uses: ['finder'] },
    { title: '인천광역시학교안전공제회 — 교원 위협대처 경호서비스', url: 'https://incheon.ssif.or.kr/sub/sub03_05_02.php', verifiedAt: '2026-09-25', uses: ['support'] },
    { title: '인천광역시교육청 「2026학년도 학교민원 처리 매뉴얼」(붙임1 학교민원 처리 매뉴얼(인천), 2026. 3. 16. 게시)', url: 'https://www.ice.go.kr/ice/na/ntt/selectNttInfo.do?mi=11822&bbsId=1711&nttSn=3364320', verifiedAt: '2026-09-26', uses: ['guide', 'support'] }
  ],

  // 대표번호와 ARS 안내(2026 교육활동보호 매뉴얼)
  hot: '032-1395',
  hotName: '인천 교육활동보호 직통 번호',
  hotSummary: '평일 09:00~18:00. 원스톱 지원(법률·상담·치료)과 소속 교육지원청 신고·심의 문의를 한 번호로 연결해요.',
  // 지원 찾기 '지역 지원 허브'의 바로 이용하기(시·도교육청 홈페이지는 officeUrl로 자동 추가)
  links: [
    { type: 'apply', label: '원스톱 지원 온라인 신청(로그인)', url: 'https://www.ice.go.kr/ice/na/ntt/selectNttList.do?mi=11825&bbsId=1712' },
    { type: 'guide', label: '교육활동보호 원스톱 지원 이용 방법', url: 'https://www.ice.go.kr/ice/cm/cntnts/cntntsView.do?mi=11820&cntntsId=856' }
  ],
  menu: [
    '<strong>교육활동보호담당관 원스톱 지원</strong> — 컨설팅·심리상담·법률자문·의료지원',
    '<strong>소속 교육지원청</strong>(2-1 남부, 2-2 북부, 2-3 동부, 2-4 서부, 2-5 강화) — 침해 신고·지역교권보호위원회 문의'
  ],

  // 공통 데이터의 토큰 값
  terms: {
    HOT: '032-1395', HOT1: '032-1395(1번)', HOT2: '032-1395(2번)',
    OFFICER: '교권보호책임관(교감)',
    LEGAL: '법률지원단·교권전담변호사', MUTUAL: '인천학교안전공제회',
    SOS: '학교민원 SOS 지원단', MEDIATE: '교육활동 갈등중재 지원'
  },

  // 교육지원청(신고·사안 조사·지역교권보호위원회). areas는 '내 교육지원청 찾기' 선택지가 돼요.
  // 관할: 종전 시행령 [별표 2]를 2026. 7. 1. 개편 구역(중구·동구 → 제물포구·영종구, 서구 → 서해구·검단구)에 맞춰 적용.
  // 2027. 3. 1. 영종·검단교육지원청 신설, 서부 → 서해교육지원청 개칭이 입법예고 중이에요. 시행되면 이 목록을 고치세요.
  offices: [
    { name: '남부교육지원청', dept: '초등교육과', areas: ['미추홀구', '제물포구', '영종구', '옹진군'], contact: '032-762-7361 · 032-1395(2-1번)', hours: '평일 근무 시간', url: 'https://nambu.ice.go.kr' },
    { name: '북부교육지원청', dept: '초등교육과', areas: ['부평구', '계양구'], contact: '032-524-9631 · 032-1395(2-2번)', hours: '평일 근무 시간', url: 'https://bukbu.ice.go.kr' },
    { name: '동부교육지원청', dept: '초등교육과', areas: ['남동구', '연수구'], contact: '032-460-6000 · 032-1395(2-3번)', hours: '평일 근무 시간', url: 'https://dongbu.ice.go.kr' },
    { name: '서부교육지원청', dept: '초등교육과', areas: ['서해구', '검단구'], contact: '032-560-6600 · 032-1395(2-4번)', hours: '평일 근무 시간', url: 'https://seobu.ice.go.kr' },
    { name: '강화교육지원청', dept: '교육지원과', areas: ['강화군'], contact: '032-930-7777 · 032-1395(2-5번)', hours: '평일 근무 시간', url: 'https://ganghwa.ice.go.kr' }
  ],
  areaNote: '2026. 7. 1. 행정체제 개편 후 구역 기준이에요. 2027. 3. 1.부터 영종·검단교육지원청 신설이 예고되어 있어요(입법예고 중).',

  // source: sources 배열의 번호
  programs: [
    { area: '신고·심의', status: '현재 시행 중', t: '교육활동 침해 신고·지역교권보호위원회 심의', sum: '학교 보고를 거쳐 교육지원청이 신고를 접수하고, 위원회가 침해 여부와 조치를 심의해요.', target: '교육활동 침해 피해 교원', org: '소속 교육지원청', apply: '학교 보고 → 교육지원청 보고', docs: '침해 신고서, 사안 발생보고서, 증거', deadline: '사안 접수 후 24시간 이내 보고, 사안 보고 후 5일 이내 발생보고서(주말·공휴일 제외)', contact: '032-1395(2번)', source: 0 },
    { area: '행정 지원', status: '현재 시행 중', t: '교육활동 침해 원스톱 지원(032-1395)', sum: '교육활동보호담당관이 초기 상담 후 지원 계획을 세우고 행정·법률·상담(치료)·중재를 맞춤 지원해요.', target: '인천 교원', org: '교육활동보호담당관', apply: '전화 032-1395(1번) 또는 교육청 홈페이지 원스톱 지원 신청', deadline: '평일 09~18시 접수', contact: '032-1395(1번)', source: 0, channels: [{ type: 'apply', label: '온라인 신청(로그인)', url: 'https://www.ice.go.kr/ice/na/ntt/selectNttList.do?mi=11825&bbsId=1712' }, { type: 'guide', label: '이용 방법', url: 'https://www.ice.go.kr/ice/cm/cntnts/cntntsView.do?mi=11820&cntntsId=856' }] },
    { area: '법률 상담·자문', status: '현재 시행 중', t: '법률지원단·교권전담변호사', sum: '침해 사안, 소송·수사 대응에 대한 법률 상담과 자문을 제공해요.', target: '법률 지원이 필요한 교원', org: '교육활동보호담당관', apply: '032-1395(1번)', docs: '사건 경과 기록, 증거', contact: '032-1395(1번)', source: 0, channels: [{ type: 'apply', label: '법률자문 신청(로그인)', url: 'https://www.ice.go.kr/ice/na/ntt/selectNttList.do?mi=11826&bbsId=1713' }, { type: 'guide', label: '이용 방법', url: 'https://www.ice.go.kr/ice/cm/cntnts/cntntsView.do?mi=11820&cntntsId=856' }] },
    { area: '아동학대 피신고 교원 지원', status: '현재 시행 중', t: '아동학대 피신고 교원 지원', sum: '정당한 교육활동 중 아동학대 신고를 받은 교원에게 법률·심리 지원을 연계해요. 심리 상담은 100만 원 한도예요.', target: '아동학대 신고를 받은 교원', org: '교육활동보호담당관', apply: '032-1395(1번)', docs: '신고 통지 자료, 지도 경위', deadline: '인지 즉시 권장', contact: '032-1395(1번)', source: 0, channels: [{ type: 'apply', label: '온라인 신청(로그인)', url: 'https://www.ice.go.kr/ice/na/ntt/selectNttList.do?mi=11825&bbsId=1712' }, { type: 'guide', label: '이용 방법', url: 'https://www.ice.go.kr/ice/cm/cntnts/cntntsView.do?mi=11820&cntntsId=856' }] },
    { area: '심리상담·치료', status: '현재 시행 중', t: '심리 상담 지원', sum: '개인·집단 상담과 온라인 심리 검사를 지원해요. 침해 피해 교원 200만 원(보호조치 비용 포함), 소진·아동학대 피신고 교원 100만 원 한도예요.', target: '교육활동 침해 피해 교원 등', org: '교육활동보호담당관·교육활동보호센터', apply: '032-1395(1번)', docs: '진료 관련 서류(치료비 지원 시)', contact: '032-1395(1번)', source: 0, channels: [{ type: 'apply', label: '온라인 신청(로그인)', url: 'https://www.ice.go.kr/ice/na/ntt/selectNttList.do?mi=11825&bbsId=1712' }, { type: 'guide', label: '이용 방법', url: 'https://www.ice.go.kr/ice/cm/cntnts/cntntsView.do?mi=11820&cntntsId=856' }] },
    { area: '갈등 중재', status: '현재 시행 중', t: '교육활동 관련 갈등중재 지원', sum: '교원과 학생·보호자 간 갈등이 있을 때 중재지원단을 매칭해 중재를 지원해요.', target: '갈등 중재가 필요한 학교·교원', org: '교육활동보호담당관', apply: '032-1395(1번)', docs: '갈등 경위 요약', contact: '032-1395', source: 1 },
    { area: '교원보호공제', status: '현재 시행 중', t: '교원보호공제', sum: '교육활동 관련 분쟁조정, 배상책임, 소송비용 등을 지원해요. 분쟁 발생 시 변호사·공제회 직원이 직접 개입하는 분쟁조정 서비스도 있어요.', target: '인천 교원', org: '교육활동보호담당관 · 인천학교안전공제회', apply: '공제회 문의', docs: '사안·비용 증빙 서류', contact: '070-7848-0794', source: 0, channels: [{ type: 'guide', label: '교원보호공제 안내', url: 'https://incheon.ssif.or.kr/sub/sub03_05.php' }] },
    { area: '학교민원·특이민원 지원', status: '현재 시행 중', t: '학교민원대응팀·학교민원 SOS 지원단', sum: '개인이 감당하기 어려운 민원과 특이민원을 공동 대응해요.', target: '반복·특이민원을 겪는 교원', org: '학교민원대응팀·교육활동보호담당관', apply: '학교민원대응팀 이관 요청, 032-1395', docs: '민원 대응 기록', contact: '032-1395', source: 1 },
    { area: '경호·신변 보호', status: '현재 시행 중', t: '교원 위협대처 경호서비스', sum: '교원보호공제의 하나로, 신변 위협을 받는 교원에게 경호를 지원해요. 1건당 최대 20일(2인 경호 시 10일), 40일까지 연장할 수 있어요.', target: '신변 위협을 받는 교원', org: '교육활동보호담당관', apply: '032-1395', docs: '위협 관련 증빙', contact: '032-1395', source: 8, channels: [{ type: 'guide', label: '경호서비스 안내', url: 'https://incheon.ssif.or.kr/sub/sub03_05_02.php' }] },
    { area: '치유·회복 프로그램', status: '현재 시행 중', t: '치유·회복 프로그램', sum: '다채움, 마음봄 집단상담, 아이-플라토, 마음챙김 프로그램을 운영해요.', target: '침해 피해 교원, 아동학대 피신고 교원, 소진 교원', org: '교육활동보호담당관·교육활동보호센터', apply: '032-1395(1번), 프로그램별 공문 안내', contact: '032-1395(1번)', source: 0 }
  ],

  // 교육지원청 카드는 offices에서 자동으로 만들어져요. 학교 내 기관·112는 공통 데이터에 있어요.
  orgs: [
    { cat: '교육청', name: '교육활동보호담당관', region: '인천 전역', role: '원스톱 지원 운영(컨설팅·심리상담·법률자문·의료지원)', contact: '032-1395(1번)', hours: '평일 09~18시' },
    { cat: '교육청', name: '교육활동보호센터', region: '본청과 5개 교육지원청(6곳)', role: '심리상담·치료 연계, 치유·회복 프로그램', contact: '032-1395(1번)', hours: '평일 09~18시' },
    { cat: '법률', name: '법률지원단·교권전담변호사', region: '인천 전역', role: '법률 상담·자문, 소송·수사 대응 지원', contact: '032-1395(1번)' },
    { cat: '공제·민원', name: '인천학교안전공제회(교원보호공제)', region: '인천 전역', role: '교원보호공제, 분쟁조정 서비스', contact: '070-7848-0794' },
    { cat: '공제·민원', name: '학교민원 SOS 지원단', region: '인천 전역', role: '특이민원 공동 대응', contact: '032-1395' }
  ]
});
