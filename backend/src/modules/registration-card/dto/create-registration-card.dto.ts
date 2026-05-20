import { PartialType } from "@nestjs/swagger";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateRegistrationCardDto {
  @ApiProperty({ description: "姓名", example: "桂艳" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "与本人关系", example: "本人" })
  @IsString()
  @IsNotEmpty()
  relationship!: string;

  @ApiProperty({ description: "身份证号", example: "610431198504200062" })
  @IsString()
  @IsNotEmpty()
  idNumber!: string;

  @ApiProperty({ description: "性别", example: "女" })
  @IsString()
  @IsNotEmpty()
  gender!: string;

  @ApiProperty({ description: "出生日期", example: "1985-04-20" })
  @IsDateString()
  birthDate!: string;

  @ApiPropertyOptional({ description: "血型", example: "A" })
  @IsOptional()
  @IsString()
  bloodType?: string;

  @ApiPropertyOptional({ description: "衣服尺码", example: "165" })
  @IsOptional()
  @IsString()
  clothingSize?: string;

  @ApiProperty({ description: "手机号码", example: "18681984912" })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiPropertyOptional({ description: "常住省份", example: "陕西省" })
  @IsOptional()
  @IsString()
  province?: string;

  @ApiPropertyOptional({ description: "常住城市", example: "咸阳市" })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: "常住地址", example: "陕西省 咸阳市" })
  @IsOptional()
  @IsString()
  permanentAddress?: string;

  @ApiPropertyOptional({ description: "详细地址", example: "武功县瑞云小区北区" })
  @IsOptional()
  @IsString()
  detailedAddress?: string;

  @ApiProperty({ description: "紧急联系人姓名", example: "等冯海东" })
  @IsString()
  @IsNotEmpty()
  emergencyContactName!: string;

  @ApiProperty({ description: "紧急联系人电话", example: "15686103111" })
  @IsString()
  @IsNotEmpty()
  emergencyContactPhone!: string;
}

export class UpdateRegistrationCardDto extends PartialType(CreateRegistrationCardDto) {
  @ApiPropertyOptional({ description: "状态：1=启用，0=禁用" })
  @IsOptional()
  @IsInt()
  status?: number;
}
