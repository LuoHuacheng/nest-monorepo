import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsDateString,
  IsNotEmpty,
  IsOptional,
  IsString,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";
import { PaginationDto } from "../../../common/dto/pagination.dto";

export class CreatePacerDto {
  @ApiPropertyOptional({ description: "PacerID，不传时后端自动生成", example: "2026050800001" })
  @IsOptional()
  @IsString()
  pacerNo?: string;

  @ApiProperty({ description: "姓名" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "手机号" })
  @IsString()
  @IsNotEmpty()
  phone!: string;

  @ApiProperty({ description: "身份证号" })
  @IsString()
  @IsNotEmpty()
  idCard!: string;

  @ApiPropertyOptional({ description: "头像" })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiProperty({ description: "配速段", type: [String], example: ["半马2:30", "半马2:45"] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  paceSegments!: string[];

  @ApiPropertyOptional({ description: "目标时间/配速目标" })
  @IsOptional()
  @IsString()
  targetTime?: string;

  @ApiProperty({ description: "尺码", example: "L" })
  @IsString()
  @IsNotEmpty()
  clothingSize!: string;

  @ApiProperty({ description: "有效期开始时间" })
  @IsDateString()
  validFrom!: string;

  @ApiProperty({ description: "有效期结束时间" })
  @IsDateString()
  validTo!: string;

  @ApiProperty({ description: "体检报告 URL" })
  @IsString()
  @IsNotEmpty()
  healthReportUrl!: string;

  @ApiProperty({ description: "心电图 URL" })
  @IsString()
  @IsNotEmpty()
  ecgImageUrl!: string;

  @ApiProperty({ description: "马拉松成绩证书，最多 4 张", type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  marathonCertificates!: string[];

  @ApiProperty({ description: "个人配速计划图片 URL" })
  @IsString()
  @IsNotEmpty()
  pacePlanImageUrl!: string;

  @ApiPropertyOptional({ description: "状态：pending/approved/suspended/revoked" })
  @IsOptional()
  @IsString()
  status?: string;
}

export class CreatePacerTestDto {
  @ApiProperty({ description: "测试日期" })
  @IsDateString()
  testDate!: string;

  @ApiPropertyOptional({ description: "地点" })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({ description: "完赛时间" })
  @IsString()
  @IsNotEmpty()
  finishTime!: string;

  @ApiPropertyOptional({ description: "视频 URL" })
  @IsOptional()
  @IsString()
  videoUrl?: string;
}

export class AssignPacerDto {
  @ApiProperty({ description: "配速员 ID" })
  @IsString()
  @IsNotEmpty()
  pacerId!: string;

  @ApiProperty({ description: "赛事 ID" })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiPropertyOptional({ description: "目标时间" })
  @IsOptional()
  @IsString()
  targetTime?: string;
}

export class QueryPacerDto extends PaginationDto {
  @ApiPropertyOptional({ description: "关键词" })
  @IsOptional()
  @IsString()
  keyword?: string;

  @ApiPropertyOptional({ description: "状态" })
  @IsOptional()
  @IsString()
  status?: string;
}
