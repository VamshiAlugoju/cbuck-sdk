import { Body, Controller, Get, Param, Post, UsePipes, ValidationPipe } from '@nestjs/common';
import { MediaService } from './mediaserver.service';
import { AppService } from './main.service';
import { StartCallDto } from './dto/startcall.dto';
import { AnswerCallDto, clearParticipantDto, ShareScreenDto } from './dto/answercall.dto';
import { CloseRoomDto } from './dto/closeRoom.dto';
import { TransportService } from './transport.service';
import {
  CreateTransportDto,
  ConnectTransportDto,
  ConsumeDto,
  ProduceDto,
  UnpauseDto,
  DataConsumerDto,
  CloneParticipantDto,
  StopScreenSharingDto,
  InitiateTranslationDto,
} from './dto/transport.dto';
import { CreateroomDto } from './dto/createRoom.dto';

@Controller('mediaserver')
export class AppController {
  constructor(
    private readonly mediaService: MediaService,
    private readonly appService: AppService,
    private readonly transportService: TransportService,
  ) { }

  @Post('start_call')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  startCall(@Body() data: StartCallDto) {
    return this.mediaService.startCall(data);
  }

  @Post('answer_call')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  answerCall(@Body() data: AnswerCallDto) {
    return this.mediaService.answerCall(data);
  }

  @Post('clear_participant')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  clearParticipant(@Body() data: clearParticipantDto) {
    return this.mediaService.clearParticipant(data);
  }

  @Post('close_room')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  closeRoom(@Body() data: CloseRoomDto) {
    return this.mediaService.closeRoom(data);
  }

  @Post('close_all_rooms')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  closeAllRooms() {
    return this.mediaService.closeAllRooms();
  }

  @Post('share_screen')
  @UsePipes(new ValidationPipe({ whitelist: true, transform: true }))
  shareScreen(@Body() body: ShareScreenDto) {
    return this.mediaService.shareScreen(body);
  }

  @Get('get_instance_details')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  getInstanceDetails(): any {
    return this.appService.getInstanceDetails();
  }

  // 🔹 Transport Routes (Now using TransportService)
  @Post('create_producer_transport')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createProducerTransport(@Body() data: CreateTransportDto) {
    return this.transportService.createProducerTransport(data);
  }

  @Post('create_consumer_transport')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  createConsumerTransport(@Body() data: CreateTransportDto) {
    return this.transportService.createConsumerTransport(data);
  }

  @Post('connect_producer_transport')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  connectProducerTransport(@Body() data: ConnectTransportDto) {
    return this.transportService.connectProducerTransport(data);
  }

  @Post('connect_consumer_transport')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  connectConsumerTransport(@Body() data: ConnectTransportDto) {
    return this.transportService.connectConsumerTransport(data);
  }

  @Post('produce')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  produce(@Body() data: ProduceDto) {
    return this.transportService.produce(data);
  }

  @Post('consume')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  consume(@Body() data: ConsumeDto) {
    return this.transportService.consume(data);
  }

  @Post('unpause_consumer')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  unpauseConsumer(@Body() data: UnpauseDto) {
    return this.transportService.unpauseConsumer(data);
  }

  @Post('create_room')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  cretaeRoom(@Body() data: CreateroomDto) {
    return this.mediaService.createRoom(data);
  }
  @Post('ConsumeData')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  getDataProducer(@Body() data: DataConsumerDto) {
    return this.transportService.consumeDataConsumer(data);
  }
  @Post('clone_participant')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  cloneParticipant(@Body() data: CloneParticipantDto) {
    return this.transportService.cloneParticipant(data);
  }
  @Post('stop_screensharing')
  @UsePipes(new ValidationPipe({ whitelist: true }))
  stop_screensharing(@Body() data: StopScreenSharingDto) {
    return this.transportService.stopScreenSharing(data);
  }


  @Post("translate")
  @UsePipes(new ValidationPipe({ whitelist: true }))
  translate(@Body() data: InitiateTranslationDto) {
    return this.mediaService.translate(data);
  }
}
