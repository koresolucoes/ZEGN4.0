
import { Component, computed, inject, output, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PatientService } from '../../services/patient.service';
import { Patient, PatientStatus } from '../../models/patient.model';

@Component({
  selector: 'app-patient-list',
  templateUrl: './patient-list.component.html',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientListComponent {
  patientService = inject(PatientService);
  patientSelected = output<Patient>();

  searchTerm = signal('');
  selectedPatientId = signal<number | null>(null);
  
  filteredPatients = computed(() => {
    const term = this.searchTerm().toLowerCase();
    return this.patientService.patientsRO().filter(p => p.name.toLowerCase().includes(term));
  });

  onSearch(event: Event) {
    const input = event.target as HTMLInputElement;
    this.searchTerm.set(input.value);
  }

  selectPatient(patient: Patient) {
    this.selectedPatientId.set(patient.id);
    this.patientSelected.emit(patient);
  }

  getStatusClass(status: PatientStatus): string {
    switch (status) {
      case PatientStatus.Active:
        return 'bg-green-500';
      case PatientStatus.FollowUp:
        return 'bg-yellow-500';
      case PatientStatus.Inactive:
        return 'bg-gray-500';
      default:
        return 'bg-gray-500';
    }
  }

  formatLastContact(date: Date): string {
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    if (diff === 0) return 'Hoy';
    if (diff === 1) return 'Ayer';
    return `Hace ${diff} días`;
  }
}