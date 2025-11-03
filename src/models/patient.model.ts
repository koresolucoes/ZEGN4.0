
export interface Message {
  sender: 'user' | 'ai' | 'system';
  text: string;
  timestamp: Date;
}

export enum PatientStatus {
  Active = 'Activo',
  Inactive = 'Inactivo',
  FollowUp = 'Seguimiento',
}

export interface Patient {
  id: string; // Changed from number to string for UUIDs
  patient_code: string;
  full_name: string; // Renamed from 'name'
  phone: string;
  status: PatientStatus;
  last_consultation: string; // Renamed from 'lastContact' and type changed to string
  medical_history_notes: string;
  avatarUrl: string;
  chatHistory: Message[];
}