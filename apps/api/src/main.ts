import { NestFactory } from "@nestjs/core";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { AppModule } from "./app.module";
import { TransformInterceptor } from "./common/interceptors/transform.interceptor";
import { HttpExceptionFilter } from "./common/filters/http-exception.filter";
import { ApiResponseDto, PaginatedApiResponseDto } from "./common/dto/api-response.dto";
import { EntityDtos } from "./common/dto/response-dto";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.setGlobalPrefix("api");

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  app.useGlobalInterceptors(new TransformInterceptor());
  app.useGlobalFilters(new HttpExceptionFilter());

  app.enableCors();

  const config = new DocumentBuilder()
    .setTitle("体育赛事管理系统")
    .setDescription("体育赛事管理后台 API 文档")
    .setVersion("1.0")
    .addBearerAuth()
    .addTag("Auth", "认证")
    .addTag("Users", "用户管理")
    .addTag("Roles", "角色管理")
    .addTag("Permissions", "权限管理")
    .addTag("Menus", "菜单管理")
    .addTag("Dicts", "字典管理")
    .addTag("Logs", "操作日志")
    .addTag("Upload", "文件上传")
    .addTag("Events", "赛事管理")
    .addTag("InviteCodes", "邀请码管理")
    .addTag("ShuttleBuses", "摆渡车管理")
    .addTag("Results", "成绩管理")
    .addTag("RegistrationCards", "报名卡管理")
    .addTag("Orders", "订单管理")
    .addTag("Organizers", "组委会")
    .addTag("AthleticCenters", "田管中心")
    .addTag("Pacers", "配速员管理")
    .addTag("Notifications", "消息通知")
    .addTag("ClientConfigs", "客户端配置")
    .build();
  const document = SwaggerModule.createDocument(app, config, {
    extraModels: [ApiResponseDto, PaginatedApiResponseDto, ...EntityDtos],
  });
  SwaggerModule.setup("docs", app, document);

  await app.listen(process.env.PORT ?? 4001);
}
bootstrap();
