import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  useCreateOrganizer,
  useOrganizerDetail,
  useUpdateOrganizer,
} from "@/api/modules/organizers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { DatePicker } from "@/components/ui/date-picker";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const organizerSchema = z.object({
  loginAccount: z.string().min(1, "请输入登录账号"),
  password: z.string().max(20).optional(),
  name: z.string().min(1, "请输入组委会名称"),
  contact: z.string().min(1, "请输入联系人"),
  phone: z.string().min(1, "请输入联系电话"),
  backupContact: z.string().min(1, "请输入备用联系人"),
  backupPhone: z.string().min(1, "请输入备用电话"),
  certificateNo: z.string().min(1, "请输入资质证书编号"),
  eventDate: z.string().min(1, "请选择赛事时间"),
  province: z.string().min(1, "请输入省份"),
  city: z.string().min(1, "请输入城市"),
  address: z.string().min(1, "请输入详细地址"),
  eventScale: z.number().min(1, "赛事规模至少为1"),
  eventItems: z.string().min(1, "请输入赛事项目"),
  operator: z.string().optional(),
  email: z.string().email("请输入有效的邮箱"),
  remark: z.string().optional(),
});

type OrganizerFormValues = z.infer<typeof organizerSchema>;

function FormFieldError({ errors }: { errors: unknown }) {
  const errorList = errors as { message?: string }[] | undefined;
  if (!errorList || errorList.length === 0) return null;
  return <p className="text-xs text-destructive">{errorList[0]?.message}</p>;
}

function getDefaultValues(): OrganizerFormValues {
  return {
    loginAccount: "",
    password: "",
    name: "",
    contact: "",
    phone: "",
    backupContact: "",
    backupPhone: "",
    certificateNo: "",
    eventDate: "",
    province: "",
    city: "",
    address: "",
    eventScale: 100,
    eventItems: "",
    operator: "",
    email: "",
    remark: "",
  };
}

function detailToFormValues(detail: Record<string, unknown>): OrganizerFormValues {
  const eventItems = detail.eventItems;
  let eventItemsStr = "";
  if (Array.isArray(eventItems)) {
    eventItemsStr = (eventItems as string[]).join(",");
  } else if (eventItems && typeof eventItems === "object") {
    eventItemsStr = Object.values(eventItems as Record<string, unknown>).join(",");
  }

  return {
    loginAccount: (detail.loginAccount as string) ?? "",
    password: "",
    name: (detail.name as string) ?? "",
    contact: (detail.contact as string) ?? "",
    phone: (detail.phone as string) ?? "",
    backupContact: (detail.backupContact as string) ?? "",
    backupPhone: (detail.backupPhone as string) ?? "",
    certificateNo: (detail.certificateNo as string) ?? "",
    eventDate: (detail.eventDate as string) ?? "",
    province: (detail.province as string) ?? "",
    city: (detail.city as string) ?? "",
    address: (detail.address as string) ?? "",
    eventScale: Number(detail.eventScale) || 100,
    eventItems: eventItemsStr,
    operator: (detail.operator as string) ?? "",
    email: (detail.email as string) ?? "",
    remark: (detail.remark as string) ?? "",
  };
}

function formValuesToPayload(values: OrganizerFormValues, isEdit: boolean) {
  const eventItems = values.eventItems
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

  const base = {
    loginAccount: values.loginAccount,
    name: values.name,
    contact: values.contact,
    phone: values.phone,
    backupContact: values.backupContact,
    backupPhone: values.backupPhone,
    certificateNo: values.certificateNo,
    eventDate: values.eventDate,
    province: values.province,
    city: values.city,
    address: values.address,
    eventScale: values.eventScale,
    eventItems,
    operator: values.operator || undefined,
    email: values.email,
    remark: values.remark || undefined,
  };

  if (isEdit) {
    return values.password ? { ...base, password: values.password } : base;
  }
  return { ...base, password: values.password };
}

interface OrganizerFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  organizerId?: string | null;
}

export function OrganizerFormDialog({ open, onOpenChange, organizerId }: OrganizerFormDialogProps) {
  const isEdit = !!organizerId;
  const [submitError, setSubmitError] = useState("");

  const createMutation = useCreateOrganizer();
  const updateMutation = useUpdateOrganizer();
  const { data: detailData, isLoading: isLoadingDetail } = useOrganizerDetail(organizerId ?? "");

  const form = useForm({
    defaultValues: getDefaultValues(),
    onSubmit: async ({ value }) => {
      setSubmitError("");
      if (!isEdit && (!value.password || value.password.length < 6)) {
        setSubmitError("请输入密码，长度6-20位");
        return;
      }
      try {
        const payload = formValuesToPayload(value, isEdit);
        if (isEdit) {
          await updateMutation.mutateAsync({
            id: organizerId!,
            body: payload as never,
          });
        } else {
          await createMutation.mutateAsync(payload as never);
        }
        onOpenChange(false);
        form.reset();
      } catch (e: unknown) {
        setSubmitError((e as Error)?.message ?? (isEdit ? "更新失败" : "创建失败"));
      }
    },
    validators: {
      onSubmit: organizerSchema,
    },
  });

  useEffect(() => {
    if (open) {
      setSubmitError("");
      if (isEdit && detailData) {
        const vals = detailToFormValues(detailData as Record<string, unknown>);
        form.reset(vals);
      } else if (!isEdit) {
        form.reset(getDefaultValues());
      }
    }
  }, [open, isEdit, detailData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑组委会" : "新增组委会"}</DialogTitle>
        </DialogHeader>

        {isEdit && isLoadingDetail ? (
          <div className="flex items-center justify-center py-8 text-muted-foreground">
            加载中...
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              e.stopPropagation();
              form.handleSubmit();
            }}
            className="space-y-4"
          >
            {submitError && (
              <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                {submitError}
              </div>
            )}

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <form.Field name="loginAccount">
                {(field) => (
                  <div className="space-y-2">
                    <Label>登录账号 *</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入登录账号"
                      disabled={isEdit}
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="password">
                {(field) => (
                  <div className="space-y-2">
                    <Label>{isEdit ? "登录密码（留空则不修改）" : "登录密码 *"}</Label>
                    <Input
                      type="password"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder={isEdit ? "留空则不修改" : "请输入密码，6-20位"}
                      maxLength={20}
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label>组委会名称 *</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入组委会名称"
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="email">
                {(field) => (
                  <div className="space-y-2">
                    <Label>邮箱 *</Label>
                    <Input
                      type="email"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入邮箱"
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="contact">
                {(field) => (
                  <div className="space-y-2">
                    <Label>联系人 *</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入联系人"
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="phone">
                {(field) => (
                  <div className="space-y-2">
                    <Label>联系电话 *</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入联系电话"
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="backupContact">
                {(field) => (
                  <div className="space-y-2">
                    <Label>备用联系人 *</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入备用联系人"
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="backupPhone">
                {(field) => (
                  <div className="space-y-2">
                    <Label>备用电话 *</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入备用电话"
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="certificateNo">
                {(field) => (
                  <div className="space-y-2">
                    <Label>资质证书编号 *</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入资质证书编号"
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="eventDate">
                {(field) => (
                  <div className="space-y-2">
                    <Label>赛事时间 *</Label>
                    <DatePicker
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(value) => field.handleChange(value)}
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="province">
                {(field) => (
                  <div className="space-y-2">
                    <Label>省份 *</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="如：广东"
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="city">
                {(field) => (
                  <div className="space-y-2">
                    <Label>城市 *</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="如：深圳"
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="eventScale">
                {(field) => (
                  <div className="space-y-2">
                    <Label>赛事规模（人数）*</Label>
                    <Input
                      type="number"
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(Number(e.target.value))}
                      min={1}
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

              <form.Field name="operator">
                {(field) => (
                  <div className="space-y-2">
                    <Label>运营单位</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入运营单位"
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="address">
              {(field) => (
                <div className="space-y-2">
                  <Label>详细地址 *</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入详细地址"
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="eventItems">
              {(field) => (
                <div className="space-y-2">
                  <Label>赛事项目 *（逗号分隔）</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="如：马拉松,半程马拉松,迷你跑"
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="remark">
              {(field) => (
                <div className="space-y-2">
                  <Label>备注</Label>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="可选"
                    rows={2}
                  />
                </div>
              )}
            </form.Field>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                取消
              </Button>
              <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
                {([canSubmit, isSubmitting]) => (
                  <Button type="submit" disabled={!canSubmit || isSubmitting}>
                    {isSubmitting
                      ? isEdit
                        ? "保存中..."
                        : "创建中..."
                      : isEdit
                        ? "保存修改"
                        : "创建组委会"}
                  </Button>
                )}
              </form.Subscribe>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
