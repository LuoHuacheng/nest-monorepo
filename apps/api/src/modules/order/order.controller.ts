import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth, ApiResponse } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { QueryOrderDto } from "./dto/query-order.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";
import { apiOkResponse, paginatedApiOkResponse, OrderDto } from "../../common/dto/response-dto";

@ApiTags("Orders")
@ApiBearerAuth()
@Controller("orders")
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @Permissions("order:create")
  @ApiOperation({ summary: "创建订单" })
  @ApiResponse({ ...apiOkResponse(OrderDto), description: "创建的订单" })
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Get()
  @Permissions("order:list")
  @ApiOperation({ summary: "订单列表" })
  @ApiResponse({
    ...paginatedApiOkResponse(OrderDto),
    description: "分页订单列表（含赛事和报名卡信息）",
  })
  findAll(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  @Get(":id")
  @Permissions("order:list")
  @ApiOperation({ summary: "订单详情" })
  @ApiResponse({ ...apiOkResponse(OrderDto), description: "订单详情（含赛事和报名卡）" })
  findOne(@Param("id") id: string) {
    return this.orderService.findOne(id);
  }

  @Post(":id/refund")
  @Permissions("order:refund")
  @ApiOperation({ summary: "退款" })
  @ApiResponse({ ...apiOkResponse(OrderDto), description: "退款后的订单" })
  refund(@Param("id") id: string) {
    return this.orderService.refund(id);
  }
}
