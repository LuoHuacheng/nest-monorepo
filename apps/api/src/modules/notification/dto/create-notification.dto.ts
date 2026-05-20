import { IsString, IsNotEmpty, IsOptional } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

export class CreateNotificationDto {
  @ApiProperty({ description: "标题" })
  @IsString()
  @IsNotEmpty()
  title!: string;

  @ApiProperty({ description: "内容" })
  @IsString()
  @IsNotEmpty()
  content!: string;

  @ApiPropertyOptional({ description: "类型" })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({ description: "目标类型: all/user", default: "all" })
  @IsOptional()
  @IsString()
  targetType?: string;

  @ApiPropertyOptional({ description: "目标用户 ID" })
  @IsOptional()
  @IsString()
  targetId?: string;
}
