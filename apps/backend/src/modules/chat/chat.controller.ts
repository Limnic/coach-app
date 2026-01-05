import {
  Controller,
  Get,
  Post,
  Put,
  Body,
  Param,
  Query,
  UseGuards,
  Request,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { ChatService } from './chat.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

@ApiTags('chat')
@Controller('chat')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class ChatController {
  constructor(private chatService: ChatService) {}

  @Get('conversations')
  @ApiOperation({ summary: 'Get list of conversations' })
  async getConversations(@Request() req) {
    return this.chatService.getConversationsList(req.user.sub);
  }

  @Get('conversations/:partnerId')
  @ApiOperation({ summary: 'Get messages with specific user' })
  async getConversation(
    @Request() req,
    @Param('partnerId') partnerId: string,
    @Query('limit') limit?: string,
    @Query('before') before?: string,
  ) {
    return this.chatService.getConversation(
      req.user.sub,
      partnerId,
      limit ? parseInt(limit) : 50,
      before ? new Date(before) : undefined,
    );
  }

  @Post('messages')
  @ApiOperation({ summary: 'Send a message' })
  async sendMessage(
    @Request() req,
    @Body() data: { receiverId: string; content: string; attachmentUrl?: string },
  ) {
    return this.chatService.sendMessage(
      req.user.sub,
      data.receiverId,
      data.content,
      data.attachmentUrl,
    );
  }

  @Put('conversations/:partnerId/read')
  @ApiOperation({ summary: 'Mark conversation as read' })
  async markAsRead(@Request() req, @Param('partnerId') partnerId: string) {
    return this.chatService.markConversationAsRead(req.user.sub, partnerId);
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread message count' })
  async getUnreadCount(@Request() req) {
    const count = await this.chatService.getUnreadCount(req.user.sub);
    return { unreadCount: count };
  }
}

