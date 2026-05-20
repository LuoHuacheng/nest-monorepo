import { ApiProperty } from "@nestjs/swagger";

export class ApiResponseDto<T = unknown> {
  @ApiProperty({ example: 200, description: "状态码" })
  code!: number;

  @ApiProperty({ description: "响应数据" })
  data!: T;

  @ApiProperty({ example: "success", description: "提示信息" })
  message!: string;
}

export class PaginatedApiResponseDto<T = unknown> {
  @ApiProperty({ example: 200, description: "状态码" })
  code!: number;

  @ApiProperty({ description: "分页数据" })
  data!: {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
  };

  @ApiProperty({ example: "success", description: "提示信息" })
  message!: string;
}
