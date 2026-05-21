import { Module } from "@nestjs/common";
import { ShuttleBusController } from "./shuttle-bus.controller";
import { ShuttleBusService } from "./shuttle-bus.service";
import { EventModule } from "../event/event.module";

@Module({
  imports: [EventModule],
  controllers: [ShuttleBusController],
  providers: [ShuttleBusService],
})
export class ShuttleBusModule {}
