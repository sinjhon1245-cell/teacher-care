# 선생님 곁에 — 상황별 도움 V2 마이그레이션 계획

> 기준 문서: `docs/situations-v2-spec.md`  
> 기준 코드: 현재 `main`의 `data/common.js`, `app.js`, `data/regions/*.js`, `tools/check-data.js`  
> 상태: **계획 확정 전 / 구현 금지**  
> 이번 문서는 코드 변경 없이 V1(16개) → V2(38개) 전환 범위와 위험을 정리한다.

---

## 1. 현재 코드에서 확인한 핵심 구조

### 1.1 현재 상황 데이터

현재 `data/common.js`의 `SITUS`는 16개이며 다음 축약 필드를 사용한다.

- `g`
- `t`
- `subject`
- `types[]`
- `urgency`
- `stages[]`
- `supports[]`
- `ex`
- `act`
- `report`
- `evidence`
- `dont`
- `programs`
- `orgs`

### 1.2 현재 렌더링이 배열 index에 의존

`app.js`는 상황 index를 여러 곳에서 식별자로 사용한다.

- 상세 상황 open key: `'s' + index`
- 관련 지원 이동: `related: { i: index, ids: [...] }`
- 지원 화면에서 제목 복원: `SITUS[S.related.i].t`

V2에서 38개로 재배열하면 index는 안정적인 식별자가 아니므로 **반드시 상황 `id` 기반으로 변경**한다.

### 1.3 현재 필터

현재 상세 조건은:

- 침해 주체
- 상황 유형
- 긴급성
- 처리 단계
- 지원 유형

같은 그룹 내부는 OR, 서로 다른 그룹은 AND다.

이 로직은 유지한다.

### 1.4 현재 지역화

상황 데이터 자체는 공통이고, 문자열 속 `{HOT}`, `{LEGAL}`, `{SOS}` 등의 토큰을 현재 지역 `terms`로 치환한다.

따라서 V2에서도 **공통 기본 대응 + 지역별 실제 지원 연결** 구조를 유지할 수 있다.

### 1.5 현재 출처 구조

지역 `sources[]`는 배열 index 기반이며 `programs[].source`가 숫자 index를 참조한다.

현재 이 구조는 정상 작동하고 있으므로 V2 상황 확장 과정에서 기존 source 배열 순서를 변경하지 않는다.

---

# 2. V1 16개 → V2 38개 migration map

## V1-01
### 기존
`학생에 의한 폭언·욕설·모욕·명예훼손`

### V2
- `verbal-abuse` — 욕설·고성·폭언을 들었어요
- `public-insult-body-shaming` — 여러 사람 앞에서 모욕하거나 외모·신체를 비하해요

### 처리
**분리**

기존 한 항목이 폭언·모욕·명예훼손을 너무 넓게 묶고 있다.

---

## V1-02
### 기존
`학생의 반복적인 수업 및 교육활동 방해`

### V2
- `repeated-class-disruption` — 반복적인 행동 때문에 수업·교육활동 진행이 어려워요

### 처리
**유지 + 사용자 언어 개선**

---

## V1-03
### 기존
`학생의 정당한 생활지도 불이행`

### V2
- `guidance-noncompliance-disruption` — 생활지도에 불응하면서 의도적으로 수업·교육활동을 방해해요

### 처리
**범위 수정**

단순 불응을 자동 침해처럼 보이게 하지 않는다. `legalCaution` 필수.

---

## V1-04
### 기존
`학생 또는 보호자에 의한 상해·폭행·위협`

### V2
- `physical-assault` — 때리거나 밀치는 등 신체적 공격을 받았어요
- `object-threat` — 물건을 던지거나 휘두르며 위협해요
- `specific-threat` — 나나 가족을 해치겠다는 구체적인 협박을 받았어요
- `weapon-threat` — 위험물·흉기 등으로 위협받고 있어요

### 처리
**4개로 분리**

`subjects[]`를 사용해 학생·보호자·외부인 중 실제 가능한 주체를 각 상황에 지정한다.

---

## V1-05
### 기존
`보호자의 반복적인 민원과 과도한 연락`

### V2
- `repeated-complaint` — 이미 처리한 같은 민원을 계속 제기해요
- `repeated-long-contact` — 장시간·반복 전화나 면담을 계속 요구해요
- `after-hours-contact` — 퇴근 후·주말에도 개인전화나 SNS로 계속 연락해요
- `repeated-info-disclosure-complaint` — 정보공개·국민신문고·온라인 민원이 반복돼 업무가 어려워요

### 처리
**4개로 분리**

정보공개 청구 자체는 권리 행사일 수 있으므로 마지막 항목에는 `legalCaution` 필수.

---

## V1-06
### 기존
`보호자의 폭언·협박 및 특이민원`

### V2
다음 상황으로 분산된다.

- `verbal-abuse`
- `private-verbal-abuse`
- `specific-threat`
- `repeated-complaint`
- `repeated-long-contact`

### 처리
**독립 항목 제거 + 여러 상황으로 흡수**

현재 제목은 서로 다른 대응이 필요한 행동을 한 항목에 섞고 있다.

---

## V1-07
### 기존
`온라인 게시물, 허위사실 유포 및 명예훼손`

### V2
- `online-defamation-doxxing` — 온라인에 허위사실·비방·개인정보·신상이 공개됐어요

### 처리
**유지 + 범위 명확화**

---

## V1-08
### 기존
`무단 녹음·촬영·게시·유포`

### V2
- `hidden-parent-recording` — 보호자가 녹음기 등을 이용해 몰래 수업을 녹음한 것 같아요
- `class-recording-filming` — 학생·보호자가 수업을 녹음하거나 촬영했어요
- `recording-distribution` — 녹음·촬영물이 단톡방이나 SNS에 퍼졌어요
- `synthetic-media-posting` — 내 얼굴·영상·음성이 합성·가공되어 게시됐어요

### 처리
**4개로 분리**

녹음·촬영 그 자체와 배포·합성은 판단과 대응이 다르므로 반드시 분리한다.

---

## V1-09
### 기존
`학교 또는 수업 공간에 무단으로 찾아온 상황`

### V2
- `unauthorized-entry` — 보호자·외부인이 교실이나 교무실에 무단으로 들어왔어요
- `refusal-to-leave-occupation` — 나가 달라고 해도 나가지 않고 항의·점거하며 업무를 방해해요

### 처리
**2개로 분리**

---

## V1-10
### 기존
`교원이 아동학대 신고를 받은 상황`

### V2
- `child-abuse-report` — 아동학대 신고를 받았어요

### 처리
**유지 + 제목 간결화**

---

## V1-11
### 기존
`경찰 조사 또는 수사기관 출석이 필요한 상황`

### V2
- `investigator-summons` — 경찰·검찰 등 수사기관에서 출석을 요구했어요

### 처리
**유지**

---

## V1-12
### 기존
`교육활동과 관련된 민사·형사상 분쟁`

### V2
- `criminal-procedure-response` — 고소·고발·진정 등 형사절차에 대응해야 해요
- `civil-damages-legal-response` — 민사소송·손해배상 문제나 법적 대응을 검토하고 있어요

### 처리
**2개로 분리**

---

## V1-13
### 기존
`교원 개인이 감당하기 어려운 학교민원`

### V2
별도 상황으로 유지하지 않는다.

다음 항목에 흡수:
- 반복 민원
- 장시간·반복 전화·면담
- 근무시간 외 개인 연락
- 반복적 정보공개·온라인 민원
- 부당한 요구·교육활동 간섭

### 처리
**제거 + 지원 안내 원칙으로 전환**

“감당하기 어렵다”는 상황 유형보다 지원 필요 상태에 가깝다.

---

## V1-14
### 기존
`갈등 당사자 간 중재가 필요한 상황`

### V2
- `pre-litigation-mediation` — 보호자와 갈등이 커지고 있지만 신고·소송 전에 중재해 보고 싶어요

### 처리
**유지 + 교사 언어 개선**

---

## V1-15
### 기존
`신변 위협으로 경호·긴급 보호가 필요한 상황`

### V2
- `stalking-approach` — 학교 밖·집 근처까지 찾아오거나 반복적으로 접근해 불안해요

또한 폭행·협박·흉기 위협 상황의 `supports[]`에 경호·신변 보호를 연결한다.

### 처리
**상황과 지원 필요를 분리**

“경호가 필요하다”는 지원 결과이지 사건 유형 자체는 아니다.

---

## V1-16
### 기존
`교육활동 침해 이후 심리적 소진·치료가 필요한 상황`

### V2
- `post-incident-burnout` — 사건 이후 불안·불면·소진이 심하고 출근하기도 두려워요
- `counseling-treatment-return` — 상담·치료나 복귀·회복 지원이 필요해요

### 처리
**2개로 분리**

---

# 3. V1에 없던 V2 신규 상황

다음은 기존 16개에 독립 항목이 없었던 상황이다.

## 폭언·성적 언동
- `private-verbal-abuse` — 1:1 전화·문자로 심한 욕설이나 모욕적인 말을 들어요
- `sexual-remarks-content` — 성적인 말·문자·그림·행동으로 불쾌감을 줘요
- `sexual-contact` — 원하지 않는 성적 신체접촉이 있었어요

## 업무 방해
- `work-interference` — 위력·허위사실 등으로 상담이나 학교 업무 수행을 방해해요

## 부당한 요구·교육활동 간섭
- `homeroom-change-demand` — 담임을 계속 바꿔 달라고 요구해요
- `no-guidance-demand` — 우리 아이를 지도·훈육하지 말라고 계속 요구해요
- `attendance-record-change-demand` — 출결·생활기록부 처리를 원하는 대로 바꾸라고 해요
- `assessment-change-demand` — 시험·평가·성적 방식을 바꾸라고 계속 요구해요
- `unlawful-personal-demand` — 교사의 법적 의무가 아닌 일이나 개인적인 요구를 계속해요

## 학교 방문·훼손
- `property-data-damage` — 학교·교사의 물건, 문서, 수업자료·파일을 고의로 훼손했어요

## 신고
- `suspected-false-report` — 사실과 다른 내용으로 신고·고소된 것 같아요

이 항목은 **신고 내용이 인정되지 않았다는 이유만으로 무고가 되는 것은 아니라는 `legalCaution`이 필수**다.

---

# 4. V2 권장 데이터 모델 — 현재 코드와의 호환을 반영한 수정안

명세의 기본 모델을 유지하되, 현재 필터 구조 때문에 `typeTags[]`를 추가하는 것을 권장한다.

```js
{
  id: 'homeroom-change-demand',
  group: 'interference',
  title: '담임을 계속 바꿔 달라고 요구해요',

  subjects: ['보호자'],

  // 공식 매뉴얼·법령상의 분류
  officialTypes: [
    '정당한 교육활동에 대한 반복적 부당간섭'
  ],

  // 사용자용 '상황 유형' 필터 전용
  typeTags: [
    '부당한 요구·간섭',
    '반복 민원'
  ],

  contexts: [
    '학부모 상담',
    '민원',
    '학급 운영'
  ],

  keywords: [
    '담임교체',
    '담임 바꿔달라',
    '교사 교체'
  ],

  urgency: '교육지원청 신고 검토',
  stages: ['학교 초기 대응'],
  supports: ['행정 지원', '갈등 중재'],

  example: '...',
  firstAction: '...',
  report: '...',
  evidence: '...',
  dont: '...',

  legalCaution: '...',

  regionVariants: {
    incheon: {},
    gyeonggi: {},
    seoul: {}
  }
}
```

## 왜 `typeTags[]`가 필요한가

`officialTypes[]`는 공식 분류 보존용이다.

사용자 필터에 그대로 쓰면:

- 법률 표현이 너무 길어짐
- 비슷한 공식 분류가 다수 생김
- 교사가 빠르게 찾기 어려움

따라서:

- `officialTypes[]` = 근거·검색·설명
- `typeTags[]` = 사용자 필터

로 역할을 분리한다.

---

# 5. 기존 `programs`, `orgs` 필드 처리

현재 `situDetail()`은 `programs`와 `orgs` 문자열을 직접 표시한다.

V2에서 이를 즉시 삭제하면 UI regression 위험이 크다.

따라서 단계적으로 처리한다.

## Phase 1~3

호환용으로 다음 필드를 유지할 수 있다.

```js
supportSummary: '...',
contactSummary: '...'
```

또는 기존 `programs`, `orgs`를 임시 유지한다.

## Phase 5

지역별 실제 지원은 `supports[]` → `SUPPORT_TYPES` → `R.programs`로 연결한다.

이 단계가 안정되면 정적인 `programs/orgs` 문자열 의존도를 줄인다.

### 원칙

지역별 전화번호·사업명을 공통 SITUS 문자열에 직접 하드코딩하지 않는다.

---

# 6. 상황 식별자는 index → id로 변경

이 변경은 V2에서 필수다.

## 현재

```js
situ: 's' + index
related: { i: index, ids: [...] }
SITUS[S.related.i]
```

## V2 권장

```js
situ: 'situ:' + s.id

related: {
  situId: s.id,
  ids: [...]
}

SITUS.find(s => s.id === S.related.situId)
```

그룹 open key도 충돌 방지를 위해:

```js
situ: 'group:' + group.id
```

형태를 권장한다.

---

# 7. FILTER_DEFS V2

## 침해 주체

```js
test: (s, o) => s.subjects.includes(o)
```

## 상황 유형

`typeTags[]` 사용.

초기 권장 사용자 필터:

- 폭행·신체 위협
- 협박·신변 위협
- 폭언·모욕
- 성적 언동·접촉
- 수업·생활지도 방해
- 업무 방해
- 반복·과도한 민원
- 부당한 요구·간섭
- 방문·점거
- 녹음·촬영
- 온라인 유포·신상공개
- 아동학대·신고
- 수사·소송
- 갈등 중재
- 심리·치료·회복

최종 명칭은 38개 데이터 입력 후 count 분포를 확인하고 확정한다.

긴급성·처리 단계·지원 유형은 기존 allowed values를 유지한다.

---

# 8. 검색 상태와 동작

`App.state`에 추가:

```js
query: ''
```

정규화 함수 예시:

```js
normalizeSearch(text)
```

검색 corpus:

- title
- keywords[]
- contexts[]
- officialTypes[]
- example

검색 + 필터는 AND.

### active 기준 변경

현재:

```js
const active = Object.keys(S.filters).length > 0;
```

V2:

```text
필터가 하나라도 선택됐거나 query가 비어 있지 않으면 결과 모드
```

검색어만 입력해도 결과 목록으로 전환되어야 한다.

---

# 9. regionVariants 적용 범위

처음부터 모든 상황에 3지역 variant를 억지로 만들지 않는다.

공통 내용으로 충분하면:

```js
regionVariants: {}
```

또는 필드 생략을 허용한다.

variant가 필요한 경우만:

- 지역 공식 사례가 의미 있게 다를 때
- 해당 지역 특화 지원사업으로 직접 연결할 때
- 신청 경로나 초기 행동이 실제로 다를 때

사용한다.

## 현재 출처 구조와의 충돌

명세 예시에는 `sourceIds`가 있지만 현재 `sources[]`에는 stable id가 없고 `programs[].source`는 숫자 index다.

따라서 **V2 1차 구현에서 per-situation `sourceIds`를 강제하지 않는다.**

화면 하단의 기존:

```js
renderSources('guide')
```

를 그대로 사용한다.

향후 상황별 출처가 필요해지면 별도 Phase에서:

- 기존 source index는 유지
- `sources[]` 각 항목에 optional stable `id` 추가
- 기존 `programs[].source`는 그대로 보존

하는 식으로 확장한다.

---

# 10. 변경될 파일

## `data/common.js`

가장 큰 변경.

- SITUS V2 모델
- 38개 상황
- 11개 SITU_GROUPS
- FILTER_DEFS V2
- 새로운 group id
- 기존 `subject/types/t/ex/act` 구조 제거 또는 호환 레이어
- `typeTags[]` 추가 권장

## `app.js`

- index 기반 상황 식별 → id 기반
- 새 필드명 사용
- `legalCaution` 렌더링
- 검색 상태·검색 로직
- 검색 UI
- 검색 + faceted filter 결합
- regionVariant merge helper
- 관련 지원 이동 시 `situId` 사용

## `style.css`

Phase 4 이후 최소 변경.

예상:
- 검색 input
- 검색 clear button
- legal caution box
- 모바일 검색 영역

기존 폰트·색·radius는 변경하지 않는다.

## `tools/check-data.js`

V2 validator 강화:

- SITUS === 38
- SITU_GROUPS === 11
- id unique
- group valid
- subjects non-empty
- typeTags non-empty
- keywords non-empty
- urgency allowed
- stages allowed
- supports allowed
- regionVariants에 알 수 없는 region id 금지
- regionVariant가 참조하는 support area가 실제 지역 `programs[].area`와 호환되는지 검사
- 기존 source/program index 검사 유지

## `data/regions/*.js`

Phase 1~4에서는 가급적 변경하지 않는다.

Phase 5에서 실제로 필요한 지역 특화 상황만 variant 데이터를 어디에 둘지 결정한다.

### 권장

V2 상황 정의가 공통 파일에 있으므로 `regionVariants`도 우선 SITUS 안에 두고,
지역별 데이터가 크게 늘어날 때만 별도 파일로 분리한다.

---

# 11. regression 위험

## 위험 1 — 배열 index 의존

가장 큼.

38개 확장 뒤 index를 식별자로 계속 사용하면 관련 지원 화면이 다른 상황을 가리킬 수 있다.

**대응: Phase 1에서 id 기반으로 먼저 변경.**

## 위험 2 — 기존 축약 필드명 변경

현재 `situDetail`, `renderGuide`, `renderSupport`가 `s.t`, `s.ex`, `s.act`, `s.g`를 직접 사용한다.

데이터만 먼저 바꾸면 화면이 바로 깨진다.

**대응: 데이터 모델과 소비 코드를 같은 Phase 안에서 원자적으로 변경하거나, 짧은 호환 helper를 둔다.**

## 위험 3 — filters count

현재 count는 같은 그룹을 제외한 다른 필터 조건을 적용한 뒤 계산한다.

검색이 추가되면 count가 “현재 검색어”까지 반영되어야 사용자가 기대하는 숫자가 된다.

**대응: `passesOthers()`의 pool 생성 시 query matching도 함께 적용.**

## 위험 4 — regionVariants 과설계

모든 상황에 서울·경기·인천 문장을 각각 만들면 38×3 유지보수 문제가 다시 생긴다.

**대응: 차이가 있을 때만 override.**

## 위험 5 — 공식 유형을 사용자 필터로 직접 사용

필터가 너무 법률 중심으로 변할 수 있다.

**대응: `typeTags[]` 분리.**

## 위험 6 — source index

지역 sources 배열 중간 삽입은 기존 `programs[].source`를 깨뜨린다.

**대응: 기존 append-only 규칙 유지. V2 작업에서는 source 순서 변경 금지.**

## 위험 7 — 공통 모드에 지역 사업명 노출

regionVariant merge 실수로 공통 모드에서 SEM119, 학교민원 SOS 지원단 등 특정 지역 서비스가 노출될 수 있다.

**대응: regionId가 없으면 variant를 절대 적용하지 않는다.**

---

# 12. 실제 작업 순서

## Phase 1 — 모델·식별자 전환

목표: 화면 기능을 거의 그대로 유지하면서 기반만 바꾼다.

1. V1 16개를 새 필드명으로 변환
2. stable `id` 부여
3. `subject` → `subjects[]`
4. `types` → `typeTags[]`
5. `t/ex/act/g` → `title/example/firstAction/group`
6. index 기반 open/related 상태 → id 기반
7. `situDetail()`, `renderGuide()`, `renderSupport()` 새 필드 대응
8. validator 업데이트

이 단계에서는 **상황 수를 16개로 유지**한다.

### Phase 1 완료 조건

- 기존 화면과 기능이 동일하게 동작
- 관련 지원 이동 정상
- faceted filter 정상
- `node tools/check-data.js` PASS
- console error 0

---

## Phase 2 — 16 → 38 확장

1. 38개 상황 입력
2. 11개 SITU_GROUPS
3. officialTypes / contexts / keywords / legalCaution 입력
4. 중복·누락 검토
5. 긴급성·stages·supports 정합성 검토

### Phase 2 완료 조건

- 38개 정확
- 11개 그룹 모두 사용
- 각 상황 id unique
- 그룹별 count 정상
- common mode / 3지역에서 기본 상세 정상

---

## Phase 3 — 필터 V2

1. subjects 기반
2. typeTags 기반
3. 새로운 그룹명
4. 기존 OR/AND 유지
5. faceted count 검증

### Phase 3 완료 조건

대표 조합 테스트:

- 보호자 + 부당한 요구·간섭
- 학생 + 수업·생활지도 방해
- 보호자 + 녹음·촬영
- 외부인 + 방문·점거
- 즉시 안전 확보 + 법률 지원

의 결과가 기대와 일치.

---

## Phase 4 — 검색

1. query state
2. 검색 input
3. normalization
4. 검색 corpus
5. 검색 + filter AND
6. 검색 clear
7. 빈 결과 UX

### Phase 4 완료 조건

다음 검색어 통과:

- 담임
- 생기부
- 녹음
- 녹음기
- 욕설
- 밤에 전화
- 아동학대
- 성적인
- 폭행
- 손해배상
- 정보공개
- 출근

---

## Phase 5 — 지역 특화 연결

1. 필요한 상황만 regionVariant 작성
2. 서울 특화 지원
3. 경기 특화 지원
4. 인천 특화 지원
5. 다른 지역 근거/기관 leak 점검

### Phase 5 완료 조건

같은 상황을 공통/서울/경기/인천에서 비교했을 때:

- 공통에는 특정 지역 사업명 없음
- 각 지역은 자기 지역 지원만 표시
- 전화번호 섞임 0
- 출처 섞임 0

---

## Phase 6 — UI polish

마지막에만 진행.

- 검색창 PC/mobile
- 38개 그룹/결과의 밀도
- legalCaution 시각 구분
- 긴급 badge
- empty state

디자인 시스템은 그대로 유지한다.

---

# 13. 구현 전에 확정할 결정 3개

## 결정 A — `typeTags[]` 추가

**권장: 추가한다.**

`officialTypes[]`와 사용자 필터 역할이 다르다.

## 결정 B — 기존 `programs/orgs` 즉시 제거 여부

**권장: 즉시 제거하지 않는다.**

Phase 1에서 호환성을 우선하고, Phase 5에서 실제 지역 프로그램 연결이 안정된 뒤 정리한다.

## 결정 C — per-situation `sourceIds`

**권장: 이번 V2에서는 보류한다.**

현재 screen-level `renderSources('guide')`를 유지한다.
상황별 출처가 실제 UX에 필요하다고 판단될 때 stable source id 체계를 별도로 도입한다.

---

# 14. 구현 시작 시 첫 커밋 범위

첫 구현 커밋은 **Phase 1만** 수행한다.

권장 commit:

```text
refactor: migrate situation model to stable v2 ids
```

포함:
- 16개 상황만 유지
- 새 데이터 필드
- stable id
- index → id
- filter compatibility
- validator

제외:
- 38개 확장
- 검색
- regionVariant 실제 데이터
- UI polish

Phase 1이 완전히 안정된 뒤 Phase 2로 간다.
