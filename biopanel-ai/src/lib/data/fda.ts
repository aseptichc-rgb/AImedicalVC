import { FDAEvent, FDAEventType } from '@/types/analysis';

const OPENFDA_BASE = 'https://api.fda.gov';

export async function fetchFDAEvents(companyName: string): Promise<FDAEvent[]> {
  try {
    const [drugApprovals, deviceClearances, recalls] = await Promise.all([
      fetchDrugApprovals(companyName),
      fetchDevice510k(companyName),
      fetchRecalls(companyName),
    ]);

    return [...drugApprovals, ...deviceClearances, ...recalls]
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 20);
  } catch (error) {
    console.error('FDA API error:', error);
    return [];
  }
}

async function fetchDrugApprovals(companyName: string): Promise<FDAEvent[]> {
  try {
    const url = `${OPENFDA_BASE}/drug/drugsfda.json?search=sponsor_name:"${encodeURIComponent(companyName)}"&limit=10`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();

    return (data.results || []).map((result: any, index: number) => ({
      id: result.application_number || `drug-${Date.now()}-${index}`,
      type: 'drug_approval' as FDAEventType,
      date: result.submissions?.[0]?.submission_status_date || '',
      product: result.products?.[0]?.brand_name,
      applicant: result.sponsor_name || companyName,
      decision: result.submissions?.[0]?.submission_status,
      indication: result.products?.[0]?.active_ingredients?.map((i: any) => i.name).join(', '),
    }));
  } catch (error) {
    console.error('FDA Drug Approvals error:', error);
    return [];
  }
}

async function fetchDevice510k(companyName: string): Promise<FDAEvent[]> {
  try {
    const url = `${OPENFDA_BASE}/device/510k.json?search=applicant:"${encodeURIComponent(companyName)}"&limit=10`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();

    return (data.results || []).map((result: any, index: number) => ({
      id: result.k_number || `510k-${Date.now()}-${index}`,
      type: 'device_510k' as FDAEventType,
      date: result.decision_date || '',
      product: result.device_name,
      applicant: result.applicant || companyName,
      decision: result.decision_code === 'SESE' ? 'Substantially Equivalent' : result.decision_code,
      documentUrl: result.k_number
        ? `https://www.accessdata.fda.gov/scripts/cdrh/cfdocs/cfpmn/pmn.cfm?ID=${result.k_number}`
        : undefined,
    }));
  } catch (error) {
    console.error('FDA 510(k) error:', error);
    return [];
  }
}

async function fetchRecalls(companyName: string): Promise<FDAEvent[]> {
  try {
    const url = `${OPENFDA_BASE}/drug/enforcement.json?search=recalling_firm:"${encodeURIComponent(companyName)}"&limit=5`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();

    return (data.results || []).map((result: any, index: number) => ({
      id: result.recall_number || `recall-${Date.now()}-${index}`,
      type: 'recall' as FDAEventType,
      date: result.recall_initiation_date || '',
      product: result.product_description?.slice(0, 100),
      applicant: result.recalling_firm || companyName,
      decision: `${result.classification || ''} - ${result.status || ''}`.trim(),
    }));
  } catch (error) {
    console.error('FDA Recalls error:', error);
    return [];
  }
}
