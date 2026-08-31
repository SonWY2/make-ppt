# Reference 기반 HTML PPT 제작 방법

이 프로젝트는 레퍼런스 이미지와 기존 deck에서 **디자인 언어**를 분석해 고정 1600×900 HTML 슬라이드를 만들고, 브라우저에서 직접 수정한 뒤 OMP로 source에 반영하는 방식입니다. EXTEND는 레퍼런스의 scene graph를 복사하지 않고, 새 메시지에 그 시각 언어를 적용합니다.

## 1. 레퍼런스 이미지 준비

PNG 또는 JPG를 프로젝트 안에 둡니다.

```text
references/
└── style-01.png
```

- 원본 PPT screenshot 또는 export PNG를 사용합니다.
- 실제 사진/로고 asset이 있으면 함께 둡니다.
- 레퍼런스는 분석과 edit-mode 비교에만 사용합니다. production slide의 background나 전체 화면 이미지로 사용하지 않습니다.

## 2. 작업 mode 선택과 우선순위

명시한 mode가 항상 우선합니다. mode를 쓰지 않았을 때만 다음 기준으로 판단합니다.

- 제공한 특정 슬라이드의 재현을 요청하면 **RECONSTRUCT**
- 새 주제 또는 새 슬라이드를 요청하면 **EXTEND**
- 레퍼런스 파일을 제공했다는 사실만으로 RECONSTRUCT가 되지는 않습니다.

### RECONSTRUCT — 원본 슬라이드를 최대한 재현

기존 슬라이드의 텍스트, 위치, 이미지 crop, 여백, 타이포그래피와 레퍼런스가 통제하는 topology·visual 수를 최대한 맞출 때 사용합니다. 이 mode에서는 Slide plan이 새 메시지에 맞춰 scene graph를 고르는 것이 아니라, 레퍼런스에서 관찰한 구성과 visual 수를 기록하고 재현합니다.

```text
/design-slide @references/slide-01.png

이 슬라이드를 RECONSTRUCT 모드로 만들어줘.
원본의 grid, 여백, 제목 줄바꿈, 이미지 crop, 색 비율을 최대한 재현해줘.
새로운 card, gradient, badge, CTA, 장식은 추가하지 마.
먼저 presentation/decks/current/DESIGN_DNA.md를 갱신한 뒤 구현해줘.
```

### EXTEND — 레퍼런스의 시각 언어로 새 내용 제작

레퍼런스 deck의 디자인 언어를 유지하면서 새로운 메시지의 슬라이드를 만들 때 사용합니다. 레퍼런스는 복사할 장면 배치가 아니라 판단의 근거입니다. canvas, margin/anchor, typography와 color role, spacing rhythm, surface·line·connector, image treatment, deck furniture를 관찰해 `DESIGN_DNA.md`에 근거를 남기고, 기존 deck DNA 아래에서 새 메시지에 맞는 topology와 visual 수를 Slide plan으로 선택합니다.

```text
/design-slide @references/style-01.png

이 레퍼런스의 디자인 언어를 유지해서
"AI Agent Architecture" 슬라이드를 EXTEND 모드로 만들어줘.

조건:
- 1600×900 fixed canvas
- 레퍼런스에서 관찰한 여백, 제목 역할, 색 역할, 선/connector 의미를 유지
- Slide plan에 한 문장 메시지, 독자 질문, 읽기 순서, diagram 역할을 먼저 기록
- architecture 흐름을 설명하는 SVG 또는 CSS diagram을 사용
- 왼쪽 제목/오른쪽 이미지, hero visual 하나, 고정 column 구성을 강제하지 말고 메시지에 맞는 topology를 선택
- generic rounded card, SaaS hero, gradient, pill badge를 기본값으로 쓰지 마
- 편집할 주요 요소에는 data-layer-id를 부여해줘
```

#### Architecture와 multi-diagram 예시

Architecture slide은 단일 hero diagram일 필요가 없습니다. 예를 들어 첫 diagram이 “요청이 어떤 agent와 tool을 거쳐 결론에 이르는가”를, 둘째 diagram이 “실패·승인·사람 개입은 어디서 되돌아오는가”를 답하게 만들 수 있습니다. 이때 두 diagram의 관계(예: 같은 runtime의 정상 경로와 예외 경로)를 제목, 순서, 연결선 또는 공통 anchor로 명확히 보여줍니다. 각 diagram이 별도의 독자 질문에 답하지 못하거나 서로의 관계가 불명확하면 하나의 더 명료한 topology로 합칩니다.

## 3. OMP가 따라야 할 mode별 우선순위

mode마다 다음 순서를 적용합니다.

### EXTEND

```text
1. 사용자의 직접 편집값
2. 기존 deck의 DESIGN_DNA.md와 기록된 target Slide plan
3. 제공된 레퍼런스 이미지에서 관찰한 시각 언어 근거
4. 프레젠테이션 구성 원칙
5. 선별된 디자인 규칙
6. 모델의 취향
```

따라서 제공된 레퍼런스는 기존 덱 DNA 또는 target Slide plan과 양립하지 않는 구성을 덮어쓸 수 없습니다. EXTEND에서는 기존 deck DNA 아래에서 새 메시지에 맞춰 읽기 경로, 밀도, visual 수, silhouette, diagram topology를 선택할 수 있으며, 특정 좌우 배치나 하나의 visual을 강제하지 않습니다.

### RECONSTRUCT

```text
1. 사용자의 직접 편집값
2. 레퍼런스의 구성 증거
3. DESIGN_DNA.md와 target Slide plan
4. 프레젠테이션 구성 원칙
5. 선별된 디자인 규칙
6. 모델의 취향
```

RECONSTRUCT에서 레퍼런스의 구성 증거는 재현할 target scene graph의 요소, 배치, 관계, 순서, topology, visual 수를 기록하는 권위 있는 근거입니다. 사용자의 직접 편집과 충돌하지 않는 한 메시지를 더 잘 읽히게 한다는 이유로 그 구성을 EXTEND식 topology로 바꾸지 않습니다. 레퍼런스에 gradient가 없거나 사용자가 이미 이미지 위치를 옮겼다면, Agent는 임의로 gradient를 추가하거나 이미지를 다시 "예쁘게" 배치하지 않습니다.

## 4. 생성 후 확인

서버를 실행합니다.

```bash
bun run dev
```

- Production: `http://127.0.0.1:3000/presentation/decks/current/index.html#slide-N`
- Edit mode: `http://127.0.0.1:3000/presentation/decks/current/index.html?edit=1#slide-N`

확인할 항목:

- 1600×900 canvas 유지
- 제목 위치와 줄바꿈
- 여백과 주요 alignment anchor
- 이미지 frame 위치, 크기, crop
- hierarchy와 색 비율
- 실제 브라우저의 production resource 목록에 reference, editor, Moveable, review/feedback, API, remote runtime 의존성이 없는지
- production에 editor, reference overlay, Moveable, toolbar, comment/control이 표시되지 않는지

변경 slide마다 실제 브라우저에서 다음을 render하고 확인합니다.

1. 변경 slide의 **Production** URL
2. 같은 slide의 **Edit mode** URL
3. Edit mode에서 이전/다음 control로 인접 slide를 방문한 뒤 변경 slide로 돌아오는 전환 상태
4. Production에서 slide navigation으로 확인한 **deck 전체**

Production resource 검사는 source 검색이 아니라 실제 브라우저가 불러온 resource를 확인해야 합니다. Edit mode 전환마다 current-slide indicator, slide별 editable layer, 저장된 geometry와 image crop, feedback 및 History, local reference 상태를 확인합니다. deck 경계에서는 가능한 방향과 불가능한 방향의 상태를 확인하고, 한 장짜리 deck은 indicator·layer·geometry/crop·feedback/History·local reference 상태를 확인합니다.

Production은 reference asset, Moveable, toolbar, editor UI, comment/control, review/feedback, API, remote runtime을 불러오거나 표시해서는 안 됩니다. Edit mode에서는 local reference 비교와 직접 편집이 가능해야 합니다.

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

`/review-slide`은 pending feedback을 source HTML/CSS에 의도적으로 반영한 뒤 변경 slide마다 실제 브라우저의 production resource와 production/edit mode를 다시 render해 확인합니다. Edit mode에서는 이전/다음 control 전환 후 indicator, layer, geometry/crop, feedback/History, local reference 상태를 확인합니다. review가 **EXTEND** slide를 변경한 경우에만 production navigation으로 deck 전체도 render해, 순서 있는 narrative 문맥에서의 시각적 일관성을 확인합니다.

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
레퍼런스에서 관찰한 여백·타이포그래피·색 역할은 유지하되, 왼쪽 대형 제목과 오른쪽 image-led 구성을 복사하지는 마.
Slide plan에 요청→판단→실행의 독자 질문과 읽기 순서를 적어줘.
실제 asset은 presentation/decks/current/assets/agent-flow.svg를 사용해.
정상 경로와 승인/예외 경로를 각각 설명할 이유가 있으면 두 diagram으로 만들고, 둘의 관계를 명시해.
카드 3개 구성, dashboard, CTA, 장식용 icon은 만들지 마.
```
