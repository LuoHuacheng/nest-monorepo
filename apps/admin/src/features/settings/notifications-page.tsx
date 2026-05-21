import { useState } from "react";
import { formatDate } from "@match/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { useNotificationList } from "@/api/modules/notifications";

export function NotificationsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const { data, isLoading } = useNotificationList({ page, pageSize: 10 });
  const items = (data as { items?: unknown[] })?.items ?? [];
  const total = (data as { total?: number })?.total ?? 0;

  const filtered = (items as Record<string, unknown>[]).filter(
    (n) => !search || (n.title as string)?.includes(search),
  );

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
    { key: "sentAt", title: "发送时间", render: (val: unknown) => formatDate(val as string) },
    { key: "createdAt", title: "创建时间", render: (val: unknown) => formatDate(val as string) },
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
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          page={page}
          pageSize={10}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
