import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Message, MessageType } from '../../models/chat.models';

@Component({
    selector: 'app-message-item',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './message-item.component.html',
    styleUrl: './message-item.component.scss'
})
export class MessageItemComponent {
    @Input() message!: Message;
    @Input() isOwn = false;

    MessageType = MessageType;

    get formattedTime(): string {
        const date = new Date(this.message.timestamp);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    get isSystemMessage(): boolean {
        return this.message.senderId === 0;
    }

    get avatarLetter(): string {
        return this.message.senderUsername?.charAt(0)?.toUpperCase() || '?';
    }

    isImageUrl(content: string): boolean {
        return this.message.type === MessageType.Image;
    }

    isVideoUrl(content: string): boolean {
        return this.message.type === MessageType.Video;
    }

    isLink(content: string): boolean {
        return this.message.type === MessageType.Link;
    }

    getYoutubeEmbedUrl(url: string): string | null {
        const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]{11})/);
        return match ? `https://www.youtube.com/embed/${match[1]}` : null;
    }

    isYoutubeUrl(url: string): boolean {
        return /(?:youtube\.com\/watch\?v=|youtu\.be\/)/.test(url);
    }
}
