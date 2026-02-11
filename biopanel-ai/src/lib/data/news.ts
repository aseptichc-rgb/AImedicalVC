import { NewsArticle, NewsCategory } from '@/types/analysis';

const GOOGLE_NEWS_RSS = 'https://news.google.com/rss/search';

export async function fetchNews(companyName: string, sector: string): Promise<NewsArticle[]> {
  try {
    const queries = [
      `${companyName} biotech`,
      `${companyName} FDA`,
      `${companyName} clinical trial`,
    ];

    const allNews = await Promise.all(
      queries.map(query => fetchGoogleNews(query))
    );

    return deduplicateAndRank(allNews.flat());
  } catch (error) {
    console.error('News fetch error:', error);
    return [];
  }
}

async function fetchGoogleNews(query: string): Promise<NewsArticle[]> {
  try {
    const url = `${GOOGLE_NEWS_RSS}?q=${encodeURIComponent(query)}&hl=en-US&gl=US&ceid=US:en`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const xml = await response.text();
    const items = parseRSSItems(xml);

    return items.slice(0, 10).map((item, index) => ({
      id: item.guid || `news-${Date.now()}-${index}`,
      title: item.title || '',
      source: extractSource(item.source) || 'Google News',
      publishedAt: item.pubDate || new Date().toISOString(),
      url: item.link || '',
      snippet: stripHtml(item.description || ''),
      category: categorizeNews(item.title || ''),
    }));
  } catch (error) {
    console.error('Google News RSS error:', error);
    return [];
  }
}

interface RSSItem {
  title?: string;
  link?: string;
  guid?: string;
  pubDate?: string;
  description?: string;
  source?: string;
}

function parseRSSItems(xml: string): RSSItem[] {
  const items: RSSItem[] = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const itemXml = match[1];
    items.push({
      title: extractTag(itemXml, 'title'),
      link: extractTag(itemXml, 'link'),
      guid: extractTag(itemXml, 'guid'),
      pubDate: extractTag(itemXml, 'pubDate'),
      description: extractTag(itemXml, 'description'),
      source: extractTag(itemXml, 'source'),
    });
  }

  return items;
}

function extractTag(xml: string, tagName: string): string | undefined {
  const regex = new RegExp(`<${tagName}[^>]*><!\\[CDATA\\[([\\s\\S]*?)\\]\\]><\\/${tagName}>|<${tagName}[^>]*>([^<]*)<\\/${tagName}>`, 'i');
  const match = regex.exec(xml);
  return match ? (match[1] || match[2] || '').trim() : undefined;
}

function extractSource(source: string | undefined): string {
  if (!source) return '';
  const match = source.match(/>([^<]+)</);
  return match ? match[1] : source;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '').trim();
}

function categorizeNews(title: string): NewsCategory {
  const lower = title.toLowerCase();

  if (lower.includes('fda') || lower.includes('approval') || lower.includes('regulatory') || lower.includes('ema')) {
    return 'regulatory';
  }
  if (lower.includes('trial') || lower.includes('phase') || lower.includes('clinical') || lower.includes('patient')) {
    return 'clinical';
  }
  if (lower.includes('digital') || lower.includes('ai ') || lower.includes('software') || lower.includes('app')) {
    return 'digital_health';
  }
  if (lower.includes('acquisition') || lower.includes('ipo') || lower.includes('funding') || lower.includes('deal') || lower.includes('stock')) {
    return 'business';
  }

  return 'general';
}

function deduplicateAndRank(articles: NewsArticle[]): NewsArticle[] {
  const seen = new Set<string>();

  return articles
    .filter(article => {
      const key = article.title.toLowerCase().slice(0, 50);
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    })
    .sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())
    .slice(0, 15);
}
