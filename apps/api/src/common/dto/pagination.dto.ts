import { IsInt, IsOptional, Min } from "class-validator";
import { Type } from "class-transformer";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class PaginationDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  pageSize: number = 10;
}

export class PaginatedResult<T> {
  @ApiProperty({ description: "数据列表" })
  items!: T[];

  @ApiProperty({ example: 100, description: "总条数" })
  total!: number;

  @ApiProperty({ example: 1, description: "当前页码" })
  page!: number;

  @ApiProperty({ example: 10, description: "每页条数" })
  pageSize!: number;
}
