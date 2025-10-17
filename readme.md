# when-otherwise

when-otherwise is a small TypeScript library that provides a fluent API for comparison logic. It is designed to simplify complex conditional statements by allowing you to chain multiple comparisons together in a readable manner. You can re-use the same comparison logic across multiple values, and it supports both synchronous and asynchronous operations.

## Installation

You can install the library with your favorite package manager:

```bash
npm install @axebear/when-otherwise
```

```bash
yarn add @axebear/when-otherwise
```

```bash
bun add @axebear/when-otherwise
```

Test the installation with `npm test`.

## Simple Usage

```typescript
import { when } from "@axebear/when-otherwise";

const result = when(type)
  .is("small", () => this.handleSmall())
  .is("medium", () => this.handleMedium())
  .is("large", () => this.handleLarge())
  .elseWhen(
    (value) => value.startsWith("extra"),
    () => this.handleExtra(),
  )
  .otherwise(() => this.handleDefault());
```

## Methods

Start a comparison with either `when` or `whenSomething`. Use `when` for immediate calculation of the result. `whenSomething` defers calculation so that you may re-use a comparison test across multiple values. Both methods create and return a `Comparison` object. Once you have this object, you can start to chain additional tests.

Note: for all of these comparison methods:

- The `comparison` parameter can be a value to compare against or a function that returns a value to compare against. The function will be called with the value being tested when the comparison is executed.
- The `result` parameter can be a value or a function that returns a value. If it is a function, it will be called with the value being tested when the comparison matches.

### Comparison Methods

- `is(comparison, result)`: Checks for strict equality (`===`) between the compared value and the provided value. If they are equal, it returns the associated result.
- `isLike(comparison, result)`: Checks for loose equality (`==`) between the compared value and the provided value. If they are loosely equal, it returns the associated result.
- `isNot(comparison, result)`: Checks for strict inequality (`!==`) between the compared value and the provided value. If they are not equal, it returns the associated result.
- `isNotLike(comparison, result)`: Checks for loose inequality (`!=`) between the compared value and the provided value. If they are not loosely equal, it returns the associated result.
- `elseWhen(condition, result)`: Allows you to have more complex comparisons. The `condition` parameter can be either a boolean or a function that accepts the value to test and returns a boolean. If the condition is true, it returns the associated result.

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

const test = whenSomething<string | number, string>()
  .is("a", () => "Value is A")
  .is("b", "Value is B")
  .is(1, "Something is 1")
  .defaultTo((value) => "Value is " + value);

console.log(test.against("a")); // Output: "Value is A"
console.log(test.against("b")); // Output: "Value is B"
console.log(test.against(1)); // Output: "Something is 1"
console.log(test.against(123)); // Output: "Value is 123"
```

### Async Comparisons

If you only need the result type to be asynchronous, you can just specify the return type as a Promise:

```typescript
import { when } from "@axebear/when-otherwise";

const fetchData = async (id: string) => {
  return `data-${id}`;
};
const result = await when<string, Promise<string>>("1")
  .is("1", fetchData)
  .is("2", fetchData)
  .otherwise("Fetched data is something else");
console.log(result); // Output: "Fetched data is data-1"
```

If you need the comparisons themselves to be asynchronous, you need to use the `withPromises()` method. This will ensure that the `otherwise` or `against` methods return a Promise that resolves to the result type.

```typescript
import { whenSomething } from "@axebear/when-otherwise";

const fetchData = async (id: string) => {
  return `data-${id}`;
};
const test = whenSomething<string, string>()
  .withPromises()
  .is(async () => "data-1", "Fetched data is data-1")
  .is(async () => "data-2", "Fetched data is data-2")
  .defaultTo("Fetched data is something else");

const result1 = await test.against(await fetchData("1"));
console.log(result1); // Output: "Fetched data is data-1"

const result2 = await test.against(await fetchData("2"));
console.log(result2); // Output: "Fetched data is data-2"

const result3 = await test.against(await fetchData("3"));
console.log(result3); // Output: "Fetched data is something else"
```
