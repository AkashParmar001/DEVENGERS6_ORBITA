import { Module } from '@nestjs/common';
import { SpaceObjectsController } from './space-objects.controller';
import { SpaceObjectsService } from './space-objects.service';

@Module({
  controllers: [SpaceObjectsController],
  providers: [SpaceObjectsService],
  exports: [SpaceObjectsService],
})
export class SpaceObjectsModule {}
