import { IsEnum, IsOptional, IsString } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateOrderDto {
  @ApiProperty({ description: "订单类型", enum: ["event", "online"] })
  @IsEnum(["event", "online"])
  type!: string;

  @ApiPropertyOptional({ description: "赛事ID" })
  @IsOptional()
  @IsString()
  eventId?: string;

  @ApiPropertyOptional({ description: "用户ID" })
  @IsOptional()
  @IsString()
  userId?: string;

  @ApiPropertyOptional({ description: "报名卡ID" })
  @IsOptional()
  @IsString()
  registrationCardId?: string;
}
