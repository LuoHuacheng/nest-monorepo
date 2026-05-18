import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { mockShuttleBuses } from "@/mocks/data/events";

export const Route = createFileRoute("/_authenticated/events/shuttle-buses")({
  component: ShuttleBusesPage,
});

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

function ShuttleBusesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = mockShuttleBuses.filter(
    (b) => b.eventName.includes(search) || b.route.includes(search),
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
