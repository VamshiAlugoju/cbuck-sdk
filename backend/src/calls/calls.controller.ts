import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
  UsePipes,
  ValidationPipe,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiBody } from '@nestjs/swagger';
import CallService from './services/implementations/calls.service';
import { AuthGuard } from 'src/common/Guards/AuthGuard';
import {
  CallHistoryDto,
  FeedbackDto,
  GetScheduledCallDto,
  GetScheduledCallListDto,
  ScheduleCallDto,
  ScheduleCallWithCallIdDto,
  TranslationErrorDto,
} from './dto/calls.dto';
// import { LoginDto } from 'src/auth/dto/login.dto';
import { Request } from 'express';

@ApiTags('Calls')
@ApiBearerAuth('accessToken')
@Controller({ version: '1', path: 'calls' })
export class CallsController {
  constructor(private readonly callService: CallService) { }
  @Post('translation_error')
  async getCallHistory(@Body() body: TranslationErrorDto) {
    return this.callService.handleTranslationError(body);
  }
}
