import type { Database } from "./database.types";
import type { CloudbaseSdkClient } from "./internal-types";

export type TableName = keyof Database["public"]["Tables"] & string;
export type Row<Table extends TableName> = Database["public"]["Tables"][Table]["Row"];
export type Insert<Table extends TableName> = Database["public"]["Tables"][Table]["Insert"];
export type Update<Table extends TableName> = Database["public"]["Tables"][Table]["Update"];

export type RdbResult<RowType> = {
  data: RowType[] | null;
  error: unknown | null;
};

export type TypedRdbQuery<RowType> = {
  select(): TypedRdbQuery<RowType>;
  select(columns: "*"): TypedRdbQuery<RowType>;
  limit(count: number): Promise<RdbResult<RowType>>;
};

export type TypedRdbFilter<RowType> = {
  eq<Column extends keyof RowType & string>(
    column: Column,
    value: RowType[Column],
  ): Promise<RdbResult<RowType>>;
};

export type TypedRdbTable<Table extends TableName> = TypedRdbQuery<Row<Table>> & {
  insert(values: Insert<Table>): Promise<RdbResult<Row<Table>>>;
  update(values: Update<Table>): TypedRdbFilter<Row<Table>>;
  delete(): TypedRdbFilter<Row<Table>>;
};

type TypedRdbTables = {
  [Table in TableName]: TypedRdbTable<Table>;
};

type UnionToIntersection<Union> = (Union extends unknown ? (value: Union) => void : never) extends (
  value: infer Intersection,
) => void
  ? Intersection
  : never;

type TypedRdbFrom = UnionToIntersection<
  {
    [Table in TableName]: (table: Table) => TypedRdbTables[Table];
  }[TableName]
>;

export type TypedRdb = {
  from: TypedRdbFrom;
};

export async function getRows<Table extends TableName>(
  client: CloudbaseSdkClient,
  table: Table,
  query: Partial<Row<Table>> = {},
): Promise<Row<Table>[]> {
  const result = await client.database().collection(table).where(query).get();
  const data = result.data as unknown;
  if (Array.isArray(data)) return data as Row<Table>[];
  if (data && typeof data === "object" && "list" in data && Array.isArray(data.list)) {
    return data.list as Row<Table>[];
  }
  return [];
}

export function typedCollection<Table extends TableName>(client: CloudbaseSdkClient, table: Table) {
  return client.database().collection(table) as ReturnType<
    ReturnType<CloudbaseSdkClient["database"]>["collection"]
  > & {
    __cloudbaseTypes?: {
      row: Row<Table>;
      insert: Insert<Table>;
      update: Update<Table>;
    };
  };
}

export function typedRdb(client: CloudbaseSdkClient): TypedRdb {
  return {
    from: ((table: TableName) => {
      const collection = client.database().collection(table);
      return {
        ...typedQuery<Row<typeof table>>(collection),
        insert(values: Insert<typeof table>) {
          return collection.add(values).then(() => ({ data: null, error: null }));
        },
        update(values: Update<typeof table>) {
          return typedFilter<Row<typeof table>>((query) => collection.where(query).update(values));
        },
        delete() {
          return typedFilter<Row<typeof table>>((query) => collection.where(query).remove());
        },
      };
    }) as TypedRdbFrom,
  };
}

function typedQuery<RowType>(
  query: ReturnType<ReturnType<CloudbaseSdkClient["database"]>["collection"]>,
): TypedRdbQuery<RowType> {
  return {
    select() {
      return typedQuery<RowType>(query);
    },
    limit(count: number) {
      return query
        .limit(count)
        .get()
        .then((result) => ({
          data: toRows<RowType>(result.data),
          error: null,
        }));
    },
  };
}

function toRows<RowType>(value: unknown): RowType[] | null {
  if (Array.isArray(value)) return value as RowType[];
  if (value && typeof value === "object" && "list" in value && Array.isArray(value.list)) {
    return value.list as RowType[];
  }
  return null;
}

function typedFilter<RowType>(
  execute: (query: Record<string, unknown>) => Promise<unknown>,
): TypedRdbFilter<RowType> {
  return {
    eq(column, value) {
      return execute({ [column]: value }).then(() => ({ data: null, error: null }));
    },
  };
}
