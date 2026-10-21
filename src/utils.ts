import { DatabaseError } from "pg";

const MAX_POSTGRES_INTEGER = 2147483647;

export function parseId(value: unknown): number | undefined {
  if (typeof value !== "string" || !/^\d+$/.test(value)) {
    return undefined;
  }

  const id = Number(value);
  return id > 0 && id <= MAX_POSTGRES_INTEGER ? id : undefined;
}

export function isUniqueViolationError(error: unknown): error is DatabaseError {
  return error instanceof DatabaseError && error.code === "23505";
}

export function isCategoryHasItemsError(
  error: unknown,
): error is DatabaseError {
  return error instanceof DatabaseError && error.code === "23001";
}
