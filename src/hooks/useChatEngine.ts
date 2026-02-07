'use client';

import { useReducer, useCallback, useRef } from 'react';
import type { ChatState, ChatMessage, ChatStep, PurchaseRequest, QuickReplyOption, PurchaseTypeSchema } from '@/types';
import { useSchema } from '@/lib/schemaContext';
import {
  generateCategoryGreeting,
  generateFieldQuestion,
  generateConfirmMessage,
  getFieldOptions,
  getConfirmOptions,
} from '@/lib/schemaMessageGenerator';

// 유틸: 고유 ID 생성
let msgCounter = 0;
function genId() {
  return `msg-${Date.now()}-${++msgCounter}`;
}

function genPRId() {
  const num = Math.floor(Math.random() * 900) + 100;
  return `PR-2025-${num}`;
}

// 초기 상태
const initialState: ChatState = {
  step: 'idle',
  schemaId: null,
  currentFieldIndex: 0,
  collectedData: {},
  messages: [],
  isTyping: false,
};

// 액션 타입
type ChatAction =
  | { type: 'ADD_USER_MESSAGE'; text: string }
  | { type: 'ADD_BOT_MESSAGE'; message: ChatMessage }
  | { type: 'SET_TYPING'; isTyping: boolean }
  | { type: 'SET_STEP'; step: ChatStep; schemaId?: string; fieldIndex?: number; data?: Record<string, string | number> }
  | { type: 'RESET' };

function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'ADD_USER_MESSAGE':
      return {
        ...state,
        messages: [
          ...state.messages,
          {
            id: genId(),
            sender: 'user',
            text: action.text,
            timestamp: new Date(),
          },
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
        schemaId: action.schemaId ?? state.schemaId,
        currentFieldIndex: action.fieldIndex ?? state.currentFieldIndex,
        collectedData: action.data
          ? { ...state.collectedData, ...action.data }
          : state.collectedData,
      };
    case 'RESET':
      return initialState;
    default:
      return state;
  }
}

// 범용 PurchaseRequest 생성
function buildGenericPurchaseRequest(
  schema: PurchaseTypeSchema,
  data: Record<string, string | number>,
): PurchaseRequest {
  const id = genPRId();

  // 첫 string/catalog 필드에서 제목 추출
  const firstStringField = schema.fields.find((f) => f.type === 'string' || f.type === 'catalog');
  const titleValue = firstStringField ? String(data[firstStringField.key] || '') : schema.label;
  const title = `${titleValue} 구매`;

  // budget/amount 필드에서 금액 추출
  const budgetField = schema.fields.find(
    (f) => f.key === 'budget' || f.key === 'totalAmount' || f.key === 'amount',
  );
  const quantityField = schema.fields.find((f) => f.key === 'quantity');
  let totalAmount = 0;
  if (budgetField && data[budgetField.key]) {
    totalAmount = Number(data[budgetField.key]);
  } else if (quantityField && data[quantityField.key]) {
    totalAmount = Number(data[quantityField.key]) * 10000;
  }

  return {
    id,
    category: schema.id,
    title,
    status: 'pending',
    createdAt: new Date().toISOString(),
    requester: '김관리자',
    department: String(data['department'] || '경영지원팀'),
    totalAmount,
    details: {
      type: 'generic',
      schemaId: schema.id,
      fields: { ...data },
    },
  };
}

export function useChatEngine() {
  const [state, dispatch] = useReducer(chatReducer, initialState);
  const { activeSchemas, getSchema } = useSchema();
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prRef = useRef<PurchaseRequest | null>(null);

  // 봇 메시지를 지연 후 추가
  const addBotMessage = useCallback(
    (text: string, options?: QuickReplyOption[], summaryCard?: PurchaseRequest, delay = 700) => {
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
            summaryCard,
          },
        });
      }, delay);
    },
    [],
  );

  // 채팅 시작 (카테고리 선택부터)
  const startChat = useCallback(() => {
    dispatch({ type: 'RESET' });
    dispatch({ type: 'SET_STEP', step: 'select_category' });

    const options = activeSchemas.map((s) => ({ label: s.label, value: s.id }));
    addBotMessage(
      '안녕하세요! 구매요청 도우미입니다.\n어떤 유형의 구매를 요청하시겠습니까?',
      options,
      undefined,
      300,
    );
  }, [activeSchemas, addBotMessage]);

  // 웰컴 화면에서 카테고리 직접 선택 (select_category 단계 건너뜀)
  const startWithCategory = useCallback(
    (schemaId: string, schemaLabel: string) => {
      dispatch({ type: 'RESET' });
      dispatch({ type: 'ADD_USER_MESSAGE', text: schemaLabel });

      const schema = getSchema(schemaId);
      if (!schema || schema.fields.length === 0) return;

      const requiredFields = schema.fields.filter((f) => f.required);
      if (requiredFields.length === 0) {
        dispatch({ type: 'SET_STEP', step: 'confirming', schemaId });
        const pr = buildGenericPurchaseRequest(schema, {});
        prRef.current = pr;
        addBotMessage(generateConfirmMessage(schema), getConfirmOptions(), pr);
        return;
      }

      dispatch({
        type: 'SET_STEP',
        step: 'collecting',
        schemaId,
        fieldIndex: 0,
      });

      const firstField = requiredFields[0];
      const greeting = generateCategoryGreeting(schema);
      const question = generateFieldQuestion(firstField, {});
      const options = getFieldOptions(firstField);
      addBotMessage(`${greeting}\n\n${question}`, options, undefined, 500);
    },
    [getSchema, addBotMessage],
  );

  // 사용자 입력 처리
  const sendMessage = useCallback(
    (value: string, displayText?: string) => {
      if (state.isTyping) return;

      dispatch({ type: 'ADD_USER_MESSAGE', text: displayText || value });

      // --- select_category 단계 ---
      if (state.step === 'select_category') {
        const schema = getSchema(value);
        if (!schema) return;

        const requiredFields = schema.fields.filter((f) => f.required);
        if (requiredFields.length === 0) {
          dispatch({ type: 'SET_STEP', step: 'confirming', schemaId: value });
          const pr = buildGenericPurchaseRequest(schema, {});
          prRef.current = pr;
          addBotMessage(generateConfirmMessage(schema), getConfirmOptions(), pr);
          return;
        }

        dispatch({
          type: 'SET_STEP',
          step: 'collecting',
          schemaId: value,
          fieldIndex: 0,
        });

        const firstField = requiredFields[0];
        const greeting = generateCategoryGreeting(schema);
        const question = generateFieldQuestion(firstField, {});
        addBotMessage(`${greeting}\n\n${question}`, getFieldOptions(firstField));
        return;
      }

      // --- collecting 단계 ---
      if (state.step === 'collecting' && state.schemaId) {
        const schema = getSchema(state.schemaId);
        if (!schema) return;

        const requiredFields = schema.fields.filter((f) => f.required);
        const currentField = requiredFields[state.currentFieldIndex];
        if (!currentField) return;

        // 값 수집
        const newData: Record<string, string | number> = {
          ...state.collectedData,
          [currentField.key]: value,
        };
        const nextIndex = state.currentFieldIndex + 1;

        if (nextIndex >= requiredFields.length) {
          // 모든 필수 필드 수집 완료 → 확인 단계
          dispatch({ type: 'SET_STEP', step: 'confirming', fieldIndex: nextIndex, data: newData });
          const pr = buildGenericPurchaseRequest(schema, newData);
          prRef.current = pr;
          addBotMessage(generateConfirmMessage(schema), getConfirmOptions(), pr);
        } else {
          // 다음 필드 질문
          const nextField = requiredFields[nextIndex];
          dispatch({ type: 'SET_STEP', step: 'collecting', fieldIndex: nextIndex, data: newData });
          const question = generateFieldQuestion(nextField, newData, currentField);
          addBotMessage(question, getFieldOptions(nextField));
        }
        return;
      }

      // --- confirming 단계 ---
      if (state.step === 'confirming') {
        if (value === 'submit') {
          // 제출 완료
          dispatch({ type: 'SET_STEP', step: 'completed' });
          dispatch({ type: 'SET_TYPING', isTyping: true });
          setTimeout(() => {
            dispatch({ type: 'SET_TYPING', isTyping: false });
            const prId = prRef.current?.id || genPRId();
            dispatch({
              type: 'ADD_BOT_MESSAGE',
              message: {
                id: genId(),
                sender: 'bot',
                text: `구매요청이 성공적으로 제출되었습니다!\n\n요청번호: ${prId}\n\n대시보드에서 진행 상황을 확인하실 수 있습니다.`,
                timestamp: new Date(),
                options: [
                  { label: '새 구매요청', value: '__restart__' },
                  { label: '대시보드로 이동', value: '__dashboard__' },
                ],
              },
            });
          }, 800);
        } else if (value === 'reset') {
          // 처음부터 다시
          dispatch({ type: 'RESET' });
          dispatch({ type: 'SET_STEP', step: 'select_category' });
          const options = activeSchemas.map((s) => ({ label: s.label, value: s.id }));
          addBotMessage(
            '안녕하세요! 구매요청 도우미입니다.\n어떤 유형의 구매를 요청하시겠습니까?',
            options,
            undefined,
            500,
          );
        } else {
          // 취소
          dispatch({ type: 'SET_TYPING', isTyping: true });
          setTimeout(() => {
            dispatch({ type: 'SET_TYPING', isTyping: false });
            dispatch({
              type: 'ADD_BOT_MESSAGE',
              message: {
                id: genId(),
                sender: 'bot',
                text: '구매요청이 취소되었습니다. 새로운 요청을 하시려면 아래 버튼을 눌러주세요.',
                timestamp: new Date(),
                options: [{ label: '새 구매요청', value: '__restart__' }],
              },
            });
            dispatch({ type: 'SET_STEP', step: 'idle' });
          }, 500);
        }
        return;
      }
    },
    [state, getSchema, activeSchemas, addBotMessage],
  );

  return {
    messages: state.messages,
    isTyping: state.isTyping,
    currentStep: state.step,
    startChat,
    startWithCategory,
    sendMessage,
    lastPR: prRef.current,
  };
}
