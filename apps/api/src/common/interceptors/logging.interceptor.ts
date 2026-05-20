import type { NestInterceptor, ExecutionContext, CallHandler } from "@nestjs/common";
import { Injectable } from "@nestjs/common";
import type { Observable } from "rxjs";
import { tap } from "rxjs/operators";
import { LogService } from "../../modules/log/log.service";
import { Reflector } from "@nestjs/core";
import { IS_PUBLIC_KEY } from "../decorators/public.decorator";

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  constructor(
    private readonly logService: LogService,
    private readonly reflector: Reflector,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    // 跳过公开接口
    if (isPublic) {
      return next.handle();
    }

    const request = context.switchToHttp().getRequest();
    const { method, path, body, ip, user } = request;

    // 跳过 GET 请求和 Swagger 文档
    if (method === "GET" || path.includes("/api/docs")) {
      return next.handle();
    }

    // 从路径中提取模块名 (e.g., /api/users -> user)
    const module = path.split("/")[2] || "";

    return next.handle().pipe(
      tap({
        next: () => {
          this.logService.create({
            userId: user?.id,
            module,
            action: this.getAction(method),
            method,
            path,
            ip: ip || request.connection?.remoteAddress,
            requestBody: body && Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
            responseStatus: 200,
          });
        },
        error: (err) => {
          this.logService.create({
            userId: user?.id,
            module,
            action: this.getAction(method),
            method,
            path,
            ip: ip || request.connection?.remoteAddress,
            requestBody: body && Object.keys(body).length > 0 ? JSON.stringify(body) : undefined,
            responseStatus: err.status || 500,
          });
        },
      }),
    );
  }

  private getAction(method: string): string {
    const map: Record<string, string> = {
      POST: "创建",
      PATCH: "更新",
      PUT: "更新",
      DELETE: "删除",
    };
    return map[method] || method;
  }
}
