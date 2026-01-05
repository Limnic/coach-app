import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class ChatService {
  constructor(private prisma: PrismaService) {}

  async sendMessage(senderId: string, receiverId: string, content: string, attachmentUrl?: string) {
    return this.prisma.message.create({
      data: {
        senderId,
        receiverId,
        content,
        attachmentUrl,
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true } },
      },
    });
  }

  async getConversation(userId1: string, userId2: string, limit = 50, before?: Date) {
    return this.prisma.message.findMany({
      where: {
        OR: [
          { senderId: userId1, receiverId: userId2 },
          { senderId: userId2, receiverId: userId1 },
        ],
        ...(before ? { createdAt: { lt: before } } : {}),
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async getConversationsList(userId: string) {
    // Get unique conversation partners
    const messages = await this.prisma.message.findMany({
      where: {
        OR: [{ senderId: userId }, { receiverId: userId }],
      },
      include: {
        sender: { select: { id: true, firstName: true, lastName: true } },
        receiver: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Group by conversation partner
    const conversationsMap = new Map<string, {
      partner: { id: string; firstName: string; lastName: string };
      lastMessage: typeof messages[0];
      unreadCount: number;
    }>();

    for (const msg of messages) {
      const partnerId = msg.senderId === userId ? msg.receiverId : msg.senderId;
      const partner = msg.senderId === userId ? msg.receiver : msg.sender;

      if (!conversationsMap.has(partnerId)) {
        conversationsMap.set(partnerId, {
          partner,
          lastMessage: msg,
          unreadCount: 0,
        });
      }

      // Count unread
      if (msg.receiverId === userId && !msg.isRead) {
        const conv = conversationsMap.get(partnerId)!;
        conv.unreadCount++;
      }
    }

    return Array.from(conversationsMap.values());
  }

  async markAsRead(messageIds: string[]) {
    return this.prisma.message.updateMany({
      where: { id: { in: messageIds } },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async markConversationAsRead(userId: string, partnerId: string) {
    return this.prisma.message.updateMany({
      where: {
        senderId: partnerId,
        receiverId: userId,
        isRead: false,
      },
      data: { isRead: true, readAt: new Date() },
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.message.count({
      where: {
        receiverId: userId,
        isRead: false,
      },
    });
  }
}

