import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEnum,
  IsInt,
  IsISO8601,
  IsMongoId,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  Max,
  Min,
  MinLength,
  Validate,
  ValidateNested,
} from 'class-validator';
import { IsFutureDate } from 'src/common/validators/isFutureDate.validator';
import { CallType } from '../types/calls.types';

export class AnswerCallDto {
  @IsString()
  @IsNotEmpty()
  roomId: string;

  @IsString()
  @IsNotEmpty()
  callId: string;

  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class NotifyServerDto {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;
}

export class RejectCallDto {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;
}

export class IgnoreCallDto {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;
}

export class SwitchVideoDto {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;
}

export class ScreenShareRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;
}

export class ScheduleCallDto {
  @IsOptional()
  @IsString()
  @IsMongoId({ message: 'ownerId must be a valid MongoDB ObjectId' })
  initiatorId: string;

  @IsArray({ message: ' *recipients* must be an array' })
  @ArrayMinSize(1, { message: 'At least one recipient is required' })
  @IsString({ each: true })
  @IsMongoId({
    each: true,
    message: 'recipient must be a valid MongoDB ObjectId',
  })
  @ApiProperty()
  invitedUserIds: string[];

  @IsString()
  @IsDateString()
  @IsFutureDate({ message: 'startTime must be a future date' })
  @ApiProperty({ example: new Date().toISOString() })
  startTime: string;

  @IsNotEmpty({ message: ' callType is required' })
  @IsEnum(CallType, { message: ' callType must be either "audio" or "video"' })
  @ApiProperty({ example: CallType.audio || CallType.video })
  callType: CallType;

  @IsInt()
  @IsPositive()
  @ApiProperty({ example: 15 })
  expectedDuration: number;
}

export class GetScheduledCallDto {
  @IsString()
  @IsNotEmpty()
  @ApiProperty()
  callId: string;
}
export class HandleScheduleCallDto {
  @IsString()
  @IsMongoId({ message: 'ownerId must be a valid MongoDB ObjectId' })
  initiatorId: string;

  @IsArray({ message: ' *recipients* must be an array' })
  @ArrayMinSize(1, { message: 'At least one recipient is required' })
  @IsString({ each: true })
  @IsMongoId({
    each: true,
    message: 'recipient must be a valid MongoDB ObjectId',
  })
  invitedUserIds: string[];

  @IsString()
  @IsDateString()
  startTime: string;

  @IsNotEmpty({ message: ' callType is required' })
  @IsEnum(CallType, { message: ' callType must be either "audio" or "video"' })
  @ApiProperty({ example: CallType.audio || CallType.video })
  callType: CallType;

  @IsString()
  callId: string;
}

export class ScheduleCallWithCallIdDto extends ScheduleCallDto {
  @ApiProperty()
  @IsString()
  callId: string;
}

export class FeedbackDto {
  @ApiProperty()
  @ApiProperty()
  @IsString()
  callId: string;

  @ApiProperty()
  @IsInt()
  @IsPositive()
  @Max(5)
  @Min(1)
  rating: number;

  @ApiProperty()
  @IsOptional()
  @IsString()
  comment: string;
}
export class FeedbackWithUserIdDto extends FeedbackDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export class InviteUsersToCallDto {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;

  @ArrayMinSize(1, { message: 'At least one invited user ID must be provided' })
  @IsMongoId({ each: true })
  invitedUserIds: string[];
}

class PaginationDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  page: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  perPage: number;
}

export class GetScheduledCallListDto {
  @IsOptional()
  @IsInt()
  @Min(1)
  initiatorPage?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  initiatorPerPage?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  invitedUsersPage?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  invitedUsersPerPage?: number;
}
export class GetScheduledCallListWithIdDto extends GetScheduledCallListDto {
  @IsString()
  @IsNotEmpty()
  userId: string;
}

export enum CallStatus {
  OUTGOING = 'outgoing',
  RECEIVED = 'received',
  MISSED = 'missed',
}

export class CallHistoryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value && +value)
  @IsInt()
  @Min(1)
  page?: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 20,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => value && +value)
  @IsInt()
  @Min(1)
  perPage?: number;

  @ApiProperty({
    description: 'search user by name or contact no',
    example: 'xyx',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Transform(({ value }) => value?.trim?.() ?? '')
  search?: string;

  @ApiProperty({
    description: 'Filter data based on call status',
    example: [CallStatus.MISSED, CallStatus.OUTGOING, CallStatus.RECEIVED],
    required: false,
    isArray: true,
    enum: CallStatus,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  @IsArray()
  @IsEnum(CallStatus, { each: true })
  callStatus?: CallStatus[];

  @ApiProperty({
    description: 'Filter data based on call type',
    example: [CallType.audio, CallType.video],
    required: false,
    isArray: true,
    enum: CallType,
  })
  @IsOptional()
  @Transform(({ value }) => {
    if (typeof value === 'string') return [value];
    return value;
  })
  @IsArray()
  @IsEnum(CallType, { each: true })
  callType?: CallType[];
}

export class RemoveParticipantFromCall {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;

  @IsString()
  participantId: string;
}
export class KeepCallAliveDto {
  @IsString()
  @IsNotEmpty({ message: 'roomId should not be empty' })
  roomId: string;
}



export class InitiateTranslationDto {
  @IsString()
  @IsNotEmpty({ message: 'producerId is required' })
  producerId: string;


  @IsString()
  @IsNotEmpty({ message: 'roomId is required' })
  roomId: string;


  @IsString()
  @IsNotEmpty({ message: 'targetLang is required' })
  targetLang: string
}