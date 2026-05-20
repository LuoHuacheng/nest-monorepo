import { useForm } from "@tanstack/react-form";
import { useEffect, useState } from "react";
import { z } from "zod";
import {
  useCreateAthleticCenter,
  useAthleticCenterDetail,
  useUpdateAthleticCenter,
} from "@/api/modules/athletic-centers";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

const athleticCenterSchema = z.object({
  name: z.string().min(1, "请输入田管中心名称"),
  loginAccount: z.string().min(1, "请输入登录账号"),
  password: z.string().optional(),
  contact: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  remark: z.string().optional(),
});

type AthleticCenterFormValues = z.infer<typeof athleticCenterSchema>;

function FormFieldError({ errors }: { errors: unknown }) {
  const errorList = errors as { message?: string }[] | undefined;
  if (!errorList || errorList.length === 0) return null;
  return <p className="text-xs text-destructive">{errorList[0]?.message}</p>;
}

function getDefaultValues(): AthleticCenterFormValues {
  return {
    name: "",
    loginAccount: "",
    password: "",
    contact: "",
    phone: "",
    address: "",
    remark: "",
  };
}

function detailToFormValues(detail: Record<string, unknown>): AthleticCenterFormValues {
  return {
    name: (detail.name as string) ?? "",
    loginAccount: (detail.loginAccount as string) ?? "",
    password: "",
    contact: (detail.contact as string) ?? "",
    phone: (detail.phone as string) ?? "",
    address: (detail.address as string) ?? "",
    remark: (detail.remark as string) ?? "",
  };
}

function formValuesToPayload(values: AthleticCenterFormValues, isEdit: boolean) {
  const base = {
    name: values.name,
    loginAccount: values.loginAccount,
    contact: values.contact || undefined,
    phone: values.phone || undefined,
    address: values.address || undefined,
    remark: values.remark || undefined,
  };

  if (isEdit) {
    return values.password ? { ...base, password: values.password } : base;
  }
  return { ...base, password: values.password! };
}

interface AthleticCenterFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  athleticCenterId?: string | null;
}

export function AthleticCenterFormDialog({
  open,
  onOpenChange,
  athleticCenterId,
}: AthleticCenterFormDialogProps) {
  const isEdit = !!athleticCenterId;
  const [submitError, setSubmitError] = useState("");

  const createMutation = useCreateAthleticCenter();
  const updateMutation = useUpdateAthleticCenter();
  const { data: detailData, isLoading: isLoadingDetail } = useAthleticCenterDetail(
    athleticCenterId ?? "",
  );

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
            id: athleticCenterId!,
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
      onSubmit: athleticCenterSchema,
    },
  });

  useEffect(() => {
    if (open) {
      setSubmitError("");
      if (isEdit && detailData) {
        form.reset(detailToFormValues(detailData as Record<string, unknown>));
      } else if (!isEdit) {
        form.reset(getDefaultValues());
      }
    }
  }, [open, isEdit, detailData]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "编辑田管中心" : "新增田管中心"}</DialogTitle>
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
              <form.Field name="name">
                {(field) => (
                  <div className="space-y-2">
                    <Label>田管中心名称 *</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入田管中心名称"
                    />
                    <FormFieldError errors={field.state.meta.errors} />
                  </div>
                )}
              </form.Field>

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

              <form.Field name="contact">
                {(field) => (
                  <div className="space-y-2">
                    <Label>联系人</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入联系人"
                    />
                  </div>
                )}
              </form.Field>

              <form.Field name="phone">
                {(field) => (
                  <div className="space-y-2">
                    <Label>电话</Label>
                    <Input
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      placeholder="请输入电话"
                    />
                  </div>
                )}
              </form.Field>
            </div>

            <form.Field name="address">
              {(field) => (
                <div className="space-y-2">
                  <Label>地址</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入地址"
                  />
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
                        : "创建田管中心"}
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
