import type { CSSProperties } from "react";

import { inputClass } from "../styles";

export function BuilderTextInput(props: {
   id: string;
   placeholder?: string;
   maxLength?: number;
   defaultValue?: string;
   value?: string;
   readOnly?: boolean;
   tabIndex?: number;
   autoComplete?: string;
   type?: "text" | "password";
   style?: CSSProperties;
   className?: string;
}) {
   const {
      id,
      placeholder,
      maxLength,
      defaultValue,
      value,
      readOnly,
      tabIndex,
      autoComplete,
      type = "text",
      style,
      className,
   } = props;

   return (
      <input
         id={id}
         className={className ? `${inputClass} ${className}` : inputClass}
         type={type}
         placeholder={placeholder}
         autoComplete={autoComplete}
         maxLength={maxLength}
         {...(typeof value === "string" ? { value } : {})}
         {...(typeof value !== "string" && typeof defaultValue === "string" ? { defaultValue } : {})}
         readOnly={readOnly}
         tabIndex={tabIndex}
         style={style}
      />
   );
}