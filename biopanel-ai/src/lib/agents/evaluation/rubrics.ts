export const EVALUATION_DIMENSIONS = {
  clinicalValue: { label: '임상적 가치', weight: 0.25, description: '임상 데이터의 질과 임상적 의미' },
  regulatoryPath: { label: '규제 승인 가능성', weight: 0.15, description: '규제 승인 경로와 확률' },
  commercialPotential: { label: '상업적 잠재력', weight: 0.20, description: '시장 규모와 매출 잠재력' },
  competitivePosition: { label: '경쟁 우위', weight: 0.15, description: '경쟁 구도에서의 포지션' },
  financialHealth: { label: '재무 건전성', weight: 0.15, description: '재무 상태와 자금 조달 능력' },
  ipStrength: { label: 'IP/특허 강도', weight: 0.10, description: '특허 포트폴리오와 보호 범위' },
} as const;

export type DimensionKey = keyof typeof EVALUATION_DIMENSIONS;
