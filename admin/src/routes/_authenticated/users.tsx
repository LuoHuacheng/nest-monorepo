import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { useUserList, useDeleteUser, useUpdateUserStatus } from "@/api/modules/users";

export const Route = createFileRoute("/_authenticated/users")({
  component: UsersPage,
});

function UsersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = useUserList({ page, pageSize: 10, keyword: search || undefined });
  const items = ((data as any)?.items ?? []) as Record<string, unknown>[];
  const total = (data as any)?.total ?? 0;

  const deleteMut = useDeleteUser();
  const statusMut = useUpdateUserStatus();

  const columns = [
    { key: "username", title: "用户名" },
    { key: "name", title: "姓名" },
    { key: "avatar", title: "头像" },
    { key: "phone", title: "手机号" },
    { key: "email", title: "邮箱" },
    {
      key: "status",
      title: "状态",
      render: (val: unknown) => (
        <Badge variant={val === 1 ? "default" : "secondary"}>{val === 1 ? "启用" : "禁用"}</Badge>
      ),
    },
    { key: "createdAt", title: "创建时间" },
    { key: "updatedAt", title: "更新时间" },
    {
      key: "actions",
      title: "操作",
      render: (_: unknown, record: Record<string, unknown>) => (
        <div className="flex gap-2">
          <Button variant="ghost" size="sm">
            编辑
          </Button>
          <Button variant="ghost" size="sm" onClick={() => statusMut.mutate(record.id as string)}>
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
      <h1 className="text-2xl font-bold">用户管理</h1>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索用户名或姓名..."
      />
      <DataTable
        columns={columns}
        data={items}
        page={page}
        pageSize={10}
        total={total}
        onPageChange={setPage}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="确定要删除该用户吗？此操作不可撤销。"
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
