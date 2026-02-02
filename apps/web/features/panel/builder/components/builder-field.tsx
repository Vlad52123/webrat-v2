import type { ReactNode } from "react";

import { fieldLabelClass } from "../styles";

export function BuilderField({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="grid gap-2">
      <span className={fieldLabelClass}>{label}</span>
      {children}
    </div>
  );
}
