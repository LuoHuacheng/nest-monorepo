import { Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import * as bcrypt from "bcrypt";
import { PrismaService } from "../../prisma/prisma.service";
import { LoginDto } from "./dto/login.dto";

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async login(dto: LoginDto) {
    const user = await this.prisma.sysUser.findUnique({
      where: { username: dto.username },
    });

    if (!user) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    if (user.status !== 1) {
      throw new UnauthorizedException("用户已被禁用");
    }

    const isValid = await bcrypt.compare(dto.password, user.password);
    if (!isValid) {
      throw new UnauthorizedException("用户名或密码错误");
    }

    const tokens = await this.generateTokens(user.id, user.username);

    return {
      ...tokens,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        avatar: user.avatar,
      },
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: this.configService.get<string>("JWT_SECRET"),
      });
      const user = await this.prisma.sysUser.findUnique({
        where: { id: payload.sub },
      });
      if (!user || user.status !== 1) {
        throw new UnauthorizedException("用户不存在或已被禁用");
      }
      return this.generateTokens(user.id, user.username);
    } catch {
      throw new UnauthorizedException("Refresh Token 无效或已过期");
    }
  }

  private async generateTokens(userId: string, username: string) {
    const payload = { sub: userId, username };

    const expiresIn = this.configService.get<string>("JWT_EXPIRES_IN", "2h");
    const refreshExpiresIn = this.configService.get<string>("JWT_REFRESH_EXPIRES_IN", "7d");

    const [accessToken, refreshToken] = await Promise.all([
      this.jwtService.signAsync(payload, { expiresIn } as never),
      this.jwtService.signAsync(payload, { expiresIn: refreshExpiresIn } as never),
    ]);

    return { accessToken, refreshToken };
  }
}
