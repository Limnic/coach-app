import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayConnection,
  OnGatewayDisconnect,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ChatService } from './chat.service';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
  namespace: '/chat',
})
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userSockets = new Map<string, string[]>(); // userId -> socketIds

  constructor(private chatService: ChatService) {}

  handleConnection(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const existing = this.userSockets.get(userId) || [];
      this.userSockets.set(userId, [...existing, client.id]);
      client.join(`user:${userId}`);
      console.log(`User ${userId} connected with socket ${client.id}`);
    }
  }

  handleDisconnect(client: Socket) {
    const userId = client.handshake.query.userId as string;
    if (userId) {
      const sockets = this.userSockets.get(userId) || [];
      this.userSockets.set(
        userId,
        sockets.filter((id) => id !== client.id),
      );
      console.log(`User ${userId} disconnected socket ${client.id}`);
    }
  }

  @SubscribeMessage('sendMessage')
  async handleMessage(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; content: string; attachmentUrl?: string },
  ) {
    const senderId = client.handshake.query.userId as string;
    
    if (!senderId) {
      return { error: 'Not authenticated' };
    }

    const message = await this.chatService.sendMessage(
      senderId,
      data.receiverId,
      data.content,
      data.attachmentUrl,
    );

    // Send to receiver
    this.server.to(`user:${data.receiverId}`).emit('newMessage', message);

    // Also send back to sender for confirmation
    return message;
  }

  @SubscribeMessage('typing')
  handleTyping(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { receiverId: string; isTyping: boolean },
  ) {
    const senderId = client.handshake.query.userId as string;
    
    this.server.to(`user:${data.receiverId}`).emit('userTyping', {
      userId: senderId,
      isTyping: data.isTyping,
    });
  }

  @SubscribeMessage('markAsRead')
  async handleMarkAsRead(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { partnerId: string },
  ) {
    const userId = client.handshake.query.userId as string;
    
    await this.chatService.markConversationAsRead(userId, data.partnerId);
    
    // Notify the partner that messages were read
    this.server.to(`user:${data.partnerId}`).emit('messagesRead', {
      by: userId,
    });
  }

  // Utility method to send real-time notifications
  sendNotification(userId: string, notification: any) {
    this.server.to(`user:${userId}`).emit('notification', notification);
  }
}

