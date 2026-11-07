# Claude 독립 검증 — 공식 근거가 충돌하거나 확인되지 않은 주장

- 기준: `main` 52d10ee · 검증일 2026-11-04~2026-11-07 · 판정 기준은 [요약](claude-independent-summary.md) 참고
- 이 문서의 항목은 **허위로 판정한 것이 아닙니다.** 공식 문서끼리 내용이 다르거나, 공식 원문으로 끝내 확인하지 못한 주장입니다. 사이트 문구를 고치기 전에 해당 기관에 확인이 필요합니다.
- 원문 인용은 짧은 사실 요약으로 적었습니다. 전체 근거와 판정은 CSV 3종의 같은 항목 ID 행에 있습니다.

## 1. 검증 책임자 교차 확인에서 추가한 쟁점

### gyeongnam-P13 — 보호조치 비용 신청 기한 10일 (`data/regions/gyeongnam.js:163`)

- 사이트 문구: 조치결과 통지서를 받은 뒤 신청서를 공문으로 제출한다고만 적고 **기한이 없음**.
- 공식 근거 A: 경남교육청 「2026 교육활동 보호 매뉴얼」 부록의 보호조치 비용 고시 제4조 제1항 — 결과 통지서를 받은 날부터 10일 이내 제출.
- 공식 근거 B: 경남 2026 기본계획 — "받은 날 이후"라고만 적고 기한 없음.
- 충돌 지점: 근거 A의 고시는 "학교교권보호위원회"와 교원지위법 구 조항(제15조 제5항)을 인용하고 있어, 2023년 법 개정 뒤에도 10일 기한을 그대로 적용하는지 문서만으로 확정할 수 없음.
- 정리 방향: 기한이 있을 수 있음을 카드에 **신청 전 확인 표시**로 알리고, 경남교육청 교육활동보호담당관에 현행 적용 여부를 확인. 우선순위 P1(기한을 놓치면 지원을 못 받을 수 있음).

## 2. 검증자가 기록한 쟁점 (64건)

### BEN

#### BEN-03 (`data/common.js:161`)

- 주장: 학교장이 판단할 수 있는 공무상 병가의 6일이 연간 누계인지 사안별인지
- 근거: https://www.moe.go.kr/boardCnts/fileDown.do?m=0305&s=moe&fileSeq=45f76c653581704fce50f2d1b387f01a — 매뉴얼 70쪽 본문은 연 6일 이내로 적음
- 근거: https://www.law.go.kr/LSW/flDownload.do?flSeq=170001959 — 예규 제225호 177쪽은 연 표기 없이 6일 이내로 적음
- 정리 방향: 사이트는 예규와 같은 '6일 이내'로 적었습니다. 판정에 영향은 없고, 교육부·인사혁신처 유권해석으로 정리할 사항입니다.

#### BEN-05 (`data/common.js:202`)

- 주장: 공무상 질병휴직 대상에 산업재해보상보험법 요양급여 결정이 포함되는지
- 근거: https://www.law.go.kr/LSW/lsInfoR.do?lsiSeq=273697&efYd=20250919&chrClsCd=010202 — 교육공무원임용령 제19조제3항은 공무원 재해보상법 시행령 제28조·제32조 승인으로 한정
- 근거: https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2124077&q_fileId=c7dc272a-6ed1-4f14-93c6-e005afc6c6c0 — 서울시교육청 2024 매뉴얼은 산재보험법 요양급여 결정도 대상으로 적음
- 정리 방향: 사이트는 현행 임용령과 일치합니다. 상위 법령인 임용령을 기준으로 보되, 서울 매뉴얼은 2024년 자료이므로 교육청 확인이 필요합니다.

### SIT

#### SIT-19 (`data/common.js:1263`)

- 주장: 지도·훈육 금지 요구의 공식 유형
- 근거: https://www.moe.go.kr/boardCnts/fileDown.do?m=0305&s=moe&fileSeq=45f76c653581704fce50f2d1b387f01a — 교육활동 보호 매뉴얼: 모든 지도·훈육 금지 민원의 반복을 목적이 정당하지 아니한 반복민원 예시로 둠
- 근거: https://www.gwe.go.kr/cmm/fileDown.do?encKey=MTE3NDc4&type=bbs — 학교민원 처리 매뉴얼: 생활지도에 대한 지나친 간섭을 반복적 부당간섭 유형에 둠
- 정리 방향: 두 교육부 문서의 분류가 다르다. 교육부에 확인하기 전까지 사이트에 두 유형을 함께 표기하는 것이 안전하다.

#### SIT-30 (`data/common.js:1772`)

- 주장: 불법정보 유통의 명예훼손 정보 범위(사실 적시 포함 여부)
- 근거: https://www.moe.go.kr/boardCnts/fileDown.do?m=0305&s=moe&fileSeq=45f76c653581704fce50f2d1b387f01a — 매뉴얼은 "사실이나 거짓의 사실을 드러내어" 훼손하는 정보로 적습니다.
- 근거: https://www.law.go.kr/LSW/lsInfoR.do?lsiSeq=290001&efYd=20261002&chrClsCd=010202 — 현행 망법 제44조의7제1항제2호는 "거짓의 사실"만 적습니다(2026. 1. 6. 개정).
- 정리 방향: 사이트는 어느 쪽 문구도 인용하지 않아 불일치는 아닙니다. 현행 법령을 기준으로 삼고, 사실 적시 비방은 망법 제70조제1항·형법 제307조제1항 쪽으로 안내하는 것이 안전합니다.

### busan

#### busan-P04 (`data/regions/busan.js:95`)

- 주장: 교원의 법률 지원 범위가 '교육활동 관련 분쟁'인지 '교육활동 침해 관련 분쟁'인지
- 근거: https://www.law.go.kr/LSW/ordinInfoR.do?ordinSeq=2131701 — 훈령 제4조는 교육활동과 관련된 분쟁에 법률지원이 필요한 교원을 대상으로 합니다.
- 근거: https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18205&cntntsId=4095 — 안내 페이지는 '교육활동과 관련된' 법적 분쟁이면 침해 피해 교원이 아니어도 지원한다고 적습니다.
- 근거: https://www.pen.go.kr/upload/main/na/bbs_2342/ntt_1165028/doc_29bdvca00=b4v71=42vcb=8dva5=baf7v7e54v8718_v6871.pdf — 2026. 3. 1. 시행 소송비용 특약 제1조는 '교육활동과 관련한'을 '교육활동 침해와 관련한'으로 개정했습니다.
- 정리 방향: 사이트는 훈령·안내 페이지와 맞습니다. 비용은 약관으로 지급되므로 약관 문구가 실제 지급 범위를 좁히는지 교원인사과 또는 센터 확인이 필요합니다.

#### busan-P04 (`data/regions/busan.js:95`)

- 주장: 변호사 선임 지원 금액이 약관 한도 전체인지, 교보위 인정 전에는 50만 원 범위인지
- 근거: https://www.law.go.kr/LSW/ordinInfoR.do?ordinSeq=2131701 — 제7조 제1항은 금액을 약관에 따르게 하고, 제2항은 침해 사안 발생 시 우선 지원을 50만 원 범위로 정합니다.
- 근거: https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18205&cntntsId=4095 — 안내 페이지는 우선 지원 구분 없이 약관 한도를 안내합니다.
- 정리 방향: 두 문서를 함께 읽는 방법이 원문에 없습니다. 사이트 수치 자체는 약관과 일치합니다.

#### busan-P04 (`data/regions/busan.js:95`)

- 주장: 비용 미지급 기준이 고의·중과실인지 귀책사유인지
- 근거: https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18204&cntntsId=4094 — 귀책사유가 있으면 지원하지 않고 없을 때만 종결 후 지급합니다.
- 근거: https://www.pen.go.kr/upload/main/na/bbs_2342/ntt_1165028/doc_29bdvca00=b4v71=42vcb=8dva5=baf7v7e54v8718_v6871.pdf — 제8조는 유죄 확정(과실 제외)과 민사 고의·중과실 등을 환수 사유로 정하고, 제2조 제4항은 선지급도 허용합니다.
- 정리 방향: 센터에 귀책사유의 범위와 선지급 운영 여부를 확인해야 합니다.

#### busan-P06 (`data/regions/busan.js:97`)

- 주장: 치료비·상담비 청구 기한이 1년인지 3년인지
- 근거: https://home.pen.go.kr/common/nttFileDownload.do?fileKey=06105a552324f84432421b58289bc889 — 사안 발생 시부터 1년 이내 청구 및 지원 가능
- 근거: https://www.pen.go.kr/upload/main/na/bbs_2342/ntt_1165028/doc_29bdvca00=b4v71=42vcb=8dva5=baf7v7e54v8718_v6871.pdf — 보통약관 제19조: 공제금 권리는 사고발생일로부터 3년간 행사하지 않으면 시효 완성
- 정리 방향: 교육청 운영 기한과 약관상 시효로 함께 참일 수 있습니다. 1년 경과 건의 처리는 센터 확인이 필요합니다.

#### busan-P06 (`data/regions/busan.js:97`)

- 주장: 외부 심리상담비 지원이 15회인지 10회 기준인지
- 근거: https://www.pen.go.kr/upload/main/na/bbs_2342/ntt_1165028/doc_29bdvca00=b4v71=42vcb=8dva5=baf7v7e54v8718_v6871.pdf — 특약 제4조 제2항: 최대 15회, 150만 원 범위. 본문은 교권보호위원회 결정 사안 한정 문구를 삭제했으나 같은 PDF의 신구대비표에는 그 문구가 남아 있습니다.
- 근거: https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18214&cntntsId=4101 — 외부 심리상담센터 심리상담 15회 150만 원 한도
- 근거: https://home.pen.go.kr/common/nttFileDownload.do?fileKey=06105a552324f84432421b58289bc889 — 피해 건당 최대 150만 원(상담 10회 기준)
- 정리 방향: 사이트는 약관·안내 페이지와 맞습니다. 계획의 '10회 기준'이 지급 조건인지 단가 설명인지는 원문으로 확정되지 않습니다.

#### busan-P07 (`data/regions/busan.js:98`)

- 주장: 공제로 지급되는 치료비의 청구기한
- 근거: https://www.pen.go.kr/upload/main/na/bbs_2342/ntt_1165028/doc_29bdvca00=b4v71=42vcb=8dva5=baf7v7e54v8718_v6871.pdf — 보통약관 제19조: 공제금 권리는 사고발생일부터 3년 행사하지 않으면 소멸시효 완성
- 근거: https://home.pen.go.kr/common/nttFileDownload.do?fileKey=06105a552324f84432421b58289bc889 — 계획 Ⅷ-2: 치료비(심리상담비)는 사안 발생 시부터 1년 이내 청구 및 지원 가능
- 정리 방향: 약관은 권리 소멸시효, 계획은 교육청 처리 기준일 수 있습니다. 센터나 교원인사과에 1년 경과 건 처리 기준을 확인해야 합니다.

#### busan-P08 (`data/regions/busan.js:99`)

- 주장: 경호 서비스 대상 표현(교육활동 관련 대 교육활동 침해 관련)
- 근거: https://www.pen.go.kr/upload/main/na/bbs_2342/ntt_1165028/doc_29bdvca00=b4v71=42vcb=8dva5=baf7v7e54v8718_v6871.pdf — 2026 개정 특약 5 제1조: 교육활동 침해와 관련하여
- 근거: https://home.pen.go.kr/forteacher/cm/cntnts/cntntsView.do?mi=18214&cntntsId=4101 — 센터 안내: 교육활동과 관련한 폭행, 상해 등 중대사안
- 근거: https://home.pen.go.kr/common/nttFileDownload.do?fileKey=4dc80ea46aa27928d418b282367a42e6 — 2026 리플릿: 교육활동과 관련한 폭행, 상해 등 중대사안
- 정리 방향: 효력 문서는 약관이므로 약관 문구를 따르는 편이 안전합니다. 센터 안내·리플릿 갱신 여부는 센터 확인이 필요합니다.

### chungbuk

#### chungbuk-P03 (`data/regions/chungbuk.js:102`)

- 주장: 협력기관 부재지역에 영동이 포함되는가
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2020/2026/07/89809479-1086-F515-A8EE-FA031C3FC8FA.hwpx — 7월 현황: 영동 소재 협력기관 없음, 위촉 전문가 표에 영동(협력기관 부재 지역)
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2020/2026/04/CA5D7B2C-AB67-0461-C706-E3A7E482A6B5.hwpx — 2025 실적 항목은 영동을 포함하고, 2026 부재지역 지원 항목은 보은·옥천·진천·괴산증평·음성만 적음
- 정리 방향: 같은 계획 안에서도 다름. 영동의 부재지역 지원(대면 2회기·비대면 8회기) 적용 여부를 마음클리닉(043-290-2257)에 확인해야 함.

#### chungbuk-P04 (`data/regions/chungbuk.js:103`)

- 주장: 공제회 교원보호공제 문의 번호
- 근거: https://chungbuk.ssif.or.kr/compensation/teacher.php — 보상관련 문의 043-225-7109, 같은 페이지 하단 대표 Tel 043-252-7109
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2020/2026/07/56B5B665-06DF-AD2B-2110-373D703D5333.hwpx — 교원보호팀 043-225-7109(시행계획·매뉴얼·안내 이미지도 225)
- 근거: https://www.cbe.go.kr/dept-26/cm/cntnts/cntntsView.do?mi=14403&cntntsId=36358 — 문의처 043-252-7109(공제회 대표번호와 같음)
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2020/2026/04/CA5D7B2C-AB67-0461-C706-E3A7E482A6B5.hwpx — 담당자 223-7109
- 정리 방향: 사이트의 225는 공제회 자체 안내와 변경 안내에 맞음. 252는 대표번호로 보이고 223은 다른 문서에 없음. 전화는 걸지 않았으므로 실제 연결은 미확인.

#### chungbuk-P04 (`data/regions/chungbuk.js:103`)

- 주장: 특수교육대상자로 인한 치료비 50만 원 한도
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2020/2026/07/56B5B665-06DF-AD2B-2110-373D703D5333.hwpx — 교육활동 침해 여부와 관계없이 50만 원 한도(공제회·센터 안내표도 같음)
- 근거: https://chungbuk.ssif.or.kr/upfile/2026/05/20260526163508-3453.hwp — 특약 제1조는 침해 사안이 아니어도 지원, 제4조는 1사고당 100만 원 한도만 적고 50만 원 별도 한도는 없음
- 정리 방향: 사이트는 변경 안내와 일치. 침해가 인정된 특수교육대상자 사안의 한도가 100만인지 50만인지 공제회 확인 필요.

#### chungbuk-P04 (`data/regions/chungbuk.js:103`)

- 주장: 지급 여부 판단 14일의 기준
- 근거: https://chungbuk.ssif.or.kr/compensation/teacher.php — 사고통보서 제출 뒤 영업일 기준 14일 소요, 보완 시 연장
- 근거: https://chungbuk.ssif.or.kr/upfile/2026/05/20260526163508-3453.hwp — 보통약관 제14조: 청구받은 날부터 14일 이내 결정, 정당한 사유 시 연장
- 정리 방향: 사이트는 공제회 안내와 일치하고 ‘안팎’으로 완화함. 기산점과 영업일 여부가 약관과 달라 참고만 함.

#### chungbuk-P06 (`data/regions/chungbuk.js:105`)

- 주장: 교육감 의견서 기한의 공휴일 제외 여부
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2020/2026/04/45A62593-A2D6-220F-A633-4BE32BA18997.hwpx — 공유받은 후 7일 이내(공휴일 제외)
- 근거: https://www.law.go.kr/법령/교원의지위향상및교육활동보호를위한특별법시행령 — 사실을 안 날부터 7일 이내, 공휴일 제외 문구 없음
- 정리 방향: 사이트는 시행계획과 일치. 기산점과 공휴일 처리 차이를 교육활동보호센터가 정리해야 함.

#### chungbuk-P06 (`data/regions/chungbuk.js:105`)

- 주장: 방어비용 50만 원 한도가 합산인지 항목별인지
- 근거: https://chungbuk.ssif.or.kr/upfile/2026/05/20260526163508-3453.hwp — 소송비용 특약 제9조: 속기료 및 CCTV 개인정보 삭제 각 50만 원 한도
- 근거: https://chungbuk.ssif.or.kr/compensation/teacher.php — 방어비용(속기료, 촬영물 개인정보 삭제) 50만 원 한도
- 정리 방향: 사이트는 안내표와 일치. 약관이 계약 문서이므로 공제회 확인 뒤 표현을 맞추는 것이 좋음.

#### chungbuk-P07 (`data/regions/chungbuk.js:106`)

- 주장: 소송비는 선지급이 원칙이에요
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2020/2026/07/56B5B665-06DF-AD2B-2110-373D703D5333.hwpx — 변경 안내 hwpx는 교원 제소 시 '선지급 원칙'으로 적음
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2020/2026/05/F6C78D6A-6C2B-A71F-AAF5-CC7FA4A9751F.jpg — 같은 게시글의 포스터 이미지는 '선지급 가능'으로 적음(이미지를 직접 확인)
- 근거: https://chungbuk.ssif.or.kr/upfile/2026/05/20260526163508-3453.hwp — 약관은 피공제자가 요청하면 선지원할 수 있고, 환수 사유가 뚜렷하면 선지급을 거절할 수 있다고 정함
- 정리 방향: 공제회에 운영 기준을 확인해야 합니다. 그 전에는 '신청 시 선지급 가능' 수준의 표현이 안전합니다.

#### chungbuk-P07 (`data/regions/chungbuk.js:106`)

- 주장: 방어비용 50만 원 한도
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2020/2026/07/56B5B665-06DF-AD2B-2110-373D703D5333.hwpx — 방어비용(속기료, 개인정보 삭제) 50만원 한도
- 근거: https://chungbuk.ssif.or.kr/upfile/2026/05/20260526163508-3453.hwp — 속기료 및 CCTV 개인정보 삭제에 각 50만원 한도
- 정리 방향: 항목별 50만 원인지 합산 50만 원인지 공제회 확인이 필요합니다. 사이트는 안내문과 일치합니다.

#### chungbuk-P07 (`data/regions/chungbuk.js:106`)

- 주장: 2026 공제 한도(배상 2억5천만·치료 100만·상담 200만·재산 200만)
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2019/2026/03/050A2887-C564-5771-3A64-F9B972C08851.pdf — 2026 매뉴얼은 배상 2억, 상해치료비 50만, 상담 150만, 재산 100만으로 적고 표준약관 개정 시 변경될 수 있다고 주석을 둠
- 근거: https://www.cbe.go.kr/upload/dept-26/na/bbs_2020/2026/04/45A62593-A2D6-220F-A633-4BE32BA18997.hwpx — 2026 시행계획도 같은 구 한도를 적음
- 근거: https://chungbuk.ssif.or.kr/upfile/2026/05/20260526163508-3453.hwp — 2026 약관은 2억5천만·100만·200만·200만
- 정리 방향: 표준약관 개정을 반영한 변경 안내·약관과 2026. 7. 15. 갱신된 센터 안내가 일치해 사이트 값이 현행입니다. 매뉴얼·시행계획은 교육청이 정정해야 할 낡은 값이며 사이트 오류가 아닙니다.

### chungnam

#### chungnam-P03 (`data/regions/chungnam.js:75`)

- 주장: 피해교원 심리상담·치료비의 한도와 신청 기한. 충남교육청 공식 문서끼리 내용이 다르다.
- 근거: http://www.cne.go.kr/boardCnts/list.do?boardID=11093&m=031703&s=cne — 누리집 교원치유지원신청: 1인당 100만원 이내(초과 시 사전 협의), 위원회 의결일로부터 6개월 이내 신청.
- 근거: http://www.cne.go.kr/sub/info.do?m=031706&page=031706&s=cne — 누리집 심리상담(치료) 안내: 위와 같이 6개월 이내 신청.
- 근거: http://www.cne.go.kr/boardCnts/fileDown.do?m=031702&s=cne&fileSeq=5131aaf294240c382515eaf54e5a247c — 2026 기본 계획(2026-04-01): 기본 10회기 100만원, 초과 포함 총 200만원 한도, 의결일로부터 1년 이내 신청. 치료비도 최대 200만원.
- 근거: http://www.cne.go.kr/boardCnts/fileDown.do?m=031702&s=cne&fileSeq=22b3cc517033630c46f19d438614c8ee — 개정 길라잡이(2026-10-14): 10회기 이내(1인당 100만원 이내), 초과 시 사전 협의, 의결일로부터 1년 이내 신청. 서식 13-1은 1인당 100만원 지원(최대 200만원).
- 정리 방향: 가장 최근 문서는 개정 길라잡이고 기본 계획과 기한이 같아 1년이 현행일 가능성이 높지만 교육청 확인 없이 확정하지 않았다. 교육활동보호센터(1588-9331 3번)에 한도와 기한을 확인해야 한다. 그 전까지 사이트는 신청 전 확인으로 표시한다.

#### chungnam-P02 (`data/regions/chungnam.js:74`)

- 주장: 1588-9331 운영 시간과 연결 번호 순서. 누리집 소개 페이지와 개정 길라잡이가 다르다.
- 근거: http://www.cne.go.kr/sub/info.do?m=031701&page=031701&s=cne — 교육활동보호센터 소개: 전화 상담 평일 09:00~18:00(수·금 17:30), 1번 상담사, 2번 변호사, 3번 초등 장학사, 4번 중등 장학사.
- 근거: http://www.cne.go.kr/boardCnts/fileDown.do?m=031702&s=cne&fileSeq=22b3cc517033630c46f19d438614c8ee — 개정 길라잡이 92쪽: 사안신고 24시간, 심리·법률상담 평일 시간대, 1번 초등 장학사, 2번 중등 장학사, 3번 전문상담사, 4번 전문변호사.
- 정리 방향: 개정 주요 내용 16번이 대표전화 운영 사항 변경을 적고 있어 길라잡이가 최신으로 보인다. 누리집 페이지는 갱신되지 않은 것으로 보이나 실제 ARS는 전화로만 확인할 수 있어 이번 검증에서는 미확인이다.

#### chungnam-P02 (`data/regions/chungnam.js:74`)

- 주장: 긴급 출동 기준의 공식 표현. 포스터와 보도자료의 세분 수준이 다르다.
- 근거: http://www.cne.go.kr/boardCnts/fileDown.do?m=082904&s=cne&fileSeq=d93c21b50a794b75b87d6537a7543b70 — 포스터: 긴급 대응일 경우 1시간 내 현장 출동.
- 근거: http://news.cne.go.kr/boardCnts/view.do?boardID=1003&boardSeq=2372618&lev=0&searchType=S&statusYN=W&page=1&s=news&m=0401&opType=N — 보도자료: 폭행 등 신변위협은 즉시 출동, 지속 협박·심각한 정신 위기는 1시간 이내 현장 방문 원칙.
- 정리 방향: 두 문서는 모순되지 않지만 야간·휴일에도 같은 기준인지는 공식 문서에서 찾지 못했다. 사이트 문구를 고칠 때 시간대를 보장하는 표현은 쓰지 않아야 한다.

#### chungnam-P02 (`data/regions/chungnam.js:74`)

- 주장: 사이트 출처 S1 https://pf.kakao.com/_xgeTTX 를 충남교육청 교육활동보호 공식 채널로 표기한 부분.
- 근거: https://pf.kakao.com/_xgeTTX — 페이지 본문이 비어 있고 게시물 API는 404, 프로필 API는 빈 값이다. 채널명과 운영기관을 읽지 못했다.
- 근거: http://www.cne.go.kr/boardCnts/fileDown.do?m=031702&s=cne&fileSeq=22b3cc517033630c46f19d438614c8ee — 개정 길라잡이에는 카카오 채널 안내가 없다.
- 정리 방향: 틀렸다는 근거는 없고 독립 확인 불가다. 충남교육청 공식 문서에서 이 채널 주소를 찾기 전에는 공식 표기를 재확인해야 한다.

### daegu

#### daegu-P04 (`data/regions/daegu.js:128`)

- 주장: 다품 긴급 법률 지원의 비용을 누가 어떤 재원으로 지급하는지
- 근거: https://www.dge.go.kr/common/nttFileDownload.do?fileKey=81db3af9f301cb0169cdbae4ef483930 — 기본계획은 종료 후 지원비를 교육청이 변호사에게 지급한다고 적음
- 근거: https://www.dge.go.kr/sch/cm/cntnts/cntntsView.do?mi=9801&cntntsId=4847 — 공제회 사업개요는 이 사업을 교원보호공제 소송 비용 지원 항목으로 안내하고, 약관은 법률 상담 비용을 금액 없이 보상 대상으로 둠
- 정리 방향: 사이트는 두 안내를 모두 적고 단정하지 않아 불일치가 아닙니다. 교원이 먼저 낼 비용이 있는지는 교육권보호센터나 공제회 확인이 필요합니다.

### daejeon

#### daejeon-P01 (`data/regions/daejeon.js:115`)

- 주장: 사안 처리 서식 번호(발생보고서·의견서·참고인 진술서)
- 근거: https://www.dje.go.kr/sub/info.do?page=050301&m=0503&s=eduhealingnew — 발생 보고서 서식3, 의견서 서식5, 참고인 진술서 서식6
- 근거: https://www.dje.go.kr/boardCnts/fileDown.do?m=0704&s=eduhealingnew&fileSeq=cb1cdfd8a5357146a2adf5882b794c68 — 발생보고서 서식7, 의견서 서식4, 참고인 진술서 서식5
- 근거: https://www.dje.go.kr/boardCnts/list.do?boardID=10606&m=0510&s=eduhealingnew — 발생보고서 서식6, 의견서 서식3, 참고인 진술서 서식4(2025-05-02 등록)
- 정리 방향: 문서마다 번호 체계가 달라 어느 쪽이 맞다고 단정하지 않았다. 게시 시점으로는 2026 매뉴얼이 가장 새 문서이며, 서식 이름으로 안내하면 충돌을 피할 수 있다.

#### daejeon-P03 (`data/regions/daejeon.js:117`)

- 주장: 교육활동보호관 변호사 전화번호
- 근거: https://www.dje.go.kr/boardCnts/fileDown.do?m=0704&s=eduhealingnew&fileSeq=357fa449c06e5adf1b1be242da0f78bf — 담당자 교육활동보호관 변호사 713-9378
- 근거: https://www.dje.go.kr/sub/info.do?page=0102&m=0102&s=eduhealingnew — 변호사 042-616-8239(사무분장·법률 지원 페이지도 같음, 2026-11-07 재수신)
- 정리 방향: 현재 조직 안내 3곳이 8239라 사이트 값을 유지할 근거가 있다. 전화 확인을 하지 않았으므로 713-9378의 현재 사용 여부는 미확인이다.

#### daejeon-P03 (`data/regions/daejeon.js:117`)

- 주장: 법률상담·변호사 연계 대상에 사립 교원이 포함되는지
- 근거: https://www.dje.go.kr/boardCnts/fileDown.do?m=0704&s=eduhealingnew&fileSeq=357fa449c06e5adf1b1be242da0f78bf — 대상을 '공립유·초·중·고·특수·각종학교'로 적고, 같은 문서의 공제 대상은 '공·사립'으로 구분해 적음
- 근거: https://www.dje.go.kr/boardCnts/fileDown.do?fileSeq=d95032ae8d13222590964e6a803d4fe5 — 법률 상담 신청서 소속란에 공립·사립 체크 칸이 있음
- 정리 방향: 사이트는 방안 표기를 그대로 쓰고 '원스톱 방안 표기'라고 밝혀 오류로 보지 않았다. 사립 교원 이용 가능 여부는 교육활동보호관 확인이 필요하다.

### gangwon

#### gangwon-P01 (`data/regions/gangwon.js:97`)

- 주장: 강원 교육활동보호센터 전화번호
- 근거: https://www.gwe.go.kr/cmm/fileDown.do?encKey=MTE3NDcx&type=bbs — 2026 매뉴얼 시도별 현황(2026년 1월 기준)은 강원 대표전화를 033-259-0819로 적음
- 근거: https://www.gwe.go.kr/main/orgnzt/list.do?key=m2307211202580 — 현행 조직도와 센터 소개에는 이 번호가 없고 033-258-534x만 있음
- 정리 방향: 사이트는 조직도 번호를 써서 강원 자체 원문과 맞고 대표번호를 따로 주장하지 않으므로 판정을 낮추지 않았습니다. 033-259-0819의 현재 사용 여부는 전화 없이 확인할 수 없어 교육활동보호팀 확인이 필요합니다.

#### gangwon-P04 (`data/regions/gangwon.js:100`)

- 주장: 033-258-5345의 담당 업무(gangwon-P06에도 해당)
- 근거: https://www.gwe.go.kr/main/content.do?key=bTIzMDcyMTExNjUyODQ= — 센터 소개표는 258-5345를 학교 행정업무 경감 담당 주무관으로 적음
- 근거: https://www.gwe.go.kr/main/orgnzt/list.do?key=m2307211202580 — 조직도는 5345에 공제·원스톱·마음건강치료비를, 5347에 행정업무 경감을 배정함
- 정리 방향: 공제 안내 페이지도 담당을 258-5345로 적어 사이트 번호는 조직도와 맞습니다. 센터 소개표의 업무 표기가 갱신되지 않은 것으로 보이나 단정하지 않습니다.

#### gangwon-P05 (`data/regions/gangwon.js:101`)

- 주장: 개인(심층) 상담 신청 방식
- 근거: https://www.gwe.go.kr/cmm/fileDown.do?encKey=MTE4OTA1&type=bbs — 2026. 1. 시행계획은 온라인 참가신청 단축 주소로 신청한다고 적음
- 근거: https://www.gwe.go.kr/main/content.do?key=bTI1MDkyOTE3NDQyMzM= — 현재 신청 페이지는 이음 메신저 동행으로 교권전담상담사에게 신청하라고 적음
- 정리 방향: 계획서의 양식은 삭제되어 접근할 수 없으므로 현재 페이지 기준으로 판정했습니다. 양식 삭제 시점과 사유는 확인하지 못했습니다.

#### gangwon-P06 (`data/regions/gangwon.js:102`)

- 주장: 사립유치원 교원의 교원보호공제 적용(공제회가 지급하는 치료비 범위와 관련)
- 근거: https://www.gwe.go.kr/main/content.do?key=m2509291752067 — 공제 안내 페이지는 가입 대상을 교원(사립유치원 제외)으로 적음
- 근거: https://www.gwe.go.kr/cmm/fileDown.do?encKey=MTIxNTM5&type=fileMng — 약관은 사립유치원 교원의 소급 보장을 2024. 3. 1. 이후로 적어 보장 대상처럼 읽힘
- 정리 방향: 카드는 시행계획대로 '강원특별자치도교육청 소속'으로만 적어 어느 쪽과도 모순되지 않습니다. 사립유치원 교원은 담당자(5345) 확인이 필요합니다.

#### gangwon-P08 (`data/regions/gangwon.js:104`)

- 주장: 강원 교원보호공제 가입 대상에서 사립유치원 교원이 제외되는가
- 근거: https://www.gwe.go.kr/main/content.do?key=m2509291752067 — 가입 대상을 교원(사립유치원 제외)으로 적는다.
- 근거: https://ssia.gwe.go.kr/cntsFile/fileDown.do?sysId=ssia&fileSeq=256 — 보통약관 제10조가 사립유치원 교원은 2024. 3. 1. 이후부터 보장한다고 적고, 피공제자 정의에 제외 문구가 없다.
- 근거: https://ssia.gwe.go.kr/sub/info.do?m=371632&s=ssia — 지원대상을 유아교육법 제20조 교원(기간제 교원 포함) 등으로 적고 사립유치원 제외 문구가 없다.
- 정리 방향: 약관 문구가 전국 표준 문안의 잔존일 수도 있어 단정하지 않는다. 공제회(033-244-9851) 또는 도교육청(033-258-5345)의 서면 확인으로 풀어야 한다.

#### gangwon-G04

- 주장: 033-258-5345의 담당 업무
- 근거: https://www.gwe.go.kr/main/orgnzt/list.do?key=m2307211202580 — 교원보호공제사업 운영, 원스톱 법률 동행, 분쟁조정지원단, 마음건강치료비 지원
- 근거: https://www.gwe.go.kr/main/content.do?key=m2509291752067 — 교원보호공제 담당 주무관 258-5345
- 근거: https://www.gwe.go.kr/main/content.do?key=bTIzMDcyMTExNjUyODQ= — 258-5345 학교 행정업무 경감 담당
- 정리 방향: 조직도·공제 안내 2건이 사이트와 같고 센터 소개 표만 다름. 소개 표가 갱신되지 않은 것으로 보이나 교육청 확인 필요.

### gyeongbuk

#### gyeongbuk-P08 (`data/regions/gyeongbuk.js:124`)

- 주장: 교보위 개최 피해 교원 상해 치료비·심리상담비 연간 한도
- 근거: https://www.gbe.kr/upload/tprotect/na/bbs_6441/ntt_1618102/doc_7732v883a=b8vb6=49v57=96v7e=a263v47e0vf644_v6319.pdf — 2026 추진계획(2026.2, 6.9 게시) 본문과 서식3 유의사항: 1인 1년 최대 200만 원
- 근거: https://www.gbe.kr/upload/tprotect/na/bbs_6522/ntt_1602820/doc_2cf0v87a1=9fv48=4fv35=9cv56=2274v52c0vf866_v59.hwp — 2026 교원보호공제 안내(2026.4.21): 1인 1년 300만 원
- 근거: https://www.gbe.kr/tprotect/cf/fileDownload.do?fileKey=7b5766bbab039381a56a540d96adf809 — 센터 안내 페이지 첨부 신청서(고시 별지 제1호): 연간 1인당 300만 원
- 정리 방향: 게시 시점상 300만 원이 최신으로 보이며 사이트는 300만 원과 함께 차이를 caution에 밝힘. 센터(054-450-4344)에 현행 한도 확인 권장.

#### gyeongbuk-P11 (`data/regions/gyeongbuk.js:127`)

- 주장: 분쟁조정 서비스 제외 사유
- 근거: https://www.gbe.kr/kbssia/cm/cntnts/cntntsView.do?mi=22543&cntntsId=9083 — 고의에 의한 분쟁, 교육활동 무관 분쟁, 소송 진행 중인 분쟁
- 근거: https://www.gbe.kr/opengbe/cf/fileDownload.do?fileKey=53df913aa9de9dd13066d2f9f557fe8f — 교육활동 무관 분쟁, 고의 또는 중과실 분쟁, 소송 진행 중 분쟁 중 소송비용 지원을 받은 경우
- 정리 방향: 약관이 계약상 효력 문서이므로 약관 기준 문구가 더 정확. 공제회 확인 필요.

#### gyeongbuk-P09 (`data/regions/gyeongbuk.js:125`)

- 주장: 심리 소진 교원 지원에 상해 치료 포함 여부
- 근거: https://www.gbe.kr/upload/tprotect/na/bbs_6441/ntt_1618102/doc_7732v883a=b8vb6=49v57=96v7e=a263v47e0vf644_v6319.pdf — 심리치료·정신과적 치료 해당, 상해·질병 치료는 제외(각주)
- 근거: https://www.gbe.kr/upload/tprotect/na/bbs_6522/ntt_1602820/doc_2cf0v87a1=9fv48=4fv35=9cv56=2274v52c0vf866_v59.hwp — 심리 소진 교원 및 상해 피해 교원 상해 치료비·심리상담비 지원
- 정리 방향: 사이트 P09는 상담·정신건강의학과 심리치료 비용만 안내해 두 문서 모두와 모순되지 않음. 기록만 함.

#### gyeongbuk-G02

- 주장: 054-450-4364가 유·초등 장학사 교권 상담 번호인지
- 근거: https://www.gbe.kr/tprotect/cm/cntnts/cntntsView.do?mi=23202&cntntsId=9453 — 장학사 054)450-4364(유,초등), 4363(중등, 특수)
- 근거: https://www.gbe.kr/tprotect/main.do?mi=20814 — 대표전화 054-450-4364(초등), 054-450-4363(중등)
- 근거: https://www.gbe.kr/tprotect/cm/cntnts/cntntsView.do?mi=23204&cntntsId=9455 — 조직도 이미지: 장학사 유치원 054-805-3323, 초등 054-805-3336, 중등 054-450-4363, 주무관 054-450-4364
- 정리 방향: 센터에 최신 조직도 확인 필요. 사이트는 소개·메인 페이지와 일치.

### gyeonggi

#### gyeonggi-P06 (`data/regions/gyeonggi.js:132`)

- 주장: 보호조치 비용 200만 원 한도에 심리상담·조언 비용이 포함되는가
- 근거: https://more.goe.go.kr/eapc/module/upload/file/fileBBSDown.do?atchFileId=30300194765&fileSn=2&mvpAt=N — 200만 원은 심리상담·조언 비용과 치료 비용을 포함한 금액
- 근거: https://more.goe.go.kr/eapc/module/upload/file/fileBBSDown.do?atchFileId=30300194749&fileSn=3&mvpAt=N — 치료 비용 1인당 200만 원, 심리 상담·조언 비용은 도교육청 직접 지원
- 근거: https://more.goe.go.kr/eapc/subList/30300002118 — 심리상담 10회기, 치료비 1인당 총 200만 원 이내
- 정리 방향: 경기도교육청 생활교육과 또는 1600-8787의 공식 답변으로 풀어야 한다. 사이트는 길라잡이 쪽과 맞다.

#### gyeonggi-P06 (`data/regions/gyeonggi.js:132`)

- 주장: 치료비 200만 원의 한도 단위가 1인당인가 사고당인가
- 근거: https://more.goe.go.kr/eapc/module/upload/file/fileBBSDown.do?atchFileId=30300194749&fileSn=3&mvpAt=N — 1인당 200만 원 한도(1년간)
- 근거: https://more.goe.go.kr/eapc/module/upload/file/fileBBSDown.do?atchFileId=30300201804&fileSn=0&mvpAt=N — 치료 비용 사고당 200만 원 한도
- 정리 방향: 같은 교원의 별건 사안이나 한 사고의 복수 피해교원에서 결과가 달라질 수 있어 공제회 확인이 필요하다.

#### gyeonggi-P06 (`data/regions/gyeonggi.js:132`)

- 주장: 치료 기간 기준(3개월 내 시작 조건 유무)
- 근거: https://more.goe.go.kr/eapc/subList/30300002117 — 선정 후 3개월 이내 상담·치료 시작, 1년 이내 종료
- 근거: https://more.goe.go.kr/eapc/module/upload/file/fileBBSDown.do?atchFileId=30300194749&fileSn=3&mvpAt=N — 사안 최초 발생일 또는 침해 인정일부터 1년 이내 치료 비용
- 근거: https://www.gessia.or.kr/compe/recov.php — 치료 시작일 또는 위원회 결정일부터 1년 중 선택
- 정리 방향: 교육청 지원 제도 페이지가 옛 기준일 수 있으나 단정하지 않는다. 사이트는 길라잡이·공제회와 맞다.

#### gyeonggi-P10 (`data/regions/gyeonggi.js:136`)

- 주장: 위협대처 보호 서비스의 한도가 기간(20일)인지 금액(500만 원)인지, 중대사안으로 한정되는지
- 근거: https://more.goe.go.kr/eapc/module/upload/file/fileBBSDown.do?atchFileId=30300201804&fileSn=0&mvpAt=N — 2026. 4. 1. 약관: 위협을 받는 사안에 사고당 최대 20일, 연장 가능. 금액 한도와 중대사안 문구 없음
- 근거: https://more.goe.go.kr/eapc/module/upload/file/fileBBSDown.do?atchFileId=30300194765&fileSn=3&mvpAt=N — 2026년 안내문: 중대사안의 경우 지원, 사고당 500만 원 범위 내 지원
- 정리 방향: 단위가 달라 함께 참일 수 있습니다. 안내문은 재산 한도가 이미 약관으로 바뀌었으므로 500만 원의 현행 여부를 공제회 공식 답변이나 공제증권으로 확인해야 합니다.

#### gyeonggi-P08 (`data/regions/gyeonggi.js:134`)

- 주장: 분쟁조정 서비스의 사고당 140만 원 범위가 현행인지
- 근거: https://more.goe.go.kr/eapc/module/upload/file/fileBBSDown.do?atchFileId=30300194765&fileSn=3&mvpAt=N — 2026년 안내문: 사고당 140만 원 범위 내 지원
- 근거: https://more.goe.go.kr/eapc/module/upload/file/fileBBSDown.do?atchFileId=30300201804&fileSn=0&mvpAt=N — 2026. 4. 1. 약관 분쟁조정 특별약관: 금액 한도 없음
- 정리 방향: 사이트는 금액을 적지 않았으므로 오류는 아닙니다. 공제회 확인 뒤 기재 여부를 정해야 합니다.

### gyeongnam

#### gyeongnam-P05 (`data/regions/gyeongnam.js:155`)

- 주장: 법률지원단 인원: 사이트 28명
- 근거: https://www.gne.go.kr/component/file/ND_fileDownload.do?q_fileSn=181611956&q_fileId=a22c6243-23d9-4bab-bb18-dcfc49fe6f67 — 2026. 2. 기본계획: 교육활동보호 법률지원단 28명
- 근거: https://www.gne.go.kr/forteacher/protection/support.jsp — 현재 페이지: 위촉직 단원 연번 27번까지(2026-11-07 확인)
- 정리 방향: 기준 시점이 다르고, 규칙상 지원단에는 단장·당연직 단원도 있어 산정 범위가 다를 수 있다. 교육활동보호담당관에 현재 인원과 산정 기준을 확인해야 한다.

#### gyeongnam-P05 (`data/regions/gyeongnam.js:155`)

- 주장: 법률지원단 위촉기간 2025. 11. 7.~2027. 12. 31.
- 근거: https://www.law.go.kr/자치법규/경상남도교육청법률지원단구성및운영에관한규칙 — 제5조: 위촉기간 2년, 2회 연임 가능, 해촉 후 새 단원은 전임자의 남은 기간
- 근거: https://www.gne.go.kr/forteacher/protection/support.jsp — 현재 페이지에는 위촉기간 표기 없음. 검색 색인에만 옛 판의 같은 날짜가 보이며(단서), 원문은 받지 못함
- 정리 방향: 시도 경로: 페이지 재수집, WebFetch, web.archive.org(429·2024년 스냅샷뿐), 기본계획·매뉴얼 검색, gne.go.kr 한정 웹 검색. 위촉 공문이나 담당 부서 확인으로 풀어야 한다.

#### gyeongnam-P09 (`data/regions/gyeongnam.js:159`)

- 주장: 교원보호공제 피공제자에 교육전문직원·퇴직교원이 포함되는지
- 근거: https://www.gne.go.kr/component/file/ND_fileDownload.do?q_fileSn=181587096&q_fileId=25b973fe-12c4-426a-aed0-5c4b6bb0f705 — 2026학년도 운영 안내 보장 대상: 사안 발생일 기준 휴직자·교육전문직 제외, 계약제교원 포함(2025학년도 안내는 교육전문직원 포함)
- 근거: http://kn.ssif.or.kr/kr/index.php?pCode=MN1000071 — 공제회 사업안내 피보험자: 교원(휴직자 제외, 계약제 포함), 교육전문직원, 퇴직교원(재직 중 보장기간 내 사안)
- 정리 방향: 공제회 누리집이 2025학년도 범위를 그대로 둔 것으로 보임. 사이트(P09)는 차이를 공개하고 공제회 확인을 권함. 교육청·공제회에 2026 범위 확인 필요(P08 eligibility도 같은 문제).

#### gyeongnam-P13 (`data/regions/gyeongnam.js:163`)

- 주장: 보호조치 비용 신청 기한: 통지서를 받은 날부터 10일 이내인지, 기한이 없는지
- 근거: https://www.gne.go.kr/component/file/ND_fileDownload.do?q_fileSn=181589297&q_fileId=c21914d3-cdbc-48e2-aebd-de567b888845 — 고시 제2020-1호 제4조①과 2026 매뉴얼 유의사항: 결과 통지서를 받은 날부터 10일 이내 제출(매뉴얼은 제출처를 학교혁신과로 적음)
- 근거: https://www.gne.go.kr/component/file/ND_fileDownload.do?q_fileSn=181611956&q_fileId=a22c6243-23d9-4bab-bb18-dcfc49fe6f67 — 2026 기본계획: 조치결과 통지서를 받은 날 이후 교육활동보호담당관으로 공문 제출, 기한 표기 없음
- 정리 방향: 고시는 기본계획이 인용하는 근거 규정이지만 학교교권보호위원회 등 옛 용어가 남아 있습니다. 담당관(055-268-1346)에 현재 적용 기한을 확인해 카드에 반영해야 합니다.

#### gyeongnam-P15 (`data/regions/gyeongnam.js:165`)

- 주장: 외부 연계 상담(치료)비 담당 센터 배정
- 근거: https://www.gne.go.kr/component/file/ND_fileDownload.do?q_fileSn=181611964&q_fileId=1a795191-e431-4ca4-a238-3d97a8d0220c — 2026-09-18 게시 기관 현황: 본청이 통영·거제·양산·밀양·창녕·고성·사천·산청·함양·거창·합천·남해·하동·의령·함안, 창원·진주·김해는 각 시만 담당(센터 페이지도 같음)
- 근거: https://www.gne.go.kr/component/file/ND_fileDownload.do?q_fileSn=181611956&q_fileId=a22c6243-23d9-4bab-bb18-dcfc49fe6f67 — 2026 기본계획: 진주 센터가 진주·사천·산청·함양·거창·합천·남해·하동, 김해 센터가 김해·양산·의령·함안, 본청은 그 외 지역
- 근거: https://www.gne.go.kr/component/file/ND_fileDownload.do?q_fileSn=181610911&q_fileId=6219c750-3e14-43e1-a7b7-0284da14988d — 학교 민원 처리 매뉴얼: 기본계획과 같은 배정, 본청은 거제·통영·밀양·고성·창녕
- 정리 방향: 사이트는 최신 전용 안내와 같습니다. 교육활동보호담당관에 공식 배정을 확인해야 합니다.

#### gyeongnam-P17 (`data/regions/gyeongnam.js:167`)

- 주장: 장기치유연수 추천 주체
- 근거: https://www.gne.go.kr/component/file/ND_fileDownload.do?q_fileSn=181611956&q_fileId=a22c6243-23d9-4bab-bb18-dcfc49fe6f67 — 2026 기본계획: 학교장이 추천한 교원
- 근거: https://www.gne.go.kr/component/file/ND_fileDownload.do?q_fileSn=181589297&q_fileId=c21914d3-cdbc-48e2-aebd-de567b888845 — 2026 매뉴얼: 대상 문구는 학교교권보호위원회 추천, 선정 절차 그림은 지역교권보호위원회 대상자 추천, 서식은 학교(유치원)장 추천서
- 정리 방향: 사이트는 기본계획·서식과 같습니다. 어느 표기가 현행 절차인지는 원문만으로 단정하지 않습니다.

### incheon

#### incheon-P04 (`data/regions/incheon.js:114`)

- 주장: 아동학대 피신고·소진 교원 상담·치료비 한도 200만 원(incheon-P05에도 동일 적용)
- 근거: https://www.ice.go.kr/upload/ice/na/bbs_1711/2026/08/895d4255a80646b1ae4132c2e04e42a1.pdf — 2026 하반기 연수자료: 100만 원에서 200만 원으로 확대, 2026. 9. 1. 이후 적용
- 근거: https://www.ice.go.kr/upload/ice/na/bbs_1711/2025/11/78f207f005a8bf69fc35e24e037d76de.hwp — 자료실 공지 첨부 교원 치유 지원 안내문(2025. 11. 업로드): 1인당 100만 원
- 정리 방향: 연수자료가 더 최근이고 변경을 명시해 사이트와 일치하지만, 공개된 계획·공문 형식의 근거는 찾지 못했습니다. 담당 부서에 확인하고 공지 첨부 갱신 여부를 보면 풀립니다.

#### incheon-P03 (`data/regions/incheon.js:113`)

- 주장: 교육청 형사고발 요청 서식 번호
- 근거: https://www.ice.go.kr/upload/ice/na/bbs_1711/2026/04/0ecf770cd5d1443260ec865a554c116b.pdf — 매뉴얼 본문 법률 지원 항목: 형사고발 지원 서식 13으로 표기
- 근거: https://www.ice.go.kr/upload/ice/na/bbs_1711/2026/04/31621f40107443cfb57b2f35d8f12f6c.hwp — 매뉴얼 서식 목록과 서식 본문: 형사고발 요청서는 서식 14, 서식 13-1·13-2는 조치 미이행 보고서
- 정리 방향: 같은 매뉴얼 안의 충돌입니다. 서식 실물 번호가 14이므로 사이트는 서식 이름을 함께 적는 편이 안전합니다.

#### incheon-P11 (`data/regions/incheon.js:121`)

- 주장: 걷기 치유 프로그램의 명칭: 아이-플라토와 휴·행·복이 같은 사업인지
- 근거: https://www.ice.go.kr/upload/ice/na/bbs_1711/2026/02/3d5388cdc0da4c6ed81ef8fc8de5b3b5.pdf — 2026. 2. 시행계획과 2026. 4. 매뉴얼은 "걸으며 치유하고 회복하는 아이-플라토"로 적습니다.
- 근거: https://www.ice.go.kr/upload/ice/na/bbs_1711/2026/08/895d4255a80646b1ae4132c2e04e42a1.pdf — 2026. 8. 연수자료는 "걸으며 치유하는 <휴·행·복>"으로 적고 아이-플라토는 쓰지 않습니다.
- 근거: https://www.ice.go.kr/ice/ad/ofcrk/ofcrkDeptInfo.do?mi=12097&deptSn=1120 — 부서 업무분장은 휴행복 프로그램 운영을 적고 아이-플라토는 없습니다.
- 정리 방향: 설명 문구가 같아 개명으로 보이지만 동일 사업이라는 공식 문장은 찾지 못했습니다. 교육활동보호담당관(032-1395)에게 확인해 풀어야 합니다.

### jeju

#### jeju-P07 (`data/regions/jeju.js:128`)

- 주장: 교원보호공제 배상책임·상해치료·재산 피해 한도
- 근거: https://www.jje.go.kr/forteacher/board/download.jje?boardId=BBS_0000268&menuCd=DOM_000000705003000000&paging=ok&startPage=1&command=update&dataSid=1466996&fileSid=1390399 — 2026 표준약관: 배상 2억5천만(합의 1억5천만), 상해치료 등 300만, 재산 물품당 200만
- 근거: https://www.jje.go.kr/forteacher/board/view.jje?boardId=BBS_0000268&menuCd=DOM_000000705003000000&dataSid=1465989 — 2026 운영계획(4.16): 약관과 같은 한도
- 근거: https://www.jje.go.kr/board/view.jje?boardId=BBS_0000216&categoryCode1=main&dataSid=1482353&menuCd=DOM_000000201001000000&paging=ok&startPage=1 — 9.29 보도자료 붙임표: 배상 2억/합의 1억, 상해 300만, 재산 200만
- 근거: https://www.jje.go.kr/forteacher/board/view.jje?boardId=BBS_0000268&menuCd=DOM_000000705003000000&dataSid=1456760 — 2.13 시행계획표: 배상 2억/1억, 상해 200만, 재산 100만
- 정리 방향: 계약 문서인 2026 약관과 운영계획이 일치하므로 사이트가 약관 값을 쓴 것은 타당. 보도자료·시행계획의 요약표는 옛 한도로 보이며 사이트 caution이 차이를 고지함. 도교육청이 보도자료 붙임표를 정정하면 caution 단축 가능.

#### jeju-P12 (`data/regions/jeju.js:133`)

- 주장: 진료비 지원이 도내 병의원으로 한정되는지 공식 문서 표현이 다르다.
- 근거: https://www.jje.go.kr/forteacher/board/download.jje?boardId=BBS_0000268&menuCd=DOM_000000705003000000&paging=ok&command=update&startPage=1&dataSid=1456760&fileSid=1376668 — 2026. 2. 시행계획은 신청방법을 도내 정신건강의학과 병의원 신청서 제출로 적는다.
- 근거: https://www.jje.go.kr/forteacher/board/download.jje?boardId=BBS_0000268&menuCd=DOM_000000705003000000&paging=ok&command=update&startPage=2&dataSid=1473523&fileSid=1401491 — 2026. 6. 세부 운영 계획과 서식에는 도내 한정 문구가 없다.
- 정리 방향: 카드는 도내 한정을 적지 않아 세부 운영 계획과 맞다. 도외 병의원 이용 가능 여부는 064-1395 확인이 필요하고, 도교육청이 어느 쪽이 맞는지 밝혀야 풀린다.

### jeonbuk

#### jeonbuk-P05 (`data/regions/jeonbuk.js:154`)

- 주장: 학교안전공제회 교원보호공제 청구 팩스번호 063-237-5238(P05·P06·P07 공통, 기관 항목 G07에도 같은 번호)
- 근거: https://www.jbe.go.kr/safety/index.jbe?menuCd=DOM_000002401005000000 — 본문은 팩스 063-237-5238, 같은 페이지 바닥글은 FAX. 063-237-5237
- 근거: https://www.jbe.go.kr/human/index.jbe?menuCd=DOM_000002709003000000 — 학교안전공제회 전화 063-239-0866, 팩스 237-5238
- 근거: https://www.ssif.or.kr/safety/contact.php — 중앙회 연락처 전북 항목 Fax) 063-237-5238
- 근거: https://www.jbe.go.kr/safety/index.jbe?menuCd=DOM_000002408003000000 — 서식 페이지 바닥글 FAX. 063-237-5237
- 정리 방향: 공식 자료 안에서 본문과 바닥글이 다릅니다. 어느 쪽이 맞다고 단정하지 않았고, 공제회가 청구 접수 번호를 확인해 주어야 풀립니다. 웹 검색으로는 추가 근거를 찾지 못했고 전화 확인은 하지 않았습니다.

#### jeonbuk-P12 (`data/regions/jeonbuk.js:161`)

- 주장: 숙박형 휴(休) 프로그램의 구성·운영기관·시기
- 근거: https://www.jbe.go.kr/human/index.jbe?menuCd=DOM_000002709002004000 — 자연명상 스테이·문화체험 휴·숲체험 휴 3개, 모두 연중, 옹달샘·순창쉴랜드·진안고원치유숲, 1박2일·동반 1인
- 근거: https://www.jbe.go.kr/human/board/download.jbe?boardId=BBS_0000270&menuCd=DOM_000002709005000000&paging=ok&startPage=1&dataSid=1021446&command=update&fileSid=695059 — 자연명상 스테이(개인·연중) / 함께 휴(집단, 4월~11월 6회, 순창쉴랜드·내장산·진안고원산림치유원) / 방학 중 교원 회복 프로그램
- 정리 방향: 센터 페이지 갱신 시점이 표시되지 않아 어느 쪽이 2026 운영 실태인지 단정 불가. 센터(063-237-0343/0344)에 2026 하반기 잔여 회차 확인 필요.

#### jeonbuk-G07

- 주장: 학교안전공제회 팩스 번호
- 근거: https://www.jbe.go.kr/human/index.jbe?menuCd=DOM_000002709003000000 — 팩스 237-5238
- 근거: https://www.jbe.go.kr/safety/index.jbe?menuCd=DOM_000002408001000000 — 누리집 하단 FAX. 063-237-5237
- 근거: https://www.jbe.go.kr/safety/index.jbe?menuCd=DOM_000002401005000000 — 팩스 063-237-5238
- 정리 방향: 공제회 본문과 공제중앙회 연락처는 5238, 누리집 하단만 5237. 사이트 5238은 본문과 일치.

### seoul

#### seoul-O04 (`data/regions/seoul.js:68`)

- 주장: 북부 SEM119 번호 02-3499-6899
- 근거: https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2252045&q_fileId=bc9fc075-da4e-4498-ad95-a8d01aac0546 — 매뉴얼(2026.3.) p.93: 북부 SEM119 담당 3499-6899
- 근거: https://bbedu.sen.go.kr/FUS/DE/DEV11.do — 현행 업무분장: 02-3499-6899는 학교폭력제로센터 콜센터 관련 업무 담당
- 정리 방향: 매뉴얼 이후 인사·업무 변경으로 보입니다. 현행 업무분장의 SEM119 담당 번호로 갱신하거나 02-1395만 안내하세요.

#### seoul-O10 (`data/regions/seoul.js:74`)

- 주장: 성동광진 SEM119 번호 02-2286-3754
- 근거: https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2252045&q_fileId=bc9fc075-da4e-4498-ad95-a8d01aac0546 — 매뉴얼 p.93: 성동광진 2286-3754
- 근거: https://sdgjedu.sen.go.kr/FUS/DE/DEV11.do — 현행 학교생활교육과 직원 목록에 이 번호 없음, SEM119·1395 연계는 02-2286-3771
- 정리 방향: 현행 업무분장을 따르는 쪽이 안전합니다.

#### seoul-P02 (`data/regions/seoul.js:106`)

- 주장: 긴급교실 안심SEM의 주당 투입 시간
- 근거: https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2252045&q_fileId=bc9fc075-da4e-4498-ad95-a8d01aac0546 — 99쪽은 주15시간 4주(축소 또는 연장 가능), 100쪽 Q&A는 기본 4주·1주 15 미만
- 근거: https://sdgjedu.sen.go.kr/CMS/admserv/admserv06/admserv0608/admserv060801/__icsFiles/afieldfile/2026/03/15/2026%20%EC%84%9C%EC%9A%B8%20%EA%B5%90%EC%9C%A1%ED%99%9C%EB%8F%99%EB%B3%B4%ED%98%B8%20%EC%8B%9C%ED%96%89%EA%B3%84%ED%9A%8D(%EC%95%88%EB%82%B4%EC%9A%A9).hwp — 주15시간 미만 4주(축소 또는 연장 가능)
- 정리 방향: 사이트는 매뉴얼 99쪽과 맞다. 어느 쪽이 맞는지 단정하지 말고 초등교육과 또는 교육지원청 SEM119에 확인할 사안이다.

#### seoul-P03 (`data/regions/seoul.js:107`)

- 주장: 법률지원단 서부 담당 염용주 변호사의 사무소·연락처
- 근거: https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2252045&q_fileId=bc9fc075-da4e-4498-ad95-a8d01aac0546 — 98쪽은 법률사무소 이지스 02-537-9225
- 근거: https://sdgjedu.sen.go.kr/CMS/admserv/admserv06/admserv0608/admserv060801/__icsFiles/afieldfile/2026/03/15/2026%20%EC%84%9C%EC%9A%B8%20%EA%B5%90%EC%9C%A1%ED%99%9C%EB%8F%99%EB%B3%B4%ED%98%B8%20%EC%8B%9C%ED%96%89%EA%B3%84%ED%9A%8D(%EC%95%88%EB%82%B4%EC%9A%A9).hwp — 참고1 명단은 법률사무소 더나은 02-715-7707
- 정리 방향: 사이트는 명단을 직접 싣지 않고 매뉴얼 98쪽을 가리키므로 사이트 오류는 아니다. 교육청이 명단을 바로잡으면 안내 쪽수를 재확인한다.

#### seoul-P05 (`data/regions/seoul.js:109`)

- 주장: 치료비 청구 구비서류에 진단서가 필요한지
- 근거: https://www.ssia.or.kr/teacher/page4.php — 구비서류에 진단서, 진료비 계산서·영수증 등을 적음
- 근거: https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2252045&q_fileId=bc9fc075-da4e-4498-ad95-a8d01aac0546 — 120쪽 청구서 구비서류는 진료비 계산서·영수증, 동의서, 지원별 별도 서류로 진단서를 적지 않음
- 정리 방향: 사이트는 매뉴얼과 맞다. 공제회(1670-4972)에 진단서 필요 여부를 확인해 documents에 반영한다.

#### seoul-P06 (`data/regions/seoul.js:110`)

- 주장: 공제금 3년 청구 기한의 기산점
- 근거: https://www.ssia.or.kr/download/2026%EB%85%84%20%EA%B5%90%EC%9B%90%EB%B3%B4%ED%98%B8%EA%B3%B5%EC%A0%9C%EC%82%AC%EC%97%85%20%EC%95%BD%EA%B4%80.pdf — 약관 제1장 제19조: 공제금 청구권 3년 소멸시효, 나머지는 민법을 따름. 사안 발생일이라는 기산점은 없음.
- 근거: https://buseo.sen.go.kr/component/file/ND_fileDownload.do?q_fileSn=2252045&q_fileId=bc9fc075-da4e-4498-ad95-a8d01aac0546 — 매뉴얼 108·114쪽: 치료비·심리상담비는 교육활동 침해 사안이 발생한 날부터 3년 이내 신청 건을 지원.
- 정리 방향: 소송비·배상책임·재산 피해의 기산점을 적은 공식 문서를 찾지 못했다. 공제회에 항목별 기산점을 확인한 뒤 카드 문구를 정해야 한다.

### ulsan

#### ulsan-P10 (`data/regions/ulsan.js:115`)

- 주장: 교원보호공제 한도가 공식 문서마다 다름(배상 한도, 재산 한도, 소진교원 지원, 형사 고소 비용)
- 근거: https://use.go.kr/component/file/ND_fileDownload.do?q_fileSn=866898&q_fileId=6d19c621-0066-47e4-99ce-fdc318a08546 — 2026. 2. 시행계획: 배상 사고당 2억 원(합의 1억 원), 재산 사고당 100만 원, 소진교원 상담 5회, 형사는 방어비용만 지원. 계약 시 일부 변경 가능하다고 표시.
- 근거: https://use.go.kr/component/file/ND_fileDownload.do?q_fileSn=873018&q_fileId=d1c08b34-a4fb-4492-8282-721bd44f0218 — 2026학년도 약관·2026. 3. 상세본: 배상 2억5천만 원(합의 1억5천만 원), 재산 물품당 200만 원, 소진교원 50만 원, 요건 충족 시 고소·고발 비용 지원.
- 정리 방향: 약관이 계약 내용이고 시행계획이 변경 가능성을 밝혔으므로 약관 값을 따르는 것이 맞고 사이트도 약관 값을 쓴다. 다만 P10이 시행계획도 출처로 적어 독자가 옛 값을 볼 수 있으니, 시행계획 값은 계약 전 값임을 출처 설명에 적는 편이 좋다.

## 3. 원문 접근 제한 등으로 남은 미확인 사항

- chungnam-programs-a: chungnam-P01: 업무포털 온라인 신고 배너는 교직원 로그인 영역이라 도달을 직접 확인하지 못함(판정은 공식 문서 기준).
- chungnam-programs-a: chungnam-P02: 1588-9331 실제 ARS 순서와 야간 출동 운영은 전화 없이 확인 불가.
- chungnam-programs-a: chungnam-P03: 교원치유지원신청 글쓰기 화면은 교직원 로그인이 필요해 미확인. 한도·기한의 공식 문서 충돌 미해소.
- chungnam-programs-a: chungnam-P04: 제37조 제4항에 따른 충남 세부 규정과 교육지원청 지원 요청 서식은 찾지 못함.

## 4. 링크·출처 중 독립 확인 불가

- 출처 327건 중 접속 실패·본문 없음은 각 CSV의 `독립 확인 불가` 행을 보세요. JS로만 열리는 카카오 채널·서울시교육청 대문은 도구 한계이며 링크 고장으로 판정하지 않았습니다.
