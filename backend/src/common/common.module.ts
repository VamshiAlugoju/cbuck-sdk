import { Module } from '@nestjs/common';
import { AuthGuard } from './Guards/AuthGuard';

@Module({
  providers: [AuthGuard],
  exports: [AuthGuard],
})
export class CommonModule {}
