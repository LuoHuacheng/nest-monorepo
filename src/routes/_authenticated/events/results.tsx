import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { useEventResults } from "@/api/modules/events";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";

export const Route = createFileRoute("/_authenticated/events/results")({
  component: ResultsPage,
});

const columns = [
  { key: "eventId", title: "赛事ID" },
  { key: "eventName", title: "赛事" },
  { key: "userId", title: "用户ID" },
  { key: "userName", title: "选手" },
  { key: "bibNumber", title: "号码布" },
  { key: "finishTime", title: "成绩" },
  { key: "rank", title: "排名" },
  { key: "status", title: "状态" },
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

function ResultsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [eventId] = useState("");

  const { data, isLoading } = useEventResults(eventId, { page, pageSize });
  const items = (data as { items?: unknown[] })?.items ?? [];
  const total = (data as { total?: number })?.total ?? 0;
  const filtered = (items as Record<string, unknown>[]).filter(
    (r) =>
      !search ||
      (r.eventName as string)?.includes(search) ||
      (r.userName as string)?.includes(search),
  );

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">成绩列表</h1>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索赛事或选手..."
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <DataTable
          columns={columns}
          data={filtered as unknown as Record<string, unknown>[]}
          page={page}
          pageSize={pageSize}
          total={total}
          onPageChange={setPage}
        />
      )}
    </div>
  );
}
