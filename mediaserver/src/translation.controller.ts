import { Controller, Post, Body, Logger } from '@nestjs/common';
import { MediaService } from './mediaserver.service';
import { StoppedTranslationDto } from './dto/transport.dto';

@Controller('translation')
export class TranslationController {
    private readonly logger = new Logger(TranslationController.name);

    constructor(private readonly mediaService: MediaService) { }

    @Post('stopped')
    async handleTranslationStopped(@Body() body: StoppedTranslationDto) {
        this.logger.warn(`⚠️ Translation stopped notification received: ${JSON.stringify(body)}`);
        await fetch('http://localhost:8088/calls/terminate_translation', { method: 'POST', body: JSON.stringify(body) });
    }
}
