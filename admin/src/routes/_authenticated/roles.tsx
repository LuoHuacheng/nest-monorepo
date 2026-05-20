import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useRoleList, useDeleteRole } from "@/api/modules/roles";

export const Route = createFileRoute("/_authenticated/roles")({
  component: RolesPage,
});

function RolesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useRoleList();
  const allItems = (Array.isArray(data) ? data : ((data as any)?.items ?? [])) as Record<
    string,
    unknown
  >[];
  const filtered = search
    ? allItems.filter(
        (r) => String(r.name ?? "").includes(search) || String(r.code ?? "").includes(search),
      )
    : allItems;
  const pageSize = 10;
  const paged = filtered.slice((page - 1) * pageSize, page * pageSize);

  const deleteMut = useDeleteRole();

  const columns = [
    { key: "name", title: "角色名称" },
    { key: "code", title: "角色编码" },
    { key: "description", title: "描述" },
    {
      key: "status",
      title: "状态",
      render: (val: unknown) => (
        <Badge variant={val === 1 ? "default" : "secondary"}>{val === 1 ? "启用" : "禁用"}</Badge>
      ),
    },
    { key: "createdAt", title: "创建时间" },
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
        <h1 className="text-2xl font-bold">角色管理</h1>
        <Button>新增角色</Button>
      </div>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索角色名称或标识..."
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
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="确定要删除该角色吗？此操作不可撤销。"
        onConfirm={() => {
          if (deleteId) deleteMut.mutate(deleteId);
          setDeleteId(null);
        }}
        confirmText="确认删除"
        variant="destructive"
      />
    </div>
  );
}
