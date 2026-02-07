function byId(id: string): HTMLElement | null {
   try {
      return document.getElementById(id);
   } catch {
      return null;
   }
}

export function installBuildModalHandlers() {
   try {
      if (typeof window === "undefined") return;
      if ((window as unknown as { __webratBuildModalInstalled?: boolean }).__webratBuildModalInstalled) return;
      (window as unknown as { __webratBuildModalInstalled?: boolean }).__webratBuildModalInstalled = true;

      const buildModal = byId("buildModal");
      const buildModalOk = byId("buildModalOk");
      const buildModalClose = byId("buildModalClose");

      const close = () => {
         if (!buildModal) return;
         (buildModal as HTMLDivElement).hidden = true;
      };

      buildModalOk?.addEventListener("click", close);
      buildModalClose?.addEventListener("click", close);
   } catch {
   }
}

export function openBuildModal(password: string) {
   const buildModal = byId("buildModal");
   const buildModalPass = byId("buildModalPass");

   if (buildModalPass) buildModalPass.textContent = password;
   if (buildModal) (buildModal as HTMLDivElement).hidden = false;
}