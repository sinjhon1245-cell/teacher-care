// 서울·경기·인천 정보 깊이(gap) — 내부 audit 데이터. 사이트(index.html)는 이 파일을 읽지 않아요.
// 이 파일 한곳에서만 고쳐요. docs/maintenance-report.md의 ‘지역별 gap’ 표와 ‘다음 점검 항목’이 여기서 만들어져요.
// node tools/check-data.js가 모든 지역 × 영역이 있는지, 상태 값과 근거(evidence)가 실제 데이터를 가리키는지 확인해요.
//
// status   complete(충분) · partial(부분적) · missing(부족) · unverified(공식자료 미확인)
// evidence 근거가 되는 지역 데이터: 지원 항목 이름(programs[].t 그대로) 또는 'benefits:<BENEFITS id>'(회복·보호 지역 기준)
// note     지금 상태의 이유(무엇이 있고 무엇이 없는지)
// todo     complete가 아니면 필수: 다음에 확인할 일(공식 자료로 확인될 때만 데이터에 넣어요. 다른 지역 값을 옮겨 적지 않아요)
//
// 판정 기준
//   complete   무엇을·누구에게·신청 경로(연락처·링크)·해당하면 한도·기간이 모두 있고 근거 출처가 연결됨
//   partial    제도와 출처는 있지만 대상·신청 경로·한도·절차 중 일부가 비어 있음
//   missing    제도가 있다는 사실 정도만 있고 교사가 바로 행동할 정보가 거의 없음
//   unverified 2026 공식 자료에서 그 지역의 해당 제도를 확인하지 못함

module.exports = {
  checkedAt: '2026-10-04',
  statuses: { complete: '충분', partial: '부분적', missing: '부족', unverified: '공식자료 미확인' },
  areas: [
    { id: 'counseling', label: '상담·회복' },
    { id: 'treatment', label: '치료·비용' },
    { id: 'legal', label: '법률' },
    { id: 'litigation', label: '수사·소송' },
    { id: 'mutual', label: '교원보호공제' },
    { id: 'safety', label: '안전·경호' },
    { id: 'complaints', label: '민원 대응' },
    { id: 'mediation', label: '갈등조정' },
    { id: 'transfer', label: '전보·근무환경' },
    { id: 'recovery', label: '치유·복귀' }
  ],
  regions: {
    seoul: {
      counseling: { status: 'complete', evidence: ['교원 심리상담(마음선·마음생·마음동·마음행)'], note: '마음선·마음생·마음동·마음행 회기·대상·신청 시기' },
      treatment: { status: 'complete', evidence: ['보호조치 비용(치료비·약제비)'], note: '유형별 한도·청구 기한(3년)·서류' },
      legal: { status: 'complete', evidence: ['교육활동보호 전담변호사·법률지원단'], note: '교육지원청 변호사 11명, 1교 1변호사, 법률지원단' },
      litigation: { status: 'complete', evidence: ['교육활동보호 전담변호사·법률지원단', '교원보호(안심)공제'], note: '100인의 변호인단(수사 단계 360만 원), 공제 심급별 최대 660만 원' },
      mutual: { status: 'complete', evidence: ['교원보호(안심)공제'], note: '소송·배상·재산 피해 한도, 대상, 청구 기한' },
      safety: { status: 'partial', evidence: ['교원위험대처 보호서비스(경호)'], note: '기간(20일, 2인 10일)·사전 신청은 있지만 대상 조건·신청 서류가 없어요', todo: '서울 경호 서비스 대상 조건·신청 서류 확인(서울특별시학교안전공제회 안내)' },
      complaints: { status: 'partial', evidence: ['학교민원 공식 창구 단일화'], note: '공식 창구 단일화 원칙만 있고 교원이 쓸 신청·연락 경로가 없어요', todo: '서울 학교민원 지원(교육(지원)청) 연락 경로 확인' },
      mediation: { status: 'complete', evidence: ['서울SEM119 갈등조정단 ‘봄’'], note: '갈등조정단 규모·대상·위촉 기간·신청' },
      transfer: { status: 'complete', evidence: ['benefits:transfer'], note: '유·초등/중등 요건, 신청 시기' },
      recovery: { status: 'partial', evidence: ['교원 심리상담(마음선·마음생·마음동·마음행)'], note: '집단상담(마음돌봄)이 상담 카드 안에만 있고 별도 일정·신청 방법이 없어요', todo: '서울 치유·회복(집단상담) 프로그램 일정·신청 방법 확인' }
    },
    gyeonggi: {
      counseling: { status: 'complete', evidence: ['교원 마음건강 지원'], note: '침해 피해 10회기, 직무 스트레스 5회기, 대상' },
      treatment: { status: 'complete', evidence: ['보호조치 비용·교원보호공제 치료비'], note: '200만 원(1년)·공제 치료비·기간·서류' },
      legal: { status: 'complete', evidence: ['SOS! 경기교육법률지원단'], note: '법률지원단, 온라인 자문 3일 회신' },
      litigation: { status: 'complete', evidence: ['SOS! 경기교육법률지원단', '교원보호공제'], note: '수사 단계 수임료 550만 원 선지급, 공제 사고당 7천만 원' },
      mutual: { status: 'complete', evidence: ['교원보호공제'], note: '위탁 기간·한도·대상·제외 대상·심사 기간' },
      safety: { status: 'complete', evidence: ['위협대처(경호) 서비스'], note: '대상·서류·기간(20일)' },
      complaints: { status: 'partial', evidence: ['학교민원대응팀·학교민원대응지원팀'], note: '학교·교육지원청 지원팀 구조만 있고 연락 경로는 ‘소속 교육지원청’이에요', todo: '경기 교육지원청 학교민원대응지원팀 연락 경로 확인' },
      mediation: { status: 'complete', evidence: ['교원보호공제 분쟁조정 서비스·화해중재단'], note: '분쟁조정·화해중재단, 동의 조건·신청' },
      transfer: { status: 'partial', evidence: ['benefits:transfer'], note: '비정기전보 요건이 교육지원청 세부기준마다 달라 개별 요건이 없어요', todo: '경기 교육지원청별 비정기전보 세부기준 확인' },
      recovery: { status: 'partial', evidence: ['교원 마음건강 지원'], note: '마음충전·심층치유·힐링성장 프로그램 이름만 있어요', todo: '경기 치유 프로그램(마음충전·심층치유·힐링성장) 대상·신청 방법 확인' }
    },
    incheon: {
      counseling: { status: 'complete', evidence: ['심리 상담 지원'], note: '대상·비용 범위·협약기관 조건(회기 수는 자료에 없어요)' },
      treatment: { status: 'complete', evidence: ['보호조치 비용(치료비·약제비·상담비)'], note: '300만 원(2026. 4. 30. 고시)·심사·서류·제외 항목' },
      legal: { status: 'complete', evidence: ['법률지원단·교권전담변호사'], note: '교권전담변호사·위촉변호사·1교 1변호사, 신청 링크' },
      litigation: { status: 'complete', evidence: ['아동학대 피신고 교원 지원', '교원보호공제(인천학교안전공제회)'], note: '첫 경찰 조사 변호사 동행, 공제 민·형사 소송비용' },
      mutual: { status: 'complete', evidence: ['교원보호공제(인천학교안전공제회)'], note: '약관 기간·한도·청구 방법·서류·제외 사항' },
      safety: { status: 'complete', evidence: ['교원 위협대처 경호서비스'], note: '대상·서류·기간(20일, 연장 40일)' },
      complaints: { status: 'complete', evidence: ['학교민원대응팀·학교민원 SOS 지원단'], note: '이관·SOS 지원단, 연락처·서류' },
      mediation: { status: 'complete', evidence: ['교육활동 관련 갈등중재 지원'], note: '중재지원단 절차·동의 조건·공제 분쟁조정 구분' },
      transfer: { status: 'partial', evidence: ['benefits:transfer'], note: '대상·요청 주체는 있지만 신청 시기·요건 세부가 없어요', todo: '인천 비정기 전보 신청 시기·요건 확인' },
      recovery: { status: 'partial', evidence: ['치유·회복 프로그램'], note: '별도 카드는 있지만 일정·대상별 신청 방법이 없어요', todo: '인천 치유·회복 프로그램 일정·대상별 신청 방법 확인' }
    }
  },
  // 위 10개 영역 밖이지만 함께 보는 항목
  extras: [
    { region: 'gyeonggi', label: '교육지원청 연락처(내 교육지원청 찾기)', status: 'partial', note: '교육지원청별 교권 직통 번호를 2026 공식 자료에서 확인하지 못했어요(대표 1600-8787·교육지원청 홈페이지로 안내)', todo: '경기 교육지원청별 경기교권보호지원센터 연락처 확인(공식 게시물로 확인될 때만)' }
  ]
};
