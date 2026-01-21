import { Injectable } from '@angular/core';
import * as signalR from '@microsoft/signalr';
import { BehaviorSubject, Subject } from 'rxjs';
import { Message, User, Channel, MessageType } from '../models/chat.models';

@Injectable({
    providedIn: 'root'
})
export class SignalrService {
    private hubConnection!: signalR.HubConnection;
    private readonly hubUrl = 'http://localhost:5000/chathub';

    // Observables for components to subscribe to
    public messageReceived$ = new Subject<Message>();
    public userJoined$ = new Subject<string>();
    public userDisconnected$ = new Subject<string>();
    public userJoinedChannel$ = new Subject<{ username: string; channelName: string }>();
    public userLeftChannel$ = new Subject<{ username: string; channelName: string }>();
    public userTyping$ = new Subject<string>();
    public userStoppedTyping$ = new Subject<string>();
    public connectionEstablished$ = new BehaviorSubject<boolean>(false);

    constructor() { }

    public async startConnection(): Promise<void> {
        this.hubConnection = new signalR.HubConnectionBuilder()
            .withUrl(this.hubUrl)
            .withAutomaticReconnect()
            .build();

        this.registerEvents();

        try {
            await this.hubConnection.start();
            console.log('SignalR Connected');
            this.connectionEstablished$.next(true);
        } catch (err) {
            console.error('Error while starting SignalR connection: ', err);
            setTimeout(() => this.startConnection(), 5000);
        }
    }

    private registerEvents(): void {
        this.hubConnection.on('ReceiveMessage', (message: Message) => {
            this.messageReceived$.next(message);
        });

        this.hubConnection.on('UserJoined', (username: string) => {
            this.userJoined$.next(username);
        });

        this.hubConnection.on('UserDisconnected', (username: string) => {
            this.userDisconnected$.next(username);
        });

        this.hubConnection.on('UserJoinedChannel', (username: string, channelName: string) => {
            this.userJoinedChannel$.next({ username, channelName });
        });

        this.hubConnection.on('UserLeftChannel', (username: string, channelName: string) => {
            this.userLeftChannel$.next({ username, channelName });
        });

        this.hubConnection.on('UserTyping', (username: string) => {
            this.userTyping$.next(username);
        });

        this.hubConnection.on('UserStoppedTyping', (username: string) => {
            this.userStoppedTyping$.next(username);
        });
    }

    public async register(username: string): Promise<{ success: boolean; userId: number; username: string }> {
        return await this.hubConnection.invoke('Register', username);
    }

    public async sendMessage(
        senderId: number,
        content: string,
        type: MessageType,
        channelId: number | null,
        receiverId: number | null
    ): Promise<void> {
        await this.hubConnection.invoke('SendMessage', senderId, content, type, channelId, receiverId);
    }

    public async joinChannel(userId: number, channelId: number): Promise<void> {
        await this.hubConnection.invoke('JoinChannel', userId, channelId);
    }

    public async leaveChannel(userId: number, channelId: number): Promise<void> {
        await this.hubConnection.invoke('LeaveChannel', userId, channelId);
    }

    public async getOnlineUsers(): Promise<User[]> {
        return await this.hubConnection.invoke('GetOnlineUsers');
    }

    public async getChannels(): Promise<Channel[]> {
        return await this.hubConnection.invoke('GetChannels');
    }

    public async getChannelMessages(channelId: number, take: number = 50): Promise<Message[]> {
        return await this.hubConnection.invoke('GetChannelMessages', channelId, take);
    }

    public async getPrivateMessages(userId: number, otherUserId: number, take: number = 50): Promise<Message[]> {
        return await this.hubConnection.invoke('GetPrivateMessages', userId, otherUserId, take);
    }

    public async startTyping(channelId: number | null, receiverId: number | null, username: string): Promise<void> {
        await this.hubConnection.invoke('StartTyping', channelId, receiverId, username);
    }

    public async stopTyping(channelId: number | null, receiverId: number | null, username: string): Promise<void> {
        await this.hubConnection.invoke('StopTyping', channelId, receiverId, username);
    }
}
