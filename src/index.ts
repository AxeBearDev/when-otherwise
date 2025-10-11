import { Comparison } from "./comparison.ts";

export { Comparison };

export function when<ResultType>(value: any = true): Comparison<ResultType> {
  return Comparison.when<ResultType>(value);
}

export function whenSomething<ResultType>(): Comparison<ResultType> {
  return Comparison.whenSomething<ResultType>();
}
