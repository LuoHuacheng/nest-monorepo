import { IsString, IsNotEmpty, IsOptional, IsArray, ValidateNested } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { Type } from "class-transformer";

export class ClientConfigItemDto {
  @ApiProperty({ description: "配置键" })
  @IsString()
  @IsNotEmpty()
  key!: string;

  @ApiProperty({ description: "配置值" })
  @IsString()
  @IsNotEmpty()
  value!: string;

  @ApiPropertyOptional({ description: "配置说明" })
  @IsOptional()
  @IsString()
  description?: string;
}

export class BatchUpdateClientConfigDto {
  @ApiProperty({ description: "配置列表", type: [ClientConfigItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ClientConfigItemDto)
  configs!: ClientConfigItemDto[];
}
