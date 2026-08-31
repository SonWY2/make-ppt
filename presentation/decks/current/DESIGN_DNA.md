# DESIGN DNA — 설득력 있는 글쓰기 / Canva reference / EXTEND

- **Mode:** EXTEND. 현재의 8장 한국어 글쓰기 덱은 기존 덱 DNA와 각 장의 메시지가 topology·시각 요소 수·밀도·실루엣을 결정하는 의도적인 메시지 주도 구성이다. `references/canva-1/canva-01.jpg`부터 `canva-12.jpg`까지의 공개 Canva 레퍼런스는 캔버스와 앵커, 타이포그래피, 색상 역할, 간격 리듬, 이미지 처리, 덱 퍼니처의 시각 언어를 뒷받침하는 증거로만 쓴다. 레퍼런스의 scene graph, 그룹화, 시각 요소 수, 슬라이드 구성을 재현하거나 현재 덱을 그 구조로 다시 만들지 않는다. 사용자의 직접 편집을 제외하고도 각 장의 메시지를 가장 잘 읽히게 하는 현재의 메시지 주도 layout을 보존하며, 레퍼런스는 visual-language 판단만 보완한다.
- **Canvas and anchors:** 고정 1600 × 900. 외부 여백은 약 72 px. 상단의 작은 영문 분류는 y=52, 한국어 섹션 제목은 y=77, 1 px 구분선은 y=124에서 x=72–1516. 본문은 x=72–1520, y=175–790 안에 두며 하단에는 현재 덱·쪽수를 작게 남긴다.
- **Type hierarchy:** `Arial, Noto Sans KR, Malgun Gothic` 순서의 단정한 산세리프. 표지의 핵심 제목은 64–74 px / 700, 일반 장의 주장은 38–48 px / 700, 소제목은 21–27 px / 700, 본문은 15–18 px / 400–500으로 쓴다. 영문 개념은 괄호 안에서만 보조하고, 읽는 흐름을 끊는 장식성 대문자는 쓰지 않는다.
- **Color roles:** 거의 흰 바탕 `#f8f8f7`, 주 강조 남색 `#273961`, 진한 본문 `#2f2f31`, 보조 회색 `#6f6e70`, 조용한 면 `#e7e4df`, 짙은 보조 면 `#4d4c4d`, 가는 선 `#d3d1cd`. 파랑은 결론·선택·숫자 강조에만 쓴다. 그라데이션, glow, 임의의 강조색은 쓰지 않는다.
- **Shapes and spacing:** 모서리 반경은 0 또는 레퍼런스에 근거한 완만한 캡슐·원형뿐이다. 비교와 단계가 메시지일 때만 직사각형 띠·원형·세로 캡슐을 쓴다. 빈 공간은 제목과 증거를 분리하는 읽기 장치다.
- **Image treatment:** 모든 사진은 `presentation/decks/current/assets/`의 로컬 이미지로만 제공한다. 사진은 1장의 주장 또는 비유를 강화하는 크롭된 프레임이며, 사진 격자나 장식 썸네일 묶음이 아니다. 기본적으로 저채도·차분한 대비를 유지한다. 각 주 이미지의 바깥 `image-frame`과 안쪽 `img`는 분리한다. Canva 레퍼런스 이미지는 편집용 비교 외에 운영 화면에서 로드하지 않는다.
- **Narrative rhythm:** 01 표지의 강한 제목 → 02 통념과 연구 결과의 대조 → 03 세 가지 증상 → 04 버릴 태도와 취할 태도 → 05 세 개의 Before/After 교정 → 06 두 원칙의 비교 → 07 수치와 흐름의 증거 → 08 다섯 행동을 남기는 결론. 인접 슬라이드가 같은 카드 구조를 반복하지 않는다.
- **Density:** 사용자가 준 근거와 예문은 보존하되, 한 장에는 한 주장과 그 주장을 읽는 데 필요한 증거만 둔다. 미확인 출처, 새 통계, 장식용 문구는 더하지 않는다.

```text
REFERENCE_FIDELITY = 8
ART_DIRECTION      = 2
DESIGN_VARIANCE    = 2
VISUAL_DENSITY     = 5
MOTION              = 0
```

## Allowed patterns

상단 분류·제목·구분선, 좌우 대조, 큰 숫자와 짧은 근거, 의미 있는 원형·세로 단계, 절제된 로컬 사진 프레임, 결론용 남색 띠와 순차 목록.

## Forbidden patterns


기본 카드 그리드, 라운드 태그, 아이콘 행, 대시보드, 장식용 그래프, 그라데이션, blob, 그림자, 화면 바깥 참조 이미지, 운영 화면의 편집 도구·피드백 UI.

## EXTEND-only slide plan / DNA status

이 템플릿은 사용자가 **EXTEND**를 선택했을 때만 새 슬라이드마다 짧게 기록한다. 기존 덱 DNA가 우선이며, 제공된 레퍼런스는 타이포그래피·색상 역할·간격 리듬·표면/선/연결선 의미·이미지 처리·덱 퍼니처 같은 시각 언어 증거를 보완할 수 있다. 단, 위의 RECONSTRUCT 증거와 현재 슬라이드의 배치·좌표·그룹화·시각 요소 수를 복제 규칙으로 바꾸지 않는다.

```text
Slide / purpose: <new slide and its role>
Message: <one reader takeaway>
Topology: <reading path; each diagram/question and their relationship>
DNA status: preserve <applicable invariants>; vary <layout, visual count, density, silhouette as needed>;
            reference visual language: may inform; scene graph copied: no
```
