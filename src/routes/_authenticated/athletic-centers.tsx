import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { mockAthleticCenters } from "@/mocks/data/organizers";

export const Route = createFileRoute("/_authenticated/athletic-centers")({
  component: AthleticCentersPage,
});

function AthleticCentersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const filtered = mockAthleticCenters.filter(
    (c) =>
      c.name.includes(search) ||
      (c.contact?.includes(search) ?? false) ||
      (c.address?.includes(search) ?? false),
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
          <Button variant="ghost" size="sm">
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
        description="确定要删除该田管中心吗？此操作不可撤销。"
        onConfirm={() => {
          setDeleteId(null);
        }}
        confirmText="确认删除"
        variant="destructive"
      />
    </div>
  );
}
