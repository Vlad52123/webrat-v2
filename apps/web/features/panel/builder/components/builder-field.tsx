import type { ReactNode } from "react";

import { fieldLabelClass } from "../styles";

export function BuilderField(props: {
   id?: string;
   hidden?: boolean;
   label: string;
   children: ReactNode;
   variant?: "default" | "two" | "checkbox";
}) {
   const { id, hidden, label, children, variant = "default" } = props;

   const variantClass =
      variant === "checkbox"
         ? "builderField--two builderField--checkbox"
         : variant === "two"
            ? "builderField--two"
            : "";

   return (
      <div
         id={id}
         className={`builderField grid grid-cols-[110px_1fr] items-center gap-[10px] ${variantClass}`}
         hidden={hidden}
      >
         <span className={fieldLabelClass}>{label}</span>
         {children}
      </div>
   );
}