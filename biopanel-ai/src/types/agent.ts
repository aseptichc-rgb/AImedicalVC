// 기존 분석가 타입
export type CoreAgentId = 'oncologist' | 'pharmacist' | 'analyst' | 'regulatory' | 'immunologist' | 'aseptic';

// 임상 전문의 타입 (진료과별)
export type ClinicalAgentId =
  // 내과계
  | 'internal_med_professor' | 'internal_med_clinic' | 'internal_med_hospital'
  | 'cardiology_professor' | 'cardiology_clinic' | 'cardiology_hospital'
  | 'gastro_professor' | 'gastro_clinic' | 'gastro_hospital'
  | 'pulmonology_professor' | 'pulmonology_clinic'
  | 'nephrology_professor' | 'nephrology_clinic'
  | 'endocrine_professor' | 'endocrine_clinic'
  | 'hematology_professor' | 'hematology_clinic'
  | 'infectious_professor' | 'infectious_hospital'
  | 'rheumatology_professor' | 'rheumatology_clinic'
  // 외과계
  | 'general_surgery_professor' | 'general_surgery_hospital'
  | 'orthopedic_professor' | 'orthopedic_clinic' | 'orthopedic_hospital'
  | 'neurosurgery_professor' | 'neurosurgery_hospital'
  | 'plastic_surgery_professor' | 'plastic_surgery_clinic'
  | 'urology_professor' | 'urology_clinic'
  | 'thoracic_surgery_professor'
  | 'cardiac_surgery_professor'
  // 기타 전문과
  | 'neurology_professor' | 'neurology_clinic' | 'neurology_hospital'
  | 'psychiatry_professor' | 'psychiatry_clinic' | 'psychiatry_hospital'
  | 'dermatology_professor' | 'dermatology_clinic'
  | 'ophthalmology_professor' | 'ophthalmology_clinic'
  | 'ent_professor' | 'ent_clinic'
  | 'obgyn_professor' | 'obgyn_clinic' | 'obgyn_hospital'
  | 'pediatrics_professor' | 'pediatrics_clinic' | 'pediatrics_hospital'
  | 'radiology_professor'
  | 'anesthesiology_professor'
  | 'emergency_professor' | 'emergency_hospital'
  | 'rehab_professor' | 'rehab_clinic';

export type AgentId = CoreAgentId | ClinicalAgentId;

// 전문의 역할 유형
export type PhysicianRole =
  | 'professor'      // 대학병원 교수
  | 'clinic_owner'   // 개원의
  | 'employed'       // 봉직의 (병원 소속)
  | 'researcher'     // 연구원/분석가
  | 'consultant';    // 컨설턴트

// 진료과 분류
export type MedicalDepartment =
  | 'oncology'           // 종양내과
  | 'internal_medicine'  // 내과 일반
  | 'cardiology'         // 심장내과
  | 'gastroenterology'   // 소화기내과
  | 'pulmonology'        // 호흡기내과
  | 'nephrology'         // 신장내과
  | 'endocrinology'      // 내분비내과
  | 'hematology'         // 혈액내과
  | 'infectious_disease' // 감염내과
  | 'rheumatology'       // 류마티스내과
  | 'general_surgery'    // 일반외과
  | 'orthopedics'        // 정형외과
  | 'neurosurgery'       // 신경외과
  | 'plastic_surgery'    // 성형외과
  | 'urology'            // 비뇨의학과
  | 'thoracic_surgery'   // 흉부외과
  | 'cardiac_surgery'    // 심장외과
  | 'neurology'          // 신경과
  | 'psychiatry'         // 정신건강의학과
  | 'dermatology'        // 피부과
  | 'ophthalmology'      // 안과
  | 'ent'                // 이비인후과
  | 'obgyn'              // 산부인과
  | 'pediatrics'         // 소아청소년과
  | 'radiology'          // 영상의학과
  | 'anesthesiology'     // 마취통증의학과
  | 'emergency_medicine' // 응급의학과
  | 'rehabilitation'     // 재활의학과
  | 'pharmacoeconomics'  // 약물경제학
  | 'regulatory_science' // 규제과학
  | 'immunology'         // 면역학
  | 'investment'         // 투자분석
  | 'healthcare_vc';     // 헬스케어 전문 VC

// 관련 질환/치료 분야
export type TherapeuticArea =
  | 'oncology_solid'      // 고형암
  | 'oncology_hematologic'// 혈액암
  | 'cardiovascular'      // 심혈관 질환
  | 'cns_neurology'       // 중추신경계/신경
  | 'cns_psychiatry'      // 정신건강
  | 'metabolic'           // 대사질환
  | 'autoimmune'          // 자가면역질환
  | 'infectious'          // 감염질환
  | 'respiratory'         // 호흡기 질환
  | 'gastrointestinal'    // 소화기 질환
  | 'renal'               // 신장 질환
  | 'musculoskeletal'     // 근골격계
  | 'ophthalmology'       // 안과 질환
  | 'dermatology'         // 피부 질환
  | 'womens_health'       // 여성건강
  | 'rare_disease'        // 희귀질환
  | 'gene_cell_therapy'   // 세포/유전자치료
  | 'digital_health'      // 디지털 헬스
  | 'medical_device'      // 의료기기
  | 'diagnostics'         // 진단
  | 'aging_sarcopenia'    // 고령화/근감소증
  | 'healthcare_dx';      // 의료 디지털 전환

export interface AgentProfile {
  id: AgentId;
  name: string;
  nameEn: string;
  title: string;
  avatar: string;
  color: string;
  // 새로운 필드
  department: MedicalDepartment;
  role: PhysicianRole;
  relevantAreas: TherapeuticArea[];  // 관련 치료 분야
  evaluationAxes: string[];
  dataFocus: string[];
  biasProfile: string;
  conflictTriggers: string[];
  // 토론 참여 우선순위 (1-5, 1이 가장 높음)
  priorityLevel?: number;
}

export type AnalysisPhase = 'independent_analysis' | 'cross_examination' | 'rebuttal' | 'final_verdict';
export type AgreementLevel = 'agree' | 'partially_agree' | 'disagree' | 'strongly_disagree';
export type VerdictType = 'strong_positive' | 'positive' | 'neutral' | 'negative' | 'strong_negative';
