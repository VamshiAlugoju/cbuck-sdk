import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AnswerCallDto {
  @ApiProperty({
    description: 'ID of the room where the call is being answered',
    example: 'room-12345',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'ID of the user answering the call',
    example: 'user-67890',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID of the participant who is answering',
    example: 'participant-abcdef',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;
}

export class clearParticipantDto {
  @ApiProperty({
    description: 'ID of the room where the call is being answered',
    example: 'room-12345',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'ID of the participant who is answering',
    example: 'participant-abcdef',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;
}

export class ShareScreenDto {
  @ApiProperty({
    description: 'ID of the room where the screen is being shared',
    example: 'room-12345',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'ID of the user sharing the screen',
    example: 'user-67890',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID of the participant who is sharing the screen',
    example: 'participant-abcdef',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;
}
