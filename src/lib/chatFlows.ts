// 스키마 기반 채팅 플로우
// 기존 하드코딩된 FLOW_CONFIG를 제거하고, schemaMessageGenerator로 대체
export {
  generateCategoryGreeting,
  generateFieldQuestion,
  generateConfirmMessage,
  getFieldOptions,
  getConfirmOptions,
} from './schemaMessageGenerator';
