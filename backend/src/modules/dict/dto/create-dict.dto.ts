import { IsString, IsNotEmpty, IsOptional, IsInt } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateDictDto {
  @ApiProperty({ description: "字典名称" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "字典编码" })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: "描述" })
  @IsOptional()
  @IsString()
  description?: string;
}

export class CreateDictItemDto {
  @ApiProperty({ description: "标签" })
  @IsString()
  @IsNotEmpty()
  label!: string;

  @ApiProperty({ description: "值" })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiPropertyOptional({ description: "排序", default: 0 })
  @IsOptional()
  @IsInt()
  sort?: number;
}
