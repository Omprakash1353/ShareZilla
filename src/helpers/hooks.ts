import { useState } from "react";

export function useAsyncState<T>(
  initialValue: T
): [T, (value: T) => Promise<void>] {
  const [value, setValue] = useState<T>(initialValue);
  const setter = (x: T): Promise<void> =>
    new Promise<void>((resolve) => {
      setValue(x);
      resolve();
    });
  return [value, setter];
}
