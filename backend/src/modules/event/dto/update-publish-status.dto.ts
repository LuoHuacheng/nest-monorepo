import { IsIn, IsNotEmpty } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";

export class UpdatePublishStatusDto {
  @ApiProperty({ description: "发布状态", enum: ["draft", "published", "offline"] })
  @IsNotEmpty()
  @IsIn(["draft", "published", "offline"])
  publishStatus!: string;
}
