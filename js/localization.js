/**
 * DO NOT PLAY THIS GAME — Localization System (Final Hackathon Release)
 * Authentic, sarcastic, concise, and punchy comedy strings for English & Korean.
 */

const LOCALIZATION = {
  en: {
    boot: {
      line1: "Starting system...",
      line2: "Memory Check... OK",
      line3: "Keyboard...... Detected",
      line4: "Common Sense... NOT FOUND",
      line5: "Launching DO_NOT_PLAY.EXE...",
      skip: "[ Press Space, Enter, or Click to Skip ]"
    },
    title: {
      main: "DO NOT PLAY THIS GAME",
      sub: "Seriously.\nClose this program.",
      play: "PLAY",
      playHover: "DON'T",
      playClick: "...Fine.",
      exit: "EXIT",
      exitNotice: "Good choice.\n\nUnfortunately, that button doesn't work.",
      langLabel: "Language:",
      instructions: "WASD — MOVE | DON'T GET HIT",
      bestScore: "BEST SCORE:",
      bestRank: "BEST RANK:",
      bestStreak: "BEST STREAK:"
    },
    countdown: {
      three: "3",
      two: "2",
      one: "1",
      survive: "SURVIVE."
    },
    gameover: {
      died: "YOU DIED.",
      toldYou: "I told you not to play.",
      fatalTitle: "FATAL ERROR",
      fatalMsg: "Player.exe has stopped responding.",
      score: "SCORE:",
      bestScore: "BEST:",
      time: "TIME:",
      eventsSurvived: "SURVIVED:",
      bestStreak: "BEST STREAK:",
      rank: "RANK:",
      replay: "DON'T",
      replayHover: "PLAY AGAIN"
    },
    sRankModal: {
      title: "CONGRATULATIONS",
      msg: "You successfully ignored every warning.\n\nWe're disappointed in you.",
      btn: "OK"
    },
    ranks: {
      F: "UNINSTALL THE GAME.",
      D: "AT LEAST YOU TRIED.",
      C: "PAINFULLY AVERAGE.",
      B: "NOT BAD. UNFORTUNATELY.",
      A: "YOU WERE TOLD NOT TO PLAY.",
      S: "PLEASE CLOSE THE PROGRAM."
    },
    streakMilestones: {
      5: "NOT BAD.",
      10: "WHY ARE YOU GOOD AT THIS?",
      20: "PLEASE STOP."
    },
    warnings: {
      systemError: "SYSTEM ERROR",
      displayFailure: "DISPLAY FAILURE",
      inputError: "INPUT ERROR",
      windowError: "WINDOW ERROR",
      spaceCorruption: "SPACE CORRUPTION",
      visualGlitch: "VISUAL GLITCH",
      displayDesync: "DISPLAY DESYNC",
      newNotifications: "NEW NOTIFICATIONS",
      pointerError: "POINTER ERROR",
      duplicateWindow: "DUPLICATE WINDOW DETECTED",
      windowSizeError: "WINDOW SIZE ERROR",
      titleBarDetached: "TITLE BAR DETACHED",
      controlInversion: "CONTROL INVERSION",
      hostilePointer: "HOSTILE POINTER",
      compressedThreat: "COMPRESSED THREAT",
      criticalError: "CRITICAL ERROR",
      scanInProgress: "SCAN IN PROGRESS",
      deleteCommand: "DELETE COMMAND",
      firewallActive: "FIREWALL ACTIVE",
      systemFailure: "SYSTEM FAILURE",
      startMenuMalfunction: "START MENU MALFUNCTION",
      gravityCorruption: "GRAVITY CORRUPTION",
      terminalBreach: "TERMINAL BREACH",
      officeAssistant: "OFFICE ASSISTANT",
      screensaverActive: "SCREENSAVER ACTIVE",
      mirrorProcess: "MIRROR PROCESS",
      selectionBox: "SELECTION BOX",
      minesweeper: "MINESWEEPER.EXE"
    },
    desktop: {
      recycleBin: "Recycle Bin",
      myComputer: "My Computer",
      gameExe: "DO_NOT_PLAY.exe",
      startBtn: "Start"
    },
    pause: {
      title: "SYSTEM_PAUSED.EXE",
      heading: "PAUSED",
      desc: "Take your time.<br>The bullets will still be waiting for you.",
      resumeBtn: "Resume"
    },
    dialogs: {
      exitTitle: "WARNING",
      exitHead: "Good choice.",
      exitBody: "Unfortunately, that button doesn't work.",
      sysPropTitle: "SYSTEM PROPERTIES",
      sysPropBody: "CPU: Genuine Retro 486DX2 66MHz<br>RAM: 16 MB EDO RAM<br>OS: Microsoft Windows 98 SE<br>Status: Severe Software Instability Detected",
      recycleTitle: "RECYCLE BIN",
      recycleBody: "Recycle Bin is empty.<br>You cannot delete your mistakes."
    },
    feedback: {
      clear: "CLEAR",
      streak: "STREAK ×"
    },
    titleBarStates: {
      normal: "DO NOT PLAY THIS GAME — [Final Release]",
      notResponding: "DO_NOT_PLAY.EXE (Not Responding)",
      whyHere: "WHY_ARE_YOU_HERE.EXE",
      stopIt: "STOP_PLAYING.EXE",
      helpMe: "HELP_ME.EXE",
      danger: "⚠️ DANGER: HIGH BULLET DENSITY"
    },
    events: {
      popup_hell: { name: "Pop-up Hell", instruction: "REDUCED VISIBILITY: POP-UPS ACTIVE!" },
      popupHell: { name: "Pop-up Hell", instruction: "REDUCED VISIBILITY: POP-UPS ACTIVE!" },
      reversed: { name: "Reversed Controls", instruction: "CONTROLS REVERSED! W↔S, A↔D" },
      cursor: { name: "Cursor.exe", instruction: "HOSTILE CURSOR INCOMING!" },
      window_shrink: { name: "Window Shrink", instruction: "PLAYABLE AREA CONTRACTING!" },
      windowShrink: { name: "Window Shrink", instruction: "PLAYABLE AREA CONTRACTING!" },
      fake_update: { name: "Fake Update", instruction: "INSTALLING SYSTEM UPDATE..." },
      fakeUpdate: { name: "Fake Update", instruction: "INSTALLING SYSTEM UPDATE..." },
      no_signal: { name: "No Signal", instruction: "SIGNAL LOSS: CRT NOISE DETECTED" },
      noSignal: { name: "No Signal", instruction: "SIGNAL LOSS: CRT NOISE DETECTED" },
      moving_window: { name: "Moving Window", instruction: "VIEWPORT DRIFTING!" },
      movingWindow: { name: "Moving Window", instruction: "VIEWPORT DRIFTING!" },
      taskbar_malfunction: { name: "작업표시줄 범람", instruction: "작업표시줄 범람: 상단 대피" },
      taskbarMalfunction: { name: "작업표시줄 범람", instruction: "작업표시줄 범람: 상단 대피" },
      ui_invasion: { name: "UI Invasion", instruction: "SYSTEM OBJECTS ENTERING ARENA!" },
      uiInvasion: { name: "UI Invasion", instruction: "SYSTEM OBJECTS ENTERING ARENA!" },
      color_error: { name: "Color Error", instruction: "PALETTE CORRUPTION: 16-COLOR MODE" },
      colorError: { name: "Color Error", instruction: "PALETTE CORRUPTION: 16-COLOR MODE" },
      title_bar_drop: { name: "Title Bar Drop", instruction: "TITLE BAR DETACHED!" },
      titleBarDrop: { name: "Title Bar Drop", instruction: "TITLE BAR DETACHED!" },
      screen_tearing: { name: "Screen Tearing", instruction: "DISPLAY DESYNC: HORIZONTAL TEARING DETECTED" },
      screenTearing: { name: "Screen Tearing", instruction: "DISPLAY DESYNC: HORIZONTAL TEARING DETECTED" },
      notification_spam: { name: "Notification Spam", instruction: "SYSTEM NOTIFICATIONS INCOMING!" },
      notificationSpam: { name: "Notification Spam", instruction: "SYSTEM NOTIFICATIONS INCOMING!" },
      mouse_trail: { name: "Mouse Trail", instruction: "GHOST CURSOR TRAILS ACTIVE!" },
      mouseTrail: { name: "Mouse Trail", instruction: "GHOST CURSOR TRAILS ACTIVE!" },
      window_ghost: { name: "Window Ghost", instruction: "DUPLICATE WINDOW DETECTED!" },
      windowGhost: { name: "Window Ghost", instruction: "DUPLICATE WINDOW DETECTED!" },
      scrollbar_malfunction: { name: "Scrollbar Malfunction", instruction: "SCROLLBARS SQUEEZING PLAYABLE SPACE!" },
      scrollbarMalfunction: { name: "Scrollbar Malfunction", instruction: "SCROLLBARS SQUEEZING PLAYABLE SPACE!" },
      zipBomb: { name: "Zip Bomb", instruction: "COMPRESSED FILE DETECTED! UNPACKING..." },
      errorLaser: { name: "Error Laser", instruction: "ERROR TURRETS DETECTED! DODGE THE CROSSFIRE" },
      antivirusScan: { name: "Antivirus Scan", instruction: "ANTIVIRUS SCAN: STOP MOVING INSIDE THE BEAM!" },
      deleteKey: { name: "Delete Key", instruction: "SYSTEM EXECUTING DELETE COMMAND!" },
      firewall: { name: "Firewall", instruction: "FIREWALL MOVING! FIND THE SECURITY GAP" },
      blueScreenBg: { name: "Blue Screen", instruction: "FATAL SYSTEM ERROR... BUT GAME CONTINUES" },
      startMenuBarrage: { name: "Start Menu Barrage", instruction: "START MENU POPPING UP! DODGE THE LAUNCHED ITEMS" },
      recycleBinVortex: { name: "Recycle Bin Vortex", instruction: "RECYCLE BIN VORTEX ACTIVE! RESIST THE GRAVITY PULL" },
      cmdHackAttack: { name: "CMD.EXE Hack Attack", instruction: "COMMAND PROMPT ACTIVE: DODGE RAINING CODE MATRICES" },
      hostileClippy: { name: "Hostile Clippy", instruction: "CLIPPY DETECTED! DODGE THE ASSISTANT'S POPUPS & WIRES" },
      bouncingScreensaver: { name: "Bouncing Screensaver", instruction: "SCREENSAVER BOUNCING! DODGE WALL-IMPACT SPARKS" },
      shadowClone: { name: "Shadow Clone EXE", instruction: "SHADOW_PLAYER.EXE COPIES YOU! AVOID CROSSING ITS PATH" },
      selectionBoxDrag: { name: "Selection Box Drag", instruction: "SELECTION BOX DRAGGING! ESCAPE THE PURGE AREA" },
      minesweeper: { name: "Minesweeper", instruction: "MINES DETECTED! AVOID FLAGGED [🚩] EXPLOSION TILES" }
    },
    hud: {
      ready: "Ready",
      playing: "DODGE THE BULLETS!",
      normalPeriod: "NORMAL SECTOR — RECOVER",
      paused: "PAUSED",
      hpRestored: "HP restored. Probably."
    },
    debug: {
      title: "🛠️ DEVELOPER DEBUG TOOLKIT [F2]",
      resetAll: "🔄 RESET ALL",
      endEvent: "⏹ END EVENT",
      pause: "⏸ PAUSE TEST",
      resume: "▶ RESUME",
      heal: "💚 FULL HP",
      damage: "💔 -20 HP",
      invincibleOn: "🛡️ INVINCIBLE: ON",
      invincibleOff: "🛡️ INVINCIBLE: OFF",
      demoReset: "🎪 DEMO RESET",
      opacity100: "👁️ 100%",
      opacity70: "👁️ 70%",
      opacity40: "👁️ 40%",
      headerDirector: "📡 EVENT DIRECTOR & LIVE STATUS",
      autoEventsOn: "AUTO EVENTS: ON",
      autoEventsOff: "AUTO EVENTS: OFF",
      lblDirector: "Director:",
      lblNext: "Next Event:",
      lblActive: "Active Event:",
      lblTime: "Time:",
      lblDiff: "Event Diff:",
      lblSurvived: "Survived:",
      headerLab: "🎯 INTERFERENCE EVENT LAB",
      searchPlaceholder: "Search events...",
      thName: "Event Name",
      thCategory: "Category",
      thStatus: "Status",
      thAction: "Action",
      btnTest: "TEST",
      headerSequence: "⚡ AUTOMATED SEQUENCE RUNNER",
      btnRunAll: "▶ RUN ALL EVENTS",
      btnRunVariants: "▶ TEST ALL VARIANTS",
      btnStop: "⏹ STOP",
      seqIdle: "Sequence idle. Click [RUN ALL EVENTS] or [TEST ALL VARIANTS] to execute.",
      headerBullet: "💥 BULLET & FAIRNESS TESTING",
      lblBulletSpawning: "Bullet Spawning:",
      lblPattern: "Pattern:",
      btnTestPattern: "Test Pattern",
      btnClearBullets: "Clear Bullets",
      headerHealth: "💊 HEALTH ITEMS & VISUAL FEEDBACK",
      lblDropRate: "Drop: 40% base / 65% clean",
      btnSpawnHp: "Spawn HP_FIX.EXE",
      btnClearHp: "Remove Pickups",
      btnTestClear: "Test CLEAR Effect",
      btnStreak5: "+5 Streak",
      headerLoc: "🌐 LOCALIZATION & TEXT VERIFICATION",
      btnTestAllText: "Test Text Modal",
      headerLog: "📜 LIVE DEBUG LOG (MAX 30)",
      btnClearLog: "Clear Log"
    }
  },
  ko: {
    boot: {
      line1: "시스템 시작 중...",
      line2: "메모리 검사........ 정상",
      line3: "???........ ???",
      line4: "??........ ???? ??",
      line5: "DO_NOT_PLAY.EXE ?? ?? ?...",
      skip: "[ Space / Enter / ???? ???? ]"
    },
    title: {
      main: "DO NOT PLAY THIS GAME",
      sub: "경고를 무시하지 마십시오.\n지금 즉시 이 프로그램을 종료하십시오.",
      play: "실행",
      playHover: "권장하지 않습니다",
      playClick: "경고를 무시하셨습니다.",
      exit: "종료",
      exitNotice: "현명한 판단이십니다.\n\n하지만 유감스럽게도 이 버튼은 작동하지 않도록 설계되었습니다.",
      langLabel: "언어 설정:",
      instructions: "조작: WASD / 방향키",
      bestScore: "최고 점수:",
      bestRank: "최고 등급:",
      bestStreak: "최고 연속:"
    },
    countdown: {
      three: "3",
      two: "2",
      one: "1",
      survive: "생존"
    },
    gameover: {
      died: "사망하셨습니다.",
      toldYou: "실행하지 말라고 분명히 경고해 드렸습니다.",
      fatalTitle: "치명적인 시스템 오류",
      fatalMsg: "Player.exe의 프로세스가 강제 종료되었습니다.",
      score: "최종 점수:",
      bestScore: "최고 기록:",
      time: "생존 시간:",
      eventsSurvived: "돌파 횟수:",
      bestStreak: "최고 연속:",
      rank: "최종 등급:",
      replay: "그만두십시오",
      replayHover: "다시 도전"
    },
    sRankModal: {
      title: "축하드립니다",
      msg: "모든 경고를 완벽하게 무시하셨습니다.\n\n시스템은 깊은 유감을 표합니다.",
      btn: "확인"
    },
    ranks: {
      F: "지금 즉시 프로그램을 삭제하십시오.",
      D: "노력은 인정하나, 결과는 처참합니다.",
      C: "지극히 평범하여 아무런 인상도 남기지 못했습니다.",
      B: "기대 이상으로 버티셨으나, 여전히 무의미한 행위입니다.",
      A: "경고를 완전히 무시하면서도 능숙하게 생존하셨습니다.",
      S: "모든 악조건을 돌파하셨습니다. 이제 만족하셨다면 전원을 끄십시오."
    },
    streakMilestones: {
      5: "의외로 침착하게 회피하고 계십니다.",
      10: "어째서 계속해서 생존하고 계신 겁니까?",
      20: "이쯤에서 그만두실 것을 엄중히 권고합니다."
    },
    warnings: {
      systemError: "시스템 오류",
      displayFailure: "화면 출력 오류",
      inputError: "입력 오류",
      windowError: "창 오류",
      spaceCorruption: "공간 왜곡",
      visualGlitch: "시각 글리치",
      displayDesync: "화면 동기화 오류",
      newNotifications: "새 알림 쇄도",
      pointerError: "포인터 오류",
      duplicateWindow: "중복 창 감지됨",
      windowSizeError: "창 크기 오류",
      titleBarDetached: "제목 표시줄 분리",
      controlInversion: "조작 반전 오류",
      hostilePointer: "적대적 포인터 감지",
      compressedThreat: "압축된 위협 감지",
      criticalError: "치명적 오류",
      scanInProgress: "백신 검사 진행 중",
      deleteCommand: "삭제 명령 실행",
      firewallActive: "방화벽 활성화",
      systemFailure: "시스템 장애",
      startMenuMalfunction: "시작 메뉴 오작동",
      gravityCorruption: "중력 왜곡 발생",
      terminalBreach: "명령 프롬프트 침공",
      officeAssistant: "오피스 도우미 출현",
      screensaverActive: "화면보호기 난입",
      mirrorProcess: "그림자 프로세스",
      selectionBox: "영역 선택 박스"
    },
    desktop: {
      recycleBin: "휴지통",
      myComputer: "내 컴퓨터",
      gameExe: "DO_NOT_PLAY.exe",
      startBtn: "시작"
    },
    pause: {
      title: "시스템_일시정지.EXE",
      heading: "일시정지",
      desc: "천천히 하십시오.<br>탄막은 언제나 당신을 기다리고 있습니다.",
      resumeBtn: "계속하기"
    },
    dialogs: {
      exitTitle: "시스템 경고",
      exitHead: "현명한 판단이십니다.",
      exitBody: "안타깝게도, 해당 기능은 제공되지 않습니다.",
      sysPropTitle: "시스템 등록 정보",
      sysPropBody: "CPU: 정품 Retro 486DX2 66MHz<br>RAM: 16 MB EDO RAM<br>OS: Microsoft Windows 98 SE<br>상태: 심각한 시스템 불안정성이 지속되고 있습니다.",
      recycleTitle: "휴지통",
      recycleBody: "휴지통이 비어 있습니다.<br>당신이 내린 선택은 되돌릴 수 없습니다."
    },
    feedback: {
      clear: "돌파 성공",
      streak: "연속 돌파 ×"
    },
    titleBarStates: {
      normal: "DO NOT PLAY THIS GAME — [정식 배포판]",
      notResponding: "DO_NOT_PLAY.EXE (응답 없음)",
      whyHere: "아직도_종료하지_않으셨습니까.EXE",
      stopIt: "그만두십시오.EXE",
      helpMe: "구조요청_거부됨.EXE",
      danger: "⚠️ 경고: 고밀도 탄막 위험 구역"
    },
    events: {
      popup_hell: { name: "팝업 지옥", instruction: "시야 차단: 팝업 주의 요망" },
      popupHell: { name: "팝업 지옥", instruction: "시야 차단: 팝업 주의 요망" },
      reversed: { name: "조작 반전", instruction: "조작 반전 발생: 역방향 이동" },
      cursor: { name: "커서 공격", instruction: "적대적 포인터: 거대 커서 회피" },
      window_shrink: { name: "화면 축소", instruction: "활동 영역 축소: 중앙 유지" },
      windowShrink: { name: "화면 축소", instruction: "활동 영역 축소: 중앙 유지" },
      fake_update: { name: "가짜 업데이트", instruction: "시야 차단: 업데이트 창 주의" },
      fakeUpdate: { name: "가짜 업데이트", instruction: "시야 차단: 업데이트 창 주의" },
      no_signal: { name: "신호 없음", instruction: "신호 노이즈 발생: 시야 주의" },
      noSignal: { name: "신호 없음", instruction: "신호 노이즈 발생: 시야 주의" },
      moving_window: { name: "흔들리는 창", instruction: "창 표류 발생: 뷰포트 추적" },
      movingWindow: { name: "흔들리는 창", instruction: "창 표류 발생: 뷰포트 추적" },
      taskbar_malfunction: { name: "작업표시줄 범람", instruction: "작업표시줄 범람: 상단 대피" },
      taskbarMalfunction: { name: "작업표시줄 범람", instruction: "작업표시줄 범람: 상단 대피" },
      ui_invasion: { name: "UI 침공", instruction: "장애물 투하: 낙하물 회피" },
      uiInvasion: { name: "UI 침공", instruction: "장애물 투하: 낙하물 회피" },
      color_error: { name: "색상 오류", instruction: "팔레트 왜곡: 시각 주의" },
      colorError: { name: "색상 오류", instruction: "팔레트 왜곡: 시각 주의" },
      screen_tearing: { name: "화면 찢김", instruction: "화면 동기화 오류: 왜곡 주의" },
      screenTearing: { name: "화면 찢김", instruction: "화면 동기화 오류: 왜곡 주의" },
      notification_spam: { name: "알림 폭탄", instruction: "알림창 쇄도: 우하단 주의" },
      notificationSpam: { name: "알림 폭탄", instruction: "알림창 쇄도: 우하단 주의" },
      mouse_trail: { name: "마우스 잔상", instruction: "커서 잔상 발생: 위치 식별" },
      mouseTrail: { name: "마우스 잔상", instruction: "커서 잔상 발생: 위치 식별" },
      zipBomb: { name: "ZIP 폭탄", instruction: "압축 해제 임박: 폭심지 대피" },
      errorLaser: { name: "오류 레이저", instruction: "교차 사격 개시: 사선 이탈" },
      antivirusScan: { name: "백신 검사", instruction: "스캔 광선 진입: 이동 정지" },
      deleteKey: { name: "Delete 키", instruction: "키캡 낙하 조준: 즉시 이탈" },
      firewall: { name: "방화벽", instruction: "방화벽 통과: 개방 포트 이동" },
      blueScreenBg: { name: "블루스크린", instruction: "시스템 치명적 오류: 탄막 회피" },
      startMenuBarrage: { name: "시작 메뉴 포격", instruction: "메뉴 버튼 사출: 궤적 회피" },
      recycleBinVortex: { name: "블랙홀 휴지통", instruction: "중력 흡입 발생: 중심 이탈" },
      cmdHackAttack: { name: "도스 프롬프트 해킹", instruction: "코드 매트릭스 낙하: 틈새 회피" },
      hostileClippy: { name: "클리피의 배신", instruction: "말풍선 투척: 폭탄 회피" },
      bouncingScreensaver: { name: "화면보호기 바운스", instruction: "벽면 충돌 스파크: 충돌면 대피" },
      shadowClone: { name: "그림자 분신 커서", instruction: "분신 궤적 생성: 잔상 회피" },
      selectionBoxDrag: { name: "영역 드래그 선택", instruction: "영역 삭제 임박: 박스 이탈" }
    },
    hud: {
      ready: "준비",
      playing: "탄막을 회피하십시오.",
      normalPeriod: "일반 구역 — 호흡을 가다듬으십시오.",
      paused: "일시정지되었습니다.",
      hpRestored: "체력이 일부 복구되었습니다."
    },
    debug: {
      title: "🛠️ 개발자 디버그 툴킷 [F2]",
      resetAll: "🔄 전체 초기화",
      endEvent: "⏹ 이벤트 종료",
      pause: "⏸ 일시정지",
      resume: "▶ 재개",
      heal: "💚 HP 완전 회복",
      damage: "💔 -20 HP 피해",
      invincibleOn: "🛡️ 무적: 켜짐",
      invincibleOff: "🛡️ 무적: 꺼짐",
      demoReset: "🎪 시연 모드 리셋",
      opacity100: "👁️ 100%",
      opacity70: "👁️ 70%",
      opacity40: "👁️ 40%",
      headerDirector: "📡 이벤트 디렉터 & 실시간 상태",
      autoEventsOn: "자동 이벤트: 켜짐",
      autoEventsOff: "자동 이벤트: 꺼짐",
      lblDirector: "디렉터 상태:",
      lblNext: "다음 이벤트:",
      lblActive: "현재 이벤트:",
      lblTime: "진행 시간:",
      lblDiff: "이벤트 난이도:",
      lblSurvived: "돌파 횟수:",
      headerLab: "🎯 방해 이벤트 실험실",
      searchPlaceholder: "이벤트 검색...",
      thName: "이벤트 이름",
      thCategory: "분류",
      thStatus: "상태",
      thAction: "테스트",
      btnTest: "실행",
      headerSequence: "⚡ 자동 순차 검증기",
      btnRunAll: "▶ 전 이벤트 자동 실행",
      btnRunVariants: "▶ 전 난이도 자동 실행",
      btnStop: "⏹ 중지",
      seqIdle: "대기 중. [전 이벤트 자동 실행] 또는 [전 난이도 자동 실행]을 클릭하세요.",
      headerBullet: "💥 탄막 난이도 및 공정성 테스트",
      lblBulletSpawning: "탄막 생성:",
      lblPattern: "패턴:",
      btnTestPattern: "패턴 발사",
      btnClearBullets: "탄막 제거",
      headerHealth: "💊 체력 아이템 & 시각 피드백",
      lblDropRate: "드롭 확률: 기본 40% / 노데미지 65%",
      btnSpawnHp: "HP_FIX.EXE 생성",
      btnClearHp: "아이템 제거",
      btnTestClear: "CLEAR 연출 테스트",
      btnStreak5: "연속 +5 추가",
      headerLoc: "🌐 언어 전환 및 텍스트 검증",
      btnTestAllText: "전체 텍스트 검증",
      headerLog: "📜 실시간 디버그 로그 (최대 30개)",
      btnClearLog: "로그 지우기"
    }
  }
};

let currentLanguage = 'ko';

try {
  const saved = localStorage.getItem('dnp_lang');
  if (saved === 'ko' || saved === 'en') {
    currentLanguage = saved;
  }
} catch (e) {}

function getLoc(category, key, subkey = null) {
  const langObj = LOCALIZATION[currentLanguage] || LOCALIZATION['ko'] || LOCALIZATION['en'];
  if (subkey) {
    return langObj[category]?.[key]?.[subkey] || LOCALIZATION['ko']?.[category]?.[key]?.[subkey] || LOCALIZATION['en']?.[category]?.[key]?.[subkey] || '';
  }
  return langObj[category]?.[key] || LOCALIZATION['ko']?.[category]?.[key] || LOCALIZATION['en']?.[category]?.[key] || key;
}

function setLanguage(lang) {
  if (LOCALIZATION[lang]) {
    currentLanguage = lang;
    try {
      localStorage.setItem('dnp_lang', lang);
    } catch (e) {}
    const langDisplay = document.getElementById('current-lang-display');
    if (langDisplay) {
      langDisplay.textContent = lang === 'ko' ? '한국어' : 'English';
    }
    if (window.game) {
      if (typeof window.game.updateLanguageStrings === 'function') {
        window.game.updateLanguageStrings();
      }
      if (typeof window.game.populateDebugEventList === 'function') {
        window.game.populateDebugEventList();
      }
    }
  }
}

function getLocalizedWarning(warningType) {
  if (currentLanguage !== 'ko') return warningType;
  const warningKeyMap = {
    'SYSTEM ERROR': 'systemError',
    'DISPLAY FAILURE': 'displayFailure',
    'INPUT ERROR': 'inputError',
    'WINDOW ERROR': 'windowError',
    'SPACE CORRUPTION': 'spaceCorruption',
    'VISUAL GLITCH': 'visualGlitch',
    'DISPLAY DESYNC': 'displayDesync',
    'NEW NOTIFICATIONS': 'newNotifications',
    'POINTER ERROR': 'pointerError',
    'DUPLICATE WINDOW DETECTED': 'duplicateWindow',
    'WINDOW SIZE ERROR': 'windowSizeError',
    'TITLE BAR DETACHED': 'titleBarDetached',
    'CONTROL INVERSION': 'controlInversion',
    'HOSTILE POINTER': 'hostilePointer',
    'COMPRESSED THREAT': 'compressedThreat',
    'CRITICAL ERROR': 'criticalError',
    'SCAN IN PROGRESS': 'scanInProgress',
    'DELETE COMMAND': 'deleteCommand',
    'FIREWALL ACTIVE': 'firewallActive',
    'SYSTEM FAILURE': 'systemFailure',
    'START MENU MALFUNCTION': 'startMenuMalfunction',
    'GRAVITY CORRUPTION': 'gravityCorruption',
    'TERMINAL BREACH': 'terminalBreach',
    'OFFICE ASSISTANT': 'officeAssistant',
    'SCREENSAVER ACTIVE': 'screensaverActive',
    'MIRROR PROCESS': 'mirrorProcess',
    'SELECTION BOX': 'selectionBox',
    'MINESWEEPER.EXE': 'minesweeper'
  };
  const key = warningKeyMap[warningType];
  if (key) return getLoc('warnings', key);
  return warningType;
}
