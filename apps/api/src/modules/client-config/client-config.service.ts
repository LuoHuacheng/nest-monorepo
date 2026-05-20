import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

@Injectable()
export class ClientConfigService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.clientConfig.findMany({
      orderBy: { key: "asc" },
    });
  }

  async batchUpdate(configs: { key: string; value: string; description?: string }[]) {
    const results: Record<string, unknown>[] = [];
    for (const config of configs) {
      const result = await this.prisma.clientConfig.upsert({
        where: { key: config.key },
        update: { value: config.value, description: config.description },
        create: { key: config.key, value: config.value, description: config.description },
      });
      results.push(result);
    }
    return results;
  }
}
