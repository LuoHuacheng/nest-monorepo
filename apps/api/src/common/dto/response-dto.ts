import { ApiProperty, ApiPropertyOptional, getSchemaPath } from "@nestjs/swagger";

// ==================== System ====================

export class SysUserDto {
  @ApiProperty({ description: "用户 ID" }) id!: string;
  @ApiProperty({ description: "登录账号" }) username!: string;
  @ApiProperty({ description: "姓名" }) name!: string;
  @ApiPropertyOptional({ description: "头像 URL" }) avatar?: string;
  @ApiPropertyOptional({ description: "手机号" }) phone?: string;
  @ApiPropertyOptional({ description: "邮箱" }) email?: string;
  @ApiProperty({ description: "状态 1-启用 0-禁用" }) status!: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
  @ApiProperty({ description: "更新时间" }) updatedAt!: string;
}

export class SysRoleDto {
  @ApiProperty({ description: "角色 ID" }) id!: string;
  @ApiProperty({ description: "角色名称" }) name!: string;
  @ApiProperty({ description: "角色编码" }) code!: string;
  @ApiPropertyOptional({ description: "描述" }) description?: string;
  @ApiProperty({ description: "状态 1-启用 0-禁用" }) status!: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

export class SysPermissionDto {
  @ApiProperty({ description: "权限 ID" }) id!: string;
  @ApiProperty({ description: "权限名称" }) name!: string;
  @ApiProperty({ description: "权限编码" }) code!: string;
  @ApiProperty({ description: "类型 button-按钮 api-接口" }) type!: string;
  @ApiPropertyOptional({ description: "父级 ID" }) parentId?: string;
}

export class SysMenuDto {
  @ApiProperty({ description: "菜单 ID" }) id!: string;
  @ApiProperty({ description: "菜单名称" }) name!: string;
  @ApiPropertyOptional({ description: "路由路径" }) path?: string;
  @ApiPropertyOptional({ description: "图标" }) icon?: string;
  @ApiPropertyOptional({ description: "父级 ID" }) parentId?: string;
  @ApiProperty({ description: "排序" }) sort!: number;
  @ApiProperty({ description: "类型 dir-目录 menu-菜单 button-按钮" }) type!: string;
  @ApiPropertyOptional({ description: "权限编码" }) permissionCode?: string;
  @ApiProperty({ description: "状态 1-启用 0-禁用" }) status!: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

export class SysDictDto {
  @ApiProperty({ description: "字典 ID" }) id!: string;
  @ApiProperty({ description: "字典名称" }) name!: string;
  @ApiProperty({ description: "字典编码" }) code!: string;
  @ApiPropertyOptional({ description: "描述" }) description?: string;
  @ApiProperty({ description: "状态 1-启用 0-禁用" }) status!: number;
}

export class SysDictItemDto {
  @ApiProperty({ description: "字典项 ID" }) id!: string;
  @ApiProperty({ description: "字典 ID" }) dictId!: string;
  @ApiProperty({ description: "标签" }) label!: string;
  @ApiProperty({ description: "值" }) value!: string;
  @ApiProperty({ description: "排序" }) sort!: number;
  @ApiProperty({ description: "状态 1-启用 0-禁用" }) status!: number;
}

export class SysLogDto {
  @ApiProperty({ description: "日志 ID" }) id!: string;
  @ApiPropertyOptional({ description: "用户 ID" }) userId?: string;
  @ApiPropertyOptional({ description: "模块" }) module?: string;
  @ApiPropertyOptional({ description: "操作" }) action?: string;
  @ApiPropertyOptional({ description: "请求方法" }) method?: string;
  @ApiPropertyOptional({ description: "请求路径" }) path?: string;
  @ApiPropertyOptional({ description: "IP 地址" }) ip?: string;
  @ApiPropertyOptional({ description: "请求体" }) requestBody?: string;
  @ApiPropertyOptional({ description: "响应状态码" }) responseStatus?: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

// ==================== Business ====================

export class EventDto {
  @ApiProperty({ description: "赛事 ID" }) id!: string;
  @ApiProperty({ description: "赛事名称" }) name!: string;
  @ApiPropertyOptional({ description: "赛事类别" }) category?: string;
  @ApiProperty({ description: "发布状态 draft/published/offline" }) publishStatus!: string;
  @ApiProperty({ description: "是否完成分组抽签" }) groupDrawCompleted!: boolean;
  @ApiProperty({ description: "管理员已确认" }) adminConfirmed!: boolean;
  @ApiProperty({ description: "开始日期" }) startDate!: string;
  @ApiProperty({ description: "结束日期" }) endDate!: string;
  @ApiPropertyOptional({ description: "报名开始日期" }) registrationStartDate?: string;
  @ApiPropertyOptional({ description: "报名截止日期" }) registrationEndDate?: string;
  @ApiPropertyOptional({ description: "省份" }) province?: string;
  @ApiPropertyOptional({ description: "城市" }) city?: string;
  @ApiPropertyOptional({ description: "详细地址" }) address?: string;
  @ApiProperty({ description: "地点" }) location!: string;
  @ApiProperty({ description: "标签" }) tags!: unknown;
  @ApiPropertyOptional({ description: "领物时间" }) packetPickupTime?: string;
  @ApiPropertyOptional({ description: "领物地点" }) packetPickupLocation?: string;
  @ApiProperty({ description: "封面图片" }) coverImages!: unknown;
  @ApiProperty({ description: "是否热门" }) isHot!: boolean;
  @ApiProperty({ description: "扩展属性" }) attributes!: unknown;
  @ApiPropertyOptional({ description: "赛事简介" }) description?: string;
  @ApiPropertyOptional({ description: "备注" }) remark?: string;
  @ApiPropertyOptional({ description: "竞赛规程" }) competitionRules?: string;
  @ApiPropertyOptional({ description: "报名须知" }) entryStatement?: string;
  @ApiPropertyOptional({ description: "比赛路线" }) raceRoute?: string;
  @ApiPropertyOptional({ description: "报名通知" }) registrationNotice?: string;
  @ApiPropertyOptional({ description: "领物通知" }) pickupNotice?: string;
  @ApiProperty({ description: "最大参赛人数" }) maxParticipants!: number;
  @ApiProperty({ description: "当前报名人数" }) currentParticipants!: number;
  @ApiPropertyOptional({ description: "组委会 ID" }) organizerId?: string;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
  @ApiProperty({ description: "更新时间" }) updatedAt!: string;
}

export class EventRegistrationCardDto {
  @ApiProperty({ description: "报名卡 ID" }) id!: string;
  @ApiProperty({ description: "赛事 ID" }) eventId!: string;
  @ApiProperty({ description: "名称" }) name!: string;
  @ApiProperty({ description: "组别类型" }) groupType!: string;
  @ApiProperty({ description: "规格名称" }) specName!: string;
  @ApiPropertyOptional({ description: "规格描述" }) specDescription?: string;
  @ApiProperty({ description: "性别限制" }) genderLimit!: string;
  @ApiPropertyOptional({ description: "最小年龄" }) minAge?: number;
  @ApiPropertyOptional({ description: "最大年龄" }) maxAge?: number;
  @ApiProperty({ description: "价格" }) price!: number;
  @ApiProperty({ description: "名额" }) quota!: number;
  @ApiProperty({ description: "已售数量" }) soldCount!: number;
  @ApiProperty({ description: "状态" }) status!: number;
  @ApiProperty({ description: "排序" }) sort!: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

export class RegistrationCardDto {
  @ApiProperty({ description: "报名卡 ID" }) id!: string;
  @ApiProperty({ description: "姓名" }) name!: string;
  @ApiProperty({ description: "关系" }) relationship!: string;
  @ApiProperty({ description: "证件号码" }) idNumber!: string;
  @ApiProperty({ description: "性别" }) gender!: string;
  @ApiProperty({ description: "出生日期" }) birthDate!: string;
  @ApiPropertyOptional({ description: "血型" }) bloodType?: string;
  @ApiPropertyOptional({ description: "衣服尺码" }) clothingSize?: string;
  @ApiProperty({ description: "手机号" }) phone!: string;
  @ApiPropertyOptional({ description: "省份" }) province?: string;
  @ApiPropertyOptional({ description: "城市" }) city?: string;
  @ApiPropertyOptional({ description: "户籍地址" }) permanentAddress?: string;
  @ApiPropertyOptional({ description: "详细地址" }) detailedAddress?: string;
  @ApiProperty({ description: "紧急联系人姓名" }) emergencyContactName!: string;
  @ApiProperty({ description: "紧急联系人电话" }) emergencyContactPhone!: string;
  @ApiProperty({ description: "状态" }) status!: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
  @ApiProperty({ description: "更新时间" }) updatedAt!: string;
}

export class EventInviteCodeDto {
  @ApiProperty({ description: "邀请码 ID" }) id!: string;
  @ApiProperty({ description: "赛事 ID" }) eventId!: string;
  @ApiProperty({ description: "邀请码" }) code!: string;
  @ApiProperty({ description: "最大使用次数" }) maxUses!: number;
  @ApiProperty({ description: "已使用次数" }) usedCount!: number;
  @ApiProperty({ description: "状态" }) status!: number;
  @ApiPropertyOptional({ description: "过期时间" }) expiresAt?: string;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

export class EventShuttleBusDto {
  @ApiProperty({ description: "班车 ID" }) id!: string;
  @ApiProperty({ description: "赛事 ID" }) eventId!: string;
  @ApiProperty({ description: "路线" }) route!: string;
  @ApiProperty({ description: "发车时间" }) departureTime!: string;
  @ApiProperty({ description: "容量" }) capacity!: number;
  @ApiProperty({ description: "状态" }) status!: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

export class EventResultDto {
  @ApiProperty({ description: "成绩 ID" }) id!: string;
  @ApiProperty({ description: "赛事 ID" }) eventId!: string;
  @ApiPropertyOptional({ description: "用户 ID" }) userId?: string;
  @ApiProperty({ description: "号码布" }) bibNumber!: string;
  @ApiProperty({ description: "完赛时间" }) finishTime!: string;
  @ApiPropertyOptional({ description: "排名" }) rank?: number;
  @ApiProperty({ description: "状态" }) status!: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

export class OrderDto {
  @ApiProperty({ description: "订单 ID" }) id!: string;
  @ApiProperty({ description: "订单号" }) orderNo!: string;
  @ApiProperty({ description: "订单类型 event-赛事 online-线上" }) type!: string;
  @ApiPropertyOptional({ description: "赛事 ID" }) eventId?: string;
  @ApiPropertyOptional({ description: "用户 ID" }) userId?: string;
  @ApiPropertyOptional({ description: "报名卡 ID" }) registrationCardId?: string;
  @ApiProperty({ description: "金额" }) amount!: number;
  @ApiProperty({ description: "状态 pending/paid/refunded/cancelled" }) status!: string;
  @ApiPropertyOptional({ description: "支付时间" }) paidAt?: string;
  @ApiPropertyOptional({ description: "退款时间" }) refundedAt?: string;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
  @ApiProperty({ description: "更新时间" }) updatedAt!: string;
}

export class OrganizerDto {
  @ApiProperty({ description: "组委会 ID" }) id!: string;
  @ApiPropertyOptional({ description: "登录账号" }) loginAccount?: string;
  @ApiProperty({ description: "名称" }) name!: string;
  @ApiPropertyOptional({ description: "联系人" }) contact?: string;
  @ApiPropertyOptional({ description: "手机号" }) phone?: string;
  @ApiPropertyOptional({ description: "备用联系人" }) backupContact?: string;
  @ApiPropertyOptional({ description: "备用手机号" }) backupPhone?: string;
  @ApiPropertyOptional({ description: "证书编号" }) certificateNo?: string;
  @ApiPropertyOptional({ description: "赛事日期" }) eventDate?: string;
  @ApiPropertyOptional({ description: "省份" }) province?: string;
  @ApiPropertyOptional({ description: "城市" }) city?: string;
  @ApiPropertyOptional({ description: "地址" }) address?: string;
  @ApiPropertyOptional({ description: "赛事规模" }) eventScale?: string;
  @ApiProperty({ description: "赛事项目" }) eventItems!: unknown;
  @ApiPropertyOptional({ description: "操作员" }) operator?: string;
  @ApiPropertyOptional({ description: "邮箱" }) email?: string;
  @ApiPropertyOptional({ description: "备注" }) remark?: string;
  @ApiProperty({ description: "状态" }) status!: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
  @ApiProperty({ description: "更新时间" }) updatedAt!: string;
}

export class AthleticCenterDto {
  @ApiProperty({ description: "田管中心 ID" }) id!: string;
  @ApiProperty({ description: "名称" }) name!: string;
  @ApiPropertyOptional({ description: "联系人" }) contact?: string;
  @ApiPropertyOptional({ description: "手机号" }) phone?: string;
  @ApiPropertyOptional({ description: "地址" }) address?: string;
  @ApiProperty({ description: "状态" }) status!: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
  @ApiProperty({ description: "更新时间" }) updatedAt!: string;
}

export class PacerDto {
  @ApiProperty({ description: "配速员 ID" }) id!: string;
  @ApiPropertyOptional({ description: "配速员编号" }) pacerNo?: string;
  @ApiProperty({ description: "姓名" }) name!: string;
  @ApiPropertyOptional({ description: "手机号" }) phone?: string;
  @ApiPropertyOptional({ description: "身份证号" }) idCard?: string;
  @ApiPropertyOptional({ description: "头像 URL" }) avatar?: string;
  @ApiProperty({ description: "配速段" }) paceSegments!: unknown;
  @ApiPropertyOptional({ description: "目标时间" }) targetTime?: string;
  @ApiPropertyOptional({ description: "衣服尺码" }) clothingSize?: string;
  @ApiPropertyOptional({ description: "有效期起" }) validFrom?: string;
  @ApiPropertyOptional({ description: "有效期止" }) validTo?: string;
  @ApiPropertyOptional({ description: "体检报告 URL" }) healthReportUrl?: string;
  @ApiPropertyOptional({ description: "心电图 URL" }) ecgImageUrl?: string;
  @ApiProperty({ description: "马拉松证书" }) marathonCertificates!: unknown;
  @ApiPropertyOptional({ description: "配速计划图片 URL" }) pacePlanImageUrl?: string;
  @ApiProperty({ description: "状态 pending/approved/suspended/revoked" }) status!: string;
  @ApiPropertyOptional({ description: "审核时间" }) approvedAt?: string;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
  @ApiProperty({ description: "更新时间" }) updatedAt!: string;
}

export class PacerTestDto {
  @ApiProperty({ description: "实测 ID" }) id!: string;
  @ApiProperty({ description: "配速员 ID" }) pacerId!: string;
  @ApiProperty({ description: "测试日期" }) testDate!: string;
  @ApiPropertyOptional({ description: "地点" }) location?: string;
  @ApiProperty({ description: "完赛时间" }) finishTime!: string;
  @ApiPropertyOptional({ description: "视频 URL" }) videoUrl?: string;
  @ApiProperty({ description: "状态" }) status!: number;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

export class PacerEventDto {
  @ApiProperty({ description: "记录 ID" }) id!: string;
  @ApiProperty({ description: "配速员 ID" }) pacerId!: string;
  @ApiProperty({ description: "赛事 ID" }) eventId!: string;
  @ApiPropertyOptional({ description: "目标时间" }) targetTime?: string;
  @ApiProperty({ description: "状态 assigned/withdrawn/completed" }) status!: string;
  @ApiProperty({ description: "分配时间" }) assignedAt!: string;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

export class NotificationDto {
  @ApiProperty({ description: "通知 ID" }) id!: string;
  @ApiProperty({ description: "标题" }) title!: string;
  @ApiProperty({ description: "内容" }) content!: string;
  @ApiPropertyOptional({ description: "类型" }) type?: string;
  @ApiProperty({ description: "目标类型 all-全体 user-指定用户" }) targetType!: string;
  @ApiPropertyOptional({ description: "目标用户 ID" }) targetId?: string;
  @ApiProperty({ description: "状态 sent/pending" }) status!: string;
  @ApiPropertyOptional({ description: "发送时间" }) sentAt?: string;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

export class ClientConfigDto {
  @ApiProperty({ description: "配置 ID" }) id!: string;
  @ApiProperty({ description: "配置键" }) key!: string;
  @ApiProperty({ description: "配置值" }) value!: string;
  @ApiPropertyOptional({ description: "描述" }) description?: string;
  @ApiProperty({ description: "更新时间" }) updatedAt!: string;
}

export class FileDto {
  @ApiProperty({ description: "文件 ID" }) id!: string;
  @ApiProperty({ description: "原始文件名" }) originalName!: string;
  @ApiProperty({ description: "存储文件名" }) filename!: string;
  @ApiProperty({ description: "文件路径" }) path!: string;
  @ApiProperty({ description: "MIME 类型" }) mimeType!: string;
  @ApiProperty({ description: "文件大小" }) size!: number;
  @ApiPropertyOptional({ description: "上传者 ID" }) uploaderId?: string;
  @ApiProperty({ description: "创建时间" }) createdAt!: string;
}

/** Swagger 注册用：所有实体 DTO 列表 */
export const EntityDtos = [
  SysUserDto,
  SysRoleDto,
  SysPermissionDto,
  SysMenuDto,
  SysDictDto,
  SysDictItemDto,
  SysLogDto,
  EventDto,
  EventRegistrationCardDto,
  RegistrationCardDto,
  EventInviteCodeDto,
  EventShuttleBusDto,
  EventResultDto,
  OrderDto,
  OrganizerDto,
  AthleticCenterDto,
  PacerDto,
  PacerTestDto,
  PacerEventDto,
  NotificationDto,
  ClientConfigDto,
  FileDto,
];

// ==================== Response Helpers ====================

/**
 * 为单条数据接口生成 @ApiResponse 装饰器元数据。
 * 用法：@ApiResponse(apiOkResponse(UserDto))
 */
export function apiOkResponse<T>(entity: new () => T) {
  return {
    status: 200,
    schema: {
      allOf: [
        {
          properties: {
            code: { type: "number", example: 200 },
            message: { type: "string", example: "success" },
          },
        },
        { properties: { data: { $ref: getSchemaPath(entity) } } },
      ],
    },
  };
}

/**
 * 为分页列表接口生成 @ApiResponse 装饰器元数据。
 * 用法：@ApiResponse(paginatedApiOkResponse(UserDto))
 */
export function paginatedApiOkResponse<T>(entity: new () => T) {
  return {
    status: 200,
    schema: {
      allOf: [
        {
          properties: {
            code: { type: "number", example: 200 },
            message: { type: "string", example: "success" },
          },
        },
        {
          properties: {
            data: {
              type: "object",
              properties: {
                items: { type: "array", items: { $ref: getSchemaPath(entity) } },
                total: { type: "number", example: 100 },
                page: { type: "number", example: 1 },
                pageSize: { type: "number", example: 10 },
              },
            },
          },
        },
      ],
    },
  };
}
