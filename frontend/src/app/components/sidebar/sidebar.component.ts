import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import { ChatService } from '../../services/chat.service';
import { Channel, User, ChatState } from '../../models/chat.models';

@Component({
    selector: 'app-sidebar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './sidebar.component.html',
    styleUrl: './sidebar.component.scss'
})
export class SidebarComponent implements OnInit, OnDestroy {
    state: ChatState | null = null;
    private subscription!: Subscription;

    constructor(private chatService: ChatService) { }

    ngOnInit(): void {
        this.subscription = this.chatService.state$.subscribe((state) => {
            this.state = state;
        });
    }

    ngOnDestroy(): void {
        this.subscription?.unsubscribe();
    }

    async selectChannel(channel: Channel): Promise<void> {
        await this.chatService.joinChannel(channel);
    }

    async selectUser(user: User): Promise<void> {
        if (user.id !== this.state?.currentUser?.id) {
            await this.chatService.startPrivateChat(user);
        }
    }

    isChannelActive(channel: Channel): boolean {
        return this.state?.currentChannel?.id === channel.id;
    }

    isUserActive(user: User): boolean {
        return this.state?.currentPrivateChat?.id === user.id;
    }
}
