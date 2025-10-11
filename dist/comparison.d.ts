/**
 * The type of result that can be returned from a comparison test.
 * This can be a direct value of type T or a function that takes
 * the value being compared and returns a value of type T.
 */
export type ComparisonResult<T> = T | ((value: any) => T);
/**
 * A utility for fluent switch statements. This works
 * similarly to PHP's match expression and is useful when you want
 * to use a ternary operator but have multiple conditions to check.
 *
 * Calling `otherwise` kicks off evaluation of the Comparison chain.
 *
 * Example usage:
 *
 * const result = when(value)
 *   .is('a', () => 'Value is a')
 *   .is('2', () => 'Value is the string "2"')
 *   .is(2, 'Value is the number 2')
 *   .isLike('1', () => 'Value is loosely the string "1"')
 *   .is('b', 'Value is b')
 *   .whenTrue(count === 2, 'Count is exactly 2')
 *   .whenFalse(isValid, () => 'Value is not valid')
 *   .otherwise(() => 'Value is something else');
 *
 * or
 *
 * const result = when()
 *   .is(value === 'a', () => 'Value is a')
 *   .is(otherValue === 'b', 'Other value is b')
 *   .isNot(something, 'Something is not true')
 *   .otherwise('Value is something else');
 *
 * or you can save the comparison for resolving later:
 *
 * const test = whenSomething()
 *   .is(value === 'a', () => 'Value is a')
 *   .is(otherValue === 'b', 'Other value is b')
 *   .isNot(something, 'Something is not true')
 *   .default('Value is something else');
 *
 * // later on...
 * const result = test.against(value);
 */
export declare class Comparison<ResultType> {
  #private;
  private tests;
  private value;
  private fallback;
  static when<ResultType>(value: any): Comparison<ResultType>;
  static whenSomething<ResultType>(): Comparison<ResultType>;
  private constructor();
  isLike(
    comparison: any,
    result: ComparisonResult<ResultType>,
  ): Comparison<ResultType>;
  is(
    comparison: any,
    result: ComparisonResult<ResultType>,
  ): Comparison<ResultType>;
  isNot(
    comparison: any,
    result: ComparisonResult<ResultType>,
  ): Comparison<ResultType>;
  isNotLike(
    comparison: any,
    result: ComparisonResult<ResultType>,
  ): Comparison<ResultType>;
  whenTrue(
    evaluation: ComparisonResult<boolean>,
    result: ComparisonResult<ResultType>,
  ): Comparison<ResultType>;
  whenFalse(
    evaluation: ComparisonResult<boolean>,
    result: ComparisonResult<ResultType>,
  ): Comparison<ResultType>;
  /**
   * Sets the fallback result to be used if no tests pass.
   * @param result The fallback result.
   * @returns The current Comparison instance.
   */
  defaultTo(result: ComparisonResult<ResultType>): Comparison<ResultType>;
  /**
   * Kicks off resolution of the Comparison chain if there is a value to compare against.
   * @param defaultResult
   * @returns ResultType | Comparison<ResultType>
   */
  otherwise(fallback: ComparisonResult<ResultType>): ResultType;
  /**
   * Applies the comparison tests against a specific value and
   * returns the first matching result or the default result.
   * @param value
   */
  against(value: any): ResultType;
}
//# sourceMappingURL=comparison.d.ts.map
