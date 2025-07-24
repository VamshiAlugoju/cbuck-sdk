import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './mediaserver.controller';
import { MediaService } from './mediaserver.service';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [MediaService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('root', () => {});
});

/* 
Rtc Provider :  -All Media soup logic
-- listen for events ( new Produer )

*/
