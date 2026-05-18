import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";

const mockNotifications = [
  {
    id: "1",
    title: "订单支付成功通知",
    content: "您的订单已支付成功。",
    type: "order",
    targetType: "all",
    targetId: "",
    status: "sent",
    sentAt: "2026-05-01 09:00",
    createdAt: "2025-01-01",
  },
  {
    id: "2",
    title: "赛事报名成功通知",
    content: "您的赛事报名已提交。",
    type: "event",
    targetType: "all",
    targetId: "",
    status: "sent",
    sentAt: "2026-05-02 10:00",
    createdAt: "2025-01-01",
  },
  {
    id: "3",
    title: "退款处理通知",
    content: "您的退款申请已受理。",
    type: "order",
    targetType: "user",
    targetId: "u1",
    status: "pending",
    sentAt: "",
    createdAt: "2025-02-01",
  },
  {
    id: "4",
    title: "赛事提醒通知",
    content: "您报名的赛事即将开始。",
    type: "event",
    targetType: "all",
    targetId: "",
    status: "pending",
    sentAt: "",
    createdAt: "2025-03-01",
  },
];

export const Route = createFileRoute("/_authenticated/settings/notifications")({
  component: NotificationsPage,
});

function NotificationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = mockNotifications.filter((n) => n.title.includes(search));

  const columns = [
    { key: "title", title: "通知标题" },
    { key: "content", title: "内容" },
    {
      key: "type",
      title: "类型",
      render: (val: unknown) => (
        <Badge variant="outline">{val === "order" ? "订单" : "赛事"}</Badge>
      ),
    },
    {
      key: "targetType",
      title: "目标",
      render: (val: unknown) => (val === "all" ? "全部用户" : "指定用户"),
    },
    { key: "targetId", title: "目标ID" },
    {
      key: "status",
      title: "状态",
      render: (val: unknown) => (
        <Badge variant={val === "sent" ? "default" : "secondary"}>
          {val === "sent" ? "已发送" : "待发送"}
        </Badge>
      ),
    },
    { key: "sentAt", title: "发送时间" },
    { key: "createdAt", title: "创建时间" },
    {
      key: "actions",
      title: "操作",
      render: () => (
        <Button variant="ghost" size="sm">
          查看
        </Button>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">消息通知</h1>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索通知标题..."
      />
      <DataTable
        columns={columns}
        data={filtered as unknown as Record<string, unknown>[]}
        page={page}
        pageSize={10}
        total={filtered.length}
        onPageChange={setPage}
      />
    </div>
  );
}
