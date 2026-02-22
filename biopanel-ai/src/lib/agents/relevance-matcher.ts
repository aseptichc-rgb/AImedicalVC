/**
 * 관련성 매칭 로직
 * 회사의 분야/섹터에 따라 관련 전문 패널만 선택
 */

import { AgentProfile, AgentId, TherapeuticArea } from '@/types/agent';
import { AGENT_REGISTRY, getAllAgents, getCoreAgents } from './registry';

// 회사 섹터/분야를 치료 분야로 매핑
const SECTOR_TO_THERAPEUTIC_AREA: Record<string, TherapeuticArea[]> = {
  // 암/종양
  'oncology': ['oncology_solid', 'oncology_hematologic'],
  '종양': ['oncology_solid', 'oncology_hematologic'],
  '항암': ['oncology_solid', 'oncology_hematologic'],
  'cancer': ['oncology_solid', 'oncology_hematologic'],
  '암': ['oncology_solid', 'oncology_hematologic'],
  '고형암': ['oncology_solid'],
  '혈액암': ['oncology_hematologic'],
  '백혈병': ['oncology_hematologic'],
  '림프종': ['oncology_hematologic'],
  '폐암': ['oncology_solid', 'respiratory'],
  '유방암': ['oncology_solid', 'womens_health'],
  '대장암': ['oncology_solid', 'gastrointestinal'],
  '간암': ['oncology_solid', 'gastrointestinal'],
  '췌장암': ['oncology_solid', 'gastrointestinal'],
  '위암': ['oncology_solid', 'gastrointestinal'],
  '난소암': ['oncology_solid', 'womens_health'],
  '전립선암': ['oncology_solid', 'renal'],
  '신장암': ['oncology_solid', 'renal'],
  '방광암': ['oncology_solid', 'renal'],
  '뇌종양': ['oncology_solid', 'cns_neurology'],
  '피부암': ['oncology_solid', 'dermatology'],
  '흑색종': ['oncology_solid', 'dermatology'],

  // 심혈관
  'cardiovascular': ['cardiovascular'],
  '심혈관': ['cardiovascular'],
  '심장': ['cardiovascular'],
  '고혈압': ['cardiovascular'],
  '심부전': ['cardiovascular'],
  '부정맥': ['cardiovascular'],
  '관상동맥': ['cardiovascular'],
  '심근경색': ['cardiovascular'],
  '뇌졸중': ['cardiovascular', 'cns_neurology'],

  // 중추신경계/신경
  'neurology': ['cns_neurology'],
  'cns': ['cns_neurology', 'cns_psychiatry'],
  '신경': ['cns_neurology'],
  '신경계': ['cns_neurology'],
  '알츠하이머': ['cns_neurology'],
  '치매': ['cns_neurology'],
  '파킨슨': ['cns_neurology'],
  '다발성경화증': ['cns_neurology', 'autoimmune'],
  'MS': ['cns_neurology', 'autoimmune'],
  'ALS': ['cns_neurology'],
  '간질': ['cns_neurology'],
  '뇌전증': ['cns_neurology'],

  // 정신건강
  'psychiatry': ['cns_psychiatry'],
  '정신': ['cns_psychiatry'],
  '우울증': ['cns_psychiatry'],
  '조현병': ['cns_psychiatry'],
  '불안장애': ['cns_psychiatry'],
  '양극성': ['cns_psychiatry'],
  'ADHD': ['cns_psychiatry'],
  '자폐': ['cns_psychiatry'],

  // 대사질환
  'metabolic': ['metabolic'],
  '대사': ['metabolic'],
  '당뇨': ['metabolic'],
  '비만': ['metabolic'],
  '고지혈증': ['metabolic', 'cardiovascular'],
  '지방간': ['metabolic', 'gastrointestinal'],
  'NASH': ['metabolic', 'gastrointestinal'],

  // 자가면역
  'autoimmune': ['autoimmune'],
  '자가면역': ['autoimmune'],
  '류마티스': ['autoimmune', 'musculoskeletal'],
  '관절염': ['autoimmune', 'musculoskeletal'],
  '루푸스': ['autoimmune'],
  '크론병': ['autoimmune', 'gastrointestinal'],
  '궤양성대장염': ['autoimmune', 'gastrointestinal'],
  'IBD': ['autoimmune', 'gastrointestinal'],
  '건선': ['autoimmune', 'dermatology'],
  '아토피': ['autoimmune', 'dermatology'],

  // 감염
  'infectious': ['infectious'],
  '감염': ['infectious'],
  '항생제': ['infectious'],
  '항바이러스': ['infectious'],
  'HIV': ['infectious'],
  'HBV': ['infectious', 'gastrointestinal'],
  'HCV': ['infectious', 'gastrointestinal'],
  '코로나': ['infectious', 'respiratory'],
  'COVID': ['infectious', 'respiratory'],
  '결핵': ['infectious', 'respiratory'],
  '패혈증': ['infectious'],

  // 호흡기
  'respiratory': ['respiratory'],
  '호흡기': ['respiratory'],
  'COPD': ['respiratory'],
  '천식': ['respiratory'],
  '폐섬유증': ['respiratory'],
  'IPF': ['respiratory'],

  // 소화기
  'gastrointestinal': ['gastrointestinal'],
  '소화기': ['gastrointestinal'],
  '위장': ['gastrointestinal'],
  '간': ['gastrointestinal'],
  '췌장': ['gastrointestinal'],
  '담도': ['gastrointestinal'],

  // 신장
  'renal': ['renal'],
  '신장': ['renal'],
  '콩팥': ['renal'],
  'CKD': ['renal'],
  '투석': ['renal'],

  // 근골격계
  'musculoskeletal': ['musculoskeletal'],
  '근골격': ['musculoskeletal'],
  '골다공증': ['musculoskeletal'],
  '척추': ['musculoskeletal'],
  '관절': ['musculoskeletal'],
  '재활': ['musculoskeletal'],
  '운동': ['musculoskeletal'],
  '모션': ['musculoskeletal'],
  '보행': ['musculoskeletal'],
  '근육': ['musculoskeletal'],

  // 안과
  'ophthalmology': ['ophthalmology'],
  '안과': ['ophthalmology'],
  'AMD': ['ophthalmology'],
  '황반변성': ['ophthalmology'],
  '녹내장': ['ophthalmology'],
  '당뇨망막': ['ophthalmology', 'metabolic'],

  // 피부
  'dermatology': ['dermatology'],
  '피부': ['dermatology'],

  // 여성건강
  'womens_health': ['womens_health'],
  '여성': ['womens_health'],
  '산부인과': ['womens_health'],
  '부인과': ['womens_health'],

  // 희귀질환
  'rare_disease': ['rare_disease'],
  '희귀': ['rare_disease'],
  '희귀질환': ['rare_disease'],
  '유전': ['rare_disease', 'gene_cell_therapy'],

  // 세포/유전자치료
  'gene_therapy': ['gene_cell_therapy'],
  'cell_therapy': ['gene_cell_therapy'],
  '세포치료': ['gene_cell_therapy'],
  '유전자치료': ['gene_cell_therapy'],
  'CAR-T': ['gene_cell_therapy', 'oncology_hematologic'],
  'CAR-NK': ['gene_cell_therapy', 'oncology_hematologic'],
  'AAV': ['gene_cell_therapy'],
  'mRNA': ['gene_cell_therapy'],

  // 디지털 헬스 - 적용 분야에 따라 확장
  'digital_health': ['digital_health'],
  '디지털': ['digital_health'],
  'AI': ['digital_health', 'diagnostics'],
  '소프트웨어': ['digital_health'],
  'SaMD': ['digital_health'],
  '앱': ['digital_health'],
  '웨어러블': ['digital_health', 'cardiovascular'],

  // 의료기기 - 적용 분야에 따라 확장
  'medical_device': ['medical_device'],
  '의료기기': ['medical_device'],
  '기기': ['medical_device'],
  '임플란트': ['medical_device', 'musculoskeletal'],
  '스텐트': ['medical_device', 'cardiovascular'],
  '카테터': ['medical_device', 'cardiovascular'],
  '인공': ['medical_device'],
  '로봇': ['medical_device'],
  '수술': ['medical_device'],
  '내시경': ['medical_device', 'gastrointestinal'],
  '초음파': ['medical_device', 'diagnostics'],
  'MRI': ['medical_device', 'diagnostics'],
  'CT': ['medical_device', 'diagnostics'],

  // 진단
  'diagnostics': ['diagnostics'],
  '진단': ['diagnostics'],
  '동반진단': ['diagnostics'],
  '바이오마커': ['diagnostics'],
  '액체생검': ['diagnostics', 'oncology_solid'],
  '검사': ['diagnostics'],
  '분석': ['diagnostics'],
};

// 의료기기/디지털헬스 세부 분야 키워드 매핑
const DEVICE_APPLICATION_KEYWORDS: Record<string, TherapeuticArea[]> = {
  // 심혈관 기기
  '심장': ['cardiovascular'],
  '혈관': ['cardiovascular'],
  '페이스메이커': ['cardiovascular'],
  '제세동기': ['cardiovascular'],
  'ICD': ['cardiovascular'],
  '스텐트': ['cardiovascular'],
  '판막': ['cardiovascular'],

  // 정형외과 기기
  '정형': ['musculoskeletal'],
  '관절': ['musculoskeletal'],
  '척추': ['musculoskeletal'],
  '뼈': ['musculoskeletal'],
  '골절': ['musculoskeletal'],
  '인대': ['musculoskeletal'],

  // 신경외과 기기
  '뇌': ['cns_neurology'],
  '신경자극': ['cns_neurology'],
  'DBS': ['cns_neurology'],
  '두개': ['cns_neurology'],

  // 재활 기기
  '재활': ['musculoskeletal'],
  '보행': ['musculoskeletal'],
  '보조기': ['musculoskeletal'],
  '의수': ['musculoskeletal'],
  '의족': ['musculoskeletal'],
  '모션': ['musculoskeletal'],
  '운동': ['musculoskeletal'],

  // 안과 기기
  '안구': ['ophthalmology'],
  '시력': ['ophthalmology'],
  '백내장': ['ophthalmology'],
  '라식': ['ophthalmology'],
  '망막': ['ophthalmology'],

  // 소화기 기기
  '내시경': ['gastrointestinal'],
  '위장': ['gastrointestinal'],

  // 호흡기 기기
  '호흡': ['respiratory'],
  '인공호흡': ['respiratory'],
  '산소': ['respiratory'],

  // 비뇨기 기기
  '비뇨': ['renal'],
  '투석': ['renal'],
  '방광': ['renal'],

  // 산부인과 기기
  '태아': ['womens_health'],
  '분만': ['womens_health'],
  '자궁': ['womens_health'],

  // 소아 기기
  '소아': ['rare_disease'],
  '신생아': ['rare_disease'],

  // 영상 진단
  '영상': ['diagnostics'],
  'X선': ['diagnostics'],
  'MRI': ['diagnostics'],
  'CT': ['diagnostics'],
  '초음파': ['diagnostics'],
  'PET': ['diagnostics', 'oncology_solid'],
};

// 키워드 기반으로 치료 분야 추출
function extractTherapeuticAreas(sector: string, description?: string): TherapeuticArea[] {
  const areas = new Set<TherapeuticArea>();
  const textToAnalyze = `${sector} ${description || ''}`.toLowerCase();

  // 1단계: 기본 섹터 매핑 확인
  for (const [keyword, mappedAreas] of Object.entries(SECTOR_TO_THERAPEUTIC_AREA)) {
    if (textToAnalyze.includes(keyword.toLowerCase())) {
      mappedAreas.forEach(area => areas.add(area));
    }
  }

  // 2단계: 의료기기/디지털헬스/진단 분야인 경우 세부 적용 분야 추가 분석
  const isDeviceOrDigital = areas.has('medical_device') || areas.has('digital_health') || areas.has('diagnostics');
  if (isDeviceOrDigital) {
    for (const [keyword, mappedAreas] of Object.entries(DEVICE_APPLICATION_KEYWORDS)) {
      if (textToAnalyze.includes(keyword.toLowerCase())) {
        mappedAreas.forEach(area => areas.add(area));
      }
    }
  }

  // 3단계: 매칭된 분야가 없거나 의료기기/디지털헬스만 있는 경우 기본 전문가 분야 추가
  const hasSpecificArea = Array.from(areas).some(area =>
    !['medical_device', 'digital_health', 'diagnostics'].includes(area)
  );

  if (areas.size === 0 || (isDeviceOrDigital && !hasSpecificArea)) {
    // 의료기기/디지털헬스의 경우 다양한 분야 전문가가 필요
    // 일반적으로 내과, 외과, 재활 관련 전문가 포함
    if (isDeviceOrDigital) {
      // 의료기기/디지털헬스 기본 분야: 다양한 분야의 전문가 필요
      areas.add('musculoskeletal');  // 재활의학, 정형외과
      areas.add('cardiovascular');    // 심장내과
      areas.add('cns_neurology');     // 신경과
    } else {
      // 분야 파악 불가 시: 범용적인 전문가들
      areas.add('metabolic');         // 내분비, 대사
      areas.add('cardiovascular');    // 심혈관
    }
  }

  return Array.from(areas);
}

export interface RelevantAgentsConfig {
  maxAgents?: number;           // 최대 참여 에이전트 수 (기본: 8)
  includeCoreAgents?: boolean;  // 핵심 분석가 항상 포함 (기본: true)
  priorityThreshold?: number;   // 우선순위 임계값 (1-5, 기본: 3)
  roles?: string[];             // 특정 역할만 포함 (선택)
}

export interface SelectedAgent {
  agent: AgentProfile;
  relevanceScore: number;
  reason: string;
}

/**
 * 회사 정보에 따라 관련성 높은 전문가 패널 선택
 */
export function selectRelevantAgents(
  company: { name: string; sector: string; description?: string },
  config: RelevantAgentsConfig = {}
): SelectedAgent[] {
  const {
    maxAgents = 8,
    includeCoreAgents = true,
    priorityThreshold = 3,
    roles,
  } = config;

  // 회사 분야에서 치료 분야 추출
  const therapeuticAreas = extractTherapeuticAreas(company.sector, company.description);

  const selectedAgents: SelectedAgent[] = [];
  const allAgents = getAllAgents();

  // 1. 핵심 분석가 (투자 분석가, 규제 전문가)는 항상 포함
  if (includeCoreAgents) {
    getCoreAgents().forEach(agent => {
      selectedAgents.push({
        agent,
        relevanceScore: 100,
        reason: '핵심 분석가 (투자/규제 - 항상 참여)',
      });
    });
  }

  // 2. 치료 분야별 관련 전문가 선택
  const scoredAgents: SelectedAgent[] = [];
  const addedDepartments = new Set<string>();

  for (const agent of allAgents) {
    // 이미 추가된 핵심 분석가 제외
    if (selectedAgents.find(sa => sa.agent.id === agent.id)) continue;

    // 역할 필터 적용
    if (roles && roles.length > 0 && !roles.includes(agent.role)) continue;

    // 관련성 점수 계산
    let relevanceScore = 0;
    const matchedAreas: string[] = [];

    for (const area of therapeuticAreas) {
      if (agent.relevantAreas.includes(area)) {
        relevanceScore += 20;
        matchedAreas.push(area);
      }
    }

    // 우선순위에 따른 가산점 (우선순위 높을수록 높은 점수)
    if (agent.priorityLevel) {
      relevanceScore += (5 - agent.priorityLevel) * 10;
    }

    // 역할에 따른 가산점 (교수급 우선)
    if (agent.role === 'professor') {
      relevanceScore += 15;
    } else if (agent.role === 'consultant') {
      relevanceScore += 10;
    }

    // 관련성이 있는 경우 추가
    if (relevanceScore > 0) {
      // 우선순위 필터: 일반적으로 priorityThreshold 이하만 포함
      // 단, 해당 부서에서 아직 선택된 전문가가 없으면 우선순위가 높아도 포함
      const isUniqueDepartment = !addedDepartments.has(agent.department);

      if (agent.priorityLevel && agent.priorityLevel <= priorityThreshold) {
        scoredAgents.push({
          agent,
          relevanceScore,
          reason: `관련 분야: ${matchedAreas.join(', ')}`,
        });
        addedDepartments.add(agent.department);
      } else if (isUniqueDepartment && agent.priorityLevel && agent.priorityLevel <= priorityThreshold + 1) {
        // 해당 부서의 첫 전문가면 우선순위 기준을 1단계 완화
        scoredAgents.push({
          agent,
          relevanceScore: relevanceScore - 5, // 약간 페널티
          reason: `관련 분야: ${matchedAreas.join(', ')} (부서 대표)`,
        });
        addedDepartments.add(agent.department);
      }
    }
  }

  // 3. 관련성 점수 기준 정렬 후 상위 에이전트 선택
  scoredAgents.sort((a, b) => b.relevanceScore - a.relevanceScore);

  // 4. 부서 다양성 확보: 같은 부서에서 최대 2명까지만 선택
  const departmentCount = new Map<string, number>();
  const diversifiedAgents: SelectedAgent[] = [];

  for (const agent of scoredAgents) {
    const dept = agent.agent.department;
    const count = departmentCount.get(dept) || 0;

    if (count < 2) {
      diversifiedAgents.push(agent);
      departmentCount.set(dept, count + 1);
    }
  }

  // 남은 슬롯에 관련 전문가 추가
  const remainingSlots = maxAgents - selectedAgents.length;
  selectedAgents.push(...diversifiedAgents.slice(0, remainingSlots));

  return selectedAgents;
}

/**
 * 선택된 전문가 ID 목록 반환
 */
export function getRelevantAgentIds(
  company: { name: string; sector: string; description?: string },
  config: RelevantAgentsConfig = {}
): AgentId[] {
  const selectedAgents = selectRelevantAgents(company, config);
  return selectedAgents.map(sa => sa.agent.id);
}

/**
 * 디버깅용: 선택된 전문가와 이유 출력
 */
export function explainAgentSelection(
  company: { name: string; sector: string; description?: string },
  config: RelevantAgentsConfig = {}
): string {
  const selectedAgents = selectRelevantAgents(company, config);
  const therapeuticAreas = extractTherapeuticAreas(company.sector, company.description);

  let explanation = `=== 전문가 패널 선정 결과 ===\n`;
  explanation += `회사: ${company.name}\n`;
  explanation += `섹터: ${company.sector}\n`;
  explanation += `관련 치료 분야: ${therapeuticAreas.join(', ')}\n\n`;
  explanation += `선정된 전문가 (${selectedAgents.length}명):\n`;
  explanation += `-`.repeat(50) + '\n';

  selectedAgents.forEach((sa, idx) => {
    const roleLabel = {
      professor: '대학병원 교수',
      clinic_owner: '개원의',
      employed: '봉직의',
      researcher: '연구원',
      consultant: '컨설턴트',
    }[sa.agent.role] || sa.agent.role;

    explanation += `${idx + 1}. ${sa.agent.name} (${sa.agent.nameEn})\n`;
    explanation += `   역할: ${roleLabel}\n`;
    explanation += `   진료과: ${sa.agent.department}\n`;
    explanation += `   관련성 점수: ${sa.relevanceScore}\n`;
    explanation += `   선정 이유: ${sa.reason}\n\n`;
  });

  return explanation;
}

/**
 * 특정 치료 분야에 대해 참여해야 할 전문과 목록 반환
 */
export function getRequiredDepartments(areas: TherapeuticArea[]): string[] {
  const departmentMap: Record<TherapeuticArea, string[]> = {
    oncology_solid: ['oncology', 'immunology'],
    oncology_hematologic: ['hematology', 'oncology', 'immunology'],
    cardiovascular: ['cardiology', 'internal_medicine'],
    cns_neurology: ['neurology', 'neurosurgery'],
    cns_psychiatry: ['psychiatry'],
    metabolic: ['endocrinology', 'internal_medicine'],
    autoimmune: ['rheumatology', 'immunology'],
    infectious: ['infectious_disease', 'internal_medicine'],
    respiratory: ['pulmonology'],
    gastrointestinal: ['gastroenterology'],
    renal: ['nephrology'],
    musculoskeletal: ['orthopedics', 'rheumatology', 'rehabilitation'],
    ophthalmology: ['ophthalmology'],
    dermatology: ['dermatology'],
    womens_health: ['obgyn'],
    rare_disease: ['immunology', 'hematology', 'pediatrics'],
    gene_cell_therapy: ['hematology', 'immunology'],
    // 의료기기/디지털헬스/진단: 범용적인 전문과 + 적용 분야에 따라 동적 추가
    digital_health: ['internal_medicine', 'rehabilitation'],
    medical_device: ['general_surgery', 'anesthesiology', 'rehabilitation', 'radiology'],
    diagnostics: ['radiology', 'internal_medicine'],
  };

  const departments = new Set<string>();
  areas.forEach(area => {
    (departmentMap[area] || []).forEach(dept => departments.add(dept));
  });

  return Array.from(departments);
}
