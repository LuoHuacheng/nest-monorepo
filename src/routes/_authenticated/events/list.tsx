import { createFileRoute } from "@tanstack/react-router";
import { MoreHorizontal } from "lucide-react";
import { useState } from "react";
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
import { mockEvents } from "@/mocks/data/events";
import type { Event, EventAttribute, EventStatus, PublishStatus } from "@/types/event";

export const Route = createFileRoute("/_authenticated/events/list")({
  component: EventsPage,
});

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

const ALL = "__ALL__";

function EventsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [statusAction, setStatusAction] = useState<{
    id: string;
    action: "publish" | "offline" | "republish";
  } | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [participantsEvent, setParticipantsEvent] = useState<Event | null>(null);
  const [ordersEvent, setOrdersEvent] = useState<Event | null>(null);
  const [drawEvent, setDrawEvent] = useState<Event | null>(null);

  const [filterEventStatus, setFilterEventStatus] = useState(ALL);
  const [filterPublishStatus, setFilterPublishStatus] = useState(ALL);
  const [filterCategory, setFilterCategory] = useState(ALL);
  const [filterAttribute, setFilterAttribute] = useState(ALL);
  const [filterIsHot, setFilterIsHot] = useState(ALL);
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  const categories = [...new Set(mockEvents.map((e) => e.category))];

  const filtered = mockEvents.filter((e) => {
    if (search && !e.name.includes(search) && !e.location.includes(search)) return false;
    if (filterPublishStatus !== ALL && e.publishStatus !== filterPublishStatus) return false;
    if (filterCategory !== ALL && e.category !== filterCategory) return false;
    if (filterAttribute !== ALL && !e.attributes.includes(filterAttribute as EventAttribute)) {
      return false;
    }
    if (filterIsHot !== ALL && e.isHot !== (filterIsHot === "true")) return false;
    if (filterDateStart && e.endDate < filterDateStart) return false;
    if (filterDateEnd && e.startDate > `${filterDateEnd} 23:59`) return false;
    return true;
  });

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
        const event = record as unknown as Event;
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="size-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>编辑</DropdownMenuItem>
              <DropdownMenuSeparator />
              {event.publishStatus === "draft" && (
                <DropdownMenuItem
                  onClick={() => setStatusAction({ id: event.id, action: "publish" })}
                >
                  发布
                </DropdownMenuItem>
              )}
              {event.publishStatus === "published" && (
                <DropdownMenuItem
                  onClick={() => setStatusAction({ id: event.id, action: "offline" })}
                >
                  下架
                </DropdownMenuItem>
              )}
              {event.publishStatus === "offline" && (
                <DropdownMenuItem
                  onClick={() => setStatusAction({ id: event.id, action: "republish" })}
                >
                  重新上架
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setParticipantsEvent(event)}>
                查看报名人员
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOrdersEvent(event)}>查看订单</DropdownMenuItem>
              {event.currentParticipants > 0 && event.publishStatus === "published" && (
                <DropdownMenuItem onClick={() => setDrawEvent(event)}>赛事抽签</DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(event.id)}>
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
        <Button>新增赛事</Button>
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
          <Select
            value={filterCategory}
            onValueChange={(v) => {
              setFilterCategory(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full min-w-40">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>全部</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
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

      <DataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        page={page}
        pageSize={10}
        total={filtered.length}
        onPageChange={setPage}
      />

      <ConfirmDialog
        open={statusAction !== null}
        onOpenChange={() => setStatusAction(null)}
        title={
          statusAction?.action === "publish"
            ? "确认发布"
            : statusAction?.action === "offline"
              ? "确认下架"
              : "确认重新上架"
        }
        description={
          statusAction?.action === "publish"
            ? "确定要发布该赛事吗？发布后选手即可看到并报名。"
            : statusAction?.action === "offline"
              ? "确定要下架该赛事吗？下架后选手将无法看到该赛事。"
              : "确定要重新上架该赛事吗？上架后选手将重新看到该赛事。"
        }
        onConfirm={() => setStatusAction(null)}
        confirmText={
          statusAction?.action === "publish"
            ? "确认发布"
            : statusAction?.action === "offline"
              ? "确认下架"
              : "确认上架"
        }
      />

      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="确定要删除该赛事吗？此操作不可撤销。"
        onConfirm={() => setDeleteId(null)}
        confirmText="确认删除"
        variant="destructive"
      />

      <Dialog open={participantsEvent !== null} onOpenChange={() => setParticipantsEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>报名人员 - {participantsEvent?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            当前报名人数：{participantsEvent?.currentParticipants ?? 0} 人
          </p>
          <p className="text-muted-foreground text-sm">（报名人员列表待接口对接后展示）</p>
        </DialogContent>
      </Dialog>

      <Dialog open={ordersEvent !== null} onOpenChange={() => setOrdersEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>赛事订单 - {ordersEvent?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">（订单列表待接口对接后展示）</p>
        </DialogContent>
      </Dialog>

      <Dialog open={drawEvent !== null} onOpenChange={() => setDrawEvent(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>赛事抽签 - {drawEvent?.name}</DialogTitle>
          </DialogHeader>
          <p className="text-muted-foreground text-sm">
            当前报名人数：{drawEvent?.currentParticipants ?? 0} 人
          </p>
          <p className="text-muted-foreground text-sm">（抽签功能待接口对接后实现）</p>
        </DialogContent>
      </Dialog>
    </div>
  );
}
