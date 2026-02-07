'use client';

import { useReducer, useCallback, useRef } from 'react';
import type { ChatMessage, BriefingStep, ProcurementTask, PurchaseRequest, QuickReplyOption } from '@/types';
import { useBriefingConfig } from '@/lib/briefingConfigContext';
import { useUserBriefingPrefs } from '@/lib/userBriefingPrefsContext';
import {
  generateAllProcurementTasks,
  formatBriefingGreeting,
  formatTaskListIntro,
  getTaskDetailText,
  formatApprovalConfirmation,
  formatBackToListMessage,
} from '@/lib/briefingDataGenerator';

let msgCounter = 0;
function genId() {
  return `brief-${Date.now()}-${++msgCounter}`;
}

interface BriefingState {
  step: BriefingStep;
  messages: ChatMessage[];
  isTyping: boolean;
  selectedTaskId: string | null;
  allTasks: ProcurementTask[];
}

const initialState: BriefingState = {
  step: 'idle',
  messages: [],
  isTyping: false,
  selectedTaskId: null,
  allTasks: [],
};

type BriefingAction =
  | { type: 'ADD_BOT_MESSAGE'; message: ChatMessage }
  | { type: 'ADD_USER_MESSAGE'; text: string }
  | { type: 'SET_TYPING'; isTyping: boolean }
  | { type: 'SET_STEP'; step: BriefingStep; taskId?: string }
  | { type: 'SET_TASKS'; tasks: ProcurementTask[] }
  | { type: 'RESET' };

function briefingReducer(state: BriefingState, action: BriefingAction): BriefingState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          { id: genId(), sender: 'user', text: action.text, timestamp: new Date() },
        ],
      };
    case 'ADD_BOT_MESSAGE':
      return {
        ...state,
        messages: [...state.messages, action.message],
      };
    case 'SET_TYPING':
      return { ...state, isTyping: action.isTyping };
    case 'SET_STEP':
      return {
        ...state,
        step: action.step,
        selectedTaskId: action.taskId ?? state.selectedTaskId,
      };
    case 'SET_TASKS':
      return { ...state, allTasks: action.tasks };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

export function useBriefingEngine() {
  const [state, dispatch] = useReducer(briefingReducer, initialState);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prsRef = useRef<PurchaseRequest[]>([]);

  // Context 소비
  const { getEnabledItems, getEnabledTemplates, items } = useBriefingConfig();
  const { prefs } = useUserBriefingPrefs();

  // useRef로 최신 값 유지 (setTimeout 클로저에서 사용)
  const configRef = useRef({ getEnabledItems, getEnabledTemplates, items });
  configRef.current = { getEnabledItems, getEnabledTemplates, items };
  const prefsRef = useRef(prefs);
  prefsRef.current = prefs;

  const addBotMessage = useCallback(
    (text: string, options?: QuickReplyOption[], taskCards?: ProcurementTask[], delay = 700) => {
      dispatch({ type: 'SET_TYPING', isTyping: true });
      timeoutRef.current = setTimeout(() => {
        dispatch({ type: 'SET_TYPING', isTyping: false });
        dispatch({
          type: 'ADD_BOT_MESSAGE',
          message: {
            id: genId(),
            sender: 'bot',
            text,
            timestamp: new Date(),
            options,
            taskCards,
          },
        });
      }, delay);
    },
    [],
  );

  const startBriefing = useCallback(
    (purchaseRequests: PurchaseRequest[]) => {
      dispatch({ type: 'RESET' });
      prsRef.current = purchaseRequests;

      const cfg = configRef.current;
      const p = prefsRef.current;

      const enabledItems = cfg.getEnabledItems(p.activeRoleId);
      const enabledTemplates = cfg.getEnabledTemplates(p.activeRoleId);

      const allTasks = generateAllProcurementTasks(purchaseRequests, enabledItems, enabledTemplates, p);
      dispatch({ type: 'SET_TASKS', tasks: allTasks });
      dispatch({ type: 'SET_STEP', step: 'greeting' });

      const greetingText = formatBriefingGreeting(p.greetingName, allTasks, enabledItems);
      dispatch({ type: 'SET_TYPING', isTyping: true });

      setTimeout(() => {
        dispatch({ type: 'SET_TYPING', isTyping: false });
        dispatch({
          type: 'ADD_BOT_MESSAGE',
          message: { id: genId(), sender: 'bot', text: greetingText, timestamp: new Date() },
        });

        dispatch({ type: 'SET_STEP', step: 'task_list' });

        if (allTasks.length > 0) {
          const listIntro = formatTaskListIntro(allTasks);
          addBotMessage(listIntro, undefined, allTasks, 500);
        } else {
          addBotMessage('현재 처리 대기 중인 업무가 없습니다.\n오늘은 여유로운 하루가 되시겠네요! 대시보드에서 전체 현황을 확인하실 수 있어요.', [
            { label: '대시보드로 이동', value: '__dashboard__' },
          ], undefined, 500);
        }
      }, 600);
    },
    [addBotMessage],
  );

  const selectTask = useCallback(
    (taskId: string) => {
      dispatch({ type: 'SET_STEP', step: 'task_detail', taskId });

      const selectedTask = state.allTasks.find((t) => t.id === taskId);
      if (selectedTask) {
        dispatch({ type: 'ADD_USER_MESSAGE', text: selectedTask.title });
      }

      const task = state.allTasks.find((t) => t.id === taskId);
      if (!task) return;

      const cfg = configRef.current;
      const detailText = getTaskDetailText(task, prsRef.current, cfg.items);

      const options: QuickReplyOption[] = [];

      if (task.itemId === 'pr_approval' && task.relatedPrId) {
        const pr = prsRef.current.find((p) => p.id === task.relatedPrId);
        if (pr?.status === 'pending') {
          options.push({ label: '승인하기', value: `__approve__:${task.relatedPrId}` });
        }
      }

      options.push(
        { label: '대시보드에서 보기', value: '__dashboard__' },
        { label: '다른 업무 보기', value: '__back_to_list__' },
      );

      addBotMessage(detailText, options);
    },
    [state.allTasks, addBotMessage],
  );

  const sendMessage = useCallback(
    (value: string, displayText?: string) => {
      if (state.isTyping) return;

      if (displayText) {
        dispatch({ type: 'ADD_USER_MESSAGE', text: displayText });
      }

      if (value === '__back_to_list__') {
        dispatch({ type: 'SET_STEP', step: 'task_list' });
        if (state.allTasks.length > 0) {
          const backMsg = formatBackToListMessage(state.allTasks);
          addBotMessage(backMsg, undefined, state.allTasks, 400);
        }
        return;
      }

      if (value.startsWith('__approve__:')) {
        const prId = value.replace('__approve__:', '');
        const task = state.allTasks.find((t) => t.relatedPrId === prId);
        const confirmMsg = task
          ? formatApprovalConfirmation(prId, task)
          : `✅ ${prId} 구매요청이 승인 처리되었습니다.\n다른 업무를 계속 확인하시겠어요?`;
        addBotMessage(
          confirmMsg,
          [
            { label: '다른 업무 보기', value: '__back_to_list__' },
            { label: '대시보드로 이동', value: '__dashboard__' },
          ],
        );
        return;
      }

      if (value === '__restart__') {
        startBriefing(prsRef.current);
        return;
      }

      // 자유 텍스트 입력 처리
      if (!displayText) {
        dispatch({ type: 'ADD_USER_MESSAGE', text: value });
      }
      addBotMessage(
        '죄송합니다, 현재 브리핑 모드에서는 자유 대화를 지원하지 않습니다.\n업무 목록에서 항목을 선택하시면 상세 내용과 처리 옵션을 안내해 드릴게요.',
        [
          { label: '업무 목록 보기', value: '__back_to_list__' },
        ],
      );
    },
    [state.isTyping, state.allTasks, addBotMessage, startBriefing],
  );

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    currentStep: state.step,
    startBriefing,
    selectTask,
    sendMessage,
  };
}
