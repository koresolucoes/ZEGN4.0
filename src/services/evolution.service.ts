import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { lastValueFrom } from 'rxjs';
import { environment } from '../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class EvolutionService {
  private http = inject(HttpClient);
  private apiUrl = environment.evolutionApi.url;
  private apiKey = environment.evolutionApi.apiKey;
  // This should be fetched from the whatsapp_instances table, but we'll use a placeholder for now.
  private instanceName = 'default-instance'; 

  sendMessage(phone: string, text: string): Promise<any> {
    const endpoint = `${this.apiUrl}/message/sendText/${this.instanceName}`;
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'apikey': this.apiKey,
    });

    const body = {
      number: phone,
      textMessage: {
        text: text,
      },
    };

    return lastValueFrom(this.http.post(endpoint, body, { headers }));
  }
}
