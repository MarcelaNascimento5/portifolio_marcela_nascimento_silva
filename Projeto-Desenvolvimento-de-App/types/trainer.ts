export interface Review {
  id: string;
  studentName: string;
  rating: number;
  comment: string;
  date: string;
}

export interface Trainer {
  id: string;
  name: string;
  specialty: string[];
  bio: string;
  rating: number;
  totalStudents: number;
  totalSessions: number;
  pricePerSession: number;
  avatar: string;
  coverImage: string;
  experience: number; // years
  certifications: string[];
  reviews: Review[];
  available: boolean;
}

export interface Session {
  id: string;
  trainerId: string;
  trainerName: string;
  trainerAvatar: string;
  date: string;
  duration: number; // minutes
  specialty: string;
  roomId: string;
}

export type Specialty =
  | 'Musculação'
  | 'Yoga'
  | 'Funcional'
  | 'Cardio'
  | 'Pilates'
  | 'Crossfit'
  | 'Natação'
  | 'Corrida';
