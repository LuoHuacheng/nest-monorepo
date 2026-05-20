import { IsOptional, IsString, IsInt } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryUserDto extends PaginationDto {
  @ApiPropertyOptional({ description: "用户名/姓名搜索" })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: "状态" })
  @IsOptional()
  @IsInt()
  status?: number;
}
