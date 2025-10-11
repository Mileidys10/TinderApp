export interface IPassion {
  category: string;
}

export interface ITinderUser {
  uid: string;
  name: string;
  lastName: string;
  birthDate: string; 
  email: string;
  password?: string; 
  country: string;
  city: string;
  gender: 'male' | 'female' | 'other';
  showGenderProfile: boolean;
  passions: IPassion[];
  photos: string[]; 
  bio?: string;
  age?: number; 
}

export interface IMatch {
  matchId: string;
  userId: string;
  matchedUserId: string;
  matchedAt: number;
  chatId: string;
}

export interface IMessage {
  messageId: string;
  chatId: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: number;
  read: boolean;
}

export interface IChat {
  chatId: string;
  participants: string[]; 
  lastMessage: string;
  lastMessageTime: number;
  messages: IMessage[];
}

export type IPublicProfile = Omit<ITinderUser, 'password' | 'email'>;