
import { Injectable, signal } from '@angular/core';
import { Patient, PatientStatus } from '../models/patient.model';

@Injectable({
  providedIn: 'root',
})
export class PatientService {
  private patients = signal<Patient[]>([
    {
      id: 1,
      name: 'Carlos Santana',
      phone: '+15551234567',
      status: PatientStatus.Active,
      lastContact: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
      avatarUrl: `https://i.pravatar.cc/150?u=carlos`,
      chatHistory: [
        { sender: 'user', text: 'Buenos días, tengo una pregunta de seguimiento sobre mi receta.', timestamp: new Date(Date.now() - 1.1 * 24 * 60 * 60 * 1000) },
        { sender: 'ai', text: 'Buenos días, Carlos. Puedo ayudarle con eso. Por favor, deme el nombre de la receta.', timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000) }
      ],
    },
    {
      id: 2,
      name: 'Maria Rodriguez',
      phone: '+15557654321',
      status: PatientStatus.FollowUp,
      lastContact: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000),
      avatarUrl: `https://i.pravatar.cc/150?u=maria`,
      chatHistory: [
         { sender: 'system', text: 'Recordatorio de cita para mañana a las 10:00 AM.', timestamp: new Date(Date.now() - 3.2 * 24 * 60 * 60 * 1000) },
         { sender: 'user', text: 'Confirmado, ¡gracias!', timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) }
      ],
    },
    {
      id: 3,
      name: 'John Doe',
      phone: '+15559876543',
      status: PatientStatus.Inactive,
      lastContact: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      avatarUrl: `https://i.pravatar.cc/150?u=john`,
      chatHistory: [],
    },
  ]);

  patientsRO = this.patients.asReadonly();

  addMessage(patientId: number, text: string, sender: 'user' | 'ai') {
    this.patients.update(patients => 
      patients.map(p => 
        p.id === patientId 
        ? { ...p, chatHistory: [...p.chatHistory, { text, sender, timestamp: new Date() }] } 
        : p
      )
    );
  }
}