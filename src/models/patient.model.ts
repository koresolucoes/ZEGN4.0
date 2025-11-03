
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
  id: number;
  name: string;
  phone: string;
  status: PatientStatus;
  lastContact: Date;
  avatarUrl: string;
  chatHistory: Message[];
}