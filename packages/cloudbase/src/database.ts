// oxlint-disable typescript/no-redundant-type-constituents
import type { Database } from "./database.types";

export type TableName = keyof Database["public"]["Tables"] & string;
export type Row<Table extends TableName> = Database["public"]["Tables"][Table]["Row"];
export type Insert<Table extends TableName> = Database["public"]["Tables"][Table]["Insert"];
export type Update<Table extends TableName> = Database["public"]["Tables"][Table]["Update"];

export type RdbError = {
  message: string;
  code?: string;
  details?: string;
  hint?: string;
};

export type RdbResult<RowType> = {
  data: RowType[] | null;
  error: RdbError | null;
};

export type RdbSingleResult<RowType> = {
  data: RowType | null;
  error: RdbError | null;
};

/**
 * Type-only mirror of the native `rdb()` query builder from `@cloudbase/js-sdk`,
 * which is a PostgREST-style client bound to the environment PostgreSQL instance.
 *
 * The runtime is entirely the SDK's; this surface only narrows table names,
 * column names and written values against the generated `Database` types.
 */
export interface RdbBuilder<RowType> extends PromiseLike<RdbResult<RowType>> {
  select(): RdbBuilder<RowType>;
  select(columns: "*"): RdbBuilder<RowType>;
  limit(count: number): RdbBuilder<RowType>;
  order<Column extends keyof RowType & string>(
    column: Column,
    options?: { ascending?: boolean },
  ): RdbBuilder<RowType>;
  eq<Column extends keyof RowType & string>(
    column: Column,
    value: RowType[Column],
  ): RdbBuilder<RowType>;
  single(): PromiseLike<RdbSingleResult<RowType>>;
}

export interface RdbTable<Table extends TableName> {
  select(): RdbBuilder<Row<Table>>;
  select(columns: "*"): RdbBuilder<Row<Table>>;
  insert(values: Insert<Table> | Insert<Table>[]): PromiseLike<RdbResult<Row<Table>>>;
  update(values: Update<Table>): RdbBuilder<Row<Table>>;
  delete(): RdbBuilder<Row<Table>>;
}

export interface TypedRdb {
  from<Table extends TableName>(table: Table): RdbTable<Table>;
}
