import { IsString, IsNotEmpty, IsOptional, IsInt } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateMenuDto {
  @ApiProperty({ description: "菜单名称" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: "路由路径" })
  @IsOptional()
  @IsString()
  path?: string;

  @ApiPropertyOptional({ description: "图标" })
  @IsOptional()
  @IsString()
  icon?: string;

  @ApiPropertyOptional({ description: "父级 ID" })
  @IsOptional()
  @IsString()
  parentId?: string;

  @ApiPropertyOptional({ description: "排序", default: 0 })
  @IsOptional()
  @IsInt()
  sort?: number;

  @ApiPropertyOptional({ description: "类型: dir/menu/button", default: "menu" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: "权限编码" })
  @IsOptional()
  @IsString()
  permissionCode?: string;

  @ApiPropertyOptional({ description: "状态: 1启用 0禁用", default: 1 })
  @IsOptional()
  @IsInt()
  status?: number;
}
