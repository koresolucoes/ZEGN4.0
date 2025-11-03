import { Component, ChangeDetectionStrategy, signal, inject, computed, effect } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientListComponent } from './components/patient-list/patient-list.component';
import { PatientChatComponent } from './components/patient-chat/patient-chat.component';
import { LoginComponent } from './components/login/login.component';
import { Patient } from './models/patient.model';
import { SupabaseService } from './services/supabase.service';
import { PatientService } from './services/patient.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [CommonModule, PatientListComponent, PatientChatComponent, LoginComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AppComponent {
  title = 'Gestor Clínico de Pacientes con IA';
  selectedPatient = signal<Patient | null>(null);
  
  private supabaseService = inject(SupabaseService);
  private patientService = inject(PatientService);
  
  session = this.supabaseService.session;
  isLoggedIn = computed(() => !!this.session());

  constructor() {
    effect(() => {
      if (this.isLoggedIn()) {
        this.patientService.fetchPatients();
      } else {
        this.selectedPatient.set(null);
      }
    });
  }

  onPatientSelected(patient: Patient) {
    this.selectedPatient.set(patient);
    this.patientService.loadChatHistory(patient.id);
  }

  async handleLogout() {
    await this.supabaseService.signOut();
  }
}