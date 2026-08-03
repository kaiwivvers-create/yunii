import { Controller, Post, Body } from '@nestjs/common';
import { ChatService } from './chat.service';

@Controller('api/chat')
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  async chat(@Body() body: { message: string; context?: string; history?: Array<{role: string; content: string}> }) {
    return this.chatService.generateResponse(body.message, body.context, body.history);
  }
}
