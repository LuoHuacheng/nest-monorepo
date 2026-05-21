import { IsArray, IsNotEmpty, IsString, ArrayMinSize } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

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
