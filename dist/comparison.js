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
export class Comparison {
    static when(value) {
        return new Comparison(value);
    }
    static whenSomething() {
        return new Comparison();
    }
    constructor(value) {
        this.tests = [];
        this.value = undefined;
        this.fallback = undefined;
        this.hasPromises = false;
        if (value !== undefined) {
            this.value = value;
        }
    }
    withPromises() {
        this.hasPromises = true;
        return this;
    }
    isLike(comparison, result) {
        return this.compare(comparison, result, false, false);
    }
    is(comparison, result) {
        return this.compare(comparison, result, true, false);
    }
    isNot(comparison, result) {
        return this.compare(comparison, result, false, true);
    }
    /**
     * Tests for non-strict inequality (loosely not equal).
     *
     * @param comparison  The value to compare against.
     * @param result
     * @returns
     */
    isNotLike(comparison, result) {
        return this.compare(comparison, result, false, true);
    }
    /**
     * Adds a conditional test that returns its result if the passes function returns true.
     * @param passes  boolean | (value: InputType) => boolean  The a boolean or function that returns a boolean indicating if the test passes.
     * @param result The result to return if the test passes.
     * @returns The current Comparison instance.
     */
    elseWhen(passes, result) {
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
    defaultTo(result) {
        this.fallback = result;
        return this;
    }
    /**
     * Kicks off resolution of the Comparison chain if there is a value to compare against.
     * @param defaultResult
     * @returns ResultType | Comparison<ResultType>
     */
    otherwise(fallback) {
        this.fallback = fallback;
        return this.against(this.value);
    }
    /**
     * Applies the comparison tests against a specific value and
     * returns the first matching result or the default result.
     * @param value
     */
    against(input) {
        this.value = input;
        return this.hasPromises ? this.againstAsync() : this.againstSync();
    }
    verify() {
        if (this.value === undefined) {
            throw new Error("Cannot compare against an undefined value");
        }
        if (this.fallback === undefined) {
            throw new Error("No tests matched and no default result was set");
        }
        const value = this.value instanceof Function ? this.value() : this.value;
        return [value, this.toCallable(this.fallback)];
    }
    againstSync() {
        const [value, getFallback] = this.verify();
        for (const test of this.tests) {
            if (test.passes(value)) {
                return test.result(value);
            }
        }
        return getFallback(value);
    }
    async againstAsync() {
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
    async valueFromPromise(value) {
        return value instanceof Promise ? await value : value;
    }
    toCallable(value) {
        if (typeof value === "function") {
            return value;
        }
        return (_input) => value;
    }
    /**
     * Adds a comparison to the test chain
     * @param comparison
     * @param result
     * @param strict
     * @param negate
     * @returns
     */
    compare(comparison, result, strict = false, negate = false) {
        const compareValue = (value, comparisonValue) => {
            const isTrue = strict
                ? comparisonValue === value
                : comparisonValue == value;
            return (isTrue && !negate) || (!isTrue && negate);
        };
        const passes = (value) => {
            const comparisonValue = this.toCallable(comparison)(value);
            return comparisonValue instanceof Promise
                ? comparisonValue.then((resolved) => compareValue(value, resolved))
                : compareValue(value, comparisonValue);
        };
        this.tests.push({ passes, result: this.toCallable(result) });
        return this;
    }
}
//# sourceMappingURL=comparison.js.map