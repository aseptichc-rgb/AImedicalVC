import { DigitalHealthInfo, DigitalHealthClearance } from '@/types/analysis';

const OPENFDA_DEVICE = 'https://api.fda.gov/device';

const DIGITAL_HEALTH_PRODUCT_CODES = [
  'LLZ', 'QAS', 'QBS', 'QDU', 'QFM', 'QKQ', 'QRG', 'QRH',
  'OXI', 'OZN', 'OZO', 'OZP', 'OZQ', 'PCS', 'PDZ', 'PIH',
];

export async function fetchDigitalHealthData(companyName: string): Promise<DigitalHealthInfo | null> {
  try {
    const clearances = await fetchDigitalHealthClearances(companyName);

    if (clearances.length === 0) return null;

    return {
      fdaClearances: clearances,
      certifications: [],
    };
  } catch (error) {
    console.error('Digital Health data error:', error);
    return null;
  }
}

async function fetchDigitalHealthClearances(companyName: string): Promise<DigitalHealthClearance[]> {
  try {
    const productCodeQuery = DIGITAL_HEALTH_PRODUCT_CODES.map(code => `"${code}"`).join('+');
    const url = `${OPENFDA_DEVICE}/510k.json?search=applicant:"${encodeURIComponent(companyName)}"+AND+product_code:(${productCodeQuery})&limit=10`;

    const response = await fetch(url);
    if (!response.ok) return [];

    const data = await response.json();

    return (data.results || []).map((result: any) => ({
      type: '510k' as const,
      clearanceNumber: result.k_number,
      date: result.decision_date,
      productCode: result.product_code,
      deviceName: result.device_name,
    }));
  } catch (error) {
    console.error('Digital Health clearances error:', error);
    return [];
  }
}

export function isDigitalHealthSector(sector: string): boolean {
  const digitalHealthKeywords = [
    'digital health',
    'digital therapeutics',
    'dtx',
    'software',
    'samd',
    'ai',
    'machine learning',
    'wearable',
    'telehealth',
    'remote monitoring',
    'mhealth',
    'health tech',
    'medtech',
  ];

  const lowerSector = sector.toLowerCase();
  return digitalHealthKeywords.some(kw => lowerSector.includes(kw));
}
