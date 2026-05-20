import { useState } from "react";
import { useShuttleBuses } from "@/api/modules/events";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";

const statusMap: Record<number, { label: string; variant: "default" | "secondary" }> = {
  0: { label: "禁用", variant: "secondary" },
  1: { label: "启用", variant: "default" },
};

const columns = [
  { key: "eventId", title: "赛事ID" },
  { key: "eventName", title: "赛事" },
  { key: "route", title: "路线" },
  { key: "departureTime", title: "出发时间" },
  { key: "capacity", title: "容量" },
  {
    key: "status",
    title: "状态",
    render: (val: unknown) => {
      const s = statusMap[val as number];
      return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val);
    },
  },
  { key: "createdAt", title: "创建时间" },
  {
    key: "actions",
    title: "操作",
    render: () => (
      <Button variant="ghost" size="sm">
        导出
      </Button>
    ),
  },
];

export function ShuttleBusesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [eventId] = useState("");

  const { data, isLoading } = useShuttleBuses(eventId);
  const items = (data as { items?: unknown[] })?.items ?? [];
  const filtered = (items as Record<string, unknown>[]).filter(
    (b) =>
      !search || (b.eventName as string)?.includes(search) || (b.route as string)?.includes(search),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">摆渡车列表</h1>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索赛事或路线..."
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
