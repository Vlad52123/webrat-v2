"use client";

import { useState } from "react";

import { BuilderForm } from "../builder/components/builder-form";
import { BuilderToggle } from "../builder/components/builder-toggle";
import { makeMutex } from "../builder/utils/make-mutex";

export function BuilderScreen() {
  const [open, setOpen] = useState(false);
  const [mutex] = useState(() => makeMutex());

  return (
    <div id="builderView" className="h-full overflow-auto">
      <div className="mx-auto w-full max-w-[min(1500px,calc(100vw-60px))] px-[10px] pb-[10px] pt-[22px]">
        <div className="flex flex-col gap-4">
          <BuilderToggle open={open} onToggle={() => setOpen((v) => !v)} />
          <BuilderForm open={open} mutex={mutex} />
        </div>
      </div>
    </div>
  );
}