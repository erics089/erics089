"use client";

import { useRef } from "react";

export function StageSelect({
  action,
  defaultValue,
  stages,
}: {
  action: (formData: FormData) => void;
  defaultValue: string;
  stages: readonly { value: string; label: string }[];
}) {
  const formRef = useRef<HTMLFormElement>(null);

  return (
    <form ref={formRef} action={action} className="mt-2">
      <select
        name="stage"
        defaultValue={defaultValue}
        onChange={() => formRef.current?.requestSubmit()}
        className="h-7 w-full rounded-md border border-input bg-transparent px-2 text-xs outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50"
      >
        {stages.map((s) => (
          <option key={s.value} value={s.value}>
            {s.label}
          </option>
        ))}
      </select>
    </form>
  );
}
