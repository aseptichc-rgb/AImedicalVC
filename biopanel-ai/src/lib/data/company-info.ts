import { EnrichedData } from '@/types/analysis';
import { CompanyInput } from '@/types/company';
import { fetchClinicalTrials } from './clinical-trials';
import { fetchPubMedArticles } from './pubmed';
import { fetchSECFilings } from './sec-edgar';
import { fetchNews } from './news';
import { fetchFDAEvents } from './fda';
import { fetchDigitalHealthData, isDigitalHealthSector } from './digital-health';

export async function enrichCompanyData(company: CompanyInput): Promise<EnrichedData> {
  const [
    clinicalTrials,
    recentPapers,
    financials,
    news,
    fdaEvents,
    digitalHealthData,
  ] = await Promise.all([
    fetchClinicalTrials(company.name),
    fetchPubMedArticles(`${company.name} ${company.sector}`),
    fetchSECFilings(company.name),
    fetchNews(company.name, company.sector),
    fetchFDAEvents(company.name),
    isDigitalHealthSector(company.sector)
      ? fetchDigitalHealthData(company.name)
      : Promise.resolve(null),
  ]);

  return {
    clinicalTrials,
    recentPapers,
    financials: financials || undefined,
    competitors: [],
    regulatoryHistory: [],
    news,
    fdaEvents,
    digitalHealthData: digitalHealthData || undefined,
  };
}
