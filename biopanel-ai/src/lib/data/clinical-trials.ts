import { ClinicalTrialSummary } from '@/types/analysis';

const BASE_URL = 'https://clinicaltrials.gov/api/v2';

export async function fetchClinicalTrials(companyName: string): Promise<ClinicalTrialSummary[]> {
  try {
    const response = await fetch(
      `${BASE_URL}/studies?query.spons=${encodeURIComponent(companyName)}&pageSize=20&format=json`
    );

    if (!response.ok) return [];

    const data = await response.json();

    return (data.studies || []).map((study: any) => ({
      nctId: study.protocolSection?.identificationModule?.nctId || '',
      title: study.protocolSection?.identificationModule?.briefTitle || '',
      phase: study.protocolSection?.designModule?.phases?.join(', ') || 'N/A',
      status: study.protocolSection?.statusModule?.overallStatus || '',
      condition: (study.protocolSection?.conditionsModule?.conditions || []).join(', '),
      intervention: (study.protocolSection?.armsInterventionsModule?.interventions || [])
        .map((i: any) => i.name).join(', '),
      startDate: study.protocolSection?.statusModule?.startDateStruct?.date,
      completionDate: study.protocolSection?.statusModule?.completionDateStruct?.date,
      enrollment: study.protocolSection?.designModule?.enrollmentInfo?.count,
    })).slice(0, 10);
  } catch (error) {
    console.error('ClinicalTrials.gov API error:', error);
    return [];
  }
}
