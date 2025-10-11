# when-otherwise

When-Otherwise is a small TypeScript library that provides a fluent API for comparison logic. It is designed to simplify complex conditional statements by allowing you to chain multiple comparisons together in a readable manner.

## Installation

You can install the library via npm:

```
npm install @axebear/when-otherwise
```

## Available Comparisons

- `is(value, result)`: Checks for strict equality (`===`) between the compared value and the provided value. If they are equal, it returns the associated result.
- `isLike(value, result)`: Checks for loose equality (`==`) between the compared value and the provided value. If they are loosely equal, it returns the associated result.
- `isNot(value, result)`: Checks for strict inequality (`!==`) between the compared value and the provided value. If they are not equal, it returns the associated result.
- `isNotLike(value, result)`: Checks for loose inequality (`!=`) between the compared value and the provided value. If they are not loosely equal, it returns the associated result.
- `whenTrue(condition, result)`: Evaluates a boolean condition. If the condition is true, it returns the associated result.
- `whenFalse(condition, result)`: Evaluates a boolean condition. If the condition is false, it returns the associated result.

## Default Result

There are two ways to provide a default result if none of the comparisons match, depending on whether you are deferring the comparison or providing the value upfront:

- `default(result)`: Used when deferring the comparison. It sets a default result to return if none of the comparisons match when the comparison is later executed.
- `otherwise(result)`: Used when providing the value upfront. It sets a default result to return if none of the comparisons match immediately.

## Examples

Note: when you provide a result, it can either be a direct value or a function that returns a value. Functions are only executed if their associated comparison matches.

### Immediate Comparison

```typescript
import { when } from "@axebear/when-otherwise";

const result = when("a")
  .is("a", () => "Value is a")
  .is("b", "Value is b")
  .is(1, "Something is 1")
  .otherwise("Value is something else");

console.log(result); // Output: "Value is a"
```

### Deferred Comparison

```typescript
import { whenSomething } from "@axebear/when-otherwise";

const test = whenSomething<string>()
  .is("a", () => "Value is a")
  .is("b", "Value is b")
  .is(1, "Something is 1")
  .default("Value is something else");

console.log(test.against("a")); // Output: "Value is a"
console.log(test.against("b")); // Output: "Value is b"
console.log(test.against(1)); // Output: "Something is 1"
console.log(test.against(123)); // Output: "Value is something else"
```
