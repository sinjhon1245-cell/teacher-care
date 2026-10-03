// 서울특별시 — 지역 데이터
// 공식 자료로 확인한 내용만 적어요. 확인하지 못한 값은 비워 두면 화면에 '공식 안내 확인 필요'로 표시돼요.
// 내용을 고치면 verifiedAt(및 해당 sources 항목)을 함께 갱신하세요.

registerRegion({
  id: 'seoul',
  short: '서울',
  name: '서울특별시',
  office: '서울특별시교육청',
  officeUrl: 'https://www.sen.go.kr',
  basis: '「서울특별시교육청 교육활동보호 매뉴얼(2026 개정판)」·「2026 서울 교육활동보호 시행계획」',
  verifiedAt: '2026-10-03',
  // 서울특별시 자치구 수
  expectedAreas: 25,
  sources: [
    { title: '서울특별시교육청 교육활동보호 매뉴얼(2026 개정판) — 초등교육과 게시(2026. 3. 6.)', url: 'https://buseo.sen.go.kr/buseo/bu12/user/bbs/BD_selectBbs.do?q_bbsSn=1266&q_bbsDocNo=20260306151914833', verifiedAt: '2026-10-03', region: 'seoul', uses: ['guide', 'procedure', 'care', 'support'] },
    { title: '교육활동보호 매뉴얼(2026 개정판)·2026 서울 교육활동보호 시행계획(안내용) — 성동광진교육지원청 게시', url: 'https://sdgjedu.sen.go.kr/CMS/admserv/admserv06/admserv0608/admserv060801/1354617_6010.html', verifiedAt: '2026-09-24', region: 'seoul', uses: ['guide', 'support'] },
    { title: '시·도 교육활동보호센터 연락처 — 한국교육개발원 교원 지원 포털', url: 'https://forteacher.kedi.re.kr/web/mapBoard/list.do?mId=40', verifiedAt: '2026-09-24', region: 'seoul', uses: ['support'] },
    { title: '서울SEM119 갈등조정단 ‘봄’ 출범 — 서울특별시교육청 보도자료(2026. 2. 20.)', url: 'https://enews.sen.go.kr/news/view.do?bbsSn=190744&step1=3&step2=1', verifiedAt: '2026-10-03', region: 'seoul', uses: ['procedure', 'support'] },
    { title: '지방교육자치에 관한 법률 시행령 부칙(대통령령 제36292호) 제2조 — 조례 제정 전까지 종전 [별표 2] 관할 적용', url: 'https://www.law.go.kr/법령/지방교육자치에관한법률시행령', verifiedAt: '2026-09-24', region: 'seoul', uses: ['finder'] },
    { title: '종전 [별표 2] 교육지원청의 명칭·위치 및 관할구역(2023. 6. 27. 개정)', url: 'https://www.law.go.kr/LSW/flDownload.do?flSeq=129700305&bylClsCd=110201', verifiedAt: '2026-09-24', region: 'seoul', uses: ['finder'] },
    { title: '서울특별시학교안전공제회 — 교육활동 침해 피해교원 보호조치 비용 지원(심리상담 신청 문의)', url: 'https://www.ssia.or.kr/teacher/page4.php', verifiedAt: '2026-10-03', region: 'seoul', uses: ['procedure', 'support'] },
    { title: '서울특별시학교안전공제회 — 소진교원 심리상담 비용 지원(상담 신청·비용 청구 문의)', url: 'https://www.ssia.or.kr/teacher/page7.php', verifiedAt: '2026-10-03', region: 'seoul', uses: ['support'] },
    // 2026-10-03 추가: 교원안심공제 항목별 안내(공제회 현재 안내)
    { title: '서울특별시학교안전공제회 — 교원위험대처 보호서비스(경호) 지원', url: 'https://www.ssia.or.kr/teacher/page5.php', verifiedAt: '2026-10-03', region: 'seoul', uses: ['procedure', 'support'] },
    { title: '서울특별시학교안전공제회 — 교원 소송 ‘초기대응 플랜’ 서비스 지원', url: 'https://www.ssia.or.kr/teacher/page3.php', verifiedAt: '2026-10-03', region: 'seoul', uses: ['procedure', 'support'] },
    { title: '서울특별시학교안전공제회 — 교육활동 중 배상책임 지원', url: 'https://www.ssia.or.kr/teacher/page8.php', verifiedAt: '2026-10-03', region: 'seoul', uses: ['procedure', 'support'] },
    { title: '서울특별시학교안전공제회 — 교육활동 침해로 인한 재산상 피해 비용 지원', url: 'https://www.ssia.or.kr/teacher/page9.php', verifiedAt: '2026-10-03', region: 'seoul', uses: ['procedure', 'support'] }
  ],

  // 02-1395: SEM119 대표전화(매뉴얼 p.93). ARS 세부 메뉴는 공식 자료에 없어 menu를 두지 않아요.
  hot: '02-1395',
  hotName: '서울 SEM119 대표전화',
  hotSummary: '교육활동보호 긴급지원팀 SEM119가 교육활동 침해 대응, 법률·심리 지원, 갈등 조정을 연결해요. 운영 시간 09:00~18:00, 카카오톡 채널은 24시간이에요.',
  menuNote: '교육지원청별 SEM119 번호와 카카오톡 채널로도 신청할 수 있어요.',
  // 지원 찾기 '지역 지원 허브'의 바로 이용하기(시·도교육청 홈페이지는 officeUrl로 자동 추가)
  links: [
    { type: 'kakao', label: 'SEM119 카카오톡 상담', url: 'https://pf.kakao.com/_akHxmG' },
    { type: 'guide', label: '2026 교육활동보호 매뉴얼', url: 'https://buseo.sen.go.kr/buseo/bu12/user/bbs/BD_selectBbs.do?q_bbsSn=1266&q_bbsDocNo=20260306151914833' }
  ],

  // SOS(학교민원 전담 지원 조직)는 서울 공식 명칭을 확인하지 못해 비워 두었어요 → 중립 문구로 표시
  terms: {
    HOT: '02-1395', HOT1: '02-1395', HOT2: '02-1395',
    OFFICER: '교육활동 보호 업무 담당자',
    LEGAL: '교육활동보호 전담변호사·서울교육활동보호법률지원단',
    MUTUAL: '서울특별시학교안전공제회',
    MEDIATE: '서울SEM119 갈등조정단 ‘봄’'
  },

  // 11개 교육지원청(종전 시행령 [별표 2]). 연락처는 교육지원청별 SEM119 번호(매뉴얼 p.93, 09:00~18:00)
  offices: [
    { name: '동부교육지원청', areas: ['동대문구', '중랑구'], contact: 'SEM119 02-2210-0406', url: 'https://dbedu.sen.go.kr' },
    { name: '서부교육지원청', areas: ['은평구', '서대문구', '마포구'], contact: 'SEM119 02-390-2211', url: 'https://sbedu.sen.go.kr' },
    { name: '남부교육지원청', areas: ['구로구', '금천구', '영등포구'], contact: 'SEM119 02-2165-2182', url: 'https://nbedu.sen.go.kr' },
    { name: '북부교육지원청', areas: ['노원구', '도봉구'], contact: 'SEM119 02-3499-6899', url: 'https://bbedu.sen.go.kr' },
    { name: '중부교육지원청', areas: ['종로구', '중구', '용산구'], contact: 'SEM119 02-708-6683', url: 'https://jbedu.sen.go.kr' },
    { name: '강동송파교육지원청', areas: ['강동구', '송파구'], contact: 'SEM119 02-3434-4458', url: 'https://gdspedu.sen.go.kr' },
    { name: '강서양천교육지원청', areas: ['강서구', '양천구'], contact: 'SEM119 02-2600-0897', url: 'https://gsycedu.sen.go.kr' },
    { name: '강남서초교육지원청', areas: ['강남구', '서초구'], contact: 'SEM119 02-3015-3426', url: 'https://gnscedu.sen.go.kr', guideUrl: 'https://gnscedu.sen.go.kr/CMS/openedu/openedu13/openedu131/openedu1312/index.html' },
    { name: '동작관악교육지원청', areas: ['동작구', '관악구'], contact: 'SEM119 02-810-1702', url: 'https://dgedu.sen.go.kr' },
    { name: '성동광진교육지원청', areas: ['성동구', '광진구'], contact: 'SEM119 02-2286-3754', url: 'https://sdgjedu.sen.go.kr', guideUrl: 'https://sdgjedu.sen.go.kr/CMS/admserv/admserv06/admserv0608/admserv060801/index.html' },
    { name: '성북강북교육지원청', areas: ['성북구', '강북구'], contact: 'SEM119 02-944-9395', url: 'https://sbgbedu.sen.go.kr' }
  ].map(o => ({ ...o, hours: 'SEM119 09:00~18:00' })),

  // 홈 ‘놓치기 쉬운 권리·지원’ 카드에 붙는 서울 한 줄(HOME_HIGHLIGHTS id). 숫자는 대상·조건과 함께 써요
  highlights: {
    'special-leave': '사용 시기 조정은 사안발생보고서 접수 후 21일 이내까지',
    transfer: '정기전보 시기에 비정기 전보를 신청할 수 있어요'
  },

  // 회복·보호 제도(BENEFITS id)의 서울 기준. 공통 문장에 섞지 않고 ‘서울 기준’ 상자로 따로 보여 줘요(문서 쪽수는 인쇄 쪽 기준)
  // 상담·치료·법률·공제·경호 같은 지원의 지역 세부는 programs(지원 찾기)에만 둬요
  benefits: {
    'transfer': {
      program: '교육활동 침해로 인한 비정기 전보',
      who: '교육활동 침해 피해 교원(학교장이 전보 내신). 유·초등은 현임교 1년 미만이라도 교권 보호 등을 위해 교육상 불가피한 교사, 중등은 교권보호위원회 심의 결과 교권을 침해당했거나 침해가 우려되는 교사(교육(지원)청 별도 심의)',
      when: '정기전보 시기에 비정기 전보를 신청할 수 있어요.',
      apply: '학교장에게 희망을 알리면 학교장이 서울특별시교육청 전보 절차·요건에 따라 전보 내신',
      source: 0
    },
    'special-leave': {
      when: '사안 발생(인지) 직후. 불가피하면 학교장이 교권보호위원회 개최 전(사안발생보고서 접수 후 21일 이내)까지 사용 시기·방법을 달리해 승인할 수 있어요.',
      missed: ['교권보호위원회를 열지 않았다면 교육지원청 접수와 사안 종결 공문이 필요해요(매뉴얼 51쪽).'],
      source: 0
    }
  },

  // source: sources 배열의 번호(둘 이상이면 배열). amount·eligibility·timing·documents·caution은 지원 찾기 ‘신청 전 확인할 것’에 보여요
  programs: [
    { area: '신고·심의', status: '현재 시행 중', t: '교육활동 침해 신고·지역교권보호위원회 심의', sum: '학교 보고를 거쳐 소속 교육지원청이 사안을 조사하고, 지역교권보호위원회가 침해 여부와 조치를 심의해요.', target: '교육활동 침해 피해 교원', org: '소속 교육지원청', apply: '학교 보고 → 교육지원청 보고', documents: '침해 신고서, 사안 발생보고서, 증거', timing: '사안 접수 후 24시간 이내 보고, 사안 보고 후 5일 이내 발생보고서(주말·공휴일 제외). 위원회는 사안발생보고서 접수 후 21일 이내 개최', contact: '02-1395', source: 0, channels: [{ type: 'guide', label: '교육활동보호 매뉴얼', url: 'https://buseo.sen.go.kr/buseo/bu12/user/bbs/BD_selectBbs.do?q_bbsSn=1266&q_bbsDocNo=20260306151914833' }] },
    { area: '긴급 지원', status: '현재 시행 중', t: 'SEM119 교육활동보호 긴급지원팀', sum: '교육지원청 학교생활교육과에서 운영해요. 조정·법률·상담·든든·안심 SEM이 갈등 조정, 법률 자문, 심리 상담, 교실 안정화 인력 지원 등을 맡아요.', eligibility: '교육활동 침해 또는 아동학대 신고 관련 도움이 필요한 교원·학교. 교육활동 침해 신고를 하지 않았어도 신청할 수 있어요', timing: '전화 09:00~18:00, 카카오톡 채널 24시간', caution: '긴급교실 안심SEM은 학교가 신청하면 지원 인력이 주 15시간씩 4주 투입돼요.', target: '교육활동 침해 또는 아동학대 신고 관련 도움이 필요한 교원·학교', org: '소속 교육지원청 학교생활교육과', apply: '02-1395, 교육지원청별 SEM119, <a href="https://pf.kakao.com/_akHxmG" target="_blank" rel="noopener">카카오톡 채널</a>(24시간)', contact: '02-1395', source: 0, channels: [{ type: 'kakao', url: 'https://pf.kakao.com/_akHxmG' }, { type: 'guide', label: '공식 안내(보도자료)', url: 'https://enews.sen.go.kr/news/view.do?bbsSn=184324&step1=3&step2=1' }] },
    { area: ['법률 상담·자문', '수사·소송 지원'], status: '현재 시행 중', t: '교육활동보호 전담변호사·법률지원단', sum: '교육지원청별 변호사(11명), 1교 1변호사제(우리학교변호사), 서울교육활동보호법률지원단, ‘선생님 동행 100인의 변호인단’이 법률 상담과 대응을 지원해요.', amount: '100인의 변호인단(피신고 교원): 수사 단계까지 최대 360만 원, 소송 시 기지원액 포함 660만 원 이내(교원 부담 없음)', eligibility: '100인의 변호인단은 아동학대·직무유기 등으로 피신고된 교원(교장·교감·교육전문직원 포함)', documents: '100인의 변호인단: 학교 공문 신청', caution: '유죄가 확정되면 지원금을 돌려받아요. 법률지원단 상담은 별도 신청 절차 없이 변호사에게 직접 연락해요(매뉴얼 98쪽 명단). 1교 1변호사는 학교 자율 계약이에요. 100인의 변호인단(수사 단계 최대 360만 원)과 공제 소송비(수사 단계 330만 원)는 서로 다른 제도예요.', target: '법률 지원이 필요한 교원', org: '서울특별시교육청·소속 교육지원청', apply: '02-1395(SEM119) 또는 소속 교육지원청', contact: '02-1395', source: [0, 1], channels: [{ type: 'kakao', url: 'https://pf.kakao.com/_akHxmG' }, { type: 'guide', label: '법률지원 안내', url: 'https://buseo.sen.go.kr/buseo/bu12/user/bbs/BD_selectBbs.do?q_bbsSn=1266&q_bbsDocNo=20250527150818109' }] },
    { area: '심리상담', status: '현재 시행 중', t: '교원 심리상담(마음선·마음생·마음동·마음행)', sum: '소진 예방부터 침해 피해 회복, 위기 개입까지 단계별 개인 심리상담과 교원 마음돌봄 집단상담을 운영해요(2026. 3.~2027. 2.).', amount: '마음선 8회 · 마음생 최대 13회 · 마음동 20회(1년, 1년 연장 가능) · 마음행 추가 5회(필요 시 3회) · 저경력교원 10회', eligibility: '마음선: 정규·기간제 교원 / 마음생: 학교장 요청 시(침해 피해 시간강사 포함) / 마음동: 위원회 심의·분쟁조정 합의로 피해 인정 교원 / 마음행: 자살위험 징후 교원', timing: '마음동은 조치결정 통지 후 1개월 이내 신청·상담 시작', documents: '마음생: 상담신청서, 학교장 의견서, 개인정보 동의서 / 마음동: 상담신청서, 조치결정 통지서(교원용), 동의서', caution: '심의 전에 마음선·마음생을 받던 교원은 조치결정 통지서만 공문으로 내면 마음동으로 바꿔 적용돼요. 상담 비용은 상담기관이 공제회로 청구해요. 마음선은 소속 학교에 상담 여부가 알려지지 않아요.', target: '심리 지원이 필요한 교원', org: '서울특별시교육청 교육활동보호센터', apply: '마음선: QR·교육활동보호 카카오채널 / 마음생·마음동: 공문(본청 초등교육과)', contact: '02-399-9707, 02-399-9709, 02-399-9710', contacts: [{ label: '상담·안내(교육활동보호센터)', value: '02-399-9707, 02-399-9709, 02-399-9710' }, { label: '심리상담 신청 문의', value: '02-6033-5824, 02-6033-5825, 02-6033-5826', call: '심리상담 신청 문의' }, { label: '비용 청구 문의(학교안전공제회)', value: '1670-4972' }], source: [0, 7], channels: [{ type: 'guide', label: '상담 신청 안내', url: 'https://www.ssia.or.kr/teacher/page7.php' }, { type: 'guide', label: '교원안심공제 안내', url: 'https://www.ssia.or.kr/teacher/page4.php' }] },
    { area: '치료·비용', status: '현재 시행 중', t: '보호조치 비용(치료비·약제비)', sum: '교육활동 침해로 생긴 정신건강의학과 등 치료·요양 비용과 처방 약제비를 서울특별시학교안전공제회에 청구해요.', amount: '마음생 30만 원 범위 · 마음동(위원회 심의 인정) 실비 · 마음동(분쟁조정 인정) 250만 원 한도 실비 · 마음행 초기치료비 50만 원 범위', eligibility: '마음생·마음동·마음행 대상 교원(위 심리상담 카드 참고)', timing: '사안이 발생한 날부터 3년 이내. 치료가 끝난 뒤 청구하고 나눠서 여러 번 청구할 수 있어요', documents: '공제급여 청구서, 진료비 계산서·영수증, 개인정보 동의서, 조치결정 통지서 또는 분쟁조정 합의서(마음생은 학교장 의견서·전문의 소견서, 마음행은 위기지원 승인서)', caution: '약제비는 처방전에 따른 경우만, 한방 치료는 국민건강보험법에서 인정하는 경우만 인정돼요.', target: '교육활동 침해 피해 교원', org: '서울특별시학교안전공제회', apply: '청구서와 서류를 이메일(safeseoul_t@ssif.or.kr)로 제출', contact: '1670-4972', source: [0, 6], channels: [{ type: 'guide', label: '보호조치 비용 안내', url: 'https://www.ssia.or.kr/teacher/page4.php' }] },
    { area: '교원보호공제', status: '현재 시행 중', t: '교원보호(안심)공제', sum: '교육청이 비용을 전액 부담하는 교원보호공제예요. 소송비, 손해배상, 재산 피해, 위험대처 경호, 분쟁조정·예방 컨설팅을 지원해요.', amount: '소송비 민·형사 각 심급별 최대 660만 원(수사 단계 종결 330만 원) · 손해배상 확정판결 1사고당 2억 원·소 제기 전 합의 1억 원 · 재산 피해 1사고당 250만 원', eligibility: '국·공·사립 유·초·중·고·특수·각종학교와 학력인정 평생교육시설 교원(기간제 포함). 시간강사는 일부만', timing: '교육활동 침해 사안이 발생한 날부터 3년 이내 청구', documents: '소송비(초기대응 플랜): 청구서, 소장 등 소송자료, 변호사 선임계약서, 통장 사본, 동의서, 재직증명서 / 재산 피해: 학교장 의견서 또는 조치 통지서', caution: '교원 개인 부담금은 없어요. 유죄·고의·중과실이 확정되면 지원하지 않고(과실치사·상 제외), 소송비는 실제 지출액을 넘지 않아요. 판결 전 선지원은 자동이 아니에요.', target: '서울 교원', org: '서울특별시학교안전공제회', apply: '1670-4972 문의 후 항목별 서류로 청구', contact: '1670-4972', source: [0, 9, 10, 11], channels: [{ type: 'guide', label: '교원안심공제 안내', url: 'https://www.ssia.or.kr/teacher/page1.php' }, { type: 'guide', label: '소송 초기대응 플랜', url: 'https://www.ssia.or.kr/teacher/page3.php' }] },
    { area: '경호·신변 보호', status: '현재 시행 중', t: '교원위험대처 보호서비스(경호)', sum: '교원안심공제로 신변 위협을 받는 교원에게 출·퇴근을 포함해 경호를 지원해요. 대중교통을 이용할 때도 밀착 경호해요.', amount: '1사고당 최대 20일(2인 출동 시 10일)', timing: '최소 2일 전 사전 신청 필수', caution: '사전 신청이 필요해 당장 위험하면 112 신고가 먼저예요.', target: '신변 위협을 받는 교원', org: '서울특별시학교안전공제회', apply: '1670-4972로 사전 신청', contact: '1670-4972', source: [8, 0], channels: [{ type: 'guide', label: '경호 서비스 안내', url: 'https://www.ssia.or.kr/teacher/page5.php' }] },
    { area: '갈등 중재', status: '현재 시행 중', t: '서울SEM119 갈등조정단 ‘봄’', sum: '교육·조정 전문가 46명이 교원과 학생·보호자 사이 갈등의 조정을 지원해요. 학교가 요청하면 갈등 초기 단계부터 현장에 투입돼요.', eligibility: '교원과 관련 당사자(보호자·학생 등)', timing: '위촉 기간 2026. 2. 20.~2027. 2. 28. 교권보호위원회와 병행할 수 있어요', caution: '사전모임 → 본모임 → 사후모임 순서로 진행돼요.', target: '갈등 조정이 필요한 교원·학교', org: '서울특별시교육청(SEM119)', apply: '학교 요청 → 소속 교육지원청 SEM119(02-1395)', contact: '02-1395', source: [3, 0], channels: [{ type: 'guide', label: '공식 안내(보도자료)', url: 'https://enews.sen.go.kr/news/view.do?bbsSn=190744&step1=3&step2=1' }] },
    { area: '학교민원·특이민원 지원', status: '현재 시행 중', t: '학교민원 공식 창구 단일화', sum: '학교민원은 학교 대표번호와 학교가 지정한 온라인 창구로 받고, 교원이 원하지 않는 개인 연락처·SNS는 노출하지 않아요.', target: '민원 응대 부담이 있는 교원', org: '소속 학교', source: 1 }
  ],

  // 교육지원청 카드는 offices에서 자동으로 만들어져요. 학교 내 기관·112는 공통 데이터에 있어요.
  orgs: [
    { cat: '교육청', name: 'SEM119 교육활동보호 긴급지원팀', region: '각 교육지원청 학교생활교육과', role: '교육활동 침해 긴급 지원, 법률·상담·갈등 조정 연계', contact: '02-1395 · 교육지원청별 SEM119', hours: '09:00~18:00(카카오톡 채널 24시간)' },
    { cat: '교육청', name: '서울특별시교육청 교육활동보호센터', region: '서울 전역', role: '교원 심리상담(마음선·마음생·마음동·마음행)', contact: '02-399-9707, 02-399-9709, 02-399-9710' },
    { cat: '법률', name: '서울교육활동보호법률지원단·교육활동보호 전담변호사', region: '서울 전역(전담변호사는 교육지원청별)', role: '법률 상담·자문, 소송·수사 대응 지원', contact: '02-1395' },
    { cat: '공제·민원', name: '서울특별시학교안전공제회', region: '서울 전역', role: '교원보호(안심)공제', contact: '1670-4972' },
    { cat: '공제·민원', name: '서울SEM119 갈등조정단 ‘봄’', region: '서울 전역', role: '교원·학생·보호자 간 갈등 조정', contact: '02-1395' }
  ]
});
