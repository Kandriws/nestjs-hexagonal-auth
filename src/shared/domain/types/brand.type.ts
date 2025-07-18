/**
 * Unique symbol used as a brand to differentiate branded types.
 */
declare const __brand: unique symbol;

/**
 * Brand type that adds a unique symbol to a type.
 */
type Brand<B> = { [__brand]: B };

/**
 * Branded type that combines a base type with a brand.
 * @template T - The base type.
 * @template B - The brand.
 */
export type Branded<T, B> = T & Brand<B>;
