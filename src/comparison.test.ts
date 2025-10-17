import { when, whenSomething } from "./index.js";

const trueFunc = () => true;
const falseFunc = () => false;

test("async value", async () => {
  const isA = when<Promise<string>, boolean>(Promise.resolve("a"))
    .withPromises()
    .is("a", true)
    .otherwise(false);
  expect(await isA).toBe(true);
});

test("deferred async result", async () => {
  const isA = whenSomething<string, Promise<string>>()
    .withPromises()
    .is("a", async () => "value is a")
    .is("b", async () => "value is b")
    .defaultTo(async () => "value is something else");
  expect(await isA.against("a")).toBe("value is a");
  expect(await isA.against("b")).toBe("value is b");
  expect(await isA.against("c")).toBe("value is something else");
});

test("deferred async comparison", async () => {
  const isA = whenSomething<string, string>()
    .withPromises()
    .is(async () => "x", "value is x")
    .is(async () => "y", "value is y")
    .defaultTo(() => "value is something else");

  const withA = await isA.against("x");
  expect(withA).toBe("value is x");

  const withB = await isA.against("y");
  expect(withB).toBe("value is y");

  const withC = await isA.against("z");
  expect(withC).toBe("value is something else");
});

test("is with functions", () => {
  expect(
    when("a")
      .is((value: any) => value, trueFunc)
      .otherwise(falseFunc),
  ).toBe(true);
  expect(when("a").is("a", trueFunc).otherwise(falseFunc)).toBe(true);
  expect(when("a").is("b", trueFunc).otherwise(falseFunc)).toBe(false);
  expect(when(1).is("1", trueFunc).otherwise(falseFunc)).toBe(false);
  expect(when(1).is(1, trueFunc).otherwise(falseFunc)).toBe(true);
});

test("is with values", () => {
  expect(when("a").is("a", true).otherwise(false)).toBe(true);
  expect(when("a").is("b", true).otherwise(false)).toBe(false);
  expect(when(1).is("1", true).otherwise(false)).toBe(false);
  expect(when(1).is(1, true).otherwise(false)).toBe(true);
});

test("isLike with functions", () => {
  expect(when(1).isLike("1", trueFunc).otherwise(falseFunc)).toBe(true);
  expect(when(1).isLike("2", trueFunc).otherwise(falseFunc)).toBe(false);
  expect(when(0).isLike(false, trueFunc).otherwise(falseFunc)).toBe(true);
});

test("isLike with values", () => {
  expect(when(1).isLike("1", true).otherwise(false)).toBe(true);
  expect(when(1).isLike("2", true).otherwise(false)).toBe(false);
  expect(when(0).isLike(false, true).otherwise(false)).toBe(true);
});

test("isNot with functions", () => {
  expect(when(1).isNot(2, trueFunc).otherwise(falseFunc)).toBe(true);
  expect(when(1).isNot(1, trueFunc).otherwise(falseFunc)).toBe(false);
  expect(when("a").isNot("b", trueFunc).otherwise(falseFunc)).toBe(true);
  expect(when("a").isNot("a", trueFunc).otherwise(falseFunc)).toBe(false);
});

test("isNot with values", () => {
  expect(when(1).isNot(2, true).otherwise(false)).toBe(true);
  expect(when(1).isNot(1, true).otherwise(false)).toBe(false);
  expect(when("a").isNot("b", true).otherwise(false)).toBe(true);
  expect(when("a").isNot("a", true).otherwise(false)).toBe(false);
});

test("isNotLike with functions", () => {
  expect(when(1).isNotLike("2", trueFunc).otherwise(falseFunc)).toBe(true);
  expect(when(1).isNotLike("1", trueFunc).otherwise(falseFunc)).toBe(false);
  expect(when(0).isNotLike(false, trueFunc).otherwise(falseFunc)).toBe(false);
  expect(when(0).isNotLike(true, trueFunc).otherwise(falseFunc)).toBe(true);
});

test("isNotLike with values", () => {
  expect(when(1).isNotLike("2", true).otherwise(false)).toBe(true);
  expect(when(1).isNotLike("1", true).otherwise(false)).toBe(false);
  expect(when(0).isNotLike(false, true).otherwise(false)).toBe(false);
  expect(when(0).isNotLike(true, true).otherwise(false)).toBe(true);
});

test("full chain", () => {
  const result = when(2)
    .is("a", () => "Value is a")
    .is("2", () => 'Value is the string "2"')
    .is(2, "Value is the number 2")
    .isLike("1", () => 'Value is loosely the string "1"')
    .is("b", "Value is b")
    .otherwise(() => "Value is something else");

  expect(result).toBe("Value is the number 2");
});

test("deferred against", () => {
  const test = whenSomething<string | number, string>()
    .is("a", () => "Value is a")
    .is("b", "Value is b")
    .is(1, "Something is 1")
    .defaultTo((value: string | number) => "Value is " + value);

  expect(test.against("a")).toBe("Value is a");
  expect(test.against("b")).toBe("Value is b");
  expect(test.against(1)).toBe("Something is 1");
  expect(test.against(123)).toBe("Value is 123");
});

test("elseWhen", () => {
  expect(
    when(2)
      .is(1, false)
      .elseWhen((value: number) => value % 2 === 0, true)
      .otherwise(false),
  ).toBe(true);

  const truth = true;
  expect(when(3).is(1, false).elseWhen(truth, true).otherwise(false)).toBe(
    true,
  );
});

test("undefined value", () => {
  expect(() => {
    whenSomething<string, string>()
      .is("a", () => "Value is a")
      .is("b", "Value is b")
      .otherwise("Value is something else");
  }).toThrow("Cannot compare against an undefined value");
});

test("empty constructor uses true", () => {
  expect(
    when()
      .is(() => 1 === 1, true)
      .otherwise(false),
  ).toBe(true);
  expect(
    when()
      .isNot(() => 1 === 1, false)
      .otherwise(true),
  ).toBe(true);
});
