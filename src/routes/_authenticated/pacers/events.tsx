import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { mockPacerEvents } from "@/mocks/data/pacers";

export const Route = createFileRoute("/_authenticated/pacers/events")({
  component: PacerEventsPage,
});

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  assigned: { label: "已分配", variant: "default" },
  completed: { label: "已完成", variant: "secondary" },
  withdrawn: { label: "已弃权", variant: "outline" },
};

const columns = [
  { key: "pacerName", title: "配速员" },
  { key: "pacerId", title: "配速员ID" },
  { key: "eventName", title: "赛事" },
  { key: "eventId", title: "赛事ID" },
  { key: "targetTime", title: "目标时间" },
  {
    key: "status",
    title: "状态",
    render: (val: unknown) => {
      const s = statusMap[val as string];
      return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val);
    },
  },
  { key: "assignedAt", title: "分配时间" },
  { key: "createdAt", title: "创建时间" },
  {
    key: "actions",
    title: "操作",
    render: (_: unknown, record: Record<string, unknown>) => (
      <div className="flex gap-2">
        <Button variant="ghost" size="sm">
          详情
        </Button>
        <Button variant="ghost" size="sm">
          导出
        </Button>
        {record.status === "assigned" && (
          <>
            <Button variant="ghost" size="sm">
              分配
            </Button>
            <Button variant="ghost" size="sm" className="text-destructive">
              弃权
            </Button>
          </>
        )}
      </div>
    ),
  },
];

function PacerEventsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const filtered = mockPacerEvents.filter(
    (e) =>
      e.pacerName.includes(search) ||
      e.eventName.includes(search) ||
      e.pacerId.includes(search) ||
      e.eventId.includes(search),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">配速员赛事</h1>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索配速员、赛事或 ID..."
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
