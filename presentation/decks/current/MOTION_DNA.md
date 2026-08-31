# MOTION DNA — 설득력 있는 글쓰기

정적인 Canva 레퍼런스에는 원래 모션 정보가 없다. 따라서 이 문서는 사용자의 요구, `DESIGN_DNA.md`, 각 슬라이드의 주장과 정보 구조를 근거로 한 시간 축의 기준이다. 사용자의 직접 geometry 편집과 명시적 모션 요청은 이 문서보다 우선한다. 모션은 고정 1600 × 900 정적 덱을 대체하지 않는 browser progressive enhancement이며, `DESIGN_DNA.md`의 여백·타이포그래피·색 역할·로컬 이미지 처리·8장 서사 순서를 바꾸지 않는다.

## Motion personality

- **Personality:** controlled / editorial / precise
- **Pace:** medium. 한 cue에서 다음 cue로 넘어가기 전에 핵심 문장을 읽을 시간을 둔다.
- **Default duration:** 0.4–0.55s
- **Default easing:** `power3.out`
- **Default stagger:** 없음. 실제 순서가 있는 짧은 목록 또는 인과 흐름에서만 0.08–0.14s를 쓴다. 증상·교정·수칙은 각각 하나의 semantic cue 안에서 읽히며, 장식적인 전역 cascade로 만들지 않는다.
- **Cue policy:** 숫자 단계 대신 내용 의미를 쓰며, 모든 슬라이드는 최종 `settled` cue를 둔다. Debug의 cue 버튼과 현재 cue는 timeline label/time에서 결정하며, 초기 label을 고정값으로 보내지 않는다.

## Eight-slide cue map

| Slide | Semantic reading order |
| --- | --- |
| 01 | `enter` → `premise` → `evidence` → `frameworks` → `settled` |
| 02 | `enter` → `evidence` → `mechanism` → `result` → `settled` |
| 03 | `enter` → `symptoms` → `practice` → `settled` |
| 04 | `enter` → `window` → `stop` → `adopt` → `settled` |
| 05 | `enter` → `context` → `corrections` → `settled` |
| 06 | `enter` → `passive` → `concrete` → `settled` |
| 07 | `enter` → `evidence` → `allocation` → `human` → `settled` |
| 08 | `enter` → `rules` → `settled` |

`enter`는 그 장의 주장을 먼저 읽히게 한다. 그 뒤 label은 수치 근거, 메커니즘, 비교, 실천, 최종 행동처럼 해당 장의 읽기 이유를 이름으로 드러낸다. 01은 `frameworks` cue로 cover frameworks를 읽힌다.

## Layer and runtime rules

- **Space/time separation:** 바깥 `.layer[data-layer-id]`만 geometry·identity·Moveable·resize·crop의 소유자다. `left`, `top`, `width`, `height`, `--x`, `--y`, `--w`, `--h`, `--crop-x`, `--crop-y`, `--crop-zoom`, image-frame mask/overflow를 모션으로 바꾸지 않는다.
- **Motion target:** 애니메이션하는 layer는 같은 ID를 가리키는 하나의 직접 자식 `.motion-shell[data-motion-target]`만 가진다. shell에는 `data-layer-id`를 붙이지 않고, 기존 내용의 순서·ID·ARIA·형제 관계를 보존하며 GSAP은 shell만 다룬다. target 또는 shell 검증에 실패하면 runtime은 경고 후 해당 slide를 정적으로 남긴다.
- **Text and diagrams:** 문단 또는 의미 블록 단위로만 나타낸다. 제목은 먼저, 근거는 다음이다. 관계가 핵심일 때만 source → connector → destination 순서로 공개한다.
- **Image:** outer image-frame은 editor crop surface와 clipping boundary로 남긴다. 그 안에서 img만 감싼 shell에 `autoAlpha`, 16–24px 범위의 x/y, 0.985–1.0 scale만 보조적으로 쓴다.
- **Grid/list parity:** 목록·grid는 기존 direct child의 순서와 layout context를 shell 안에서 유지한다. wrapper 때문에 settled layout, 색상 nth-child 규칙, text alignment가 달라져서는 안 된다.
- **Lifecycle:** slide마다 하나의 paused GSAP master timeline을 만들고 navigation/remount 때 context를 revert/kill한다. 활성 mount만 boot guard를 해제한다. CSS delay, timer, ScrollTrigger, loop는 사용하지 않는다.

## Allowed effects

`fade`, `fadeUp`, `directional reveal`, `subtle scale`, 관계를 설명하는 SVG path draw.

## Forbidden effects and scope

bounce, elastic, spin, floating, pulse/glow loop, 무작위 blur, 의미 없는 zoom, parallax, 3D camera, character explosion, 모든 요소의 일괄 stagger를 쓰지 않는다. MP4·영상 export, GSAP plugin, CDN/외부 runtime, 또는 별도의 motion feedback queue도 만들지 않는다.

## Accessibility, settled state, and modes

- HTML/CSS 기본 화면은 항상 `settled` 상태다. `timeline.seek("settled")`는 no-motion 화면과 position, size, crop, typography, alignment, visibility가 같아야 한다.
- `prefers-reduced-motion`, `?motion=off`, Motion Debug의 reduced-motion simulation, GSAP/module 부재, runtime/config 오류에서는 즉시 같은 static settled surface를 보여 준다.
- `?edit=1`은 Motion runtime/timeline을 초기화하지 않는다. edit-only Moveable, geometry/crop persistence, reference overlay, feedback/history는 production motion과 분리된 채 바깥 layer를 계속 선택한다.
- `?motion-debug=1`에서는 panel의 Play, Pause, Restart, numeric seek, semantic cue seek, Motion on/off, reduced-motion simulation과 feedback을 사용한다. Debug panel의 control/input은 deck navigation을 소비하거나 slide를 우발적으로 넘기지 않으며, slide 이동은 hash/명시적 slide navigation으로 한다.
- 모션 feedback은 기존 same-origin `POST /api/feedback`와 `presentation/review/feedback.jsonl`만 사용한다. payload는 `{slide, layerId, cueId, type: "comment", note}`이며, 성공한 뒤에만 note를 비운다. 전송 실패는 화면 상태로 알리고 별도 queue를 만들지 않는다.
