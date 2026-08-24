# 🎮 Do Not Play This Game

> **DODGE THE BULLETS WHILE THE GAME ITSELF TRIES TO SABOTAGE YOU.**

**Do Not Play This Game**은 탄막을 피하며 최대한 오래 생존하는
브라우저 기반 **Bullet-Hell Survival Game**입니다.

단순히 탄막을 회피하는 것에서 그치지 않고,
게임 자체가 플레이어의 **시야, 조작, UI, 플레이 공간**을 방해하는
다양한 이벤트를 발생시키도록 설계했습니다.

---

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
