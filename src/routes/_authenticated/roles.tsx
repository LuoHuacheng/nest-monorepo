import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

const mockRoles = [
  {
    id: "1",
    name: "管理员",
    code: "admin",
    description: "系统管理员，拥有全部权限",
    status: 1,
    createdAt: "2025-01-01",
  },
  {
    id: "2",
    name: "编辑员",
    code: "editor",
    description: "可编辑赛事和订单",
    status: 1,
    createdAt: "2025-03-01",
  },
  {
    id: "3",
    name: "查看员",
    code: "viewer",
    description: "只读权限",
    status: 0,
    createdAt: "2025-06-01",
  },
];

export const Route = createFileRoute("/_authenticated/roles")({
  component: RolesPage,
});

function RolesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = mockRoles.filter((r) => r.name.includes(search) || r.code.includes(search));

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
        data={filtered as unknown as Record<string, unknown>[]}
        page={page}
        pageSize={10}
        total={filtered.length}
        onPageChange={setPage}
      />
      <ConfirmDialog
        open={deleteId !== null}
        onOpenChange={() => setDeleteId(null)}
        title="确认删除"
        description="确定要删除该角色吗？此操作不可撤销。"
        onConfirm={() => {
          setDeleteId(null);
        }}
        confirmText="确认删除"
        variant="destructive"
      />
    </div>
  );
}
