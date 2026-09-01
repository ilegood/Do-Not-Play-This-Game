# 🎮 Do Not Play This Game

> **DODGE THE BULLETS WHILE THE GAME ITSELF TRIES TO SABOTAGE YOU.**

**Do Not Play This Game**은 탄막을 피하며 최대한 오래 생존하는
브라우저 기반 **Bullet-Hell Survival Game**입니다.

단순히 탄막을 회피하는 것에서 그치지 않고,
게임 자체가 플레이어의 **시야, 조작, UI, 플레이 공간**을 방해하는
다양한 이벤트를 발생시키도록 설계했습니다.

---

# 🌐 Play

게임은 GitHub Pages를 통해 바로 플레이할 수 있습니다.

**[🎮 Play Do Not Play This Game](https://ilegood.github.io/Do-Not-Play-This-Game/)**

별도의 설치나 빌드 과정 없이 브라우저에서 실행할 수 있습니다.

---

# 🔗 Repository

**[GitHub - Do Not Play This Game](https://github.com/ilegood/Do-Not-Play-This-Game)**

## 📌 Project Overview

| 항목 | 내용 |
|---|---|
| 개발 형태 | 개인 프로젝트 |
| 개발 기간 | 1주일 이내 |
| 플랫폼 | Web Browser |
| 장르 | Bullet-Hell Survival |
| 개발 언어 | HTML / CSS / JavaScript |
| 주요 기술 | HTML5 Canvas / Web Audio API |
| 외부 라이브러리 | 없음 |
| 배포 | 미배포 |

---

## 🎮 Gameplay

플레이어는 지속적으로 생성되는 탄막을 피하며
최대한 오래 생존해야 합니다.

시간이 지날수록 탄막과 방해 이벤트가 발생하며,
플레이어는 변화하는 상황에 맞춰 움직여야 합니다.

```text
        Bullet Patterns
               │
               ▼
          ┌─────────┐
          │ Player  │
          └────┬────┘
               │
               ▼
        Event Director
               │
       ┌───────┼───────┐
       ▼       ▼       ▼
      UI     Input    Space
   Disruption Disruption Disruption

# 📚 What I Learned

- HTML5 Canvas를 활용한 게임 렌더링
- JavaScript 기반 게임 루프 구현
- 탄막 생성 및 충돌 처리
- 이벤트 기반 게임 플레이 구조 설계
- 확장 가능한 콘텐츠 구조 설계
- Debug Toolkit을 활용한 기능 테스트 및 밸런싱
- Web Audio API를 활용한 브라우저 사운드 구현
- HTML / CSS / JavaScript만을 활용한 게임 개발
