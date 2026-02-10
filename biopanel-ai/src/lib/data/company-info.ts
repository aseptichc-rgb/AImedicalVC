import { EnrichedData } from '@/types/analysis';
import { CompanyInput } from '@/types/company';
import { fetchClinicalTrials } from './clinical-trials';
import { fetchPubMedArticles } from './pubmed';
import { fetchSECFilings } from './sec-edgar';

export async function enrichCompanyData(company: CompanyInput): Promise<EnrichedData> {
  const [clinicalTrials, recentPapers, financials] = await Promise.all([
    fetchClinicalTrials(company.name),
    fetchPubMedArticles(`${company.name} ${company.sector}`),
    fetchSECFilings(company.name),
  ]);

  return {
    clinicalTrials,
    recentPapers,
    financials: financials || undefined,
    competitors: [],
    regulatoryHistory: [],
  };
}
