import { Module } from "@nestjs/common";
import { RegistrationCardController } from "./registration-card.controller";
import { RegistrationCardService } from "./registration-card.service";

@Module({
  controllers: [RegistrationCardController],
  providers: [RegistrationCardService],
  exports: [RegistrationCardService],
})
export class RegistrationCardModule {}
