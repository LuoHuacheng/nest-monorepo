import { Type } from "class-transformer";
import {
  ArrayMaxSize,
  ArrayMinSize,
  IsArray,
  IsBoolean,
  IsDateString,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  MaxLength,
  Min,
  ValidateNested,
} from "class-validator";
import { ApiProperty, ApiPropertyOptional, PartialType } from "@nestjs/swagger";

export class CreateEventRegistrationGroupDto {
  @ApiProperty({ description: "组别类型", example: "个人组" })
  @IsString()
  @IsNotEmpty()
  groupType!: string;

  @ApiProperty({ description: "规格名称", example: "马拉松" })
  @IsString()
  @IsNotEmpty()
  specName!: string;

  @ApiPropertyOptional({ description: "规格描述" })
  @IsOptional()
  @IsString()
  specDescription?: string;

  @ApiProperty({ description: "价格（元）" })
  @IsNumber()
  @Min(0)
  price!: number;

  @ApiProperty({ description: "性别限制", example: "不限" })
  @IsString()
  @IsNotEmpty()
  genderLimit!: string;

  @ApiProperty({ description: "最小年龄" })
  @IsInt()
  @Min(0)
  minAge!: number;

  @ApiProperty({ description: "最大年龄" })
  @IsInt()
  @Min(0)
  maxAge!: number;

  @ApiProperty({ description: "人数限制" })
  @IsInt()
  @Min(1)
  quota!: number;
}

export class CreateEventDto {
  @ApiProperty({ description: "赛事名称" })
  @IsString()
  @IsNotEmpty()
  name!: string;

  @ApiProperty({ description: "赛事分类", example: "马拉松赛" })
  @IsString()
  @IsNotEmpty()
  category!: string;

  @ApiProperty({ description: "比赛日期" })
  @IsDateString()
  startDate!: string;

  @ApiProperty({ description: "结束日期" })
  @IsDateString()
  endDate!: string;

  @ApiProperty({ description: "报名开始日期" })
  @IsDateString()
  registrationStartDate!: string;

  @ApiProperty({ description: "报名结束日期" })
  @IsDateString()
  registrationEndDate!: string;

  @ApiProperty({ description: "比赛省份" })
  @IsString()
  @IsNotEmpty()
  province!: string;

  @ApiProperty({ description: "比赛城市" })
  @IsString()
  @IsNotEmpty()
  city!: string;

  @ApiProperty({ description: "详细地址" })
  @IsString()
  @IsNotEmpty()
  address!: string;

  @ApiPropertyOptional({ description: "标签" })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiProperty({ description: "赛事包领取时间" })
  @IsDateString()
  packetPickupTime!: string;

  @ApiProperty({ description: "赛事包领取地址" })
  @IsString()
  @IsNotEmpty()
  packetPickupLocation!: string;

  @ApiProperty({ description: "封面图片，最多 2 张", type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(2)
  @IsString({ each: true })
  coverImages!: string[];

  @ApiPropertyOptional({ description: "是否热门赛事" })
  @IsOptional()
  @IsBoolean()
  isHot?: boolean;

  @ApiPropertyOptional({
    description: "赛事属性",
    type: [String],
    example: ["online", "shuttle_bus", "pacer_recruitment"],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  attributes?: string[];

  @ApiProperty({ description: "最大参与人数" })
  @IsInt()
  @Min(1)
  maxParticipants!: number;

  @ApiProperty({ description: "组委会 ID" })
  @IsString()
  @IsNotEmpty()
  organizerId!: string;

  @ApiProperty({ description: "报名级别", type: [CreateEventRegistrationGroupDto] })
  @IsArray()
  @ArrayMinSize(1)
  @ValidateNested({ each: true })
  @Type(() => CreateEventRegistrationGroupDto)
  registrationGroups!: CreateEventRegistrationGroupDto[];

  @ApiProperty({ description: "赛事描述" })
  @IsString()
  @IsNotEmpty()
  @MaxLength(500)
  description!: string;

  @ApiPropertyOptional({ description: "备注，仅后台可见" })
  @IsOptional()
  @IsString()
  @MaxLength(200)
  remark?: string;

  @ApiPropertyOptional({ description: "竞赛规程" })
  @IsOptional()
  @IsString()
  competitionRules?: string;

  @ApiPropertyOptional({ description: "参赛声明" })
  @IsOptional()
  @IsString()
  entryStatement?: string;

  @ApiPropertyOptional({ description: "比赛路线" })
  @IsOptional()
  @IsString()
  raceRoute?: string;

  @ApiPropertyOptional({ description: "报名须知" })
  @IsOptional()
  @IsString()
  registrationNotice?: string;

  @ApiPropertyOptional({ description: "领物须知" })
  @IsOptional()
  @IsString()
  pickupNotice?: string;
}

export class UpdateEventDto extends PartialType(CreateEventDto) {}

export class CreateInviteCodeDto {
  @ApiProperty({ description: "赛事ID" })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ description: "邀请码，不填则自动生成" })
  @IsString()
  @IsNotEmpty()
  code!: string;

  @ApiPropertyOptional({ description: "邀请码描述" })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiPropertyOptional({ description: "赛事组别 ID，不填则适用于所有组别" })
  @IsOptional()
  @IsString()
  registrationGroupId?: string;

  @ApiProperty({ description: "折扣百分比，100 为原价，0 为免费", example: 100 })
  @IsInt()
  @Min(0)
  discount!: number;

  @ApiProperty({ description: "可用次数" })
  @IsInt()
  @Min(1)
  maxUses!: number;

  @ApiPropertyOptional({ description: "过期时间" })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class UpdateInviteCodeDto {
  @ApiPropertyOptional({ description: "邀请码描述" })
  @IsOptional()
  @IsString()
  desc?: string;

  @ApiPropertyOptional({ description: "折扣百分比，100 为原价，0 为免费" })
  @IsOptional()
  @IsInt()
  @Min(0)
  discount?: number;

  @ApiPropertyOptional({ description: "可用次数" })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxUses?: number;

  @ApiPropertyOptional({ description: "状态 1-启用 0-禁用" })
  @IsOptional()
  @IsInt()
  @Min(0)
  status?: number;

  @ApiPropertyOptional({ description: "过期时间" })
  @IsOptional()
  @IsDateString()
  expiresAt?: string;
}

export class CreateShuttleBusDto {
  @ApiProperty({ description: "赛事ID" })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ description: "路线" })
  @IsString()
  @IsNotEmpty()
  route!: string;

  @ApiProperty({ description: "出发时间" })
  @IsDateString()
  departureTime!: string;

  @ApiProperty({ description: "容量" })
  @IsInt()
  capacity!: number;
}

export class ImportResultsDto {
  @ApiProperty({ description: "赛事ID" })
  @IsString()
  @IsNotEmpty()
  eventId!: string;

  @ApiProperty({ description: "成绩列表", type: [Object] })
  @IsArray()
  @ArrayMinSize(1)
  results!: { bibNumber: string; finishTime: string; rank?: number }[];
}

export class ConfirmDrawDto {
  @ApiProperty({ description: "中签订单 ID 列表", type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  orderIds!: string[];
}
