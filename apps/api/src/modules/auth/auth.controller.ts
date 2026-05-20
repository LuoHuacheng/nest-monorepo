import { Controller, Post, Body, Get } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiOkResponse, ApiResponse } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "../../common/decorators/public.decorator";
import { CurrentUser } from "../../common/decorators/current-user.decorator";
import { PrismaService } from "../../prisma/prisma.service";
import { ApiResponseDto } from "../../common/dto/api-response.dto";
import { SysUserDto, apiOkResponse } from "../../common/dto/response-dto";

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
  @ApiOkResponse({
    type: ApiResponseDto,
    description: "登录成功，返回 accessToken、refreshToken 和用户信息",
  })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Public()
  @Post("refresh")
  @ApiOperation({ summary: "刷新 Token" })
  @ApiOkResponse({ type: ApiResponseDto, description: "返回新的 accessToken 和 refreshToken" })
  refresh(@Body("refreshToken") refreshToken: string) {
    return this.authService.refresh(refreshToken);
  }

  @Get("profile")
  @ApiBearerAuth()
  @ApiOperation({ summary: "获取当前用户信息" })
  @ApiResponse({ ...apiOkResponse(SysUserDto), description: "当前登录用户信息（含角色）" })
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
  @ApiOkResponse({ type: ApiResponseDto, description: "退出成功" })
  logout() {
    return { message: "退出成功" };
  }
}
