# when-otherwise

When-Otherwise is a small TypeScript library that provides a fluent API for comparison logic. It is designed to simplify complex conditional statements by allowing you to chain multiple comparisons together in a readable manner.

## Installation

You can install the library via npm:

```
npm install @axebear/when-otherwise
```

## Methods

Note: All of these methods accept either direct values or functions that return values. Functions will receive the compared value as an argument.

### Comparison Methods

- `is(value, result)`: Checks for strict equality (`===`) between the compared value and the provided value. If they are equal, it returns the associated result.
- `isLike(value, result)`: Checks for loose equality (`==`) between the compared value and the provided value. If they are loosely equal, it returns the associated result.
- `isNot(value, result)`: Checks for strict inequality (`!==`) between the compared value and the provided value. If they are not equal, it returns the associated result.
- `isNotLike(value, result)`: Checks for loose inequality (`!=`) between the compared value and the provided value. If they are not loosely equal, it returns the associated result.
- `whenTrue(condition, result)`: Evaluates a boolean condition. If the condition is true, it returns the associated result.
- `whenFalse(condition, result)`: Evaluates a boolean condition. If the condition is false, it returns the associated result.

### Handling Default Results

There are two ways to provide a default result if none of the comparisons match, depending on whether you are deferring the comparison or providing the value upfront:

- `defaultTo(result)`: Used when deferring the comparison. It sets a default result to return if none of the comparisons match when the comparison is later executed.
- `otherwise(result)`: Used when providing the value upfront. It sets a default result to return if none of the comparisons match immediately.

## Examples

### Immediate Comparison

```typescript
import { when } from "@axebear/when-otherwise";

const input = "a";
const result = when(input)
  .is("a", () => "Value is a")
  .is("b", "Value is b")
  .is(1, "Something is 1")
  .otherwise("Value is something else");

console.log(result); // Output: "Value is a"
```

Calling `when()` without a parameter defaults to `when(true)`. This allows you to test boolean conditions.

```typescript
import { when } from "@axebear/when-otherwise";

const firstName = get("firstName");
const lastName = get("lastName");

const result = when()
  .is(
    () => firstName.startsWith("A"),
    () => "First name starts with A",
  )
  .is(
    () => lastName.startsWith("A"),
    () => "Last name starts with A",
  )
  .otherwise("Your name doesn't start with As");

console.log(result); // Output: "Value is A"
```

### Deferred Comparison

```typescript
import { whenSomething } from "@axebear/when-otherwise";

const test = whenSomething<string>()
  .is("a", () => "Value is A")
  .is("b", "Value is B")
  .is(1, "Something is 1")
  .defaultTo((value) => "Value is " + value);

console.log(test.against("a")); // Output: "Value is A"
console.log(test.against("b")); // Output: "Value is B"
console.log(test.against(1)); // Output: "Something is 1"
console.log(test.against(123)); // Output: "Value is 123"
```
