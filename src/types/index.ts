// 구매요청 카테고리 (기존 3개 유지, 하위호환)
export type PRCategory = 'general' | 'it_asset' | 'mro';

// 구매요청 상태
export type PRStatus = 'pending' | 'in_review' | 'approved' | 'rejected';

// 긴급도
export type Urgency = 'low' | 'medium' | 'high';

// 일반 구매요청 상세
export interface GeneralPRDetails {
  type: 'general';
  itemName: string;
  quantity: number;
  desiredDeliveryDate: string;
  budget: number;
  reason: string;
}

// IT 자산 구매 상세
export interface ITAssetPRDetails {
  type: 'it_asset';
  equipmentType: string;
  specs: string;
  quantity: number;
  user: string;
  department: string;
}

// MRO/소모품 상세
export interface MROPRDetails {
  type: 'mro';
  consumableName: string;
  quantity: number;
  urgency: Urgency;
  deliveryAddress: string;
}

// 범용 스키마 기반 상세 (동적 스키마에서 생성)
export interface GenericPRDetails {
  type: 'generic';
  schemaId: string;
  fields: Record<string, unknown>;
}

export type PRDetails = GeneralPRDetails | ITAssetPRDetails | MROPRDetails | GenericPRDetails;

// 구매요청
export interface PurchaseRequest {
  id: string;
  category: string; // PRCategory 또는 동적 스키마 ID
  title: string;
  status: PRStatus;
  createdAt: string;
  requester: string;
  department: string;
  totalAmount: number;
  details: PRDetails;
}

// 채팅 메시지
export type MessageSender = 'bot' | 'user';

export interface QuickReplyOption {
  label: string;
  value: string;
}

export interface ChatMessage {
  id: string;
  sender: MessageSender;
  text: string;
  timestamp: Date;
  options?: QuickReplyOption[];
  summaryCard?: PurchaseRequest;
  taskCards?: ProcurementTask[];
}

// 채팅 상태머신 스텝 (스키마 기반 — 5개로 간소화)
export type ChatStep = 'idle' | 'select_category' | 'collecting' | 'confirming' | 'completed';

export interface ChatState {
  step: ChatStep;
  schemaId: string | null;
  currentFieldIndex: number;
  collectedData: Record<string, string | number>;
  messages: ChatMessage[];
  isTyping: boolean;
}

// ========== 스키마 관리 ==========

// 필드 데이터 타입
export type FieldType = 'string' | 'number' | 'enum' | 'date' | 'text' | 'catalog';

// 필드 검증 규칙
export interface FieldValidation {
  min?: number;
  max?: number;
  pattern?: string;
  patternMessage?: string;
}

// 카탈로그 검색 설정 (type === 'catalog' 일 때 사용)
export interface CatalogConfig {
  displayFields: string[];
  valueField: string;
  labelField: string;
  filters?: Record<string, string>;
  autoPopulate?: Record<string, string>;
}

// 단일 필드 스키마
export interface FieldSchema {
  key: string;
  label: string;
  type: FieldType;
  required: boolean;
  values?: string[];
  validation?: FieldValidation;
  description?: string;
  placeholder?: string;
  catalogConfig?: CatalogConfig;
}

// 구매유형 스키마
export interface PurchaseTypeSchema {
  id: string;
  label: string;
  description: string;
  icon?: string;
  color?: string;
  fields: FieldSchema[];
  active: boolean;
}

// ========== 브리핑 모드 ==========

export type BriefingStep = 'idle' | 'greeting' | 'task_list' | 'task_detail';

export type ProcurementCategory = 'pr_approval' | 'bidding' | 'contract' | 'po_delivery' | 'vendor';

export interface ProcurementTask {
  id: string;
  category: ProcurementCategory;
  title: string;
  description: string;
  urgency: 'high' | 'medium' | 'low';
  amount?: number;
  dueDate?: string;
  requester?: string;
  department?: string;
  relatedPrId?: string;
  vendor?: string;
}

// 대시보드 필터
export interface DashboardFilters {
  search: string;
  status: PRStatus | 'all';
  category: string | 'all';
}
