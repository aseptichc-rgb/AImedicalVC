import { FinancialSummary } from '@/types/analysis';

export async function fetchSECFilings(companyName: string): Promise<FinancialSummary | null> {
  try {
    const userAgent = process.env.SEC_EDGAR_USER_AGENT || 'BioPanel AI research@biopanel.ai';

    const searchRes = await fetch(
      `https://efts.sec.gov/LATEST/search-index?q=${encodeURIComponent(companyName)}&dateRange=custom&startdt=2024-01-01&forms=10-K,10-Q`,
      { headers: { 'User-Agent': userAgent } }
    );

    if (!searchRes.ok) return null;

    return {
      revenue: undefined,
      marketCap: undefined,
      cashPosition: undefined,
      burnRate: undefined,
      runway: undefined,
    };
  } catch (error) {
    console.error('SEC EDGAR API error:', error);
    return null;
  }
}
