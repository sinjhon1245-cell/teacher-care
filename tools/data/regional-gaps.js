// 서울·경기·인천·부산·충북·강원 정보 깊이(gap) — 내부 audit 데이터. 사이트(index.html)는 이 파일을 읽지 않아요.
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
    },
    busan: {
      counseling: { status: 'complete', evidence: ['개인 심리상담(교육활동보호센터)'], note: '기본 10회·연장 5회·전문의 6회, 대상(모든 희망 교원)·신청 경로' },
      treatment: { status: 'complete', evidence: ['치료비·심리상담비·치유비 지원'], note: '치료비·상담비·소진 치료비·치유비 한도, 청구 기한, 공문 절차, 제외 조건' },
      legal: { status: 'complete', evidence: ['교원법률지원단(법률상담·변호사 선임)'], note: '법률상담 건당 20만 원(12회, 총 200만 원), 사전 논의 조건, 온라인 신청' },
      litigation: { status: 'complete', evidence: ['교원법률지원단(법률상담·변호사 선임)', '교원보호공제(부산광역시학교안전공제회 위탁)'], note: '형사 심급별 1,000만 원·수사 종결 330만 원·고소 330만 원·민사 소송물가액별, 환수 조건' },
      mutual: { status: 'complete', evidence: ['교원보호공제(부산광역시학교안전공제회 위탁)'], note: '2026 표준약관 운영기간·보장 범위·한도·청구 서류·시효(3년)' },
      safety: { status: 'complete', evidence: ['위협 대처 보호 서비스(긴급 경호)'], note: '대상·서류·기간(20일, 2인 10일)·제외 비용' },
      complaints: { status: 'partial', evidence: ['학교민원대응팀·학교민원대응지원팀·악성민원 법률 대응'], note: '단계별 대응과 민원 해결 요청 게시판은 있지만 교육지원청 학교민원대응지원팀 연락처가 없어요', todo: '부산 교육지원청별 학교민원대응지원팀 연락 경로 확인(공식 게시물로 확인될 때만)' },
      mediation: { status: 'complete', evidence: ['분쟁조정 서비스(교원보호공제)'], note: '공제 분쟁조정 범위·제외·서류, 지역교권보호위원회 분쟁조정과 구분' },
      transfer: { status: 'partial', evidence: ['benefits:transfer'], note: '긴급 전보가 교육(지원)청 심의로 결정된다는 것만 있고 신청 시기·요건이 없어요', todo: '부산 피해 교원 긴급 전보 신청 시기·요건 확인' },
      recovery: { status: 'partial', evidence: ['치유·회복 프로그램'], note: '프로그램 목록·시기는 있지만 회차별 일정·신청 방법은 공문 안내로만 나와요', todo: '부산 치유·회복 프로그램 2026 하반기 일정·신청 방법 확인' }
    },
    chungbuk: {
      counseling: { status: 'complete', evidence: ['마음클리닉(교원 심리상담·심리치료)'], note: '기본 10회기·재직 중 3회, 대상(기간제·휴직 포함)·신청 경로·협력기관 부재지역 지원' },
      treatment: { status: 'complete', evidence: ['피해 교원 치료비·심리상담비(교원보호공제)'], note: '치료비 100만 원·상담비 200만 원 한도, 대상·서류·중복 제한. 앞선 계획의 낮은 금액과 구분' },
      legal: { status: 'complete', evidence: ['교육활동 보호 법률지원단(교권전담 변호사·권역별 위촉 변호사)'], note: '1인당 1사건 연 100만 원(중대 200만 원), 대상·신청 경로(043-290-2255)' },
      litigation: { status: 'complete', evidence: ['교원보호공제(충청북도학교안전공제회)', '아동학대 신고 대응(교육감 의견서·조사 동행)'], note: '심급별 660만 원·수사 단계 330만(이의신청 440만) 원·방어비용 50만 원, 교육감 의견서 기한, 환수 조건' },
      mutual: { status: 'complete', evidence: ['교원보호공제(충청북도학교안전공제회)'], note: '2026 공제기간·가입대상·보장 범위·한도·청구 절차·보상 문의처' },
      safety: { status: 'complete', evidence: ['위협 대처 보호 서비스(긴급 경호·차량 지원)'], note: '대상·기간(20일, 연장 40일)·신청서·제외 비용' },
      complaints: { status: 'partial', evidence: ['학교민원대응팀·학교민원대응지원팀·현장지원119'], note: '단계별 대응·현장지원119·기관 고발은 있지만 교육지원청 학교민원대응지원팀 연락처가 없어요', todo: '충북 교육지원청별 학교민원대응지원팀 연락 경로 확인(공식 게시물로 확인될 때만)' },
      mediation: { status: 'partial', evidence: ['갈등조정 서비스(교원보호공제)'], note: '내용·한도(없음)·신청 창구는 있지만 신청 서류·진행 절차가 없어요', todo: '충북 교원보호공제 갈등조정 서비스 신청 서류·진행 절차 확인' },
      transfer: { status: 'partial', evidence: ['benefits:transfer'], note: '학교장 요청 비정기 전보 근거만 있고 신청 시기·요건 세부가 없어요', todo: '충북 교원 인사관리기준의 교권 보호 비정기 전보 시기·요건 확인' },
      recovery: { status: 'partial', evidence: ['마음건강 심리지원 프로그램'], note: '프로그램 종류·회기·신청 경로는 있지만 회차별 일정이 없어요', todo: '충북 마음건강 심리지원 프로그램 2026 하반기 일정 확인' }
    },
    gangwon: {
      counseling: { status: 'complete', evidence: ['교권전담 상담사 긴급 상담·개인(심층) 상담'], note: '긴급 상담 경로(033-258-5344), 개인 상담 기본 연 10회기·대상(휴직자 포함)·제한(3년 연속 불가)' },
      treatment: { status: 'complete', evidence: ['마음 건강 치료비(정신건강의학과)', '교육활동 침해 인정 교원 치료비·심리상담비(교원보호공제)'], note: '마음 건강 치료비 연 100만 원(청구 기간·서류·중복 제한), 침해 인정 교원 300만 원(2026. 5. 1. 약관)과 계획(200만 원) 차이 표시' },
      legal: { status: 'complete', evidence: ['교육활동보호센터 법률상담(교권전담 변호사)'], note: '대상 3종·신청 경로(이음톡·033-258-5343)·자문회신서' },
      litigation: { status: 'complete', evidence: ['원스톱 변호사 법률지원(경찰·지자체 조사 입회)', '교원보호공제(강원특별자치도학교안전공제회)'], note: '조사 입회 변호사비 기준·절차, 공제 형사 심급별 1,000만 원·수사 종결 500만 원·민사 소송물가액별' },
      mutual: { status: 'complete', evidence: ['교원보호공제(강원특별자치도학교안전공제회)'], note: '2026. 5. 1. 표준약관 보장 범위·한도·청구 절차·시효(3년)·면책' },
      safety: { status: 'complete', evidence: ['위협 대처 보호 서비스(긴급 경호)'], note: '대상·기간(20일, 연장 40일)·신청 서류·제외 비용' },
      complaints: { status: 'partial', evidence: ['교육활동 침해 관련 학교민원 대응(교육활동보호팀)'], note: '도교육청 담당(033-258-5342)만 있고 교육지원청 민원 지원 연락처·강원 고유 절차가 없어요(게시 매뉴얼은 교육부 전국본)', todo: '강원 교육지원청 학교민원 대응 지원 연락 경로 확인(공식 게시물로 확인될 때만)' },
      mediation: { status: 'partial', evidence: ['분쟁조정 서비스(교원보호공제)'], note: '공제 분쟁조정 범위·제외·서류는 있지만 도교육청 분쟁조정지원단의 신청 방법·대상이 없어요', todo: '강원 교육활동 침해 분쟁조정지원단 운영 방식·신청 방법 확인' },
      transfer: { status: 'unverified', note: '2026 강원 공식 자료에서 피해 교원 비정기 전보 기준을 확인하지 못했어요', todo: '강원 교육공무원 인사관리기준의 교육활동 침해 피해 교원 전보 기준 확인' },
      recovery: { status: 'partial', evidence: ['교원 치유 프로그램(집단상담·자기돌봄)'], note: '운영 횟수·형태·대상은 있지만 2026 회차별 일정·프로그램명이 확정되지 않았어요(위탁 기관 선정에 따라 변경)', todo: '강원 2026 하반기 집단상담·자기돌봄 프로그램 일정 확인' }
    }
  },
  // 위 10개 영역 밖이지만 함께 보는 항목
  extras: [
    { region: 'gyeonggi', label: '교육지원청 연락처(내 교육지원청 찾기)', status: 'partial', note: '교육지원청별 교권 직통 번호를 2026 공식 자료에서 확인하지 못했어요(대표 1600-8787·교육지원청 홈페이지로 안내)', todo: '경기 교육지원청별 경기교권보호지원센터 연락처 확인(공식 게시물로 확인될 때만)' },
    { region: 'gyeonggi', label: '도교육청 보호조치 비용과 공제 치료비의 관계', status: 'unverified', note: '길라잡이의 도교육청 보호조치 비용(1인당 200만 원)과 공제 치료비(200만 원)가 별개 한도인지 같은 비용인지 공식 자료에서 확인하지 못했어요(카드에 합산하지 말라고 안내)', todo: '경기도교육청·경기도학교안전공제회 공식 안내에서 두 한도의 관계(별개·중복 청구 가능 여부) 확인' },
    { region: 'seoul', label: '교육지원청 SEM119 번호(북부·성동광진)', status: 'partial', note: '9곳은 매뉴얼과 교육지원청 업무분장이 일치해요. 북부(02-3499-6899)는 업무분장상 학교폭력제로센터 콜센터 담당 번호이고, 성동광진(02-2286-3754)은 직원 목록에 없어 매뉴얼 기준으로 두고 02-1395 내선을 함께 안내해요', todo: '서울 북부·성동광진교육지원청 SEM119 전용 번호를 교육지원청 공식 안내로 다시 확인' },
    { region: 'busan', label: '교육활동보호센터 업무별 내선', status: 'partial', note: '업무별 내선 번호가 2026 계획·매뉴얼과 센터 누리집에서 서로 달라(예: 치료비 8번 / 6번) 대표번호 051-862-1122로만 안내해요. 심리상담(내선 3~4)만 일치해요', todo: '부산 교육활동보호센터 업무별 내선 최신 안내 확인(공식 게시물로 확인될 때만 contacts로 추가)' },
    { region: 'chungbuk', label: '교육지원청 연락처(내 교육지원청 찾기)', status: 'partial', note: '교육지원청별 교육활동보호 직통번호를 2026 공식 자료에서 확인하지 못했어요(043-1395·교원119·교육지원청 누리집으로 안내)', todo: '충북 교육지원청별 교육활동 보호 업무 연락처 확인(공식 게시물로 확인될 때만)' },
    { region: 'gangwon', label: '교육지원청 연락처(내 교육지원청 찾기)', status: 'partial', note: '교육지원청별 교육활동보호 담당 번호를 2026 공식 자료에서 확인하지 못했어요(도교육청 교육활동보호팀·교육지원청 누리집으로 안내)', todo: '강원 교육지원청별 교육활동 보호 업무 연락처 확인(공식 게시물로 확인될 때만)' },
    { region: 'gangwon', label: '2026 교육활동보호 「동:행」 기본계획·긴급 요청 창구', status: 'unverified', note: '기본계획 원문이 공개 게시판에서 확인되지 않았고, 업무분장의 긴급 요청 창구는 ‘(가칭)’ 단계라 화면에 넣지 않았어요', todo: '강원 2026 「동:행」 기본계획 원문과 교권보호 긴급 요청 창구 확정 여부 확인' }
  ]
};
