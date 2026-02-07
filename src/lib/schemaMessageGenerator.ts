import type { FieldSchema, PurchaseTypeSchema, QuickReplyOption } from '@/types';

/**
 * 카테고리 선택 시 인사 메시지 생성
 */
export function generateCategoryGreeting(schema: PurchaseTypeSchema): string {
  return `${schema.label} 구매요청이시군요! 몇 가지 정보를 여쭤볼게요.`;
}

/**
 * 필드별 질문 메시지 생성
 */
export function generateFieldQuestion(
  field: FieldSchema,
  collectedData: Record<string, unknown>,
  previousField?: FieldSchema,
): string {
  let ack = '';

  // 이전 답변 확인 메시지
  if (previousField && collectedData[previousField.key] !== undefined) {
    const prevValue = collectedData[previousField.key];
    ack = `'${prevValue}' 확인했습니다.\n\n`;
  }

  const desc = field.description ? ` (${field.description})` : '';
  const placeholder = field.placeholder ? `\n예: ${field.placeholder}` : '';

  switch (field.type) {
    case 'enum':
      return `${ack}${field.label}을(를) 선택해주세요.${desc}`;
    case 'number':
      return `${ack}${field.label}을(를) 입력해주세요.${desc}${placeholder}`;
    case 'date':
      return `${ack}${field.label}을(를) 알려주세요.${desc}${placeholder || '\n예: 2025-03-15'}`;
    case 'catalog':
      return `${ack}${field.label}을(를) 입력해주세요.${desc}${placeholder}\n(카탈로그 검색은 준비 중입니다. 텍스트로 입력해주세요.)`;
    case 'text':
      return `${ack}${field.label}을(를) 알려주세요.${desc}${placeholder}`;
    default:
      return `${ack}${field.label}을(를) 알려주세요.${desc}${placeholder}`;
  }
}

/**
 * 확인 요청 메시지 생성
 */
export function generateConfirmMessage(schema: PurchaseTypeSchema): string {
  return `모든 정보가 입력되었습니다. 아래 내용으로 ${schema.label} 구매요청을 제출할까요?`;
}

/**
 * enum 필드의 선택지 반환
 */
export function getFieldOptions(field: FieldSchema): QuickReplyOption[] | undefined {
  if (field.type === 'enum' && field.values && field.values.length > 0) {
    return field.values.map((v) => ({ label: v, value: v }));
  }
  return undefined;
}

/**
 * 확인 단계 옵션
 */
export function getConfirmOptions(): QuickReplyOption[] {
  return [
    { label: '제출하기', value: 'submit' },
    { label: '처음부터 다시', value: 'reset' },
    { label: '취소하기', value: 'cancel' },
  ];
}
