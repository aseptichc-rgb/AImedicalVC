export type ExpertSpecialty =
  | 'oncology'
  | 'cardiology'
  | 'neurology'
  | 'immunology'
  | 'endocrinology'
  | 'pharmacology'
  | 'regulatory'
  | 'biotech_analyst'
  | 'patent_law'
  | 'clinical_trials'
  | 'digital_health'
  | 'medical_device'
  | 'other';

export type ConsultMethod = 'video' | 'phone' | 'email' | 'in_person';
export type ConsultRequestStatus = 'pending' | 'notified' | 'accepted' | 'scheduled' | 'completed' | 'declined' | 'cancelled';

export interface ExpertDoc {
  id: string;
  name: string;
  nameEn: string;
  email: string;
  photoURL?: string;
  specialty: ExpertSpecialty;
  specialtyLabel: string;
  subSpecialties: string[];
  credentials: {
    title: string;
    hospital?: string;
    experience: string;
    education: string[];
    certifications: string[];
  };
  consultAreas: string[];
  pricing: {
    initialConsult: number;
    hourlyRate: number;
    currency: 'KRW' | 'USD';
    note?: string;
  };
  consultMethods: ConsultMethod[];
  isActive: boolean;
  responseTime: string;
  rating?: number;
  reviewCount: number;
  linkedAgentId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConsultRequestDoc {
  id: string;
  userId: string;
  userName: string;
  userEmail: string;
  userCompany?: string;
  userPhone?: string;
  expertId: string;
  expertName: string;
  expertSpecialty: string;
  subject: string;
  message: string;
  linkedAnalysisId?: string;
  linkedCompany?: string;
  aiReportSummary?: string;
  preferredMethod: ConsultMethod;
  preferredSchedule?: string;
  urgency: 'normal' | 'urgent';
  status: ConsultRequestStatus;
  expertResponse?: {
    message: string;
    proposedSchedule?: string;
    respondedAt: Date;
  };
  createdAt: Date;
  updatedAt: Date;
  notifiedAt?: Date;
}
