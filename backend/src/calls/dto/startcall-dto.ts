import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  IsEnum,
} from 'class-validator';
import { CallType } from '../types/calls.types';

export class StartCallDto {
  // Recipients must be an array with at least one valid MongoDB ObjectId
  @IsArray({ message: ' *recipients* must be an array' })
  @ArrayMinSize(1, { message: 'At least one recipient is required' })
  @IsString({ each: true })
  recipients: string[];

  @IsString()
  @IsNotEmpty({ message: 'callerId should not be empty' })
  callerId: string;

  // Call type must be either 'audio' or 'video'
  @IsNotEmpty({ message: ' call_type is required' })
  @IsEnum(CallType, { message: ' call_type must be either "audio" or "video"' })
  call_type: CallType;
}

export class NotifyServerDto {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;
}
export class LeaveCallDto {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;
}

export class CallStatusDto {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;
}
