import { Type, type TSchema, type Static } from "typebox";

export function StringEnum<T extends readonly string[]>(
  values: T,
  opts?: { default?: T[number]; description?: string }
): TSchema {
  return Type.Unsafe<Static<TSchema>>(
    Type.Union(
      values.map((v) => Type.Literal(v)) as unknown as [TSchema, ...TSchema[]],
      { default: opts?.default, description: opts?.description }
    )
  );
}
