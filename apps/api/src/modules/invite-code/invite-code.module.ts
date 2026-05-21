import { Module } from "@nestjs/common";
import { InviteCodeController } from "./invite-code.controller";
import { InviteCodeService } from "./invite-code.service";
import { EventModule } from "../event/event.module";

@Module({
  imports: [EventModule],
  controllers: [InviteCodeController],
  providers: [InviteCodeService],
})
export class InviteCodeModule {}
