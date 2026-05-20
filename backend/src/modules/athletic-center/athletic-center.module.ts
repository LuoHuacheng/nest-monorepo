import { Module } from "@nestjs/common";
import { AthleticCenterController } from "./athletic-center.controller";
import { AthleticCenterService } from "./athletic-center.service";

@Module({
  controllers: [AthleticCenterController],
  providers: [AthleticCenterService],
  exports: [AthleticCenterService],
})
export class AthleticCenterModule {}
