import { Injectable } from '@angular/core';
import { IPublicProfile, IMatch, IMessage, IChat } from 'src/app/interfaces/tinder-user';

@Injectable({
  providedIn: 'root'
})
export class MockTinderService {
  private mockProfiles: IPublicProfile[] = [
    {
      uid: 'mock-user-1',
      name: 'Sofía',
      lastName: 'Gómez',
      birthDate: '2001-04-12',
      country: 'Colombia',
      city: 'Bogotá',
      gender: 'female',
      showGenderProfile: true,
      passions: [
        { category: 'Café de Especialidad' },
        { category: 'Cine Indie' },
        { category: 'Diseño UX' },
        { category: 'Hiking' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=600&auto=format&fit=crop&q=80'
      ],
      bio: 'Diseñadora gráfica & UX. Si sabes de buenos lugares de café o te gusta el senderismo de montaña, nos llevaremos increíble ☕🏔️✨'
    },
    {
      uid: 'mock-user-2',
      name: 'Mateo',
      lastName: 'Restrepo',
      birthDate: '1999-08-20',
      country: 'Colombia',
      city: 'Medellín',
      gender: 'male',
      showGenderProfile: true,
      passions: [
        { category: 'Música en Vivo' },
        { category: 'Tecnología' },
        { category: 'Conciertos' },
        { category: 'Gatos' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=600&auto=format&fit=crop&q=80'
      ],
      bio: 'Arquitecto de software de día, baterista en bandas de rock de noche 🎸💻 Busco a alguien para compartir playlists y salir a cenar.'
    },
    {
      uid: 'mock-user-3',
      name: 'Valentina',
      lastName: 'Ospina',
      birthDate: '2002-01-15',
      country: 'Colombia',
      city: 'Cali',
      gender: 'female',
      showGenderProfile: true,
      passions: [
        { category: 'Fotografía' },
        { category: 'Salsa & Baile' },
        { category: 'Viajes' },
        { category: 'Arte Contemporáneo' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=600&auto=format&fit=crop&q=80'
      ],
      bio: 'Fotógrafa urbana. Si te gusta bailar, los viajes por carretera improvisados y las conversaciones profundas bajo las estrellas 📸💃🌌'
    },
    {
      uid: 'mock-user-4',
      name: 'Lucas',
      lastName: 'Vargas',
      birthDate: '2000-06-18',
      country: 'Colombia',
      city: 'Barranquilla',
      gender: 'male',
      showGenderProfile: true,
      passions: [
        { category: 'Gastronomía' },
        { category: 'Playa' },
        { category: 'Fitness' },
        { category: 'Perros' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=600&auto=format&fit=crop&q=80'
      ],
      bio: 'Chef aficionado y amante del mar. La pasta casera fresca y los atardeceres en la playa son mi debilidad 🍝🌊🐕'
    },
    {
      uid: 'mock-user-5',
      name: 'Isabella',
      lastName: 'Herrera',
      birthDate: '2001-11-23',
      country: 'Colombia',
      city: 'Cartagena',
      gender: 'female',
      showGenderProfile: true,
      passions: [
        { category: 'Buceo' },
        { category: 'Sostenibilidad' },
        { category: 'Yoga' },
        { category: 'Lectura' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=600&auto=format&fit=crop&q=80',
        'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=600&auto=format&fit=crop&q=80'
      ],
      bio: 'Bióloga marina. Cuidando los corales y explorando las profundidades del océano 🐠🌊 Siempre lista para un té y un buen libro.'
    },
    {
      uid: 'mock-user-6',
      name: 'Camila',
      lastName: 'Montoya',
      birthDate: '2000-09-04',
      country: 'Colombia',
      city: 'Bucaramanga',
      gender: 'female',
      showGenderProfile: true,
      passions: [
        { category: 'Moda Sostenible' },
        { category: 'Arquitectura' },
        { category: 'Vino' },
        { category: 'Plantas' }
      ],
      photos: [
        'https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=600&auto=format&fit=crop&q=80'
      ],
      bio: 'Directora creativa en agencia digital. Amante del minimalismo, las plantas y una buena copa de Malbec 🍷🌿'
    }
  ];

  private mockMatches: IMatch[] = [
    {
      matchId: 'match-pre-1',
      userId: 'current-user-demo',
      matchedUserId: 'mock-user-1',
      participants: ['current-user-demo', 'mock-user-1'],
      matchedAt: Date.now() - 3600000 * 4,
      chatId: 'current-user-demo_mock-user-1'
    }
  ];

  private mockChats: { [chatId: string]: IChat } = {
    'current-user-demo_mock-user-1': {
      chatId: 'current-user-demo_mock-user-1',
      participants: ['current-user-demo', 'mock-user-1'],
      lastMessage: '¡Hola! Qué gusto coincidir contigo por aquí 😊',
      lastMessageTime: Date.now() - 3600000 * 2,
      messages: [
        {
          messageId: 'msg-1',
          chatId: 'current-user-demo_mock-user-1',
          senderId: 'mock-user-1',
          receiverId: 'current-user-demo',
          message: '¡Hola! Qué gusto coincidir contigo por aquí 😊',
          timestamp: Date.now() - 3600000 * 2,
          read: true
        }
      ]
    }
  };

  private likedUids: Set<string> = new Set();
  private passedUids: Set<string> = new Set();

  constructor() {}

  async getAvailableProfiles(): Promise<IPublicProfile[]> {
    return this.mockProfiles.filter(p => !this.likedUids.has(p.uid) && !this.passedUids.has(p.uid));
  }

  async likeProfile(likedUserId: string): Promise<boolean> {
    this.likedUids.add(likedUserId);
    
    // Simular que el 70% de los likes resultan en match para interactividad fluida
    const isMatch = true; 

    if (isMatch) {
      const chatId = `current-user-demo_${likedUserId}`;
      const newMatch: IMatch = {
        matchId: `match-${Date.now()}`,
        userId: 'current-user-demo',
        matchedUserId: likedUserId,
        participants: ['current-user-demo', likedUserId],
        matchedAt: Date.now(),
        chatId: chatId
      };

      this.mockMatches.unshift(newMatch);

      // Iniciar el chat con saludo simulado
      const targetUser = this.mockProfiles.find(p => p.uid === likedUserId);
      const greeting = targetUser 
        ? `¡Hola! Me encantó tu perfil y que coincidamos ✨ ¿Cómo va tu día?`
        : `¡Hola! Qué gusto hacer match contigo 🚀`;

      this.mockChats[chatId] = {
        chatId: chatId,
        participants: ['current-user-demo', likedUserId],
        lastMessage: greeting,
        lastMessageTime: Date.now(),
        messages: [
          {
            messageId: `msg-${Date.now()}`,
            chatId: chatId,
            senderId: likedUserId,
            receiverId: 'current-user-demo',
            message: greeting,
            timestamp: Date.now(),
            read: false
          }
        ]
      };

      return true;
    }

    return false;
  }

  async passProfile(passedUserId: string): Promise<void> {
    this.passedUids.add(passedUserId);
  }

  async getMatches(): Promise<IMatch[]> {
    return [...this.mockMatches];
  }

  subscribeToMatches(callback: (matches: IMatch[]) => void): () => void {
    callback(this.mockMatches);
    return () => {};
  }

  async getChat(chatId: string): Promise<IChat | null> {
    return this.mockChats[chatId] || null;
  }

  subscribeToChat(chatId: string, callback: (chat: IChat | null) => void): () => void {
    callback(this.mockChats[chatId] || null);
    return () => {};
  }

  async sendMessage(chatId: string, message: string, receiverId: string): Promise<void> {
    let chat = this.mockChats[chatId];
    if (!chat) {
      chat = {
        chatId,
        participants: ['current-user-demo', receiverId],
        lastMessage: message,
        lastMessageTime: Date.now(),
        messages: []
      };
      this.mockChats[chatId] = chat;
    }

    const newMsg: IMessage = {
      messageId: `msg-${Date.now()}`,
      chatId,
      senderId: 'current-user-demo',
      receiverId,
      message,
      timestamp: Date.now(),
      read: true
    };

    chat.messages.push(newMsg);
    chat.lastMessage = message;
    chat.lastMessageTime = Date.now();

    // Auto-respuesta inteligente simulada tras 1.2 segundos
    setTimeout(() => {
      const autoReplies = [
        '¡Totalmente de acuerdo! Qué buen plan 👌',
        'Jaja me encanta esa actitud, me caes súper bien!',
        '¡Genial! Deberíamos planear un café pronto ☕',
        '¡Qué interesante! Cuéntame más sobre eso 😊'
      ];
      const randomReply = autoReplies[Math.floor(Math.random() * autoReplies.length)];
      
      const replyMsg: IMessage = {
        messageId: `msg-reply-${Date.now()}`,
        chatId,
        senderId: receiverId,
        receiverId: 'current-user-demo',
        message: randomReply,
        timestamp: Date.now(),
        read: false
      };

      chat.messages.push(replyMsg);
      chat.lastMessage = randomReply;
      chat.lastMessageTime = Date.now();
    }, 1200);
  }

  async getProfileByUid(uid: string): Promise<IPublicProfile | null> {
    const found = this.mockProfiles.find(p => p.uid === uid);
    return found || null;
  }
}
