import { useState } from "react";
import { formatDate } from "@match/utils";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { SearchForm } from "@/components/common/search-form";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  usePacerList,
  useDeletePacer,
  useApprovePacer,
  useSuspendPacer,
  useRevokePacer,
} from "@/api/modules/pacers";

const statusMap: Record<
  string,
  { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
> = {
  pending: { label: "待审核", variant: "secondary" },
  approved: { label: "已通过", variant: "default" },
  suspended: { label: "已暂停", variant: "outline" },
  revoked: { label: "已解除", variant: "destructive" },
};

export function PacersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  const { data } = usePacerList({ page, pageSize: 10, keyword: search || undefined });
  const items = (data?.items ?? []) as Record<string, unknown>[];
  const total = data?.total ?? 0;

  const deleteMut = useDeletePacer();
  const approveMut = useApprovePacer();
  const suspendMut = useSuspendPacer();
  const revokeMut = useRevokePacer();

  const columns = [
    { key: "pacerNo", title: "PacerID" },
    { key: "name", title: "姓名" },
    { key: "phone", title: "手机号" },
    { key: "idCard", title: "身份证号" },
    {
      key: "paceSegments",
      title: "配速段",
      render: (val: unknown) =>
        (val as string[] | undefined)?.length ? (val as string[]).join(" / ") : "-",
    },
    { key: "targetTime", title: "目标时间" },
    { key: "clothingSize", title: "尺码" },
    { key: "validFrom", title: "有效期开始" },
    { key: "validTo", title: "有效期结束" },
    { key: "healthReportUrl", title: "体检报告" },
    { key: "ecgImageUrl", title: "心电图" },
    {
      key: "marathonCertificates",
      title: "成绩证书",
      render: (val: unknown) => `${((val as string[] | undefined) ?? []).length} 张`,
    },
    { key: "pacePlanImageUrl", title: "配速计划" },
    {
      key: "status",
      title: "状态",
      render: (val: unknown) => {
        const s = statusMap[val as string];
        return s ? <Badge variant={s.variant}>{s.label}</Badge> : String(val);
      },
    },
    { key: "createdAt", title: "创建时间", render: (val: unknown) => formatDate(val as string) },
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
          {record.status === "pending" && (
            <Button
              variant="ghost"
              size="sm"
              className="text-green-600"
              onClick={() => approveMut.mutate(record.id as string)}
            >
              审核
            </Button>
          )}
          {record.status === "approved" && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => suspendMut.mutate(record.id as string)}
            >
              暂停授权
            </Button>
          )}
          {record.status === "suspended" && (
            <Button variant="ghost" size="sm" onClick={() => revokeMut.mutate(record.id as string)}>
              解除授权
            </Button>
          )}
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
      <h1 className="text-2xl font-bold">配速员列表</h1>
      <SearchForm
        value={search}
        onChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setPage(1);
        }}
        placeholder="搜索姓名、手机号、身份证号或 PacerID..."
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
        description="确定要删除该配速员吗？此操作不可撤销。"
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
