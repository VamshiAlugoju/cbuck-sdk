import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class SendMessageDto {
    @IsNotEmpty()
    @IsString()
    receiver: string;

    @IsNotEmpty()
    @IsString()
    text: string;
}

export class MessageHistoryDto {
  @IsNotEmpty()
  @IsString()
  receiver: string;

  @IsOptional()
  @IsNumber()
  limit?: number;

  @IsOptional()
  @IsString()
  lastMessageId?: string;
}
