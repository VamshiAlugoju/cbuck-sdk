import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateTransportDto {
  @ApiProperty({ description: 'ID of the room', example: 'room-12345' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'ID of the participant',
    example: 'participant-67890',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;
}

export class ConnectTransportDto {
  @ApiProperty({ description: 'ID of the room', example: 'room-12345' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'ID of the participant',
    example: 'participant-67890',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @ApiProperty({ description: 'DTLS parameters for WebRTC transport' })
  @IsObject()
  @IsNotEmpty()
  dtlsParameters: any;
}

export class ProduceDto {
  @ApiProperty({ description: 'ID of the room', example: 'room-12345' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'ID of the participant',
    example: 'participant-67890',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @ApiProperty({ description: 'Kind of media (audio/video)', example: 'audio' })
  @IsString()
  @IsNotEmpty()
  kind: 'audio' | 'video';

  @ApiProperty({ description: 'RTP parameters for the media' })
  @IsObject()
  @IsNotEmpty()
  rtpParameters: Record<string, any>;

  @ApiProperty({
    description: 'Additional application-specific data',
    required: false,
  })
  @IsObject()
  @IsOptional()
  appData?: Record<string, any>;
}

export class ConsumeDto {
  @ApiProperty({ description: 'ID of the room', example: 'room-12345' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({ description: 'ID of the producer', example: 'producer-98765' })
  @IsString()
  @IsNotEmpty()
  producerId: string;

  @ApiProperty({
    description: 'ID of the participant',
    example: 'participant-67890',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @ApiProperty({
    description: 'ID of the producer’s client',
    example: 'client-abc123',
  })
  @IsString()
  // @IsNotEmpty()
  producerClientId: string;

  @ApiProperty({ description: 'RTP capabilities of the consumer' })
  @IsNotEmpty()
  rtpCapabilities: any;
}

export class DataConsumerDto {
  @ApiProperty({ description: 'ID of the room', example: 'room-12345' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'ID of the participant',
    example: 'participant-67890',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;
}

export class CloneParticipantDto {
  @ApiProperty({ description: 'ID of the room', example: 'room-12345' })
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @ApiProperty({
    description: 'ID of the participant',
    example: 'participant-67890',
  })
  @IsString()
  @IsNotEmpty()
  old_participant_id: string;

  @ApiProperty({
    description: 'ID of the participant',
    example: 'participant-67890',
  })
  @IsString()
  @IsNotEmpty()
  participant_id: string;
}

export class UnpauseDto {
  @ApiProperty({
    description: 'ID of the consumer',
    example: 'consumer-112233',
  })
  @IsString()
  @IsNotEmpty()
  consumerId: string;

  @ApiProperty({ description: 'ID of the room', example: 'room-12345' })
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class StopScreenSharingDto {
  @ApiProperty({
    description: 'ID of the participant',
    example: 'participanat-112233',
  })
  @IsString()
  @IsNotEmpty()
  participantId: string;

  @ApiProperty({ description: 'ID of the room', example: 'room-12345' })
  @IsString()
  @IsNotEmpty()
  roomId: string;
}
