import { Controller, Post, Body, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../prisma/prisma.service";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(
    private authService: AuthService,
    private prisma: PrismaService,
  ) {}

  @Public()
  @Post("login")
  @ApiOperation({ summary: "管理员登录" })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "刷新 Token" })
  refresh(@Body("refreshToken") refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取当前用户信息" })
  async getProfile(@CurrentUser("id") userId: string) {
    const user = await this.prisma.sysUser.findUnique({
      where: { id: userId },
      select: {
        id: true,
        username: true,
        name: true,
        avatar: true,
        phone: true,
        email: true,
        status: true,
        userRoles: {
          select: {
            role: {
              select: { id: true, name: true, code: true },
            },
          },
        },
      },
    });
    return user;
  }

  @Post("logout")
  @ApiBearerAuth()
  @ApiOperation({ summary: "退出登录" })
  logout() {
    return { message: "退出成功" };
  }
}
