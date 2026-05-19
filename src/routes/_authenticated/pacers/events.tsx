import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { usePacerEvents, useWithdrawPacer } from "@/api/modules/pacers";

export const Route = createFileRoute("/_authenticated/pacers/events")({
  component: PacerEventsPage,
});

const statusMap: Record<string, { label: string; variant: "default" | "secondary" | "outline" }> = {
  assigned: { label: "已分配", variant: "default" },
  completed: { label: "已完成", variant: "secondary" },
  withdrawn: { label: "已弃权", variant: "outline" },
};

function PacerEventsPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [withdrawId, setWithdrawId] = useState<string | null>(null);

  const { data } = usePacerEvents();
  const allItems = (Array.isArray(data) ? data : ((data as any)?.items ?? [])) as Record<
    string,
    unknown
  >[];
  const filtered = search
    ? allItems.filter(
        (e) =>
          String(e.pacerName ?? "").includes(search) ||
          String(e.eventName ?? "").includes(search) ||
          String(e.pacerId ?? "").includes(search) ||
          String(e.eventId ?? "").includes(search),
      )
    : allItems;
  const pageSize = 10;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const withdrawMut = useWithdrawPacer();

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
              <Button
                variant="ghost"
                size="sm"
                className="text-destructive"
                onClick={() => setWithdrawId(record.id as string)}
              >
                弃权
              </Button>
            </>
          )}
        </div>
      ),
    },
  ];

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
        data={paged}
        page={page}
        pageSize={pageSize}
        total={filtered.length}
        onPageChange={setPage}
      />
      <ConfirmDialog
        open={withdrawId !== null}
        onOpenChange={() => setWithdrawId(null)}
        title="确认弃权"
        description="确定要将该配速员从此赛事中撤回吗？"
        onConfirm={() => {
          if (withdrawId) withdrawMut.mutate(withdrawId);
          setWithdrawId(null);
        }}
        confirmText="确认弃权"
        variant="destructive"
      />
    </div>
  );
}
