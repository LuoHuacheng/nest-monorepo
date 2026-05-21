import { IsDateString, IsInt, IsNotEmpty, IsOptional, IsString, Min } from "class-validator";
import { ApiProperty, ApiPropertyOptional } from "@nestjs/swagger";

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

export class UpdateShuttleBusDto {
  @ApiPropertyOptional({ description: "路线" })
  @IsOptional()
  @IsString()
  route?: string;

  @ApiPropertyOptional({ description: "出发时间" })
  @IsOptional()
  @IsDateString()
  departureTime?: string;

  @ApiPropertyOptional({ description: "容量" })
  @IsOptional()
  @IsInt()
  @Min(1)
  capacity?: number;
}
