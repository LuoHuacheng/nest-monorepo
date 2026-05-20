import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreatePermissionDto {
  @ApiProperty({ description: "权限名称" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "权限编码" })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: "类型", default: "button" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: "父级 ID" })
  @IsOptional()
  @IsString()
  parentId?: string;
}
