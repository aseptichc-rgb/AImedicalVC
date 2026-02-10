import { ExpertSpecialty } from '@/types/expert';

const SPECIALTY_MAP: Record<ExpertSpecialty, { label: string; color: string }> = {
  oncology: { label: '종양내과', color: 'bg-red-100 text-red-700' },
  cardiology: { label: '심장내과', color: 'bg-pink-100 text-pink-700' },
  neurology: { label: '신경과', color: 'bg-purple-100 text-purple-700' },
  immunology: { label: '면역학', color: 'bg-indigo-100 text-indigo-700' },
  endocrinology: { label: '내분비내과', color: 'bg-teal-100 text-teal-700' },
  pharmacology: { label: '약학', color: 'bg-green-100 text-green-700' },
  regulatory: { label: '규제', color: 'bg-amber-100 text-amber-700' },
  biotech_analyst: { label: '바이오 애널리스트', color: 'bg-blue-100 text-blue-700' },
  patent_law: { label: '특허법', color: 'bg-orange-100 text-orange-700' },
  clinical_trials: { label: '임상시험', color: 'bg-cyan-100 text-cyan-700' },
  digital_health: { label: '디지털헬스', color: 'bg-violet-100 text-violet-700' },
  medical_device: { label: '의료기기', color: 'bg-emerald-100 text-emerald-700' },
  other: { label: '기타', color: 'bg-gray-100 text-gray-700' },
};

interface ExpertBadgeProps {
  specialty: ExpertSpecialty;
}

export function getSpecialtyLabel(specialty: ExpertSpecialty): string {
  return SPECIALTY_MAP[specialty]?.label || specialty;
}

export function getSpecialtyColor(specialty: ExpertSpecialty): string {
  return SPECIALTY_MAP[specialty]?.color || 'bg-gray-100 text-gray-700';
}

export default function ExpertBadge({ specialty }: ExpertBadgeProps) {
  const { label, color } = SPECIALTY_MAP[specialty] || SPECIALTY_MAP.other;

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${color}`}
    >
      {label}
    </span>
  );
}
