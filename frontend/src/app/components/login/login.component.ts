import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { ChatService } from '../../services/chat.service';
import { Router } from '@angular/router';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './login.component.html',
    styleUrl: './login.component.scss'
})
export class LoginComponent {
    username = '';
    isLoading = false;
    error = '';

    constructor(private chatService: ChatService, private router: Router) { }

    async onSubmit(): Promise<void> {
        if (!this.username.trim()) {
            this.error = 'Please enter a username';
            return;
        }

        this.isLoading = true;
        this.error = '';

        try {
            await this.chatService.initialize();
            const success = await this.chatService.login(this.username.trim());

            if (success) {
                this.router.navigate(['/chat']);
            } else {
                this.error = 'Failed to join chat. Please try again.';
            }
        } catch (err) {
            this.error = 'Connection error. Please try again.';
            console.error(err);
        } finally {
            this.isLoading = false;
        }
    }
}
