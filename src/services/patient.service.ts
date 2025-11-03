import { Injectable, computed, inject, signal } from '@angular/core';
import { Patient, PatientStatus, Message } from '../models/patient.model';
import { SupabaseService } from './supabase.service';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private supabaseService = inject(SupabaseService);
  private supabase = this.supabaseService.supabase;

  private patients = signal<Patient[]>([]);

  patientsRO = this.patients.asReadonly();

  async fetchPatients() {
    const { data, error } = await this.supabase.from('patients').select('*');
    if (error) {
      console.error('Error fetching patients:', error);
      return;
    }

    const patientsData: Patient[] = data.map((p: any) => ({
      ...p,
      full_name: p.full_name,
      last_consultation: p.last_consultation,
      avatarUrl: `https://i.pravatar.cc/150?u=${p.id}`,
      status: this.getDerivedStatus(p.last_consultation),
      chatHistory: [],
    }));

    this.patients.set(patientsData);
  }

  async loadChatHistory(patientId: string) {
    const { data, error } = await this.supabase
      .from('messages')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      return;
    }
    
    const chatHistory: Message[] = data.map((m: any) => ({
        sender: m.sender,
        text: m.text,
        timestamp: new Date(m.created_at)
    }));

    this.patients.update(patients =>
      patients.map(p =>
        p.id === patientId ? { ...p, chatHistory } : p
      )
    );
  }

  async addMessage(patientId: string, text: string, sender: 'user' | 'ai') {
    // Optimistically update UI
    const newMessage: Message = { text, sender, timestamp: new Date() };
    this.patients.update(patients =>
      patients.map(p =>
        p.id === patientId
          ? { ...p, chatHistory: [...p.chatHistory, newMessage] }
          : p
      )
    );

    // Persist to database
    const { error } = await this.supabase.from('messages').insert([
      { patient_id: patientId, text, sender, created_at: newMessage.timestamp.toISOString() },
    ]);

    if (error) {
        console.error('Error saving message:', error);
        // TODO: Implement rollback logic if needed
    }
  }
  
  private getDerivedStatus(lastConsultationDate: string | null): PatientStatus {
    if (!lastConsultationDate) return PatientStatus.Inactive;

    const now = new Date();
    const lastContact = new Date(lastConsultationDate);
    const diffDays = Math.floor((now.getTime() - lastContact.getTime()) / (1000 * 3600 * 24));

    if (diffDays <= 7) return PatientStatus.Active;
    if (diffDays <= 30) return PatientStatus.FollowUp;
    return PatientStatus.Inactive;
  }
}