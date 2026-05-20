import { IsString, IsNotEmpty, IsOptional, IsArray } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateRoleDto {
  @ApiProperty({ description: "角色名称" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "角色编码" })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: "描述" })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: "权限 ID 列表", type: [String] })
  @IsOptional()
  @IsArray()
  permissionIds?: string[];
}
