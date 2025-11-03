import { Component, input, viewChild, ElementRef, effect, ChangeDetectionStrategy, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Patient } from '../../models/patient.model';
import { GeminiService } from '../../services/gemini.service';
import { PatientService } from '../../services/patient.service';
import { EvolutionService } from '../../services/evolution.service';
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
  evolutionService = inject(EvolutionService);

  newMessage = signal('');
  isGenerating = signal(false);

  chatContainer = viewChild<ElementRef>('chatContainer');

  constructor() {
    effect(() => {
      // effect runs when patient() signal changes or chat history updates
      this.patient()?.chatHistory; 
      this.scrollToBottom();
    }, { allowSignalWrites: true });
  }

  async sendMessage() {
    const text = this.newMessage().trim();
    if (!text || this.isGenerating()) return;

    const currentPatient = this.patient();
    if (!currentPatient) return;

    // 1. Add user message to state and DB
    this.patientService.addMessage(currentPatient.id, text, 'user');
    this.newMessage.set('');
    this.isGenerating.set(true);
    this.scrollToBottom();

    try {
      // 2. Generate AI response
      const aiResponse = await this.geminiService.generateResponse(currentPatient.id, currentPatient.chatHistory, text);
      
      // 3. Add AI response to state and DB
      this.patientService.addMessage(currentPatient.id, aiResponse, 'ai');

      // 4. Send AI response via Evolution API
      await this.evolutionService.sendMessage(currentPatient.phone, aiResponse);

    } catch (error) {
       console.error("Failed to process and send AI response", error);
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