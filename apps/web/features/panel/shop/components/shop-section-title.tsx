import type { ReactNode } from "react";

import { shopClasses } from "../styles";

export function ShopSectionTitle(props: { children: ReactNode }) {
   const { children } = props;
   return (
      <div className={shopClasses.sectionTitle}>
         {children}
         <span className={shopClasses.sectionTitleLine} style={{ background: "var(--line)" }} />
      </div>
   );
}