import { Module } from "@nestjs/common";
import { ResultController } from "./result.controller";
import { ResultService } from "./result.service";
import { EventModule } from "../event/event.module";

@Module({
  imports: [EventModule],
  controllers: [ResultController],
  providers: [ResultService],
})
export class ResultModule {}
