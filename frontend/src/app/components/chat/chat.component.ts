import { Component, OnInit, OnDestroy, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { ChatState } from '../../models/chat.models';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { MessageInputComponent } from '../message-input/message-input.component';
import { MessageItemComponent } from '../message-item/message-item.component';

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, SidebarComponent, MessageInputComponent, MessageItemComponent],
    templateUrl: './chat.component.html',
    styleUrl: './chat.component.scss'
})
export class ChatComponent implements OnInit, OnDestroy {
    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    state: ChatState | null = null;
    private subscription!: Subscription;

    constructor(private chatService: ChatService, private router: Router) { }

    ngOnInit(): void {
        this.subscription = this.chatService.state$.subscribe((state) => {
            const wasAtBottom = this.isScrolledToBottom();
            this.state = state;

            if (!state.currentUser) {
                this.router.navigate(['/']);
                return;
            }

            // Auto-scroll to bottom for new messages
            if (wasAtBottom) {
                setTimeout(() => this.scrollToBottom(), 0);
            }
        });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    private isScrolledToBottom(): boolean {
        if (!this.messagesContainer?.nativeElement) return true;
        const el = this.messagesContainer.nativeElement;
        return el.scrollHeight - el.scrollTop <= el.clientHeight + 100;
    }

    private scrollToBottom(): void {
        if (this.messagesContainer?.nativeElement) {
            const el = this.messagesContainer.nativeElement;
            el.scrollTop = el.scrollHeight;
        }
    }

    get chatTitle(): string {
        if (this.state?.currentChannel) {
            return `# ${this.state.currentChannel.name}`;
        }
        if (this.state?.currentPrivateChat) {
            return `@ ${this.state.currentPrivateChat.username}`;
        }
        return 'Select a channel or user';
    }

    get chatDescription(): string {
        if (this.state?.currentChannel?.description) {
            return this.state.currentChannel.description;
        }
        if (this.state?.currentPrivateChat) {
            return 'Private conversation';
        }
        return '';
    }
}
