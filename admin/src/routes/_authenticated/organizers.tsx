import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  useOrganizerList,
  useUpdateOrganizerStatus,
  useResetOrganizerPassword,
} from "@/api/modules/organizers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";

export const Route = createFileRoute("/_authenticated/organizers")({
  component: OrganizersPage,
});

function OrganizersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [resetId, setResetId] = useState<string | null>(null);
  const [statusToggle, setStatusToggle] = useState<{ id: string; status: number } | null>(null);

  const queryParams: Record<string, unknown> = {
    page,
    pageSize: 10,
    keyword: search || undefined,
  };

  const { data, isLoading } = useOrganizerList(queryParams);
  const organizers = (data?.items ?? []) as Record<string, unknown>[];
  const total = data?.total ?? 0;

  const updateStatusMutation = useUpdateOrganizerStatus();
  const resetPasswordMutation = useResetOrganizerPassword();

  const columns = [
    { key: "loginAccount", title: "登录账号" },
    { key: "name", title: "组委会名称" },
    { key: "contact", title: "联系人" },
    { key: "phone", title: "联系电话" },
    { key: "backupContact", title: "备用联系人" },
    { key: "backupPhone", title: "备用电话" },
    { key: "certificateNo", title: "资质证书编号" },
    { key: "eventDate", title: "赛事时间" },
    { key: "province", title: "省份" },
    { key: "city", title: "城市" },
    { key: "address", title: "详细地址" },
    { key: "eventScale", title: "赛事规模" },
    {
      key: "eventItems",
      title: "赛事项目",
      render: (val: unknown) => ((val as string[]).length ? (val as string[]).join(" / ") : "-"),
    },
    { key: "operator", title: "运营单位" },
    { key: "email", title: "邮箱" },
    { key: "remark", title: "备注" },
    {
      key: "status",
      title: "状态",
      render: (val: unknown) => (
        <Badge variant={val === 1 ? "default" : "secondary"}>{val === 1 ? "启用" : "停用"}</Badge>
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
          <Button variant="ghost" size="sm" onClick={() => setResetId(record.id as string)}>
            重置密码
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setStatusToggle({ id: record.id as string, status: record.status === 1 ? 0 : 1 })
            }
          >
            {record.status === 1 ? "停用" : "启用"}
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">组委会</h1>
        <Button>新增组委会</Button>
      </div>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索名称、账号、联系人或电话..."
      />
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <DataTable
          columns={columns}
          data={organizers}
          page={page}
          pageSize={10}
          total={total}
          onPageChange={setPage}
        />
      )}
      <ConfirmDialog
        open={resetId !== null}
        onOpenChange={() => setResetId(null)}
        title="重置密码"
        description="确定要重置该组委会的登录密码吗？"
        onConfirm={() => {
          if (resetId) resetPasswordMutation.mutate(resetId);
          setResetId(null);
        }}
        confirmText="确认重置"
      />
      <ConfirmDialog
        open={statusToggle !== null}
        onOpenChange={() => setStatusToggle(null)}
        title={statusToggle?.status === 1 ? "确认启用" : "确认停用"}
        description={
          statusToggle?.status === 1
            ? "确定要启用该组委会吗？启用后可正常登录使用。"
            : "确定要停用该组委会吗？停用后将无法登录。"
        }
        onConfirm={() => {
          if (statusToggle) {
            updateStatusMutation.mutate(statusToggle);
          }
          setStatusToggle(null);
        }}
        confirmText={statusToggle?.status === 1 ? "确认启用" : "确认停用"}
        variant={statusToggle?.status === 1 ? "default" : "destructive"}
      />
    </div>
  );
}
