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
  verifiedAt: '2026-09-24',
  // 서울특별시 자치구 수
  expectedAreas: 25,
  sources: [
    { title: '서울특별시교육청 교육활동보호 매뉴얼(2026 개정판) — 초등교육과 게시(2026. 3. 6.)', url: 'https://buseo.sen.go.kr/buseo/bu12/user/bbs/BD_selectBbs.do?q_bbsSn=1266&q_bbsDocNo=20260306151914833', verifiedAt: '2026-09-24' },
    { title: '교육활동보호 매뉴얼(2026 개정판)·2026 서울 교육활동보호 시행계획(안내용) — 성동광진교육지원청 게시', url: 'https://sdgjedu.sen.go.kr/CMS/admserv/admserv06/admserv0608/admserv060801/1354617_6010.html', verifiedAt: '2026-09-24' },
    { title: '시·도 교육활동보호센터 연락처 — 한국교육개발원 교원 지원 포털', url: 'https://forteacher.kedi.re.kr/web/mapBoard/list.do?mId=40', verifiedAt: '2026-09-24' },
    { title: '서울SEM119 갈등조정단 ‘봄’ 출범 — 서울특별시교육청 보도자료', url: 'https://enews.sen.go.kr/news/view.do?bbsSn=190744&step1=3&step2=1', verifiedAt: '2026-09-24' },
    { title: '지방교육자치에 관한 법률 시행령 부칙(대통령령 제36292호) 제2조 — 조례 제정 전까지 종전 [별표 2] 관할 적용', url: 'https://www.law.go.kr/법령/지방교육자치에관한법률시행령', verifiedAt: '2026-09-24' },
    { title: '종전 [별표 2] 교육지원청의 명칭·위치 및 관할구역(2023. 6. 27. 개정)', url: 'https://www.law.go.kr/LSW/flDownload.do?flSeq=129700305&bylClsCd=110201', verifiedAt: '2026-09-24' }
  ],

  // 02-1395: SEM119 대표전화(매뉴얼 p.93). ARS 세부 메뉴는 공식 자료에 없어 menu를 두지 않아요.
  hot: '02-1395',
  hotName: '서울 SEM119 대표전화',
  hotSummary: '교육활동보호 긴급지원팀 SEM119가 교육활동 침해 대응, 법률·심리 지원, 갈등 조정을 연결해요. 운영 시간 09:00~18:00, 카카오톡 채널은 24시간이에요.',
  menuNote: '교육지원청별 SEM119 번호와 카카오톡 채널로도 신청할 수 있어요.',

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

  // source: sources 배열의 번호
  programs: [
    { area: '신고·심의', status: '현재 시행 중', t: '교육활동 침해 신고·지역교권보호위원회 심의', sum: '학교 보고를 거쳐 소속 교육지원청이 사안을 조사하고, 지역교권보호위원회가 침해 여부와 조치를 심의해요.', target: '교육활동 침해 피해 교원', org: '소속 교육지원청', apply: '학교 보고 → 교육지원청 보고', docs: '침해 신고서, 사안 발생보고서, 증거', deadline: '사안 접수 후 24시간 이내 보고, 사안 보고 후 5일 이내 발생보고서(주말·공휴일 제외)', contact: '02-1395', source: 0, channels: [{ type: 'guide', label: '교육활동보호 매뉴얼', url: 'https://buseo.sen.go.kr/buseo/bu12/user/bbs/BD_selectBbs.do?q_bbsSn=1266&q_bbsDocNo=20260306151914833' }] },
    { area: '긴급 지원', status: '현재 시행 중', t: 'SEM119 교육활동보호 긴급지원팀', sum: '교육지원청 학교생활교육과에서 운영해요. 조정·법률·상담·든든·안심 SEM이 갈등 조정, 법률 자문, 심리 상담, 교실 안정화 인력 지원 등을 맡아요.', target: '교육활동 침해 또는 아동학대 신고 관련 도움이 필요한 교원·학교', org: '소속 교육지원청 학교생활교육과', apply: '02-1395, 교육지원청별 SEM119, <a href="https://pf.kakao.com/_akHxmG" target="_blank" rel="noopener">카카오톡 채널</a>(24시간)', deadline: '전화 09:00~18:00', contact: '02-1395', source: 0, channels: [{ type: 'kakao', url: 'https://pf.kakao.com/_akHxmG' }, { type: 'guide', label: '공식 안내(보도자료)', url: 'https://enews.sen.go.kr/news/view.do?bbsSn=184324&step1=3&step2=1' }] },
    { area: '법률 상담·자문', status: '현재 시행 중', t: '교육활동보호 전담변호사·법률지원단', sum: '교육지원청별 교육활동보호 전담변호사, 1교 1변호사제(우리학교변호사), 서울교육활동보호법률지원단, ‘선생님 동행 100인의 변호인단’이 법률 상담과 대응을 지원해요.', target: '법률 지원이 필요한 교원', org: '서울특별시교육청·소속 교육지원청', apply: '02-1395(SEM119) 또는 소속 교육지원청', contact: '02-1395', source: 0, channels: [{ type: 'kakao', url: 'https://pf.kakao.com/_akHxmG' }, { type: 'guide', label: '법률지원 안내', url: 'https://buseo.sen.go.kr/buseo/bu12/user/bbs/BD_selectBbs.do?q_bbsSn=1266&q_bbsDocNo=20250527150818109' }] },
    { area: '심리상담·치료', status: '현재 시행 중', t: '교원 심리상담(마음선·마음생·마음동·마음행)', sum: '개인 심리상담 마음선(8회)·마음생(13회)·마음동(20회), 마음행(추가 5회, 필요 시 3회 연장)과 교원 마음돌봄 집단상담을 운영해요.', target: '심리 지원이 필요한 교원', org: '서울특별시교육청 교육활동보호센터', contact: '02-399-9707, 02-399-9709, 02-399-9710', source: 0, channels: [{ type: 'guide', label: '매뉴얼(상담 안내)', url: 'https://buseo.sen.go.kr/buseo/bu12/user/bbs/BD_selectBbs.do?q_bbsSn=1266&q_bbsDocNo=20260306151914833' }] },
    { area: '교원보호공제', status: '현재 시행 중', t: '교원보호(안심)공제', sum: '교육청이 비용을 전액 부담하는 교원보호공제예요. 보장 범위와 청구 방법은 공제회 안내를 확인하세요.', target: '서울 교원', org: '서울특별시학교안전공제회', contact: '1670-4972', source: 0, channels: [{ type: 'kakao', url: 'https://pf.kakao.com/_akHxmG' }, { type: 'guide', label: '교원안심공제 안내', url: 'https://www.ssia.or.kr/teacher/page1.php' }] },
    { area: '갈등 중재', status: '현재 시행 중', t: '서울SEM119 갈등조정단 ‘봄’', sum: '교원과 학생·보호자 사이 갈등의 조정을 지원해요. 2026. 2. 20.부터 2027. 2. 28.까지 운영해요.', target: '갈등 조정이 필요한 교원·학교', org: '서울특별시교육청(SEM119)', apply: 'SEM119(02-1395)로 신청', contact: '02-1395', source: 3, channels: [{ type: 'guide', label: '공식 안내(보도자료)', url: 'https://enews.sen.go.kr/news/view.do?bbsSn=190744&step1=3&step2=1' }] },
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
