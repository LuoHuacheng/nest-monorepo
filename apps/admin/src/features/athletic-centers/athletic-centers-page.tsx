import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  useAthleticCenterList,
  useDeleteAthleticCenter,
  useUpdateAthleticCenterStatus,
} from "@/api/modules/athletic-centers";

export function AthleticCentersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data, isLoading } = useAthleticCenterList({ page, pageSize: 10 });
  const items = (data as { items?: unknown[] })?.items ?? [];
  const total = (data as { total?: number })?.total ?? 0;
  const deleteMutation = useDeleteAthleticCenter();
  const updateStatusMutation = useUpdateAthleticCenterStatus();

  const filtered = (items as Record<string, unknown>[]).filter(
    (c) =>
      !search ||
      (c.name as string)?.includes(search) ||
      (c.contact as string)?.includes(search) ||
      (c.address as string)?.includes(search),
  );

  const columns = [
    { key: "name", title: "名称" },
    { key: "contact", title: "联系人" },
    { key: "phone", title: "电话" },
    { key: "address", title: "地址" },
    {
      key: "status",
      title: "状态",
      render: (val: unknown) => (
        <Badge variant={val === 1 ? "default" : "secondary"}>{val === 1 ? "启用" : "禁用"}</Badge>
      ),
    },
    {
      key: "actions",
      title: "操作",
      render: (_: unknown, record: Record<string, unknown>) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            编辑
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              updateStatusMutation.mutate({
                id: record.id as string,
                status: record.status === 1 ? 0 : 1,
              })
            }
          >
            {record.status === 1 ? "禁用" : "启用"}
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="text-destructive"
            onClick={() => setDeleteId(record.id as string)}
          >
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">田管中心</h1>
        <Button>新增田管中心</Button>
      </div>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索名称、联系人或地址..."
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
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="确定要删除该田管中心吗？此操作不可撤销。"
        onConfirm={() => {
          if (deleteId) {
            deleteMutation.mutate(deleteId, {
              onSettled: () => setDeleteId(null),
            });
          }
        }}
        confirmText="确认删除"
        variant="destructive"
      />
    </div>
  );
}
