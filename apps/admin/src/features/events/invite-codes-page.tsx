import { useState } from "react";
import { useInviteCodes } from "@/api/modules/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";

const columns = [
  { key: "code", title: "邀请码" },
  { key: "eventId", title: "赛事ID" },
  { key: "eventName", title: "赛事" },
  {
    key: "usage",
    title: "使用情况",
    render: (_: unknown, record: Record<string, unknown>) =>
      `${record.usedCount}/${record.maxUses}`,
  },
  {
    key: "status",
    title: "状态",
    render: (val: unknown) => (
      <Badge variant={val === 1 ? "default" : "secondary"}>{val === 1 ? "启用" : "禁用"}</Badge>
    ),
  },
  { key: "expiresAt", title: "过期时间" },
  { key: "createdAt", title: "创建时间" },
  {
    key: "actions",
    title: "操作",
    render: () => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          使用记录
        </Button>
        <Button variant="ghost" size="sm">
          导出
        </Button>
      </div>
    ),
  },
];

export function InviteCodesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [eventId] = useState("");

  const { data, isLoading } = useInviteCodes(eventId);
  const items = (data as { items?: unknown[] })?.items ?? [];
  const filtered = (items as Record<string, unknown>[]).filter(
    (c) =>
      !search || (c.code as string)?.includes(search) || (c.eventName as string)?.includes(search),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">邀请码列表</h1>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索邀请码或赛事..."
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          page={page}
          pageSize={10}
          total={filtered.length}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
