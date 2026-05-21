import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

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
