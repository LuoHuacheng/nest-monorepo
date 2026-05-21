import { useState } from "react";
import { useEventList, useEventDetail } from "@/api/modules/events";
import {
  useInviteCodes,
  useCreateInviteCode,
  useUpdateInviteCode,
  useDeleteInviteCode,
  useInviteCodeParticipants,
  inviteCodeKeys,
} from "@/api/modules/invite-codes";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/common/data-table";
import { FilterBar, FilterItem } from "@/components/common/filter-bar";
import { ConfirmDialog } from "@/components/common/confirm-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, Pencil, Trash2, Users } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";

interface InviteCodeFormProps {
  eventId: string;
  initialData?: {
    id?: string;
    code?: string;
    desc?: string;
    registrationGroupId?: string;
    discount?: number;
    maxUses?: number;
    expiresAt?: string;
  };
  onSuccess?: () => void;
}

function InviteCodeForm({ eventId, initialData, onSuccess }: InviteCodeFormProps) {
  const createInviteCode = useCreateInviteCode();
  const updateInviteCode = useUpdateInviteCode();
  const { data: eventsData } = useEventList({ pageSize: 100 });
  const events = (eventsData as { items?: unknown[] })?.items ?? [];
  const [formData, setFormData] = useState({
    code: initialData?.code || "",
    desc: initialData?.desc || "",
    registrationGroupId: initialData?.registrationGroupId || "",
    discount: initialData?.discount ?? 100,
    maxUses: initialData?.maxUses ?? 1,
    expiresAt: initialData?.expiresAt ? initialData.expiresAt.split("T")[0] : "",
    eventId: eventId || "",
  });

  const { data: eventDetail } = useEventDetail(formData.eventId);
  const registrationGroups =
    ((eventDetail as Record<string, unknown>)?.registrationGroups as Record<string, unknown>[]) ??
    [];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (initialData?.id) {
        await updateInviteCode.mutateAsync({
          id: initialData.id,
          body: {
            desc: formData.desc || undefined,
            discount: formData.discount,
            maxUses: formData.maxUses,
            expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
          },
        });
      } else {
        await createInviteCode.mutateAsync({
          eventId: formData.eventId,
          code: formData.code,
          desc: formData.desc || undefined,
          registrationGroupId: formData.registrationGroupId || undefined,
          discount: formData.discount,
          maxUses: formData.maxUses,
          expiresAt: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : undefined,
        });
      }
      onSuccess?.();
    } catch (error) {
      console.error("操作失败:", error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!initialData?.id && (
        <>
          <div className="space-y-2">
            <Label htmlFor="eventId">选择赛事</Label>
            <Select
              value={formData.eventId}
              onValueChange={(value) =>
                setFormData({ ...formData, eventId: value, registrationGroupId: "" })
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="请选择赛事" />
              </SelectTrigger>
              <SelectContent>
                {(events as Record<string, unknown>[]).map((event) => (
                  <SelectItem key={event.id as string} value={event.id as string}>
                    {event.name as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="registrationGroupId">赛事组别</Label>
            <Select
              value={formData.registrationGroupId}
              onValueChange={(value) => setFormData({ ...formData, registrationGroupId: value })}
              disabled={!formData.eventId}
            >
              <SelectTrigger className="w-full">
                <SelectValue
                  placeholder={formData.eventId ? "请选择赛事组别（可选）" : "请先选择赛事"}
                />
              </SelectTrigger>
              <SelectContent>
                {registrationGroups.map((group) => (
                  <SelectItem key={group.id as string} value={group.id as string}>
                    {group.specName as string} - {group.groupType as string}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="code">邀请码</Label>
            <Input
              id="code"
              value={formData.code}
              onChange={(e) => setFormData({ ...formData, code: e.target.value })}
              placeholder="请输入邀请码"
              required
            />
          </div>
        </>
      )}
      <div className="space-y-2">
        <Label htmlFor="desc">描述</Label>
        <Input
          id="desc"
          value={formData.desc}
          onChange={(e) => setFormData({ ...formData, desc: e.target.value })}
          placeholder="请输入描述"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="discount">折扣百分比</Label>
        <Input
          id="discount"
          type="number"
          min="0"
          max="100"
          value={formData.discount}
          onChange={(e) => setFormData({ ...formData, discount: Number(e.target.value) })}
          placeholder="100为原价，0为免费"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="maxUses">可用次数</Label>
        <Input
          id="maxUses"
          type="number"
          min="1"
          value={formData.maxUses}
          onChange={(e) => setFormData({ ...formData, maxUses: Number(e.target.value) })}
          placeholder="请输入可用次数"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="expiresAt">过期时间</Label>
        <Input
          id="expiresAt"
          type="date"
          value={formData.expiresAt}
          onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
        />
      </div>
      <div className="flex justify-end gap-2">
        <Button type="submit" disabled={createInviteCode.isPending || updateInviteCode.isPending}>
          {initialData?.id ? "更新" : "创建"}
        </Button>
      </div>
    </form>
  );
}

function ParticipantsDialog({
  inviteCodeId,
  inviteCodeName,
}: {
  inviteCodeId: string;
  inviteCodeName: string;
}) {
  const [page, setPage] = useState(1);
  const { data, isLoading } = useInviteCodeParticipants(inviteCodeId, { page, pageSize: 10 });
  const items = (data as { items?: unknown[] })?.items ?? [];
  const total = (data as { total?: number })?.total ?? 0;

  const columns = [
    { key: "orderNo", title: "订单号" },
    {
      key: "userName",
      title: "姓名",
      render: (_: unknown, record: Record<string, unknown>) =>
        ((record.user as Record<string, unknown>)?.name as string) || "-",
    },
    {
      key: "userPhone",
      title: "手机号",
      render: (_: unknown, record: Record<string, unknown>) =>
        ((record.user as Record<string, unknown>)?.phone as string) || "-",
    },
    {
      key: "groupName",
      title: "报名组别",
      render: (_: unknown, record: Record<string, unknown>) =>
        ((record.registrationGroup as Record<string, unknown>)?.name as string) || "-",
    },
    { key: "amount", title: "金额", render: (val: unknown) => `¥${val}` },
    {
      key: "status",
      title: "状态",
      render: (val: unknown) => {
        const statusMap: Record<
          string,
          { label: string; variant: "default" | "secondary" | "destructive" | "outline" }
        > = {
          pending: { label: "待支付", variant: "secondary" },
          paid: { label: "已支付", variant: "default" },
          refunded: { label: "已退款", variant: "destructive" },
          cancelled: { label: "已取消", variant: "outline" },
        };
        const status = statusMap[val as string] || { label: val as string, variant: "secondary" };
        return <Badge variant={status.variant}>{status.label}</Badge>;
      },
    },
    { key: "createdAt", title: "创建时间" },
  ];

  return (
    <DialogContent className="max-w-4xl">
      <DialogHeader>
        <DialogTitle>使用记录 - {inviteCodeName}</DialogTitle>
      </DialogHeader>
      {isLoading ? (
        <div className="flex items-center justify-center py-8 text-muted-foreground">加载中...</div>
      ) : (
        <DataTable
          columns={columns}
          data={items as Record<string, unknown>[]}
          page={page}
          pageSize={10}
          total={total}
          onPageChange={setPage}
        />
      )}
    </DialogContent>
  );
}

export function InviteCodesPage() {
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [eventId, setEventId] = useState("");
  const [status, setStatus] = useState("");
  const [dateStart, setDateStart] = useState("");
  const [dateEnd, setDateEnd] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [participantsDialogOpen, setParticipantsDialogOpen] = useState(false);
  const [selectedInviteCode, setSelectedInviteCode] = useState<Record<string, unknown> | null>(
    null,
  );
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [inviteCodeToDelete, setInviteCodeToDelete] = useState<string | null>(null);

  const queryClient = useQueryClient();
  const deleteInviteCode = useDeleteInviteCode();

  const { data: eventsData } = useEventList({ pageSize: 100 });
  const events = (eventsData as { items?: unknown[] })?.items ?? [];

  const { data, isLoading } = useInviteCodes({
    eventId: eventId || undefined,
    status: status ? Number(status) : undefined,
    dateStart: dateStart || undefined,
    dateEnd: dateEnd || undefined,
  });
  const items = (data as { items?: unknown[] })?.items ?? [];
  const filtered = (items as Record<string, unknown>[]).filter((c) => {
    if (search && !(c.code as string)?.includes(search) && !(c.desc as string)?.includes(search))
      return false;
    return true;
  });

  const handleDelete = (id: string) => {
    setInviteCodeToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (inviteCodeToDelete) {
      await deleteInviteCode.mutateAsync(inviteCodeToDelete);
      queryClient.invalidateQueries({ queryKey: inviteCodeKeys.all });
      setDeleteDialogOpen(false);
      setInviteCodeToDelete(null);
    }
  };

  const columns = [
    { key: "code", title: "邀请码" },
    { key: "desc", title: "描述", render: (val: unknown) => (val as string) || "-" },
    {
      key: "usage",
      title: "使用情况",
      render: (_: unknown, record: Record<string, unknown>) =>
        `${record.usedCount}/${record.maxUses}`,
    },
    {
      key: "discount",
      title: "折扣",
      render: (val: unknown) => `${val}%`,
    },
    {
      key: "status",
      title: "状态",
      render: (val: unknown) => (
        <Badge variant={val === 1 ? "default" : "secondary"}>{val === 1 ? "启用" : "禁用"}</Badge>
      ),
    },
    {
      key: "expiresAt",
      title: "过期时间",
      render: (val: unknown) =>
        (val as string) ? new Date(val as string).toLocaleDateString() : "永久",
    },
    { key: "createdAt", title: "创建时间" },
    {
      key: "actions",
      title: "操作",
      render: (_: unknown, record: Record<string, unknown>) => (
        <div className="flex gap-2">
          <Dialog
            open={participantsDialogOpen && selectedInviteCode?.id === record.id}
            onOpenChange={(open) => {
              setParticipantsDialogOpen(open);
              if (open) setSelectedInviteCode(record);
              else setSelectedInviteCode(null);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setSelectedInviteCode(record)}>
                <Users className="mr-1 size-4" />
                使用记录
              </Button>
            </DialogTrigger>
            {selectedInviteCode?.id === record.id && (
              <ParticipantsDialog
                inviteCodeId={record.id as string}
                inviteCodeName={record.code as string}
              />
            )}
          </Dialog>
          <Dialog
            open={editDialogOpen && selectedInviteCode?.id === record.id}
            onOpenChange={(open) => {
              setEditDialogOpen(open);
              if (open) setSelectedInviteCode(record);
              else setSelectedInviteCode(null);
            }}
          >
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" onClick={() => setSelectedInviteCode(record)}>
                <Pencil className="mr-1 size-4" />
                编辑
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>编辑邀请码</DialogTitle>
              </DialogHeader>
              {selectedInviteCode?.id === record.id && (
                <InviteCodeForm
                  eventId={eventId}
                  initialData={{
                    id: record.id as string,
                    code: record.code as string,
                    desc: record.desc as string,
                    registrationGroupId: record.registrationGroupId as string,
                    discount: record.discount as number,
                    maxUses: record.maxUses as number,
                    expiresAt: record.expiresAt as string,
                  }}
                  onSuccess={() => {
                    setEditDialogOpen(false);
                    setSelectedInviteCode(null);
                    queryClient.invalidateQueries({ queryKey: inviteCodeKeys.all });
                  }}
                />
              )}
            </DialogContent>
          </Dialog>
          <Button variant="ghost" size="sm" onClick={() => handleDelete(record.id as string)}>
            <Trash2 className="mr-1 size-4" />
            删除
          </Button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold">邀请码列表</h1>
        <Dialog open={createDialogOpen} onOpenChange={setCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-1 size-4" />
              新增邀请码
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>新增邀请码</DialogTitle>
            </DialogHeader>
            <InviteCodeForm
              eventId={eventId}
              onSuccess={() => {
                setCreateDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: inviteCodeKeys.all });
              }}
            />
          </DialogContent>
        </Dialog>
      </div>

      <FilterBar
        searchValue={search}
        onSearchChange={setSearch}
        onSearch={() => setPage(1)}
        onReset={() => {
          setSearch("");
          setEventId("");
          setStatus("");
          setDateStart("");
          setDateEnd("");
          setPage(1);
        }}
        searchPlaceholder="搜索邀请码或描述..."
      >
        <FilterItem label="赛事">
          <Select
            value={eventId}
            onValueChange={(value) => {
              setEventId(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="全部赛事" />
            </SelectTrigger>
            <SelectContent>
              {(events as Record<string, unknown>[]).map((event) => (
                <SelectItem key={event.id as string} value={event.id as string}>
                  {event.name as string}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </FilterItem>
        <FilterItem label="状态">
          <Select
            value={status}
            onValueChange={(value) => {
              setStatus(value);
              setPage(1);
            }}
          >
            <SelectTrigger>
              <SelectValue placeholder="全部状态" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">启用</SelectItem>
              <SelectItem value="0">禁用</SelectItem>
            </SelectContent>
          </Select>
        </FilterItem>
        <FilterItem label="创建时间起">
          <Input
            type="date"
            value={dateStart}
            onChange={(e) => {
              setDateStart(e.target.value);
              setPage(1);
            }}
          />
        </FilterItem>
        <FilterItem label="创建时间止">
          <Input
            type="date"
            value={dateEnd}
            onChange={(e) => {
              setDateEnd(e.target.value);
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
          data={filtered as unknown as Record<string, unknown>[]}
          page={page}
          pageSize={10}
          total={filtered.length}
          onPageChange={setPage}
        />
      )}

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="删除邀请码"
        description="确定要删除该邀请码吗？此操作不可撤销。"
        onConfirm={confirmDelete}
        confirmText="删除"
        variant="destructive"
        loading={deleteInviteCode.isPending}
      />
    </div>
  );
}
