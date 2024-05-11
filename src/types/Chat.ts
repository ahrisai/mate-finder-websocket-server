import { Message } from './Message.js';

export interface ChatUser {
  id: number;
  nickname: string;
  avatar: string;
}
export interface Chat {
  id?: number;
  team: boolean;
  roomId: string;
  messages: Message[];
  members: ChatUser[];
}
