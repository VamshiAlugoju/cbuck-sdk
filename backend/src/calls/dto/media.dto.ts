import {
  IsBoolean,
  IsIn,
  IsNotEmpty,
  IsObject,
  IsOptional,
  IsString,
} from 'class-validator';
// import { any, any, any } from '../types/mediasoup.types';
export class CreateTransportDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;
}

export class ConnectTransportDto {
  @IsString()
  roomId: string;

  @IsObject()
  dtlsParameters: any;
}

export class ProduceDto {
  @IsString()
  roomId: string;

  @IsIn(['audio', 'video'])
  kind: 'audio' | 'video';

  @IsObject()
  rtpParameters: any;

  @IsObject()
  appData: any;


  @IsOptional()
  @IsBoolean()
  isScreenShare: boolean;
}

export class ConsumeDto {
  @IsString()
  roomId: string;

  @IsString()
  producerClientId: string;

  @IsString()
  producerId: string;

  @IsObject()
  rtpCapabilities: any;
}

export class UnpauseDto {
  @IsString()
  id: string;

  @IsString()
  roomId: string;
}
