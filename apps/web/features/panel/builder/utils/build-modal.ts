function byId(id: string): HTMLElement | null {
   try {
      return document.getElementById(id);
   } catch {
      return null;
   }
}

export function openBuildModal(password: string) {
   const buildModal = byId("buildModal");
   const buildModalPass = byId("buildModalPass");

   if (buildModalPass) buildModalPass.textContent = password;
   if (buildModal) (buildModal as HTMLDivElement).hidden = false;
}