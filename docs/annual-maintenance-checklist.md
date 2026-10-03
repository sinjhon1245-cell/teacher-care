# 연례 갱신 체크리스트

매년(새 학년도 전후) 이 문서를 복사해 그해 기록으로 쓰세요(예: `docs/maintenance-log-2027.md`). 항목마다 □를 ☑로 바꾸고, 바뀐 것이 있으면 옆에 한 줄로 적어요.

- 지금 할 일 목록: `node tools/check-all.js` → `docs/maintenance-report.md`의 **다음 점검 항목**
- 데이터 위치: 공통 `data/common.js` · 지역 `data/regions/seoul.js`, `gyeonggi.js`, `incheon.js` · 지역 gap `tools/data/regional-gaps.js`
- 원칙: **공식 원문으로 확인한 것만** 고쳐요. 한 지역 자료가 없다고 다른 지역 값을 옮겨 적지 않아요. 확인하지 못한 칸은 비워 두면 화면에서 숨겨져요.

## 업데이트 절차(항목 하나를 고칠 때마다)

1. **공식 원문 확인** — 교육부·국가법령정보센터·시·도교육청·학교안전공제회 게시물(개인 블로그·카페 글은 근거로 쓰지 않아요)
2. **기존 데이터 비교** — 해당 항목(`programs[]`, `benefits`, `BENEFITS`, `offices`)과 원문을 한 줄씩 대조
3. **데이터 수정** — 바뀐 값만 고치기. 새 출처는 `sources` 배열 **끝에만** 추가(중간에 넣으면 `source` 번호가 어긋나요)
4. **verifiedAt 수정** — 확인한 항목과 그 출처의 `verifiedAt`을 확인한 날로. 연락처는 `contactsVerifiedAt`, 관할은 `areasVerifiedAt`
5. **sourceUpdatedAt 수정** — 원문의 게시·시행일을 알면 출처와 항목에 적기(공통 제도는 근거 중 가장 최근 시행일)
6. **reviewStatus 수정** — 확인 끝 `verified` · 바뀐 것으로 보여 다시 봐야 함 `review-needed` · 원문이 사라짐 `source-unavailable`. 새 학년도 자료가 나오면 지역 `reviewBy`도 다음 해 3월 1일로
7. **점검**

   ```bash
   node tools/check-all.js
   ```

   `STATUS PASS`가 아니면 멈추고 출력과 `docs/maintenance-report.md`를 보고 고쳐요.
8. **browser smoke test** — 로컬 정적 서버로 서울·경기·인천·공통을 바꿔 가며 고친 화면(지원 찾기 카드·회복·보호 상세·교육지원청 찾기)과 전화 버튼, 링크 복사·인쇄, 뒤로가기를 확인
9. **asset version 변경** — `index.html`의 `<meta name="asset-version">`과 로컬 CSS·JS의 `?v=`를 같은 새 값(`YYYYMMDD-n`)으로
10. **git diff review** — `git diff`로 의도한 줄만 바뀌었는지, `git diff --check`로 공백 오류
11. **commit**
12. **main push**(force push 금지)
13. **GitHub Pages 확인** — Actions의 pages build and deployment 성공, 실제 주소에서 새 asset version과 고친 내용 확인

## [1~2월] 새 기준 자료

| □ | 확인할 것 | 어디서 | 데이터 |
| --- | --- | --- | --- |
| □ | 교육부 새 「교육활동 보호 매뉴얼」 | 교육부·시·도교육청 게시물 | `COMMON_PUBLIC_SOURCES` `manual`, 대응 절차(`STEPS`·`STEP_DETAIL`) |
| □ | 교원지위법·시행령 개정 | 국가법령정보센터(law.go.kr) | `jiwi-law`, `jiwi-decree` → 분리·보호조치 요청·전보(`BENEFITS`) |
| □ | 「교원휴가에 관한 예규」 | 국가법령정보센터 행정규칙 | `leave-rule` → 특별휴가·병가 |
| □ | 국가공무원 복무규정·복무 관련 예규 | 국가법령정보센터 | `bokmu`, `bokmu-rule` → 병가·공무상 병가 |
| □ | 공무원 재해보상법·시행령, 공무원연금공단 공무상 요양 안내 | 국가법령정보센터, geps.or.kr | `accident-act`, `accident-decree`, `geps` → 공무상 요양·공무상 질병휴직 |
| □ | 교육공무원법·임용령·사립학교법·국가공무원법(휴직·복직) | 국가법령정보센터 | `edu-act`, `edu-appoint`, `private-school`, `gukga` |
| □ | 서울 교육활동보호 시행계획·매뉴얼 | 서울특별시교육청 | `data/regions/seoul.js` `sources`, `basis` |
| □ | 경기 교육활동 보호 종합대책·길라잡이 | 경기도교육청 | `data/regions/gyeonggi.js` `sources`, `basis` |
| □ | 인천 교육활동 보호 시행계획·매뉴얼·비용 고시 | 인천광역시교육청 | `data/regions/incheon.js` `sources`, `basis` |

## [2~3월] 지역 지원·연락처(새 학년도 시작 전후)

| □ | 확인할 것 | 데이터 |
| --- | --- | --- |
| □ | 대표전화(02-1395·1600-8787·032-1395 등)와 ARS 메뉴 | 지역 `hot`, `terms`, `menu` → `contactsVerifiedAt` |
| □ | 교육지원청 조직(이름·담당 부서·연락처) | 지역 `offices` → `contactsVerifiedAt` |
| □ | 관할구역(행정구역 개편·교육지원청 신설) | `offices[].areas`, `expectedAreas`, `areaNote` → `areasVerifiedAt`, `areasReviewBy` |
| □ | 교권보호지원센터·교육활동보호센터 | 지역 `programs`, `orgs` |
| □ | 상담기관(협약기관·상담 프로그램 이름) | `programs` 심리상담 |
| □ | 치료비(한도·기간·서류) | `programs` 치료·비용 `amount`·`timing`·`documents` |
| □ | 상담 횟수(회기) | `programs` 심리상담 `amount`·`eligibility` |
| □ | 법률지원(법률지원단·자문 신청 방법) | `programs` 법률 |
| □ | 변호사 지원(수사 단계·소송비 한도) | `programs` 법률·교원보호공제 |
| □ | 안전·경호(기간·대상·서류) | `programs` 경호 |
| □ | 교원보호공제(약관 기간·한도·청구 방법) | `programs` 교원보호공제, 해당 출처 |
| □ | 민원지원(학교민원 대응 조직·연락 경로) | `programs` 학교민원 |
| □ | 갈등조정(조정단·중재단 운영 기간·신청) | `programs` 갈등 중재 |
| □ | 전보 기준(비정기 전보 요건·시기) | 지역 `benefits.transfer` |
| □ | 복귀·회복 관련 지원(치유 프로그램·복귀 지원) | `programs` 치유·회복, `benefits.return-to-work` |
| □ | 지역 gap 다시 판정 | `tools/data/regional-gaps.js`(`checkedAt`, 각 `status`·`note`·`todo`) |
| □ | 새 학년도 재확인일 갱신 | 지역 `reviewBy`(다음 해 3월 1일), 기간이 끝나는 항목의 `reviewBy` |

## [수시]

| □ | 언제 | 할 일 |
| --- | --- | --- |
| □ | broken link | `node tools/check-links.js`에서 ‘끊김’ → 새 공식 주소로 교체, 못 찾으면 `reviewStatus: 'source-unavailable'` |
| □ | 조직개편 | 담당 부서·기관명·연락처·관할 확인, 관련 `orgs`·`offices`·`terms` |
| □ | 전화번호 변경 | 번호를 바꿨다면 실제로 걸어 보거나 공식 자료와 다시 대조(위기 상황에서 쓰여요) |
| □ | 새 매뉴얼 | 위 [1~2월] 해당 줄 다시 확인 |
| □ | 금액 변경 | `amount` 수정 + 출처 `sourceUpdatedAt`(예: 고시 시행일) |
| □ | 상담 횟수 변경 | 심리상담 `amount`·`eligibility` |
| □ | 법령 개정 | 공통 근거 `sourceUpdatedAt` → 관련 `BENEFITS`의 `sourceUpdatedAt`·`verifiedAt`(점검 도구가 어긋나면 알려 줘요) |
| □ | 사용자 오류 제보 | 제보 내용을 공식 원문으로 확인한 뒤에만 반영(제보만으로 고치지 않아요). 의견 받기 운영은 `docs/feedback-form-spec.md` |

## 그해 기록

| 날짜 | 확인한 것 | 바뀐 것 | 커밋 |
| --- | --- | --- | --- |
|  |  |  |  |
