export type PaginatedResponse<TItem = unknown> = {
  items: TItem[];
  total: number;
  page: number;
  pageSize: number;
};

export type QueryOf<TData extends { query?: unknown }> = NonNullable<TData["query"]>;
export type BodyOf<TData extends { body?: unknown }> = NonNullable<TData["body"]>;

export type WithId<TBody> = {
  id: string;
  body: TBody;
};
