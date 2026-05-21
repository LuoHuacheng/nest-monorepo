import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryResultDto extends PaginationDto {
  @ApiPropertyOptional({ description: "赛事ID" })
  @IsOptional()
  @IsString()
  eventId?: string;
}
