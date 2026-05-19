import { Controller, Post, Get, Param, UploadedFile, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes } from "@nestjs/swagger";
import { UploadService } from "./upload.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";

@ApiTags("Upload")
@ApiBearerAuth()
@Controller("files")
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post("upload")
  @ApiOperation({ summary: "上传文件" })
  @ApiConsumes("multipart/form-data")
  @UseInterceptors(FileInterceptor("file"))
  upload(@UploadedFile() file: Express.Multer.File, @CurrentUser("id") userId: string) {
    return this.uploadService.upload(file, userId);
  }

  @Get(":id")
  @ApiOperation({ summary: "获取文件信息" })
  findOne(@Param("id") id: string) {
    return this.uploadService.findOne(id);
  }
}
