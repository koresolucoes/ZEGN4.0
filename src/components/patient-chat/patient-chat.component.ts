
import { Component, input, viewChild, ElementRef, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient, Message } from '../../models/patient.model';
import { GeminiService } from '../../services/gemini.service';
import { PatientService } from '../../services/patient.service';
import { signal } from '@angular/core';

@Component({
  selector: 'app-patient-chat',
  templateUrl: './patient-chat.component.html',
  standalone: true,
  imports: [CommonModule, FormsModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class PatientChatComponent {
  patient = input.required<Patient>();
  geminiService = inject(GeminiService);
  patientService = inject(PatientService);

  newMessage = signal('');
  isGenerating = signal(false);

  chatContainer = viewChild<ElementRef>('chatContainer');

  constructor() {
    effect(() => {
      // effect runs when patient() signal changes
      this.patient(); 
      this.scrollToBottom();
    }, { allowSignalWrites: true });
  }

  async sendMessage() {
    const text = this.newMessage().trim();
    if (!text || this.isGenerating()) return;

    const currentPatient = this.patient();
    this.patientService.addMessage(currentPatient.id, text, 'user');
    this.newMessage.set('');
    this.isGenerating.set(true);
    this.scrollToBottom();

    try {
      const aiResponse = await this.geminiService.generateResponse(currentPatient.id, currentPatient.chatHistory, text);
      this.patientService.addMessage(currentPatient.id, aiResponse, 'ai');
    } catch (error) {
       console.error("Failed to get AI response", error);
       this.patientService.addMessage(currentPatient.id, "Lo siento, no pude procesar eso. Por favor, inténtelo de nuevo.", 'ai');
    } finally {
      this.isGenerating.set(false);
      this.scrollToBottom();
    }
  }

  private scrollToBottom(): void {
    setTimeout(() => {
      const container = this.chatContainer()?.nativeElement;
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    }, 0);
  }
}