'use client';

import { createContext, useContext, useState, useCallback, type ReactNode } from 'react';
import type { PurchaseTypeSchema, FieldSchema } from '@/types';

// ========== 기본 스키마 데이터 ==========

const DEFAULT_SCHEMAS: PurchaseTypeSchema[] = [
  {
    id: 'general',
    label: '일반 구매',
    description: '사무용품, 가구, 비품 등 일반적인 구매요청',
    icon: 'Package',
    color: 'violet',
    active: true,
    fields: [
      { key: 'itemName', label: '품목명', type: 'string', required: true, description: '구매할 품목의 이름', placeholder: '예: A4용지, 사무용 의자' },
      { key: 'quantity', label: '수량', type: 'number', required: true, description: '구매 수량', validation: { min: 1 } },
      { key: 'desiredDeliveryDate', label: '희망 납품일', type: 'date', required: true, description: '납품 받고 싶은 날짜', placeholder: '예: 2025-03-15' },
      { key: 'budget', label: '예산', type: 'number', required: true, description: '예상 예산 (원 단위)', validation: { min: 0 } },
      { key: 'reason', label: '구매 사유', type: 'text', required: true, description: '구매가 필요한 이유' },
    ],
  },
  {
    id: 'it_asset',
    label: 'IT 자산',
    description: '노트북, 모니터, 서버 등 IT 장비 구매요청',
    icon: 'Monitor',
    color: 'blue',
    active: true,
    fields: [
      { key: 'equipmentType', label: '장비 종류', type: 'enum', required: true, values: ['노트북', '데스크톱', '모니터', '서버/네트워크'], description: '구매할 IT 장비의 종류' },
      { key: 'specs', label: '사양', type: 'text', required: true, description: '필요한 장비 사양', placeholder: '예: Intel i7, RAM 32GB, SSD 1TB' },
      { key: 'quantity', label: '수량', type: 'number', required: true, description: '구매 수량 (대)', validation: { min: 1 } },
      { key: 'user', label: '사용자', type: 'string', required: true, description: '장비를 사용할 사람 (수령인)' },
      { key: 'department', label: '부서', type: 'enum', required: true, values: ['개발팀', '마케팅팀', '경영지원팀', '인사팀'], description: '사용자 소속 부서' },
    ],
  },
  {
    id: 'mro',
    label: 'MRO / 소모품',
    description: '사무용지, 토너, 청소용품 등 소모성 자재 구매요청',
    icon: 'Wrench',
    color: 'amber',
    active: true,
    fields: [
      { key: 'consumableName', label: '소모품명', type: 'string', required: true, description: '구매할 소모품의 이름', placeholder: '예: A4용지, 복합기 토너' },
      { key: 'quantity', label: '수량', type: 'number', required: true, description: '구매 수량', validation: { min: 1 } },
      { key: 'urgency', label: '긴급도', type: 'enum', required: true, values: ['high', 'medium', 'low'], description: '긴급도 (high=1-2일, medium=3-5일, low=1-2주)' },
      { key: 'deliveryAddress', label: '배송지', type: 'string', required: true, description: '배송받을 주소 또는 사무실 위치', placeholder: '예: 본사 3층 경영지원팀' },
    ],
  },
];

// ========== Context ==========

interface SchemaContextValue {
  schemas: PurchaseTypeSchema[];
  activeSchemas: PurchaseTypeSchema[];
  getSchema: (id: string) => PurchaseTypeSchema | undefined;
  addSchema: (schema: PurchaseTypeSchema) => void;
  updateSchema: (id: string, schema: Partial<PurchaseTypeSchema>) => void;
  deleteSchema: (id: string) => void;
  addField: (schemaId: string, field: FieldSchema) => void;
  updateField: (schemaId: string, fieldKey: string, field: Partial<FieldSchema>) => void;
  deleteField: (schemaId: string, fieldKey: string) => void;
  reorderFields: (schemaId: string, fromIndex: number, toIndex: number) => void;
}

const SchemaContext = createContext<SchemaContextValue | null>(null);

export function SchemaProvider({ children }: { children: ReactNode }) {
  const [schemas, setSchemas] = useState<PurchaseTypeSchema[]>(DEFAULT_SCHEMAS);

  const activeSchemas = schemas.filter((s) => s.active);

  const getSchema = useCallback(
    (id: string) => schemas.find((s) => s.id === id),
    [schemas],
  );

  const addSchema = useCallback((schema: PurchaseTypeSchema) => {
    setSchemas((prev) => [...prev, schema]);
  }, []);

  const updateSchema = useCallback((id: string, updates: Partial<PurchaseTypeSchema>) => {
    setSchemas((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...updates } : s)),
    );
  }, []);

  const deleteSchema = useCallback((id: string) => {
    setSchemas((prev) => prev.filter((s) => s.id !== id));
  }, []);

  const addField = useCallback((schemaId: string, field: FieldSchema) => {
    setSchemas((prev) =>
      prev.map((s) =>
        s.id === schemaId ? { ...s, fields: [...s.fields, field] } : s,
      ),
    );
  }, []);

  const updateField = useCallback(
    (schemaId: string, fieldKey: string, updates: Partial<FieldSchema>) => {
      setSchemas((prev) =>
        prev.map((s) =>
          s.id === schemaId
            ? {
                ...s,
                fields: s.fields.map((f) =>
                  f.key === fieldKey ? { ...f, ...updates } : f,
                ),
              }
            : s,
        ),
      );
    },
    [],
  );

  const deleteField = useCallback((schemaId: string, fieldKey: string) => {
    setSchemas((prev) =>
      prev.map((s) =>
        s.id === schemaId
          ? { ...s, fields: s.fields.filter((f) => f.key !== fieldKey) }
          : s,
      ),
    );
  }, []);

  const reorderFields = useCallback((schemaId: string, fromIndex: number, toIndex: number) => {
    setSchemas((prev) =>
      prev.map((s) => {
        if (s.id !== schemaId) return s;
        const fields = [...s.fields];
        const [moved] = fields.splice(fromIndex, 1);
        fields.splice(toIndex, 0, moved);
        return { ...s, fields };
      }),
    );
  }, []);

  return (
    <SchemaContext.Provider
      value={{
        schemas,
        activeSchemas,
        getSchema,
        addSchema,
        updateSchema,
        deleteSchema,
        addField,
        updateField,
        deleteField,
        reorderFields,
      }}
    >
      {children}
    </SchemaContext.Provider>
  );
}

export function useSchema() {
  const ctx = useContext(SchemaContext);
  if (!ctx) throw new Error('useSchema must be used inside SchemaProvider');
  return ctx;
}
