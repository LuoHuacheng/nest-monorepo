import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateAthleticCenterDto {
  @ApiProperty({ description: "名称" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiPropertyOptional({ description: "联系人" })
  @IsOptional()
  @IsString()
  contact?: string;

  @ApiPropertyOptional({ description: "手机号" })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiPropertyOptional({ description: "地址" })
  @IsOptional()
  @IsString()
  address?: string;

  @ApiProperty({ description: "登录账号" })
  @IsString()
  @IsNotEmpty()
  loginAccount!: string;

  @ApiProperty({ description: "密码" })
  @IsString()
  @IsNotEmpty()
  password!: string;

  @ApiPropertyOptional({ description: "备注" })
  @IsOptional()
  @IsString()
  remark?: string;
}
