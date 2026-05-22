import { Controller, Post, Get, Param, Req } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiConsumes, ApiResponse } from "@nestjs/swagger";
import { UploadService } from "./upload.service";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { apiOkResponse, FileDto } from "../../common/dto/response-dto";
import type { FastifyRequest } from "fastify";

@ApiTags("Upload")
@ApiBearerAuth()
@Controller("files")
export class UploadController {
  constructor(private uploadService: UploadService) {}

  @Post("upload")
  @ApiOperation({ summary: "上传文件" })
  @ApiConsumes("multipart/form-data")
  @ApiResponse({
    ...apiOkResponse(FileDto),
    description: "文件元信息（originalName、filename、path、mimeType、size）",
  })
  async upload(@Req() req: FastifyRequest, @CurrentUser("id") userId: string) {
    const file = await req.file();
    if (!file) {
      throw new Error("No file uploaded");
    }
    const buffer = await file.toBuffer();
    return this.uploadService.upload(
      {
        buffer,
        originalname: file.filename,
        mimetype: file.mimetype,
        size: buffer.length,
      },
      userId,
    );
  }

  @Get(":id")
  @ApiOperation({ summary: "获取文件信息" })
  @ApiResponse({ ...apiOkResponse(FileDto), description: "文件元信息" })
  findOne(@Param("id") id: string) {
    return this.uploadService.findOne(id);
  }
}
