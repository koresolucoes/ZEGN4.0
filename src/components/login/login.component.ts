import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
// FIX: Import `FormControl` and `FormGroup` instead of `FormBuilder` to manually create the reactive form and avoid injection issues.
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { SupabaseService } from '../../services/supabase.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './login.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LoginComponent {
  private supabaseService = inject(SupabaseService);

  loading = signal(false);
  errorMessage = signal<string | null>(null);

  // FIX: The `inject(FormBuilder)` call was failing. The form is now created by directly instantiating `FormGroup` and `FormControl` to fix the error "Property 'group' does not exist on type 'unknown'".
  loginForm = new FormGroup({
    email: new FormControl('test@example.com', [Validators.required, Validators.email]),
    password: new FormControl('password123', [Validators.required]),
  });

  async onSubmit(): Promise<void> {
    if (this.loginForm.invalid) {
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);
    const email = this.loginForm.value.email as string;
    const password = this.loginForm.value.password as string;

    const { error } = await this.supabaseService.signIn({ email, password });

    if (error) {
      this.errorMessage.set('Credenciales inválidas. Por favor, inténtelo de nuevo.');
    }
    
    this.loading.set(false);
  }
}
