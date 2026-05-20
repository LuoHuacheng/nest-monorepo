import { useState } from "react";
import {
  useOrganizerList,
  useUpdateOrganizerStatus,
  useResetOrganizerPassword,
} from "@/api/modules/organizers";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { FilterBar, FilterItem } from "@/components/common/filter-bar";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { OrganizerFormDialog } from "./organizer-form-dialog";

const ALL = "__ALL__";

const detailFields: { key: string; label: string }[] = [
  { key: "loginAccount", label: "登录账号" },
  { key: "name", label: "组委会名称" },
  { key: "contact", label: "联系人" },
  { key: "phone", label: "联系电话" },
  { key: "backupContact", label: "备用联系人" },
  { key: "backupPhone", label: "备用电话" },
  { key: "certificateNo", label: "资质证书编号" },
  { key: "eventDate", label: "赛事时间" },
  { key: "province", label: "省份" },
  { key: "city", label: "城市" },
  { key: "address", label: "详细地址" },
  { key: "eventScale", label: "赛事规模" },
  { key: "eventItems", label: "赛事项目" },
  { key: "operator", label: "运营单位" },
  { key: "email", label: "邮箱" },
  { key: "remark", label: "备注" },
  { key: "status", label: "状态" },
  { key: "createdAt", label: "创建时间" },
];

function formatDetailValue(key: string, val: unknown): string {
  if (val === null || val === undefined || val === "") return "-";
  if (key === "eventItems") {
    if (Array.isArray(val)) return (val as string[]).join(" / ");
    if (typeof val === "object") return Object.values(val as Record<string, unknown>).join(" / ");
    return String(val);
  }
  if (key === "status") return val === 1 ? "启用" : "停用";
  return String(val);
}

export function OrganizersPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [filterStatus, setFilterStatus] = useState(ALL);
  const [filterDateStart, setFilterDateStart] = useState("");
  const [filterDateEnd, setFilterDateEnd] = useState("");

  const [resetId, setResetId] = useState<string | null>(null);
  const [statusToggle, setStatusToggle] = useState<{
    id: string;
    status: number;
  } | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [detailId, setDetailId] = useState<string | null>(null);

  const queryParams: Record<string, unknown> = {
    page,
    pageSize: 10,
    keyword: search || undefined,
    status: filterStatus !== ALL ? Number(filterStatus) : undefined,
    startDate: filterDateStart || undefined,
    endDate: filterDateEnd || undefined,
  };

  const { data, isLoading } = useOrganizerList(queryParams);
  const organizers = (data?.items ?? []) as Record<string, unknown>[];
  const total = data?.total ?? 0;

  const updateStatusMutation = useUpdateOrganizerStatus();
  const resetPasswordMutation = useResetOrganizerPassword();

  function resetFilters() {
    setFilterStatus(ALL);
    setFilterDateStart("");
    setFilterDateEnd("");
    setSearch("");
    setPage(1);
  }

  function openCreate() {
    setEditId(null);
    setFormOpen(true);
  }

  function openEdit(id: string) {
    setEditId(id);
    setFormOpen(true);
  }

  const detailRecord = detailId ? (organizers.find((o) => o.id === detailId) ?? null) : null;

  const columns = [
    { key: "loginAccount", title: "登录账号" },
    { key: "name", title: "组委会名称" },
    { key: "contact", title: "联系人" },
    { key: "phone", title: "联系电话" },
    {
      key: "eventItems",
      title: "赛事项目",
      render: (val: unknown) => {
        if (!val) return "-";
        if (Array.isArray(val))
          return (val as string[]).length ? (val as string[]).join(" / ") : "-";
        if (typeof val === "object") {
          const arr = Object.values(val as Record<string, unknown>);
          return arr.length ? arr.join(" / ") : "-";
        }
        return "-";
      },
    },
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
          <Button variant="ghost" size="sm" onClick={() => setDetailId(record.id as string)}>
            查看
          </Button>
          <Button variant="ghost" size="sm" onClick={() => openEdit(record.id as string)}>
            编辑
          </Button>
          <Button variant="ghost" size="sm" onClick={() => setResetId(record.id as string)}>
            重置密码
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() =>
              setStatusToggle({
                id: record.id as string,
                status: record.status === 1 ? 0 : 1,
              })
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
        <Button onClick={openCreate}>新增组委会</Button>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={resetFilters}
        searchPlaceholder="搜索名称、账号、联系人或电话..."
      >
        <FilterItem label="状态">
          <Select
            value={filterStatus}
            onValueChange={(v) => {
              setFilterStatus(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder="全部" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>全部</SelectItem>
              <SelectItem value="1">启用</SelectItem>
              <SelectItem value="0">停用</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>
        <FilterItem label="创建开始日期">
          <Input
            type="date"
            value={filterDateStart}
            onChange={(e) => {
              setFilterDateStart(e.target.value);
              setPage(1);
            }}
          />
        </FilterItem>
        <FilterItem label="创建结束日期">
          <Input
            type="date"
            value={filterDateEnd}
            onChange={(e) => {
              setFilterDateEnd(e.target.value);
              setPage(1);
            }}
          />
        </FilterItem>
      </FilterBar>

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

      {/* 新增/编辑弹窗 */}
      <OrganizerFormDialog
        open={formOpen}
        onOpenChange={(v) => {
          setFormOpen(v);
          if (!v) setEditId(null);
        }}
        organizerId={editId}
      />

      {/* 查看详情弹窗 */}
      <Dialog open={detailId !== null} onOpenChange={() => setDetailId(null)}>
        <DialogContent className="max-h-[80vh] overflow-y-auto sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>组委会详情</DialogTitle>
          </DialogHeader>
          {detailRecord ? (
            <div className="space-y-3">
              {detailFields.map(({ key, label }) => (
                <div key={key} className="flex gap-2">
                  <span className="shrink-0 w-24 text-sm text-muted-foreground">{label}</span>
                  <span className="text-sm">{formatDetailValue(key, detailRecord[key])}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-4 text-center text-muted-foreground">未找到数据</div>
          )}
        </DialogContent>
      </Dialog>

      {/* 重置密码确认 */}
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

      {/* 启用/停用确认 */}
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
