import { PaperSummary } from '@/types/analysis';

const BASE_URL = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils';

export async function fetchPubMedArticles(query: string): Promise<PaperSummary[]> {
  try {
    const apiKey = process.env.NCBI_API_KEY ? `&api_key=${process.env.NCBI_API_KEY}` : '';

    const searchRes = await fetch(
      `${BASE_URL}/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=10&retmode=json&sort=date${apiKey}`
    );
    const searchData = await searchRes.json();
    const ids = searchData.esearchresult?.idlist || [];

    if (ids.length === 0) return [];

    const fetchRes = await fetch(
      `${BASE_URL}/esummary.fcgi?db=pubmed&id=${ids.join(',')}&retmode=json${apiKey}`
    );
    const fetchData = await fetchRes.json();

    return ids.map((id: string) => {
      const article = fetchData.result?.[id];
      if (!article) return null;
      return {
        pmid: id,
        title: article.title || '',
        authors: (article.authors || []).map((a: any) => a.name),
        journal: article.source || '',
        publishDate: article.pubdate || '',
        abstract: '',
      };
    }).filter(Boolean) as PaperSummary[];
  } catch (error) {
    console.error('PubMed API error:', error);
    return [];
  }
}
