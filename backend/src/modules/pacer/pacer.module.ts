import { Module } from "@nestjs/common";
import { PacerController } from "./pacer.controller";
import { PacerService } from "./pacer.service";

@Module({
  controllers: [PacerController],
  providers: [PacerService],
  exports: [PacerService],
})
export class PacerModule {}
