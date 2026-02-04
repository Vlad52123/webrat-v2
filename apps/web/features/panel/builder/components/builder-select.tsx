import type { ChangeEvent, ReactNode } from "react";

import { selectClass } from "../styles";

export function BuilderSelect(props: {
   id: string;
   defaultValue?: string;
   value?: string;
   onChange?: (e: ChangeEvent<HTMLSelectElement>) => void;
   children: ReactNode;
}) {
   const { id, defaultValue, value, onChange, children } = props;

   return (
      <select
         id={id}
         className={selectClass}
         defaultValue={defaultValue}
         {...(typeof value === "string" ? { value } : {})}
         onChange={onChange}
      >
         {children}
      </select>
   );
}
