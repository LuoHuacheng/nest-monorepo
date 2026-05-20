import { IsOptional, IsString } from "class-validator";
import { ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class QueryRegistrationCardDto extends PaginationDto {
  @ApiPropertyOptional({ description: "搜索关键词（姓名）" })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: "手机号" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "身份证号" })
  @IsOptional()
  @IsString()
  idNumber?: string;
}
