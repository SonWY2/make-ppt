# Reference 기반 HTML PPT 제작 방법

이 프로젝트는 레퍼런스 이미지의 디자인 언어를 분석해 고정 1600×900 HTML 슬라이드를 만들고, 브라우저에서 직접 수정한 뒤 OMP로 source에 반영하는 방식입니다.

## 1. 레퍼런스 이미지 준비

PNG 또는 JPG를 프로젝트 안에 둡니다.

```text
references/
└── style-01.png
```

- 원본 PPT screenshot 또는 export PNG를 사용합니다.
- 실제 사진/로고 asset이 있으면 함께 둡니다.
- 레퍼런스는 분석과 edit-mode 비교에만 사용합니다. production slide의 background나 전체 화면 이미지로 사용하지 않습니다.

## 2. 작업 mode 선택

### RECONSTRUCT — 원본 슬라이드를 최대한 재현

기존 슬라이드의 텍스트, 위치, 이미지 crop, 여백, 타이포그래피를 최대한 맞출 때 사용합니다.

```text
/design-slide @references/slide-01.png

이 슬라이드를 RECONSTRUCT 모드로 만들어줘.
원본의 grid, 여백, 제목 줄바꿈, 이미지 crop, 색 비율을 최대한 재현해줘.
새로운 card, gradient, badge, CTA, 장식은 추가하지 마.
먼저 presentation/decks/current/DESIGN_DNA.md를 갱신한 뒤 구현해줘.
```

### EXTEND — 레퍼런스의 스타일로 새 내용 제작

레퍼런스 deck의 디자인 언어를 유지하면서 새로운 메시지의 슬라이드를 만들 때 사용합니다.

```text
/design-slide @references/style-01.png

이 레퍼런스의 디자인 언어를 유지해서
"AI Agent Architecture" 슬라이드를 EXTEND 모드로 만들어줘.

조건:
- 1600×900 fixed canvas
- 레퍼런스의 여백, 제목 크기, 이미지 비중, 색 역할을 우선
- 내용에는 architecture 흐름이 보이게 SVG 또는 CSS diagram 사용
- generic rounded card, SaaS hero, gradient, pill badge를 기본값으로 쓰지 마
- 편집할 주요 요소에는 data-layer-id를 부여해줘
```

## 3. OMP가 따라야 할 우선순위

다음 순서는 바뀌지 않습니다.

```text
1. 사용자의 직접 편집값
2. 레퍼런스 이미지
3. DESIGN_DNA.md
4. 프레젠테이션 구성 원칙
5. 선별된 디자인 규칙
6. 모델의 취향
```

따라서 레퍼런스에 gradient가 없거나 사용자가 이미 이미지 위치를 옮겼다면, Agent는 임의로 gradient를 추가하거나 이미지를 다시 "예쁘게" 배치하지 않습니다.

## 4. 생성 후 확인

서버를 실행합니다.

```bash
bun run dev
```

- Production: `http://127.0.0.1:3000/presentation/decks/current/index.html`
- Edit mode: `http://127.0.0.1:3000/presentation/decks/current/index.html?edit=1`

확인할 항목:

- 1600×900 canvas 유지
- 제목 위치와 줄바꿈
- 여백과 주요 alignment anchor
- 이미지 frame 위치, 크기, crop
- hierarchy와 색 비율
- production에 editor, reference overlay, Moveable이 없는지

## 5. 브라우저에서 직접 수정

Edit mode에서 다음을 할 수 있습니다.

- 요소 선택, drag, resize, snap
- Arrow: 1px 이동 / Shift + Arrow: 10px 이동
- hero image crop: pan, zoom
- 요소 comment 및 빈 공간 point comment
- Undo, Reset
- Reference overlay, opacity, side-by-side compare

직접 이동/resize/crop한 값은 즉시 `presentation/review/overrides.json`에 저장됩니다. 코멘트는 `presentation/review/feedback.jsonl`에 append-only로 저장됩니다.

## 6. 코멘트 관리

- 기본 화면에는 아직 처리하지 않은 코멘트만 보입니다.
- **History**: 적용 또는 dismiss된 코멘트를 흐린 marker로 확인합니다.
- **Dismiss**: 더 이상 필요 없는 pending 코멘트를 화면에서 숨깁니다. 원본 기록은 삭제하지 않고 `rejected` resolution으로 남깁니다.

## 7. OMP로 source 반영

직접 편집과 pending 코멘트를 확인한 뒤 실행합니다.

```text
/review-slide

pending feedback을 source에 반영해줘.
직접 drag / resize / crop한 geometry는 그대로 유지해.
적용한 feedback만 applied로 기록하고, 해당 override만 정리해.
```

특정 요소만 반영하려면:

```text
/review-slide

hero-image 관련 pending feedback만 적용해줘.
다른 layer의 comment와 geometry는 변경하지 마.
```

`/review-slide`은 source HTML/CSS를 수정한 뒤 production과 edit mode를 다시 확인합니다.

## 8. 권장 요청 방식

좋은 요청은 다음 정보를 포함합니다.

```text
- mode: RECONSTRUCT 또는 EXTEND
- 레퍼런스 이미지 경로
- 슬라이드의 한 문장 핵심 메시지
- 반드시 유지할 요소
- 변경하면 안 되는 요소
- 사용할 실제 asset 경로
```

예시:

```text
/design-slide @references/strategy-deck-03.png

EXTEND 모드.
핵심 메시지는 "AI Agent가 운영 의사결정을 더 빠르게 만든다".
레퍼런스의 왼쪽 대형 제목과 오른쪽 image-led 구성을 유지해줘.
실제 asset은 presentation/decks/current/assets/agent-flow.svg를 사용해.
카드 3개 구성, dashboard, CTA, 장식용 icon은 만들지 마.
```
