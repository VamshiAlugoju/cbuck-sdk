import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class StartCallDto {
  @ApiProperty({
    description: 'Unique identifier for the call',
    example: 'call-12345',
  })
  @IsString()
  @IsNotEmpty()
  callId: string;

  @ApiProperty({
    description: 'ID of the participant initiating the call',
    example: 'participant-67890',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @ApiProperty({
    description: 'ID of the user starting the call',
    example: 'user-abcdef',
  })
  @IsString()
  @IsNotEmpty()
  userId: string;

  @ApiProperty({
    description: 'ID of the room where the call is happening',
    example: 'room-98765',
  })
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
