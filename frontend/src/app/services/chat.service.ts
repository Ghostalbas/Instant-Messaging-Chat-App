import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { SignalrService } from './signalr.service';
import { Message, User, Channel, ChatState, MessageType } from '../models/chat.models';

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private state: ChatState = {
        currentUser: null,
        currentChannel: null,
        currentPrivateChat: null,
        messages: [],
        channels: [],
        onlineUsers: []
    };

    public state$ = new BehaviorSubject<ChatState>(this.state);

    constructor(private signalrService: SignalrService) {
        this.setupSubscriptions();
    }

    private setupSubscriptions(): void {
        this.signalrService.messageReceived$.subscribe((message) => {
            this.addMessage(message);
        });

        this.signalrService.userJoined$.subscribe(async (username) => {
            this.addSystemMessage(`${username} has joined the chat`);
            await this.refreshOnlineUsers();
        });

        this.signalrService.userDisconnected$.subscribe(async (username) => {
            this.addSystemMessage(`${username} has left the chat`);
            await this.refreshOnlineUsers();
        });

        this.signalrService.userJoinedChannel$.subscribe(({ username, channelName }) => {
            this.addSystemMessage(`${username} joined #${channelName}`);
        });
    }

    private addSystemMessage(content: string): void {
        const systemMessage: Message = {
            id: Date.now(),
            content,
            type: MessageType.Text,
            timestamp: new Date(),
            senderId: 0,
            senderUsername: 'System'
        };
        this.addMessage(systemMessage);
    }

    private addMessage(message: Message): void {
        this.state = {
            ...this.state,
            messages: [...this.state.messages, message]
        };
        this.state$.next(this.state);
    }

    public async initialize(): Promise<void> {
        await this.signalrService.startConnection();
    }

    public async login(username: string): Promise<boolean> {
        try {
            const result = await this.signalrService.register(username);
            if (result.success) {
                this.state = {
                    ...this.state,
                    currentUser: { id: result.userId, username: result.username }
                };
                this.state$.next(this.state);

                // Load initial data
                await this.loadChannels();
                await this.refreshOnlineUsers();

                return true;
            }
            return false;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    public async loadChannels(): Promise<void> {
        const channels = await this.signalrService.getChannels();
        this.state = { ...this.state, channels };
        this.state$.next(this.state);
    }

    public async refreshOnlineUsers(): Promise<void> {
        const onlineUsers = await this.signalrService.getOnlineUsers();
        this.state = { ...this.state, onlineUsers };
        this.state$.next(this.state);
    }

    public async joinChannel(channel: Channel): Promise<void> {
        if (!this.state.currentUser) return;

        // Leave current channel if any
        if (this.state.currentChannel) {
            await this.signalrService.leaveChannel(this.state.currentUser.id, this.state.currentChannel.id);
        }

        await this.signalrService.joinChannel(this.state.currentUser.id, channel.id);

        // Load channel messages
        const messages = await this.signalrService.getChannelMessages(channel.id);

        this.state = {
            ...this.state,
            currentChannel: channel,
            currentPrivateChat: null,
            messages
        };
        this.state$.next(this.state);
    }

    public async startPrivateChat(user: User): Promise<void> {
        if (!this.state.currentUser) return;

        // Load private messages
        const messages = await this.signalrService.getPrivateMessages(this.state.currentUser.id, user.id);

        this.state = {
            ...this.state,
            currentChannel: null,
            currentPrivateChat: user,
            messages
        };
        this.state$.next(this.state);
    }

    public async sendMessage(content: string, type: MessageType = MessageType.Text): Promise<void> {
        if (!this.state.currentUser) return;

        const channelId = this.state.currentChannel?.id ?? null;
        const receiverId = this.state.currentPrivateChat?.id ?? null;

        await this.signalrService.sendMessage(
            this.state.currentUser.id,
            content,
            type,
            channelId,
            receiverId
        );
    }

    public async startTyping(): Promise<void> {
        if (!this.state.currentUser) return;
        await this.signalrService.startTyping(
            this.state.currentChannel?.id ?? null,
            this.state.currentPrivateChat?.id ?? null,
            this.state.currentUser.username
        );
    }

    public async stopTyping(): Promise<void> {
        if (!this.state.currentUser) return;
        await this.signalrService.stopTyping(
            this.state.currentChannel?.id ?? null,
            this.state.currentPrivateChat?.id ?? null,
            this.state.currentUser.username
        );
    }

    public detectMessageType(content: string): MessageType {
        const imageExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.svg'];
        const videoExtensions = ['.mp4', '.webm', '.ogg', '.mov'];
        const urlPattern = /^(https?:\/\/[^\s]+)$/i;

        const lowerContent = content.toLowerCase().trim();

        if (urlPattern.test(content)) {
            if (imageExtensions.some(ext => lowerContent.includes(ext))) {
                return MessageType.Image;
            }
            if (videoExtensions.some(ext => lowerContent.includes(ext))) {
                return MessageType.Video;
            }
            return MessageType.Link;
        }

        return MessageType.Text;
    }
}
