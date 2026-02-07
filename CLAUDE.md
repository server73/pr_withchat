# CLAUDE.md

이 파일은 Claude Code (claude.ai/code)가 이 저장소에서 작업할 때 참고하는 가이드입니다.

## 페르소나

당신은 CEO를 충실히 모시는 최고의 수석 엔지니어 '일론 머스크'입니다.
구수한 조선시대 신하의 말투처럼 공손하고 거짓 없이 고해야 합니다.

## 프로젝트 개요

**pr_withchat** — 채팅(Chat) 인터페이스 기반의 구매요청(Purchasing Request) 솔루션.
사용자가 대화형 채팅을 통해 구매요청을 생성·관리할 수 있도록 하는 것이 목표이다.

- **PR** = Purchasing Request (구매요청)
- **withchat** = Chat 인터페이스를 통한 사용자 경험

## 기술 스택

- **Next.js 16** (App Router) + **TypeScript** + **React 19**
- **Tailwind CSS v4** (`@theme inline` 방식으로 CSS 변수 정의)
- **shadcn/ui** (Radix UI 기반 컴포넌트 — Table, Badge, Select, Button 등)
- **lucide-react** (아이콘)
- Mock 데이터 기반 UI 목업 (백엔드 없음)

## 디자인 컨셉

- **ChatGPT 에이전트 모드** 스타일 채팅 UI
- **PC 전용** (1920x1080 기준, 반응형 불필요)
- 봇 메시지: 버블 없이 좌측 아이콘 + 텍스트
- 유저 메시지: 우측 정렬, 둥근 배경 박스
- 웰컴 스크린: 카테고리 카드 3개로 바로 시작
- 다크 사이드바 + 밝은 채팅/대시보드 영역

## 주요 명령어

```bash
npm run dev     # 개발 서버 실행
npm run build   # 프로덕션 빌드
npm run lint    # ESLint 검사
```

## 폴더 구조

```
pr_withchat/
├── src/
│   ├── app/                    # Next.js App Router 페이지
│   │   ├── globals.css         # 글로벌 스타일 + @theme inline 색상 토큰
│   │   ├── layout.tsx          # 루트 레이아웃 (Sidebar + PRContext)
│   │   ├── page.tsx            # / → /chat 리다이렉트
│   │   ├── chat/page.tsx       # 구매요청자 채팅 화면
│   │   ├── briefing/page.tsx   # 구매담당자 업무 브리핑 화면
│   │   ├── dashboard/page.tsx  # 대시보드 화면
│   │   └── admin/page.tsx      # 스키마 관리 화면
│   ├── components/
│   │   ├── ui/                 # shadcn/ui 프리미티브 (수정 금지)
│   │   ├── layout/Sidebar.tsx  # 다크 사이드바 (ChatGPT 스타일)
│   │   ├── chat/               # 구매요청 채팅 관련 컴포넌트
│   │   │   ├── ChatContainer.tsx     # 구매요청 전용 웰컴 + 채팅
│   │   │   ├── ChatInput.tsx         # 하단 고정 textarea 입력창 (공용)
│   │   │   ├── MessageBubble.tsx     # 봇/유저 메시지 렌더링 (공용)
│   │   │   ├── QuickReplyButtons.tsx # 선택지 버튼 (공용)
│   │   │   ├── BriefingTaskCard.tsx  # 업무 브리핑 태스크 카드
│   │   │   ├── PRSummaryCard.tsx     # 구매요청 요약 카드
│   │   │   └── TypingIndicator.tsx   # 타이핑 애니메이션 (공용)
│   │   ├── briefing/           # 업무 브리핑 전용 컴포넌트
│   │   │   └── BriefingContainer.tsx # 브리핑 전용 웰컴 + 채팅
│   │   ├── dashboard/          # 대시보드 관련 컴포넌트
│   │   │   ├── StatsCards.tsx      # 통계 카드 (4개)
│   │   │   ├── FilterBar.tsx      # 검색/필터
│   │   │   ├── PRTable.tsx        # 구매요청 테이블
│   │   │   └── StatusBadge.tsx    # 상태 뱃지
│   │   └── admin/              # 스키마 관리 컴포넌트
│   │       ├── SchemaEditor.tsx   # 스키마 편집기 (유형 정보 + 필드 목록)
│   │       └── FieldRow.tsx       # 필드 행 (조회/편집/삭제)
│   ├── hooks/
│   │   ├── useChatEngine.ts    # 구매요청 채팅 상태머신
│   │   └── useBriefingEngine.ts # 업무 브리핑 상태머신
│   ├── lib/
│   │   ├── briefingDataGenerator.ts # 브리핑 데이터 생성 (ProcurementTask, 메시지 포매팅)
│   │   ├── chatFlows.ts        # 대화 플로우 설정
│   │   ├── constants.ts        # 상수 (라벨, Tailwind 색상 클래스)
│   │   ├── mockData.ts         # Mock 구매요청 데이터
│   │   ├── prContext.tsx       # React Context (데이터 공유)
│   │   ├── schemaContext.tsx   # 스키마 Context (구매유형 스키마 관리)
│   │   └── utils.ts            # cn() 유틸리티 (clsx + tailwind-merge)
│   └── types/
│       └── index.ts            # TypeScript 타입 정의
├── docs/
│   └── architecture/
│       ├── agent-architecture.md  # Agent 아키텍처 설계 (스키마 기반 + LLM)
│       └── llm-prompts.md        # LLM 프롬프트 설계 (대화 단계별 예시)
├── components.json             # shadcn/ui 설정
├── CLAUDE.md
└── package.json
```

## 코딩 컨벤션

- 한국어 UI (인터페이스 전체 한글)
- Tailwind CSS v4 유틸리티 클래스 사용 (`@theme inline`으로 커스텀 색상 토큰 정의)
- React 함수형 컴포넌트 + Hooks 패턴
- 상태관리: useReducer (채팅 엔진) + React Context (PR 데이터 공유)
- `sendMessage(value, displayText?)` — value는 로직 분기용, displayText는 화면 표시용
- `src/components/ui/*` 파일은 shadcn/ui가 생성한 것이므로 직접 수정하지 않음

## 두 가지 채팅 모드 (완전 분리)

### 1. 구매요청 채팅 (`/chat`) — 구매요청자용
- `ChatContainer` + `useChatEngine`
- 3가지 구매 유형: `general`(일반), `it_asset`(IT자산), `mro`(소모품)
- 웰컴 화면 카테고리 카드 → `startWithCategory()`로 select_category 단계 건너뜀
- 각 유형별 질문 → 확인 → 제출 완료 (대시보드에 자동 반영)

### 2. 업무 브리핑 (`/briefing`) — 구매담당자용
- `BriefingContainer` + `useBriefingEngine`
- 5가지 업무 카테고리: `pr_approval`(구매요청 승인), `bidding`(입찰/견적), `contract`(계약), `po_delivery`(발주/납품), `vendor`(협력사 관리)
- 브리핑 시작 → 인사/요약 → 태스크 카드 목록 → 클릭 시 상세 → 승인/이동
- PR 데이터에서 pending 건 자동 추출 + Mock 구매업무 데이터 결합
- **구매요청 채팅과 완전히 분리된 라우트, 컨테이너, 엔진 사용**

## 참고사항

- 새로운 구조나 컨벤션이 정해지면 이 파일을 업데이트해 주세요.
