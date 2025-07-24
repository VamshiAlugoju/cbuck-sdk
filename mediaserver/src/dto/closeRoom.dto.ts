import { IsString, IsNotEmpty } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CloseRoomDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty({
    description: 'roomId',
    example: '12345',
  })
  roomId: string;
}
