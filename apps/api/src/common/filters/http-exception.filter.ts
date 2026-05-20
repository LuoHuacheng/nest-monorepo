import type { ExceptionFilter, ArgumentsHost } from "@nestjs/common";
import { Catch, HttpException, HttpStatus } from "@nestjs/common";
import type { Response } from "express";

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    // const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const res = exception.getResponse();
      message = typeof res === "string" ? res : (res as { message?: string }).message || message;
      if (Array.isArray(message)) message = message.join("; ");
    } else if (exception instanceof Error) {
      ({ message } = exception);
    }

    // 401/403 返回 HTTP 200，由前端根据 body.code 处理，避免触发浏览器/拦截器的错误流程
    const httpStatus = status === 401 || status === 403 ? 200 : status;

    response.status(httpStatus).json({
      code: status,
      data: null,
      message,
    });
  }
}
