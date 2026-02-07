import { useEffect, useRef } from "react";

export function useInputsErrorReset(p: {
   inputsError: boolean;
   setInputsError: (v: boolean) => void;
   loginValue: string;
   passwordValue: string;
}) {
   const { inputsError, setInputsError, loginValue, passwordValue } = p;

   const inputsErrorRef = useRef(false);

   useEffect(() => {
      inputsErrorRef.current = inputsError;
   }, [inputsError]);

   useEffect(() => {
      if (inputsErrorRef.current) setInputsError(false);
   }, [loginValue, passwordValue, setInputsError]);

   return { inputsErrorRef };
}