import { Link } from "@tanstack/react-router";
import { ShoppingCart, Users, RotateCcw, DollarSign, ArrowRight, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useDashboardRecentOrders, useDashboardRecentEvents } from "@/api/modules/dashboard";

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "待支付", variant: "secondary" },
  paid: { label: "已支付", variant: "default" },
  refunded: { label: "已退款", variant: "destructive" },
  cancelled: { label: "已取消", variant: "outline" },
  draft: { label: "草稿", variant: "secondary" },
  published: { label: "已发布", variant: "default" },
  ended: { label: "已结束", variant: "secondary" },
};

function renderTablePlaceholder(colSpan: number, text: string) {
  return (
    <TableRow>
      <TableCell colSpan={colSpan} className="text-center text-muted-foreground">
        {text}
      </TableCell>
    </TableRow>
  );
}

export function DashboardPage() {
  const { data: ordersData, isLoading: ordersLoading } = useDashboardRecentOrders();
  const { data: eventsData, isLoading: eventsLoading } = useDashboardRecentEvents();

  const recentOrders = ((ordersData as { items?: unknown[] })?.items ?? []) as Record<
    string,
    unknown
  >[];
  const recentEvents = ((eventsData as { items?: unknown[] })?.items ?? []) as Record<
    string,
    unknown
  >[];

  const statCards = [
    {
      title: "今日订单",
      value: "—",
      icon: ShoppingCart,
      change: "",
      accent: "bg-blue-500",
    },
    {
      title: "今日新增用户",
      value: "—",
      icon: Users,
      change: "",
      accent: "bg-emerald-500",
    },
    {
      title: "待处理退款",
      value: "—",
      icon: RotateCcw,
      change: "",
      accent: "bg-amber-500",
    },
    {
      title: "本月营收",
      value: "—",
      icon: DollarSign,
      change: "",
      accent: "bg-primary",
    },
  ];

  const orderRows = (() => {
    if (ordersLoading) return renderTablePlaceholder(4, "加载中...");
    if (recentOrders.length === 0) return renderTablePlaceholder(4, "暂无数据");

    return recentOrders.map((order, index) => (
      <TableRow key={(order.id as string) ?? index} className="table-row-hover border-border/15">
        <TableCell className="pl-6 font-mono text-xs text-muted-foreground">
          {(order.orderNo as string) ?? "—"}
        </TableCell>
        <TableCell className="text-sm">
          {(order.userName as string) ?? (order.user as Record<string, unknown>)?.name ?? "—"}
        </TableCell>
        <TableCell className="text-sm font-medium">¥{String(order.amount ?? "—")}</TableCell>
        <TableCell className="pr-6">
          <Badge variant={statusMap[order.status as string]?.variant} className="text-[11px]">
            {statusMap[order.status as string]?.label ?? String(order.status ?? "")}
          </Badge>
        </TableCell>
      </TableRow>
    ));
  })();

  const eventRows = (() => {
    if (eventsLoading) return renderTablePlaceholder(3, "加载中...");
    if (recentEvents.length === 0) return renderTablePlaceholder(3, "暂无数据");

    return recentEvents.map((event, index) => (
      <TableRow key={(event.id as string) ?? index} className="table-row-hover border-border/15">
        <TableCell className="pl-6 text-sm font-medium">{(event.name as string) ?? "—"}</TableCell>
        <TableCell>
          <Badge variant={statusMap[event.status as string]?.variant} className="text-[11px]">
            {statusMap[event.status as string]?.label ?? String(event.status ?? "")}
          </Badge>
        </TableCell>
        <TableCell className="pr-6">
          <span className="text-sm tabular-nums">
            {Number(event.currentParticipants ?? 0).toLocaleString()} 人
          </span>
        </TableCell>
      </TableRow>
    ));
  })();

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div>
        <h1 className="font-display text-2xl font-bold tracking-tight">概览</h1>
        <p className="mt-1 text-sm text-muted-foreground">赛事运营数据概览</p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4 stagger-in">
        {statCards.map((card) => (
          <Card
            key={card.title}
            className="stat-card group relative overflow-hidden border-border/30 transition-shadow hover:shadow-md"
          >
            <div
              className={`absolute left-0 top-0 bottom-0 w-1 ${card.accent} rounded-r opacity-0 transition-opacity group-hover:opacity-100`}
            />
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                {card.title}
              </CardTitle>
              <div className="rounded-lg bg-muted/60 p-2 text-muted-foreground transition-colors group-hover:bg-primary/10 group-hover:text-primary">
                <card.icon className="size-4" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{card.value}</div>
              {card.change && (
                <div className="mt-1 flex items-center gap-1 text-xs text-muted-foreground">
                  <TrendingUp className="size-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">{card.change}</span>
                  <span>较昨日</span>
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Data Tables */}
      <div className="grid gap-6 lg:grid-cols-2 stagger-in">
        {/* Recent Orders */}
        <Card className="border-border/30">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-sm font-semibold tracking-tight">最近订单</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-primary"
              asChild
            >
              <Link to="/orders/events">
                查看全部 <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    订单号
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    用户
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    金额
                  </TableHead>
                  <TableHead className="pr-6 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    状态
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{orderRows}</TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card className="border-border/30">
          <CardHeader className="flex flex-row items-center justify-between border-b border-border">
            <CardTitle className="text-sm font-semibold tracking-tight">最近赛事</CardTitle>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 text-xs text-muted-foreground hover:text-primary"
              asChild
            >
              <Link to="/events/list">
                查看全部 <ArrowRight className="size-3" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent className="px-0 pt-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="pl-6 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    赛事名称
                  </TableHead>
                  <TableHead className="text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    状态
                  </TableHead>
                  <TableHead className="pr-6 text-xs font-medium uppercase tracking-wider text-muted-foreground/70">
                    报名人数
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>{eventRows}</TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="border-border/30">
        <CardHeader className="border-b border-border">
          <CardTitle className="text-sm font-semibold tracking-tight">快捷操作</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-3">
          <Button variant="outline" size="sm" asChild>
            <Link to="/events/list">管理赛事</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/orders/events">查看订单</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/pacers/list">配速员管理</Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link to="/users">用户管理</Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
