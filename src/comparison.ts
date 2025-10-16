/**
 * The type of result that can be returned from a comparison test.
 * This can be a direct value of type T or a function that takes
 * the value being compared and returns a value of type T.
 */
export type ComparisonResult<InputType, ResultType> =
  | ResultType
  | ((value: InputType) => ResultType);

/**
 * Represents a value to compare against, which can be a direct value
 * of type ComparisonType or a function that takes the value being
 * compared and returns a value of type ComparisonType.
 */
export type ComparisonValue<InputType, ComparisonType> =
  | ComparisonType
  | ((value: InputType) => ComparisonType);

/**
 * Represents a single comparison test within a Comparison chain.
 */
export interface ComparisonTest<InputType, ResultType> {
  passes: (value: InputType) => boolean;
  result: ComparisonResult<InputType, ResultType>;
}

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
export class Comparison<InputType extends any, ResultType extends any> {
  protected tests: ComparisonTest<InputType, ResultType>[] = [];
  protected value: InputType | undefined = undefined;
  protected fallback: ComparisonResult<InputType, ResultType> | undefined =
    undefined;

  static when<InputType, ResultType>(
    value: InputType,
  ): Comparison<InputType, ResultType> {
    return new Comparison<InputType, ResultType>(value);
  }

  static whenSomething<InputType, ResultType>(): Comparison<
    InputType,
    ResultType
  > {
    return new Comparison<InputType, ResultType>();
  }

  protected constructor(value?: InputType) {
    if (value !== undefined) {
      this.value = value;
    }
  }

  isLike<ComparisonType>(
    comparison: ComparisonValue<InputType, ComparisonType>,
    result: ComparisonResult<InputType, ResultType>,
  ): this {
    return this.compare(comparison, result, false, false);
  }

  is<ComparisonType>(
    comparison: ComparisonValue<InputType, ComparisonType>,
    result: ComparisonResult<InputType, ResultType>,
  ): this {
    return this.compare(comparison, result, true, false);
  }

  isNot<ComparisonType>(
    comparison: ComparisonValue<InputType, ComparisonType>,
    result: ComparisonResult<InputType, ResultType>,
  ): this {
    return this.compare(comparison, result, false, true);
  }

  /**
   * Tests for non-strict inequality (loosely not equal).
   *
   * @param comparison  The value to compare against.
   * @param result
   * @returns
   */
  isNotLike<ComparisonType>(
    comparison: ComparisonValue<InputType, ComparisonType>,
    result: ComparisonResult<InputType, ResultType>,
  ): this {
    return this.compare(comparison, result, false, true);
  }

  /**
   * Adds a conditional test that returns its result if the passes function returns true.
   * @param passes  boolean | (value: InputType) => boolean  The a boolean or function that returns a boolean indicating if the test passes.
   * @param result The result to return if the test passes.
   * @returns The current Comparison instance.
   */
  elseWhen(
    passes: ComparisonValue<InputType, boolean>,
    result: ComparisonResult<InputType, ResultType>,
  ): this {
    this.tests.push({ passes: this.toCallable(passes), result });
    return this;
  }

  /**
   * Sets the fallback result to be used if no tests pass.
   * @param result The fallback result.
   * @returns The current Comparison instance.
   */
  defaultTo(result: ComparisonResult<InputType, ResultType>): this {
    this.fallback = result;
    return this;
  }

  /**
   * Kicks off resolution of the Comparison chain if there is a value to compare against.
   * @param defaultResult
   * @returns ResultType | Comparison<ResultType>
   */
  otherwise(fallback: ComparisonResult<InputType, ResultType>): ResultType {
    this.fallback = fallback;

    if (this.value === undefined) {
      throw new Error(
        "Cannot call otherwise on a Comparison without a value. Use defaultTo() and against() instead.",
      );
    }

    return this.against(this.value);
  }

  /**
   * Applies the comparison tests against a specific value and
   * returns the first matching result or the default result.
   * @param value
   */
  against(value: InputType): ResultType {
    if (value === undefined) {
      throw new Error("Cannot compare against an undefined value");
    }

    const passingTest = this.getPassingTest(value);

    if (passingTest) {
      return this.toCallable(passingTest.result)(value);
    }

    if (this.fallback === undefined) {
      throw new Error("No tests matched and no default result was set");
    }

    return this.toCallable(this.fallback)(value);
  }

  protected getPassingTest(value: InputType) {
    return this.tests.find((test) => test.passes(value));
  }

  protected toCallable<In, Out>(
    value: ComparisonValue<In, Out>,
  ): (input: In) => Out {
    if (typeof value === "function") {
      return value as (input: In) => Out;
    }
    return (_input: In) => value;
  }

  /**
   * Adds a comparison to the test chain
   * @param comparison
   * @param result
   * @param strict
   * @param negate
   * @returns
   */
  protected compare<ComparisonType>(
    comparison: ComparisonValue<InputType, ComparisonType>,
    result: ComparisonResult<InputType, ResultType>,
    strict = false,
    negate = false,
  ): this {
    const passes = (value: any) => {
      const comparisonValue = this.toCallable(comparison)(value);
      const isTrue = strict
        ? comparisonValue === value
        : comparisonValue == value;
      return (isTrue && !negate) || (!isTrue && negate);
    };

    this.tests.push({ passes, result });

    return this;
  }
}
