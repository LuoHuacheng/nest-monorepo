import { useForm } from "@tanstack/react-form";
import { useNavigate } from "@tanstack/react-router";
import { ArrowLeft, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { z } from "zod";
import { useCreateEvent, useEventDetail, useUpdateEvent } from "@/api/modules/events";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

const registrationGroupSchema = z.object({
  groupType: z.string().min(1, "请输入组别类型"),
  specName: z.string().min(1, "请输入规格名称"),
  specDescription: z.string().optional(),
  price: z.number().min(0, "价格不能为负"),
  genderLimit: z.string().min(1, "请选择性别限制"),
  minAge: z.number().min(0, "年龄不能为负"),
  maxAge: z.number().min(0, "年龄不能为负"),
  quota: z.number().min(1, "名额至少为1"),
});

const eventSchema = z.object({
  name: z.string().min(1, "请输入赛事名称"),
  category: z.string().min(1, "请输入赛事分类"),
  startDate: z.string().min(1, "请选择比赛日期"),
  endDate: z.string().min(1, "请选择结束日期"),
  registrationStartDate: z.string().min(1, "请选择报名开始日期"),
  registrationEndDate: z.string().min(1, "请选择报名截止日期"),
  province: z.string().min(1, "请输入省份"),
  city: z.string().min(1, "请输入城市"),
  address: z.string().min(1, "请输入详细地址"),
  tags: z.string().optional(),
  packetPickupTime: z.string().min(1, "请选择领物时间"),
  packetPickupLocation: z.string().min(1, "请输入领物地点"),
  coverImages: z.string().min(1, "请输入封面图片URL"),
  isHot: z.string().optional(),
  attributes: z.string().optional(),
  maxParticipants: z.number().min(1, "最大参与人数至少为1"),
  organizerId: z.string().min(1, "请输入组委会ID"),
  registrationGroups: z.array(registrationGroupSchema).min(1, "至少需要一个报名组别"),
  description: z.string().min(1, "请输入赛事描述").max(500, "描述不超过500字"),
  remark: z.string().optional(),
  competitionRules: z.string().optional(),
  entryStatement: z.string().optional(),
  raceRoute: z.string().optional(),
  registrationNotice: z.string().optional(),
  pickupNotice: z.string().optional(),
});

type EventFormValues = z.infer<typeof eventSchema>;

interface EventFormPageProps {
  eventId?: string;
}

const categoryOptions = [
  "马拉松赛",
  "路跑活动",
  "越野赛",
  "定向赛",
  "自行车赛",
  "篮球赛",
  "羽毛球",
  "展演",
  "乒乓球",
  "游泳",
  "线上赛",
  "徒步",
  "足球",
  "田径",
  "其他",
];

const attributeOptions = [
  { value: "online", label: "线上赛" },
  { value: "shuttle_bus", label: "提供摆渡车" },
  { value: "pacer_recruitment", label: "招募配速员赛事" },
];

const marathonSpecNameOptions = ["全马", "半马"];

const genderOptions = [
  { value: "不限", label: "不限" },
  { value: "男", label: "男" },
  { value: "女", label: "女" },
];

function getDefaultValues(): EventFormValues {
  return {
    name: "",
    category: "",
    startDate: "",
    endDate: "",
    registrationStartDate: "",
    registrationEndDate: "",
    province: "",
    city: "",
    address: "",
    tags: "",
    packetPickupTime: "",
    packetPickupLocation: "",
    coverImages: "",
    isHot: "false",
    attributes: "",
    maxParticipants: 100,
    organizerId: "",
    registrationGroups: [
      {
        groupType: "",
        specName: "",
        specDescription: "",
        price: 0,
        genderLimit: "不限",
        minAge: 0,
        maxAge: 100,
        quota: 100,
      },
    ],
    description: "",
    remark: "",
    competitionRules: "",
    entryStatement: "",
    raceRoute: "",
    registrationNotice: "",
    pickupNotice: "",
  };
}

function eventToFormValues(event: Record<string, unknown>): EventFormValues {
  return {
    name: (event.name as string) ?? "",
    category: (event.category as string) ?? "",
    startDate: (event.startDate as string) ?? "",
    endDate: (event.endDate as string) ?? "",
    registrationStartDate: (event.registrationStartDate as string) ?? "",
    registrationEndDate: (event.registrationEndDate as string) ?? "",
    province: (event.province as string) ?? "",
    city: (event.city as string) ?? "",
    address: (event.address as string) ?? "",
    tags: ((event.tags as string[]) ?? []).join(","),
    packetPickupTime: (event.packetPickupTime as string) ?? "",
    packetPickupLocation: (event.packetPickupLocation as string) ?? "",
    coverImages: ((event.coverImages as string[]) ?? []).join(","),
    isHot: event.isHot ? "true" : "false",
    attributes: ((event.attributes as string[]) ?? []).join(","),
    maxParticipants: (event.maxParticipants as number) ?? 100,
    organizerId: (event.organizerId as string) ?? "",
    registrationGroups:
      (event.registrationGroups as EventFormValues["registrationGroups"])?.map((g) => ({
        groupType: g.groupType ?? "",
        specName: g.specName ?? "",
        specDescription: g.specDescription ?? "",
        price: g.price ?? 0,
        genderLimit: g.genderLimit ?? "不限",
        minAge: g.minAge ?? 0,
        maxAge: g.maxAge ?? 100,
        quota: g.quota ?? 100,
      })) ?? getDefaultValues().registrationGroups,
    description: (event.description as string) ?? "",
    remark: (event.remark as string) ?? "",
    competitionRules: (event.competitionRules as string) ?? "",
    entryStatement: (event.entryStatement as string) ?? "",
    raceRoute: (event.raceRoute as string) ?? "",
    registrationNotice: (event.registrationNotice as string) ?? "",
    pickupNotice: (event.pickupNotice as string) ?? "",
  };
}

function formValuesToPayload(values: EventFormValues) {
  return {
    name: values.name,
    category: values.category,
    startDate: values.startDate,
    endDate: values.endDate,
    registrationStartDate: values.registrationStartDate,
    registrationEndDate: values.registrationEndDate,
    province: values.province,
    city: values.city,
    address: values.address,
    tags: values.tags
      ? values.tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    packetPickupTime: values.packetPickupTime,
    packetPickupLocation: values.packetPickupLocation,
    coverImages: values.coverImages
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean),
    isHot: values.isHot === "true",
    attributes: values.attributes
      ? values.attributes
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean)
      : [],
    maxParticipants: values.maxParticipants,
    organizerId: values.organizerId,
    registrationGroups: values.registrationGroups.map((g) => ({
      ...g,
      specDescription: g.specDescription || undefined,
    })),
    description: values.description,
    remark: values.remark || undefined,
    competitionRules: values.competitionRules || undefined,
    entryStatement: values.entryStatement || undefined,
    raceRoute: values.raceRoute || undefined,
    registrationNotice: values.registrationNotice || undefined,
    pickupNotice: values.pickupNotice || undefined,
  };
}

function FormFieldError({ errors }: { errors: unknown }) {
  const errorList = errors as { message?: string }[] | undefined;
  if (!errorList || errorList.length === 0) return null;
  return <p className="text-xs text-destructive">{errorList[0]?.message}</p>;
}

export function EventFormPage({ eventId }: EventFormPageProps) {
  const isEdit = !!eventId;
  const navigate = useNavigate();
  const createMutation = useCreateEvent();
  const updateMutation = useUpdateEvent();
  const { data: eventData, isLoading } = useEventDetail(eventId ?? "");
  const [submitError, setSubmitError] = useState("");

  const defaultValues =
    isEdit && eventData
      ? eventToFormValues(eventData as Record<string, unknown>)
      : getDefaultValues();

  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      setSubmitError("");
      try {
        const payload = formValuesToPayload(value);
        if (isEdit) {
          await updateMutation.mutateAsync({ id: eventId, body: payload });
        } else {
          await createMutation.mutateAsync(payload as never);
        }
        navigate({ to: "/events/list" });
      } catch (e: unknown) {
        setSubmitError((e as Error)?.message ?? (isEdit ? "更新失败" : "创建失败"));
      }
    },
    validators: {
      onSubmit: eventSchema,
    },
  });

  if (isEdit && isLoading) {
    return (
      <div className="flex items-center justify-center py-8 text-muted-foreground">加载中...</div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="sm" onClick={() => navigate({ to: "/events/list" })}>
          <ArrowLeft className="mr-2 size-4" />
          返回
        </Button>
        <h1 className="text-2xl font-bold">{isEdit ? "编辑赛事" : "新增赛事"}</h1>
      </div>

      {submitError && (
        <div className="rounded-lg border border-destructive/20 bg-destructive/5 px-4 py-3 text-sm text-destructive">
          {submitError}
        </div>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          e.stopPropagation();
          form.handleSubmit();
        }}
        className="space-y-8"
      >
        {/* 基本信息 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">基本信息</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            <form.Field name="name">
              {(field) => (
                <div className="space-y-2">
                  <Label>赛事名称 *</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入赛事名称"
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="category">
              {(field) => (
                <div className="space-y-2">
                  <Label>赛事分类 *</Label>
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="请选择赛事分类" />
                    </SelectTrigger>
                    <SelectContent>
                      {categoryOptions.map((o) => (
                        <SelectItem key={o} value={o}>
                          {o}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="maxParticipants">
              {(field) => (
                <div className="space-y-2">
                  <Label>最大参与人数 *</Label>
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

            <form.Field name="organizerId">
              {(field) => (
                <div className="space-y-2">
                  <Label>组委会ID *</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入组委会ID"
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="isHot">
              {(field) => (
                <div className="space-y-2">
                  <Label>是否热门</Label>
                  <Select value={field.state.value} onValueChange={(v) => field.handleChange(v)}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="false">否</SelectItem>
                      <SelectItem value="true">是</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </form.Field>

            <form.Field name="attributes">
              {(field) => {
                const selected = field.state.value
                  ? field.state.value.split(",").filter(Boolean)
                  : [];
                return (
                  <div className="space-y-2">
                    <Label>赛事属性</Label>
                    <div className="flex flex-wrap gap-4">
                      {attributeOptions.map((opt) => (
                        <label key={opt.value} className="flex items-center gap-2 cursor-pointer">
                          <input
                            type="checkbox"
                            className="size-4 rounded border-gray-300"
                            checked={selected.includes(opt.value)}
                            onChange={(e) => {
                              const next = e.target.checked
                                ? [...selected, opt.value]
                                : selected.filter((v) => v !== opt.value);
                              field.handleChange(next.join(","));
                            }}
                          />
                          <span className="text-sm">{opt.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                );
              }}
            </form.Field>
          </div>

          <form.Field name="description">
            {(field) => (
              <div className="space-y-2">
                <Label>赛事描述 * (最多500字)</Label>
                <Textarea
                  value={field.state.value}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                  placeholder="请输入赛事描述"
                  rows={3}
                />
                <p className="text-xs text-muted-foreground">{field.state.value.length}/500</p>
                <FormFieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </section>

        {/* 时间信息 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">时间信息</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
            <form.Field name="startDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>比赛日期 *</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="endDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>结束日期 *</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="registrationStartDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>报名开始 *</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="registrationEndDate">
              {(field) => (
                <div className="space-y-2">
                  <Label>报名截止 *</Label>
                  <Input
                    type="date"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>
        </section>

        {/* 地点信息 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">地点信息</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
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
          </div>
        </section>

        {/* 领物信息 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">领物信息</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field name="packetPickupTime">
              {(field) => (
                <div className="space-y-2">
                  <Label>领物时间 *</Label>
                  <Input
                    type="datetime-local"
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>

            <form.Field name="packetPickupLocation">
              {(field) => (
                <div className="space-y-2">
                  <Label>领物地点 *</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="请输入领物地点"
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>
        </section>

        {/* 标签与图片 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">标签与图片</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field name="tags">
              {(field) => (
                <div className="space-y-2">
                  <Label>标签（逗号分隔）</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="如：马拉松,城市跑,户外"
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="coverImages">
              {(field) => (
                <div className="space-y-2">
                  <Label>封面图片URL（逗号分隔，最多2张） *</Label>
                  <Input
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="图片URL1,图片URL2"
                  />
                  <FormFieldError errors={field.state.meta.errors} />
                </div>
              )}
            </form.Field>
          </div>
        </section>

        {/* 报名组别 */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold">报名组别</h2>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => {
                const groups = form.getFieldValue(
                  "registrationGroups",
                ) as EventFormValues["registrationGroups"];
                form.setFieldValue("registrationGroups", [
                  ...groups,
                  {
                    groupType: "",
                    specName: "",
                    specDescription: "",
                    price: 0,
                    genderLimit: "不限",
                    minAge: 0,
                    maxAge: 100,
                    quota: 100,
                  },
                ]);
              }}
            >
              <Plus className="mr-1 size-4" />
              添加组别
            </Button>
          </div>

          <form.Field name="registrationGroups">
            {(field) => (
              <div className="space-y-4">
                {(field.state.value as EventFormValues["registrationGroups"]).map(
                  (_group, index) => (
                    <div key={index} className="space-y-4 rounded-lg border p-4">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">组别 {index + 1}</h3>
                        {field.state.value.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              const groups = [
                                ...(field.state.value as EventFormValues["registrationGroups"]),
                              ];
                              groups.splice(index, 1);
                              field.handleChange(groups);
                            }}
                          >
                            <Trash2 className="size-4 text-destructive" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
                        <div className="space-y-2">
                          <Label>组别类型 *</Label>
                          <Input
                            value={field.state.value[index].groupType}
                            onChange={(e) => {
                              const groups = [
                                ...(field.state.value as EventFormValues["registrationGroups"]),
                              ];
                              groups[index] = { ...groups[index], groupType: e.target.value };
                              field.handleChange(groups);
                            }}
                            placeholder="如：个人组"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>规格名称 *</Label>
                          {form.getFieldValue("category") === "马拉松赛" ? (
                            <Select
                              value={field.state.value[index].specName}
                              onValueChange={(v) => {
                                const groups = [
                                  ...(field.state.value as EventFormValues["registrationGroups"]),
                                ];
                                groups[index] = { ...groups[index], specName: v };
                                field.handleChange(groups);
                              }}
                            >
                              <SelectTrigger className="w-full">
                                <SelectValue placeholder="请选择规格" />
                              </SelectTrigger>
                              <SelectContent>
                                {marathonSpecNameOptions.map((o) => (
                                  <SelectItem key={o} value={o}>
                                    {o}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          ) : (
                            <Input
                              value={field.state.value[index].specName}
                              onChange={(e) => {
                                const groups = [
                                  ...(field.state.value as EventFormValues["registrationGroups"]),
                                ];
                                groups[index] = { ...groups[index], specName: e.target.value };
                                field.handleChange(groups);
                              }}
                              placeholder="请输入规格名称"
                            />
                          )}
                        </div>
                        <div className="space-y-2">
                          <Label>价格（元）*</Label>
                          <Input
                            type="number"
                            value={field.state.value[index].price}
                            onChange={(e) => {
                              const groups = [
                                ...(field.state.value as EventFormValues["registrationGroups"]),
                              ];
                              groups[index] = {
                                ...groups[index],
                                price: Number(e.target.value),
                              };
                              field.handleChange(groups);
                            }}
                            min={0}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>性别限制 *</Label>
                          <Select
                            value={field.state.value[index].genderLimit}
                            onValueChange={(v) => {
                              const groups = [
                                ...(field.state.value as EventFormValues["registrationGroups"]),
                              ];
                              groups[index] = { ...groups[index], genderLimit: v };
                              field.handleChange(groups);
                            }}
                          >
                            <SelectTrigger className="w-full">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {genderOptions.map((o) => (
                                <SelectItem key={o.value} value={o.value}>
                                  {o.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label>最小年龄 *</Label>
                          <Input
                            type="number"
                            value={field.state.value[index].minAge}
                            onChange={(e) => {
                              const groups = [
                                ...(field.state.value as EventFormValues["registrationGroups"]),
                              ];
                              groups[index] = {
                                ...groups[index],
                                minAge: Number(e.target.value),
                              };
                              field.handleChange(groups);
                            }}
                            min={0}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>最大年龄 *</Label>
                          <Input
                            type="number"
                            value={field.state.value[index].maxAge}
                            onChange={(e) => {
                              const groups = [
                                ...(field.state.value as EventFormValues["registrationGroups"]),
                              ];
                              groups[index] = {
                                ...groups[index],
                                maxAge: Number(e.target.value),
                              };
                              field.handleChange(groups);
                            }}
                            min={0}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>名额 *</Label>
                          <Input
                            type="number"
                            value={field.state.value[index].quota}
                            onChange={(e) => {
                              const groups = [
                                ...(field.state.value as EventFormValues["registrationGroups"]),
                              ];
                              groups[index] = {
                                ...groups[index],
                                quota: Number(e.target.value),
                              };
                              field.handleChange(groups);
                            }}
                            min={1}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label>规格描述</Label>
                          <Input
                            value={field.state.value[index].specDescription ?? ""}
                            onChange={(e) => {
                              const groups = [
                                ...(field.state.value as EventFormValues["registrationGroups"]),
                              ];
                              groups[index] = {
                                ...groups[index],
                                specDescription: e.target.value,
                              };
                              field.handleChange(groups);
                            }}
                            placeholder="可选"
                          />
                        </div>
                      </div>
                    </div>
                  ),
                )}
                <FormFieldError errors={field.state.meta.errors} />
              </div>
            )}
          </form.Field>
        </section>

        {/* 其他信息 */}
        <section className="space-y-4">
          <h2 className="text-lg font-semibold">其他信息</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <form.Field name="competitionRules">
              {(field) => (
                <div className="space-y-2">
                  <Label>竞赛规程</Label>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="可选"
                    rows={3}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="entryStatement">
              {(field) => (
                <div className="space-y-2">
                  <Label>参赛声明</Label>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="可选"
                    rows={3}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="raceRoute">
              {(field) => (
                <div className="space-y-2">
                  <Label>比赛路线</Label>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="可选"
                    rows={3}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="registrationNotice">
              {(field) => (
                <div className="space-y-2">
                  <Label>报名须知</Label>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="可选"
                    rows={3}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="pickupNotice">
              {(field) => (
                <div className="space-y-2">
                  <Label>领物须知</Label>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="可选"
                    rows={3}
                  />
                </div>
              )}
            </form.Field>

            <form.Field name="remark">
              {(field) => (
                <div className="space-y-2">
                  <Label>备注（仅后台可见）</Label>
                  <Textarea
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    placeholder="可选"
                    rows={3}
                  />
                </div>
              )}
            </form.Field>
          </div>
        </section>

        {/* 提交按钮 */}
        <form.Subscribe selector={(state) => [state.canSubmit, state.isSubmitting]}>
          {([canSubmit, isSubmitting]) => {
            let label: string;
            if (isSubmitting) {
              label = isEdit ? "保存中..." : "创建中...";
            } else {
              label = isEdit ? "保存修改" : "创建赛事";
            }

            return (
              <div className="flex justify-end gap-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate({ to: "/events/list" })}
                >
                  取消
                </Button>
                <Button type="submit" disabled={!canSubmit || isSubmitting}>
                  {label}
                </Button>
              </div>
            );
          }}
        </form.Subscribe>
      </form>
    </div>
  );
}
