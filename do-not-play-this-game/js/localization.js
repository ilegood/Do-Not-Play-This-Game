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
      systemFailure: "SYSTEM FAILURE"
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
      popupHell: { name: "Pop-up Hell", instruction: "REDUCED VISIBILITY: POP-UPS ACTIVE!" },
      reversed: { name: "Reversed Controls", instruction: "CONTROLS REVERSED! W↔S, A↔D" },
      cursor: { name: "Cursor.exe", instruction: "HOSTILE CURSOR INCOMING!" },
      windowShrink: { name: "Window Shrink", instruction: "PLAYABLE AREA CONTRACTING!" },
      fakeUpdate: { name: "Fake Update", instruction: "INSTALLING SYSTEM UPDATE..." },
      noSignal: { name: "No Signal", instruction: "SIGNAL LOSS: CRT NOISE DETECTED" },
      movingWindow: { name: "Moving Window", instruction: "VIEWPORT DRIFTING!" },
      taskbarMalfunction: { name: "Taskbar Malfunction", instruction: "TASKBAR EXPANDING UPWARD!" },
      uiInvasion: { name: "UI Invasion", instruction: "SYSTEM OBJECTS ENTERING ARENA!" },
      colorError: { name: "Color Error", instruction: "PALETTE CORRUPTION: 16-COLOR MODE" },
      titleBarDrop: { name: "Title Bar Drop", instruction: "TITLE BAR DETACHED!" },
      screenTearing: { name: "Screen Tearing", instruction: "DISPLAY DESYNC: HORIZONTAL TEARING DETECTED" },
      notificationSpam: { name: "Notification Spam", instruction: "SYSTEM NOTIFICATIONS INCOMING!" },
      mouseTrail: { name: "Mouse Trail", instruction: "GHOST CURSOR TRAILS ACTIVE!" },
      windowGhost: { name: "Window Ghost", instruction: "DUPLICATE WINDOW DETECTED!" },
      scrollbarMalfunction: { name: "Scrollbar Malfunction", instruction: "SCROLLBARS SQUEEZING PLAYABLE SPACE!" },
      zipBomb: { name: "Zip Bomb", instruction: "COMPRESSED FILE DETECTED! UNPACKING..." },
      errorLaser: { name: "Error Laser", instruction: "ERROR TURRET ACTIVATED! DODGE THE BEAM" },
      antivirusScan: { name: "Antivirus Scan", instruction: "THREAT DETECTED: PLAYER! AVOID SCAN FIELD" },
      deleteKey: { name: "Delete Key", instruction: "SYSTEM EXECUTING DELETE COMMAND!" },
      firewall: { name: "Firewall", instruction: "FIREWALL MOVING! FIND THE SECURITY GAP" },
      blueScreenBg: { name: "Blue Screen", instruction: "FATAL SYSTEM ERROR... BUT GAME CONTINUES" }
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
      line3: "키보드........ 감지됨",
      line4: "상식........ 감지되지 않음",
      line5: "DO_NOT_PLAY.EXE 실행 중...",
      skip: "[ Space, Enter 또는 클릭으로 건너뛰기 ]"
    },
    title: {
      main: "DO NOT PLAY THIS GAME",
      sub: "진심이야.\n그냥 이 프로그램 꺼.",
      play: "시작",
      playHover: "하지마",
      playClick: "...알겠어.",
      exit: "종료",
      exitNotice: "좋은 선택입니다.\n\n하지만 안타깝게도 이 버튼은 작동하지 않습니다.",
      langLabel: "언어:",
      instructions: "WASD — 이동 | 맞지 마",
      bestScore: "최고 점수:",
      bestRank: "최고 등급:",
      bestStreak: "최고 연속:"
    },
    countdown: {
      three: "3",
      two: "2",
      one: "1",
      survive: "살아남아."
    },
    gameover: {
      died: "사망하셨습니다.",
      toldYou: "하지 말랬잖아.",
      fatalTitle: "치명적인 오류",
      fatalMsg: "Player.exe의 작동이 중지되었습니다.",
      score: "점수:",
      bestScore: "최고:",
      time: "생존 시간:",
      eventsSurvived: "돌파:",
      bestStreak: "최고 연속:",
      rank: "등급:",
      replay: "하지마",
      replayHover: "다시 하기"
    },
    sRankModal: {
      title: "축하합니다",
      msg: "모든 경고를 성공적으로 무시하셨습니다.\n\n정말 실망스럽습니다.",
      btn: "확인"
    },
    ranks: {
      F: "게임 삭제해.",
      D: "시도는 했네.",
      C: "놀랍도록 평범함.",
      B: "아쉽게도 좀 치네.",
      A: "하지 말랬는데 잘도 하네.",
      S: "제발 이제 꺼."
    },
    streakMilestones: {
      5: "좀 치네.",
      10: "왜 잘하는데?",
      20: "제발 그만해."
    },
    warnings: {
      systemError: "시스템 오류",
      displayFailure: "화면 출력 오류",
      inputError: "입력 오류",
      windowError: "창 오류",
      spaceCorruption: "공간 왜곡",
      visualGlitch: "시각 글리치",
      displayDesync: "화면 동기화 오류",
      newNotifications: "새 알림 있음",
      pointerError: "포인터 오류",
      duplicateWindow: "중복 창 감지됨",
      windowSizeError: "창 크기 오류",
      titleBarDetached: "제목 표시줄 분리",
      controlInversion: "조작 반전 오류",
      hostilePointer: "적대적 포인터 감지",
      compressedThreat: "압축된 위협 감지",
      criticalError: "치명적 오류",
      scanInProgress: "검사 진행 중",
      deleteCommand: "삭제 명령 실행",
      firewallActive: "방화벽 활성화",
      systemFailure: "시스템 장애"
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
      desc: "천천히 하세요.<br>탄막은 언제나 당신을 기다리고 있습니다.",
      resumeBtn: "계속하기"
    },
    dialogs: {
      exitTitle: "경고",
      exitHead: "좋은 선택입니다.",
      exitBody: "안타깝게도, 그 버튼은 작동하지 않습니다.",
      sysPropTitle: "시스템 등록 정보",
      sysPropBody: "CPU: 정품 Retro 486DX2 66MHz<br>RAM: 16 MB EDO RAM<br>OS: Microsoft Windows 98 SE<br>상태: 심각한 소프트웨어 불안정성 감지됨",
      recycleTitle: "휴지통",
      recycleBody: "휴지통이 비어 있습니다.<br>당신이 저지른 실수는 삭제할 수 없습니다."
    },
    feedback: {
      clear: "돌파 성공",
      streak: "연속 돌파 ×"
    },
    titleBarStates: {
      normal: "DO NOT PLAY THIS GAME — [Final Release]",
      notResponding: "DO_NOT_PLAY.EXE (응답 없음)",
      whyHere: "왜_아직도_있는거야.EXE",
      stopIt: "그만_해.EXE",
      helpMe: "살려줘.EXE",
      danger: "⚠️ 경고: 고밀도 탄막 구역"
    },
    events: {
      popupHell: { name: "팝업 지옥", instruction: "시야 방해: 오류 팝업 발생!" },
      reversed: { name: "조작 반전", instruction: "조작 반전 발생! W↔S, A↔D" },
      cursor: { name: "커서 공격", instruction: "거대 마우스 커서 추적 중!" },
      windowShrink: { name: "화면 축소", instruction: "활동 영역이 좁아집니다!" },
      fakeUpdate: { name: "가짜 업데이트", instruction: "시스템 업데이트 설치 중..." },
      noSignal: { name: "신호 없음", instruction: "신호 불량: 노이즈 발생" },
      movingWindow: { name: "흔들리는 창", instruction: "게임 창이 표류합니다!" },
      taskbarMalfunction: { name: "작업표시줄 확장", instruction: "작업 표시줄이 상승합니다!" },
      uiInvasion: { name: "UI 침공", instruction: "시스템 UI 장애물 투하!" },
      colorError: { name: "색상 오류", instruction: "16색 팔레트 왜곡 모드" },
      titleBarDrop: { name: "제목줄 낙하", instruction: "제목 표시줄이 떨어집니다!" },
      screenTearing: { name: "화면 찢김", instruction: "화면 동기화 오류: 수평 찢김 발생" },
      notificationSpam: { name: "알림 폭탄", instruction: "시스템 알림 창 쇄도 중!" },
      mouseTrail: { name: "마우스 잔상", instruction: "마우스 커서 잔상 활성화!" },
      windowGhost: { name: "창 잔상", instruction: "중복 창 감지됨!" },
      scrollbarMalfunction: { name: "스크롤바 오류", instruction: "스크롤바가 공간을 압박합니다!" },
      zipBomb: { name: "ZIP 폭탄", instruction: "압축 파일 감지! 해제 중..." },
      errorLaser: { name: "오류 레이저", instruction: "오류 포탑 작동! 레이저를 피하세요" },
      antivirusScan: { name: "백신 검사", instruction: "위협 요소 감지: 플레이어! 검사 영역 회피" },
      deleteKey: { name: "Delete 키", instruction: "시스템이 삭제 명령을 실행합니다!" },
      firewall: { name: "방화벽", instruction: "방화벽 이동 중! 보안 틈새로 통과하세요" },
      blueScreenBg: { name: "블루스크린", instruction: "치명적 시스템 오류... 하지만 게임은 계속됩니다" }
    },
    hud: {
      ready: "준비",
      playing: "탄막을 피하세요!",
      normalPeriod: "일반 구역 — 회복 구간",
      paused: "일시정지",
      hpRestored: "HP 복구됨. 아마도."
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

let currentLanguage = 'en';

function getLoc(category, key, subkey = null) {
  const langObj = LOCALIZATION[currentLanguage] || LOCALIZATION['en'];
  if (subkey) {
    return langObj[category]?.[key]?.[subkey] || LOCALIZATION['en'][category]?.[key]?.[subkey] || '';
  }
  return langObj[category]?.[key] || LOCALIZATION['en'][category]?.[key] || key;
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
    'SYSTEM FAILURE': 'systemFailure'
  };
  const key = warningKeyMap[warningType];
  if (key) return getLoc('warnings', key);
  return warningType;
}
