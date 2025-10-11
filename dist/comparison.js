var __classPrivateFieldGet = (this && this.__classPrivateFieldGet) || function (receiver, state, kind, f) {
    if (kind === "a" && !f) throw new TypeError("Private accessor was defined without a getter");
    if (typeof state === "function" ? receiver !== state || !f : !state.has(receiver)) throw new TypeError("Cannot read private member from an object whose class did not declare it");
    return kind === "m" ? f : kind === "a" ? f.call(receiver) : f ? f.value : state.get(receiver);
};
var _Comparison_instances, _Comparison_getValue, _Comparison_compare;
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
        _Comparison_instances.add(this);
        this.tests = [];
        this.value = undefined;
        this.fallback = undefined;
        if (value !== undefined) {
            this.value = value;
        }
    }
    isLike(comparison, result) {
        return __classPrivateFieldGet(this, _Comparison_instances, "m", _Comparison_compare).call(this, comparison, result, false, false);
    }
    is(comparison, result) {
        return __classPrivateFieldGet(this, _Comparison_instances, "m", _Comparison_compare).call(this, comparison, result, true, false);
    }
    isNot(comparison, result) {
        return __classPrivateFieldGet(this, _Comparison_instances, "m", _Comparison_compare).call(this, comparison, result, false, true);
    }
    isNotLike(comparison, result) {
        return __classPrivateFieldGet(this, _Comparison_instances, "m", _Comparison_compare).call(this, comparison, result, false, true);
    }
    whenTrue(evaluation, result) {
        const passes = (_value) => __classPrivateFieldGet(this, _Comparison_instances, "m", _Comparison_getValue).call(this, evaluation) === true;
        this.tests.push({ passes, result });
        return this;
    }
    whenFalse(evaluation, result) {
        const passes = (_value) => __classPrivateFieldGet(this, _Comparison_instances, "m", _Comparison_getValue).call(this, evaluation) === false;
        this.tests.push({ passes, result });
        return this;
    }
    /**
     * Sets the fallback result to be used if no tests pass.
     * @param result The fallback result.
     * @returns The current Comparison instance.
     */
    default(result) {
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
    against(value) {
        if (value === undefined) {
            throw new Error("Cannot compare against an undefined value");
        }
        for (const test of this.tests) {
            if (test.passes(value)) {
                return __classPrivateFieldGet(this, _Comparison_instances, "m", _Comparison_getValue).call(this, test.result);
            }
        }
        return __classPrivateFieldGet(this, _Comparison_instances, "m", _Comparison_getValue).call(this, this.fallback);
    }
}
_Comparison_instances = new WeakSet(), _Comparison_getValue = function _Comparison_getValue(val) {
    if (typeof val === "function") {
        return val();
    }
    return val;
}, _Comparison_compare = function _Comparison_compare(comparison, result, strict = false, negate = false) {
    const passes = (value) => {
        const comparisonValue = __classPrivateFieldGet(this, _Comparison_instances, "m", _Comparison_getValue).call(this, comparison);
        const isTrue = strict
            ? comparisonValue === value
            : comparisonValue == value;
        return (isTrue && !negate) || (!isTrue && negate);
    };
    this.tests.push({ passes, result });
    return this;
};
//# sourceMappingURL=comparison.js.map