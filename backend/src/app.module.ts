import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { APP_GUARD, APP_INTERCEPTOR } from "@nestjs/core";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./modules/auth/auth.module";
import { UserModule } from "./modules/user/user.module";
import { RoleModule } from "./modules/role/role.module";
import { PermissionModule } from "./modules/permission/permission.module";
import { MenuModule } from "./modules/menu/menu.module";
import { DictModule } from "./modules/dict/dict.module";
import { LogModule } from "./modules/log/log.module";
import { UploadModule } from "./modules/upload/upload.module";
import { EventModule } from "./modules/event/event.module";
import { RegistrationCardModule } from "./modules/registration-card/registration-card.module";
import { OrderModule } from "./modules/order/order.module";
import { OrganizerModule } from "./modules/organizer/organizer.module";
import { AthleticCenterModule } from "./modules/athletic-center/athletic-center.module";
import { PacerModule } from "./modules/pacer/pacer.module";
import { NotificationModule } from "./modules/notification/notification.module";
import { ClientConfigModule } from "./modules/client-config/client-config.module";
import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { RbacGuard } from "./common/guards/rbac.guard";
import { LoggingInterceptor } from "./common/interceptors/logging.interceptor";

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    AuthModule,
    UserModule,
    RoleModule,
    PermissionModule,
    MenuModule,
    DictModule,
    LogModule,
    UploadModule,
    EventModule,
    RegistrationCardModule,
    OrderModule,
    OrganizerModule,
    AthleticCenterModule,
    PacerModule,
    NotificationModule,
    ClientConfigModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: JwtAuthGuard },
    { provide: APP_GUARD, useClass: RbacGuard },
    { provide: APP_INTERCEPTOR, useClass: LoggingInterceptor },
  ],
})
export class AppModule {}
