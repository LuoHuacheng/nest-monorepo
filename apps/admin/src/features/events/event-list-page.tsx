import { useNavigate } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
import {
  useDeleteEvent,
  useDrawEvent,
  useEventDrawResults,
  useEventList,
  useEventOrders,
  useEventParticipants,
  useUpdatePublishStatus,
} from "@/api/modules/events";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { DataTable } from "@/components/common/data-table";
import { FilterBar, FilterItem } from "@/components/common/filter-bar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type EventStatus =
  | "registration_not_started"
  | "registration_open"
  | "registration_ended"
  | "event_not_started"
  | "event_in_progress"
  | "event_ended";
type PublishStatus = "draft" | "published" | "offline";
type EventAttribute = "online" | "shuttle_bus" | "pacer_recruitment";
type PublishAction = "publish" | "offline" | "republish";

const eventStatusMap: Record<
  EventStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  registration_not_started: { label: "报名未开始", variant: "secondary" },
  registration_open: { label: "报名中", variant: "default" },
  registration_ended: { label: "报名结束", variant: "outline" },
  event_not_started: { label: "比赛未开始", variant: "secondary" },
  event_in_progress: { label: "比赛中", variant: "default" },
  event_ended: { label: "已结束", variant: "outline" },
};

const publishStatusMap: Record<
  PublishStatus,
  { label: string; variant: "default" | "secondary" | "outline" }
> = {
  draft: { label: "草稿", variant: "secondary" },
  published: { label: "已发布", variant: "default" },
  offline: { label: "已下架", variant: "outline" },
};

const attributeMap: Record<EventAttribute, string> = {
  online: "线上赛",
  shuttle_bus: "摆渡车",
  pacer_recruitment: "招募配速员",
};

const statusActionDialog: Record<
  PublishAction,
  { title: string; description: string; confirmText: string }
> = {
  publish: {
    title: "确认发布",
    description: "确定要发布该赛事吗？发布后选手即可看到并报名。",
    confirmText: "确认发布",
  },
  offline: {
    title: "确认下架",
    description: "确定要下架该赛事吗？下架后选手将无法看到该赛事。",
    confirmText: "确认下架",
  },
  republish: {
    title: "确认重新上架",
    description: "确定要重新上架该赛事吗？上架后选手将重新看到该赛事。",
    confirmText: "确认上架",
  },
};

const ALL = "__ALL__";

function getNextPublishStatus(action: PublishAction): PublishStatus {
  if (action === "offline") return "offline";
  return "published";
}

export function EventsPage() {
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [statusAction, setStatusAction] = useState<{
    id: string;
    action: PublishAction;
  } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [participantsEventId, setParticipantsEventId] = useState<string | null>(null);
  const [ordersEventId, setOrdersEventId] = useState<string | null>(null);
  const [drawEventId, setDrawEventId] = useState<string | null>(null);
  const [participantsPage, setParticipantsPage] = useState(1);
  const [ordersPage, setOrdersPage] = useState(1);

  const { data: participantsData } = useEventParticipants(participantsEventId ?? "", {
    page: participantsPage,
    pageSize: 10,
  });
  const { data: ordersData } = useEventOrders(ordersEventId ?? "", {
    page: ordersPage,
    pageSize: 10,
  });
  const { data: drawResults } = useEventDrawResults(drawEventId ?? "");
  const drawMutation = useDrawEvent();

  const [filterEventStatus, setFilterEventStatus] = useState(ALL);
  const [filterPublishStatus, setFilterPublishStatus] = useState(ALL);
  const [filterCategory, setFilterCategory] = useState(ALL);
  const [filterAttribute, setFilterAttribute] = useState(ALL);
  const [filterIsHot, setFilterIsHot] = useState(ALL);
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  const queryParams: Record<string, unknown> = {
    page,
    pageSize,
    keyword: search || undefined,
    eventStatus: filterEventStatus !== ALL ? filterEventStatus : undefined,
    publishStatus: filterPublishStatus !== ALL ? filterPublishStatus : undefined,
    category: filterCategory !== ALL ? filterCategory : undefined,
    attribute: filterAttribute !== ALL ? filterAttribute : undefined,
    isHot: filterIsHot !== ALL ? filterIsHot === "true" : undefined,
    dateStart: filterDateStart || undefined,
    dateEnd: filterDateEnd || undefined,
  };

  const { data, isLoading } = useEventList(queryParams);
  const events = (data?.items ?? []) as Record<string, unknown>[];
  const total = data?.total ?? 0;

  const deleteMutation = useDeleteEvent();
  const updateStatusMutation = useUpdatePublishStatus();
  const dialogContent = statusAction ? statusActionDialog[statusAction.action] : null;

  function resetFilters() {
    setFilterEventStatus(ALL);
    setFilterPublishStatus(ALL);
    setFilterCategory(ALL);
    setFilterAttribute(ALL);
    setFilterIsHot(ALL);
    setFilterDateStart("");
    setFilterDateEnd("");
    setSearch("");
    setPage(1);
  }

  const columns = [
    { key: "name", title: "赛事名称", fixed: "left" as const, width: 180 },
    { key: "category", title: "赛事分类" },
    {
      key: "eventStatus",
      title: "赛事状态",
      render: (val: unknown) => {
        const s = eventStatusMap[val as EventStatus];
        return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val ?? "-");
      },
    },
    {
      key: "publishStatus",
      title: "发布状态",
      render: (val: unknown) => {
        const s = publishStatusMap[val as PublishStatus];
        return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val);
      },
    },
    { key: "startDate", title: "比赛时间" },
    { key: "endDate", title: "结束时间" },
    { key: "registrationStartDate", title: "报名开始" },
    { key: "registrationEndDate", title: "报名截止" },
    { key: "province", title: "省份" },
    { key: "city", title: "城市" },
    { key: "address", title: "详细地址" },
    {
      key: "tags",
      title: "标签",
      render: (val: unknown) => ((val as string[]).length ? (val as string[]).join(" / ") : "-"),
    },
    {
      key: "attributes",
      title: "赛事属性",
      render: (val: unknown) => {
        const attributes = val as EventAttribute[];
        return attributes.length
          ? attributes.map((item) => attributeMap[item] ?? item).join(" / ")
          : "-";
      },
    },
    {
      key: "isHot",
      title: "热门",
      render: (val: unknown) => (val ? <Badge variant="destructive">热门</Badge> : "-"),
    },
    { key: "packetPickupTime", title: "领物时间" },
    { key: "packetPickupLocation", title: "领物地点" },
    { key: "maxParticipants", title: "人数限制" },
    { key: "currentParticipants", title: "当前人数" },
    { key: "organizerId", title: "组委会ID" },
    { key: "createdAt", title: "创建时间" },
    {
      key: "actions",
      title: "操作",
      fixed: "right" as const,
      width: 80,
      render: (_: unknown, record: Record<string, unknown>) => {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() =>
                  navigate({ to: "/events/edit/$id", params: { id: record.id as string } })
                }
              >
                编辑
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {record.publishStatus === "draft" && (
                <DropdownMenuItem
                  onClick={() => setStatusAction({ id: record.id as string, action: "publish" })}
                >
                  发布
                </DropdownMenuItem>
              )}
              {record.publishStatus === "published" && (
                <DropdownMenuItem
                  onClick={() => setStatusAction({ id: record.id as string, action: "offline" })}
                >
                  下架
                </DropdownMenuItem>
              )}
              {record.publishStatus === "offline" && (
                <DropdownMenuItem
                  onClick={() => setStatusAction({ id: record.id as string, action: "republish" })}
                >
                  重新上架
                </DropdownMenuItem>
              )}
              <DropdownMenuItem
                onClick={() => {
                  setParticipantsEventId(record.id as string);
                  setParticipantsPage(1);
                }}
              >
                查看报名人员
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => {
                  setOrdersEventId(record.id as string);
                  setOrdersPage(1);
                }}
              >
                查看订单
              </DropdownMenuItem>
              {(record.currentParticipants as number) > 0 &&
                record.publishStatus === "published" && (
                  <DropdownMenuItem onClick={() => setDrawEventId(record.id as string)}>
                    赛事抽签
                  </DropdownMenuItem>
                )}
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => setDeleteId(record.id as string)}
              >
                删除
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">赛事列表</h1>
        <Button onClick={() => navigate({ to: "/events/create" })}>新增赛事</Button>
      </div>

      <FilterBar
        onReset={resetFilters}
        searchValue={search}
        onSearchChange={setSearch}
        onSearch={() => setPage(1)}
        searchPlaceholder="搜索赛事名称或地点..."
      >
        <FilterItem label="赛事状态">
          <Select
            value={filterEventStatus}
            onValueChange={(v) => {
              setFilterEventStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full min-w-40">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>全部</SelectItem>
              <SelectItem value="registration_not_started">报名未开始</SelectItem>
              <SelectItem value="registration_open">报名中</SelectItem>
              <SelectItem value="registration_ended">报名结束</SelectItem>
              <SelectItem value="event_not_started">比赛未开始</SelectItem>
              <SelectItem value="event_in_progress">比赛中</SelectItem>
              <SelectItem value="event_ended">已结束</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="发布状态">
          <Select
            value={filterPublishStatus}
            onValueChange={(v) => {
              setFilterPublishStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full min-w-40">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>全部</SelectItem>
              <SelectItem value="draft">草稿</SelectItem>
              <SelectItem value="published">已发布</SelectItem>
              <SelectItem value="offline">已下架</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="赛事分类">
          <Input
            className="min-w-40"
            value={filterCategory !== ALL ? filterCategory : ""}
            onChange={(e) => {
              setFilterCategory(e.target.value || ALL);
              setPage(1);
            }}
            placeholder="输入分类名称"
          />
        </FilterItem>

        <FilterItem label="赛事属性">
          <Select
            value={filterAttribute}
            onValueChange={(v) => {
              setFilterAttribute(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full min-w-40">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>全部</SelectItem>
              <SelectItem value="online">线上赛</SelectItem>
              <SelectItem value="shuttle_bus">摆渡车</SelectItem>
              <SelectItem value="pacer_recruitment">招募配速员</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="赛事热度">
          <Select
            value={filterIsHot}
            onValueChange={(v) => {
              setFilterIsHot(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full min-w-40">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>全部</SelectItem>
              <SelectItem value="true">热门</SelectItem>
              <SelectItem value="false">非热门</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>

        <FilterItem label="赛事日期（起）">
          <Input
            type="date"
            className="min-w-40"
            value={filterDateStart}
            onChange={(e) => {
              setFilterDateStart(e.target.value);
              setPage(1);
            }}
          />
        </FilterItem>

        <FilterItem label="赛事日期（止）">
          <Input
            type="date"
            className="min-w-40"
            value={filterDateEnd}
            onChange={(e) => {
              setFilterDateEnd(e.target.value);
              setPage(1);
            }}
          />
        </FilterItem>
      </FilterBar>

      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <DataTable
          columns={columns}
          data={events as unknown as Record<string, unknown>[]}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={statusAction !== null}
        onOpenChange={() => setStatusAction(null)}
        title={dialogContent?.title ?? ""}
        description={dialogContent?.description ?? ""}
        onConfirm={() => {
          if (statusAction) {
            const publishStatus = getNextPublishStatus(statusAction.action);
            updateStatusMutation.mutate({ id: statusAction.id, publishStatus });
          }
          setStatusAction(null);
        }}
        confirmText={dialogContent?.confirmText ?? ""}
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="确定要删除该赛事吗？此操作不可撤销。"
        onConfirm={() => {
          if (deleteId) deleteMutation.mutate(deleteId);
          setDeleteId(null);
        }}
        confirmText="确认删除"
        variant="destructive"
      />

      <Dialog open={participantsEventId !== null} onOpenChange={() => setParticipantsEventId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>报名人员</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">共 {participantsData?.total ?? 0} 人</div>
          <DataTable
            columns={[
              { key: "orderNo", title: "订单号" },
              { key: "userId", title: "用户ID" },
              {
                key: "status",
                title: "状态",
                render: (val: unknown) => {
                  const statusMap: Record<
                    string,
                    { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
                  > = {
                    pending: { label: "待支付", variant: "secondary" },
                    paid: { label: "已支付", variant: "default" },
                    refunded: { label: "已退款", variant: "outline" },
                    cancelled: { label: "已取消", variant: "destructive" },
                  };
                  const s = statusMap[val as string];
                  return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val ?? "-");
                },
              },
              {
                key: "amount",
                title: "金额",
                render: (val: unknown) => `¥${((val as number) / 100).toFixed(2)}`,
              },
              { key: "createdAt", title: "创建时间" },
            ]}
            data={(participantsData?.items ?? []) as Record<string, unknown>[]}
            page={participantsPage}
            pageSize={10}
            total={participantsData?.total ?? 0}
            onPageChange={setParticipantsPage}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={ordersEventId !== null} onOpenChange={() => setOrdersEventId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>赛事订单</DialogTitle>
          </DialogHeader>
          <div className="text-sm text-muted-foreground">共 {ordersData?.total ?? 0} 条</div>
          <DataTable
            columns={[
              { key: "orderNo", title: "订单号" },
              { key: "type", title: "类型" },
              { key: "userId", title: "用户ID" },
              {
                key: "status",
                title: "状态",
                render: (val: unknown) => {
                  const statusMap: Record<
                    string,
                    { label: string; variant: "default" | "secondary" | "outline" | "destructive" }
                  > = {
                    pending: { label: "待支付", variant: "secondary" },
                    paid: { label: "已支付", variant: "default" },
                    refunded: { label: "已退款", variant: "outline" },
                    cancelled: { label: "已取消", variant: "destructive" },
                  };
                  const s = statusMap[val as string];
                  return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val ?? "-");
                },
              },
              {
                key: "amount",
                title: "金额",
                render: (val: unknown) => `¥${((val as number) / 100).toFixed(2)}`,
              },
              { key: "createdAt", title: "创建时间" },
            ]}
            data={(ordersData?.items ?? []) as Record<string, unknown>[]}
            page={ordersPage}
            pageSize={10}
            total={ordersData?.total ?? 0}
            onPageChange={setOrdersPage}
          />
        </DialogContent>
      </Dialog>

      <Dialog open={drawEventId !== null} onOpenChange={() => setDrawEventId(null)}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>赛事抽签</DialogTitle>
          </DialogHeader>
          {drawResults?.data?.groupDrawCompleted ? (
            <div className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-muted-foreground">最大参赛人数：</span>
                  <span className="font-medium">{drawResults.data.maxParticipants ?? 0}</span>
                </div>
                <div>
                  <span className="text-muted-foreground">已中签人数：</span>
                  <span className="font-medium">{drawResults.data.drawnCount ?? 0}</span>
                </div>
              </div>
              {drawResults.data.drawn && drawResults.data.drawn.length > 0 && (
                <DataTable
                  columns={[
                    { key: "orderNo", title: "订单号" },
                    { key: "userId", title: "用户ID" },
                    {
                      key: "amount",
                      title: "金额",
                      render: (val: unknown) => `¥${((val as number) / 100).toFixed(2)}`,
                    },
                    { key: "paidAt", title: "支付时间" },
                  ]}
                  data={drawResults.data.drawn as Record<string, unknown>[]}
                  page={1}
                  pageSize={drawResults.data.drawn.length}
                  total={drawResults.data.drawn.length}
                />
              )}
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-muted-foreground text-sm">尚未进行抽签，点击下方按钮开始抽签。</p>
              <Button
                onClick={() => {
                  if (drawEventId) drawMutation.mutate(drawEventId);
                }}
                disabled={drawMutation.isPending}
              >
                {drawMutation.isPending ? "抽签中..." : "开始抽签"}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
