export enum MessageType {
  Text = 0,
  Image = 1,
  Video = 2,
  Link = 3
}

export interface User {
  id: number;
  username: string;
  isOnline?: boolean;
}

export interface Message {
  id: number;
  content: string;
  type: MessageType;
  timestamp: Date;
  senderId: number;
  senderUsername: string;
  channelId?: number;
  receiverId?: number;
}

export interface Channel {
  id: number;
  name: string;
  description?: string;
}

export interface ChatState {
  currentUser: User | null;
  currentChannel: Channel | null;
  currentPrivateChat: User | null;
  messages: Message[];
  channels: Channel[];
  onlineUsers: User[];
}
