'use client';

import { ExpertSpecialty } from '@/types/expert';

interface ExpertFilterProps {
  selectedSpecialty: ExpertSpecialty | null;
  onSelect: (specialty: ExpertSpecialty | null) => void;
}

const SPECIALTY_FILTERS: { key: ExpertSpecialty | null; label: string }[] = [
  { key: null, label: '전체' },
  { key: 'oncology', label: '종양내과' },
  { key: 'cardiology', label: '심장내과' },
  { key: 'neurology', label: '신경과' },
  { key: 'immunology', label: '면역학' },
  { key: 'endocrinology', label: '내분비내과' },
  { key: 'pharmacology', label: '약학' },
  { key: 'regulatory', label: '규제' },
  { key: 'biotech_analyst', label: '바이오 애널리스트' },
  { key: 'patent_law', label: '특허법' },
  { key: 'clinical_trials', label: '임상시험' },
  { key: 'digital_health', label: '디지털헬스' },
  { key: 'medical_device', label: '의료기기' },
];

export default function ExpertFilter({ selectedSpecialty, onSelect }: ExpertFilterProps) {
  return (
    <div className="relative">
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide -mx-1 px-1">
        {SPECIALTY_FILTERS.map(({ key, label }) => {
          const isActive = selectedSpecialty === key;

          return (
            <button
              key={label}
              type="button"
              onClick={() => onSelect(key)}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                isActive
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              {label}
            </button>
          );
        })}
      </div>
    </div>
  );
}
