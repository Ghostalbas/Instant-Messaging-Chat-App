import { Component, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ChatService } from '../../services/chat.service';
import { EmojiPickerComponent } from '../emoji-picker/emoji-picker.component';

@Component({
    selector: 'app-message-input',
    standalone: true,
    imports: [CommonModule, FormsModule, EmojiPickerComponent],
    templateUrl: './message-input.component.html',
    styleUrl: './message-input.component.scss'
})
export class MessageInputComponent {
    message = '';
    showEmojiPicker = false;
    private typingTimeout: any;

    constructor(private chatService: ChatService) { }

    async onSend(): Promise<void> {
        if (!this.message.trim()) return;

        const content = this.message.trim();
        const type = this.chatService.detectMessageType(content);

        await this.chatService.sendMessage(content, type);
        this.message = '';
        this.showEmojiPicker = false;
    }

    onKeydown(event: KeyboardEvent): void {
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            this.onSend();
        }
    }

    onInput(): void {
        // Typing indicator logic
        clearTimeout(this.typingTimeout);
        this.chatService.startTyping();

        this.typingTimeout = setTimeout(() => {
            this.chatService.stopTyping();
        }, 2000);
    }

    toggleEmojiPicker(): void {
        this.showEmojiPicker = !this.showEmojiPicker;
    }

    onEmojiSelect(emoji: string): void {
        this.message += emoji;
        this.showEmojiPicker = false;
    }

    onClickOutside(): void {
        this.showEmojiPicker = false;
    }
}
