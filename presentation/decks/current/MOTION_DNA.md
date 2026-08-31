# MOTION DNA — 설득력 있는 글쓰기

정적인 Canva 레퍼런스에는 원래 모션 정보가 없다. 따라서 이 문서는 사용자의 요구, `DESIGN_DNA.md`, 각 슬라이드의 주장과 정보 구조를 근거로 한 시간 축의 기준이다. 사용자의 직접 geometry 편집과 명시적 모션 요청은 이 문서보다 우선한다.

## Motion personality

- **Personality:** controlled / editorial / precise
- **Pace:** medium. 한 cue에서 다음 cue로 넘어가기 전에 핵심 문장을 읽을 시간을 둔다.
- **Default duration:** 0.4–0.55s
- **Default easing:** `power3.out`
- **Default stagger:** 없음. 실제 순서가 있는 짧은 목록 또는 인과 흐름에서만 0.08–0.14s를 쓴다.
- **Cue policy:** 숫자 단계 대신 내용 의미를 쓰며, 모든 슬라이드는 최종 `settled` cue를 둔다.

## Layer rules

- **Text:** 문단 또는 의미 블록 단위로만 나타낸다. 제목은 먼저, 근거는 그 다음이다. 글자·단어 단위 분해는 특별한 근거가 없으면 쓰지 않는다.
- **Image:** 사진 프레임의 geometry와 crop은 그대로 두고 내부 `motion-shell`만 0.985–1.0 scale 또는 16–24px 범위에서 보조적으로 움직인다.
- **Diagram:** 관계와 인과가 핵심일 때 source → connector → destination 순서로 공개한다. 장식 목적의 움직임은 쓰지 않는다.
- **Slide transition:** 기본은 정적 전환이다. 별도 요구가 있을 때만 절제된 fade 또는 방향 전환을 사용한다.

## Allowed effects

`fade`, `fadeUp`, `directional reveal`, `subtle scale`, 관계를 설명하는 SVG path draw.

## Forbidden effects

bounce, elastic, spin, floating, pulse/glow loop, 무작위 blur, 의미 없는 zoom, parallax, 3D camera, character explosion, 모든 요소의 일괄 stagger.

## Accessibility and fallback

- HTML/CSS의 기본 화면은 항상 `settled` 상태다.
- `prefers-reduced-motion`, `?motion=off`, GSAP 로드 실패, Edit Mode에서는 즉시 정적 화면을 유지한다.
- Motion은 `.motion-shell`에서만 실행한다. `data-layer-id`를 가진 geometry shell의 `left`, `top`, `width`, `height`, crop 속성은 건드리지 않는다.

## Initial demo — slide 01

`enter`에서 제목, `premise`에서 설명, `evidence`에서 사진을 순서대로 보여 준다. 프레임워크 목록은 정적으로 유지한다. 이 장의 목적은 장식이 아니라 첫 읽기와 근거의 순서를 확인하는 것이다.
