import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";
import {
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsEmail,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Length,
  MaxLength,
  Min,
} from "class-validator";

export class CreateOrganizerDto {
  @ApiProperty({ description: "登录账号" })
  @IsString()
  @IsNotEmpty()
  loginAccount!: string;

  @ApiProperty({ description: "登录密码，长度 6-20 位" })
  @IsString()
  @Length(6, 20)
  password!: string;

  @ApiProperty({ description: "组委会名称" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(50)
  name!: string;

  @ApiProperty({ description: "联系人" })
  @IsString()
  @IsNotEmpty()
  contact!: string;

  @ApiProperty({ description: "联系电话" })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: "备用联系人" })
  @IsString()
  @IsNotEmpty()
  backupContact!: string;

  @ApiProperty({ description: "备用联系电话" })
  @IsString()
  @IsNotEmpty()
  backupPhone!: string;

  @ApiProperty({ description: "资质证书编号" })
  @IsString()
  @IsNotEmpty()
  certificateNo!: string;

  @ApiProperty({ description: "赛事时间" })
  @IsDateString()
  eventDate!: string;

  @ApiProperty({ description: "赛事省份" })
  @IsString()
  @IsNotEmpty()
  province!: string;

  @ApiProperty({ description: "赛事城市" })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ description: "详细地址" })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiProperty({ description: "赛事规模（人数）" })
  @IsInt()
  @Min(1)
  eventScale!: number;

  @ApiProperty({ description: "赛事项目", type: [String], example: ["马拉松", "半程马拉松"] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  eventItems!: string[];

  @ApiPropertyOptional({ description: "运营单位" })
  @IsOptional()
  @IsString()
  operator?: string;

  @ApiProperty({ description: "组委会邮箱" })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: "备注" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;
}

export class UpdateOrganizerDto extends PartialType(CreateOrganizerDto) {}
