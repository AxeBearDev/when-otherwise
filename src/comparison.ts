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
  | ((value: InputType) => ComparisonType)
  | ((value: InputType) => Promise<ComparisonType>);

/**
 * Represents a value that can be compared against. If it's a function,
 * it will be called to get the actual value.
 */
export type ComparableType<T> = T | (() => T);

/**
 * Represents a single comparison test within a Comparison chain.
 */
export interface ComparisonTest<InputType, ResultType> {
  passes: (value: InputType) => boolean | Promise<boolean>;
  result: (value: InputType) => ResultType | Promise<ResultType>;
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
  protected value: ComparableType<InputType> | undefined = undefined;
  protected fallback: ComparisonResult<InputType, ResultType> | undefined =
    undefined;
  protected hasPromises = false;

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

  protected constructor(value?: ComparableType<InputType>) {
    if (value !== undefined) {
      this.value = value;
    }
  }

  withPromises(): this {
    this.hasPromises = true;
    return this;
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
    this.tests.push({
      passes: this.toCallable(passes),
      result: this.toCallable(result),
    });
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
  otherwise(
    fallback: ComparisonResult<InputType, ResultType>,
  ): ResultType | Promise<ResultType> {
    this.fallback = fallback;
    return this.against(this.value);
  }

  /**
   * Applies the comparison tests against a specific value and
   * returns the first matching result or the default result.
   * @param value
   */
  against(
    input: ComparableType<InputType> | undefined,
  ): ResultType | Promise<ResultType> {
    this.value = input;
    return this.hasPromises ? this.againstAsync() : this.againstSync();
  }

  protected verify(): [InputType, (value: InputType) => ResultType] {
    if (this.value === undefined) {
      throw new Error("Cannot compare against an undefined value");
    }

    if (this.fallback === undefined) {
      throw new Error("No tests matched and no default result was set");
    }

    const value = this.value instanceof Function ? this.value() : this.value;

    return [value, this.toCallable(this.fallback)];
  }

  protected againstSync(): ResultType {
    const [value, getFallback] = this.verify();

    for (const test of this.tests) {
      if (test.passes(value)) {
        return test.result(value) as ResultType;
      }
    }

    return getFallback(value) as ResultType;
  }

  protected async againstAsync(): Promise<ResultType> {
    const [maybeValue, getFallback] = this.verify();

    const value = await this.valueFromPromise(maybeValue);

    for (const test of this.tests) {
      const passed = await this.valueFromPromise(test.passes(value));

      if (passed) {
        const result = await this.valueFromPromise(test.result(value));
        return result;
      }
    }

    return this.valueFromPromise(getFallback(value));
  }

  protected async valueFromPromise<T>(value: T | Promise<T>): Promise<T> {
    return value instanceof Promise ? await value : value;
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
    const compareValue = (value: InputType, comparisonValue: any) => {
      const isTrue = strict
        ? comparisonValue === value
        : comparisonValue == value;
      return (isTrue && !negate) || (!isTrue && negate);
    };

    const passes = (value: any) => {
      const comparisonValue = this.toCallable(comparison)(value);

      return comparisonValue instanceof Promise
        ? comparisonValue.then((resolved) => compareValue(value, resolved))
        : compareValue(value, comparisonValue);
    };

    this.tests.push({ passes, result: this.toCallable(result) });

    return this;
  }
}
