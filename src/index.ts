import { Comparison } from "./comparison.js";

export { Comparison };

export function when<InputType, ResultType>(
  value: InputType = true as any,
): Comparison<InputType, ResultType> {
  return Comparison.when<InputType, ResultType>(value);
}

export function whenSomething<InputType, ResultType>(): Comparison<
  InputType,
  ResultType
> {
  return Comparison.whenSomething<InputType, ResultType>();
}
