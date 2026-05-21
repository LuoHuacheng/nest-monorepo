import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";

export class QueryShuttleBusDto {
  @ApiPropertyOptional({ description: "赛事ID" })
  @IsOptional()
  @IsString()
  eventId?: string;
}
