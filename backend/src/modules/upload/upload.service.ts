import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { ConfigService } from "@nestjs/config";
import * as path from "path";
import * as fs from "fs";

@Injectable()
export class UploadService {
  constructor(
    private prisma: PrismaService,
    private configService: ConfigService,
  ) {}

  async upload(file: Express.Multer.File, uploaderId?: string) {
    const uploadDir = this.configService.get<string>("UPLOAD_DIR", "./uploads");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const filename = `${Date.now()}-${file.originalname}`;
    const filePath = path.join(uploadDir, filename);
    fs.writeFileSync(filePath, file.buffer);

    return this.prisma.file.create({
      data: {
        originalName: file.originalname,
        filename,
        path: filePath,
        mimeType: file.mimetype,
        size: file.size,
        uploaderId,
      },
    });
  }

  async findOne(id: string) {
    return this.prisma.file.findUnique({ where: { id } });
  }
}
