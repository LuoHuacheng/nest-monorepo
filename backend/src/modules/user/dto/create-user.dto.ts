import { IsString, IsNotEmpty, IsOptional, IsEmail, IsArray } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateUserDto {
  @ApiProperty({ description: "用户名" })
  @IsString()
  @IsNotEmpty()
  username!: string;

  @ApiProperty({ description: "密码" })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiProperty({ description: "姓名" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: "手机号" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "邮箱" })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiPropertyOptional({ description: "头像" })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: "角色 ID 列表", type: [String] })
  @IsOptional()
  @IsArray()
  roleIds?: string[];
}
