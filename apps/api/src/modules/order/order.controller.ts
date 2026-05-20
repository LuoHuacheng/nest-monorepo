import { Controller, Get, Post, Param, Query, Body } from "@nestjs/common";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { OrderService } from "./order.service";
import { QueryOrderDto } from "./dto/query-order.dto";
import { CreateOrderDto } from "./dto/create-order.dto";
import { Permissions } from "../../common/decorators/permissions.decorator";

@ApiTags("Orders")
@ApiBearerAuth()
@Controller("orders")
export class OrderController {
  constructor(private orderService: OrderService) {}

  @Post()
  @Permissions("order:create")
  @ApiOperation({ summary: "创建订单" })
  create(@Body() dto: CreateOrderDto) {
    return this.orderService.create(dto);
  }

  @Get()
  @Permissions("order:list")
  @ApiOperation({ summary: "订单列表" })
  findAll(@Query() query: QueryOrderDto) {
    return this.orderService.findAll(query);
  }

  @Get(":id")
  @Permissions("order:list")
  @ApiOperation({ summary: "订单详情" })
  findOne(@Param("id") id: string) {
    return this.orderService.findOne(id);
  }

  @Post(":id/refund")
  @Permissions("order:refund")
  @ApiOperation({ summary: "退款" })
  refund(@Param("id") id: string) {
    return this.orderService.refund(id);
  }
}
