export type PanelRoute = {
  key: "panel" | "builder" | "community" | "shop" | "settings";
  href: string;
  label: string;
};

export const PANEL_ROUTES: PanelRoute[] = [
  { key: "panel", href: "/panel/#panel", label: "Panel" },
  { key: "builder", href: "/panel/#builder", label: "Builder" },
  { key: "community", href: "/panel/#community", label: "Community" },
  { key: "shop", href: "/panel/#shop", label: "Shop" },
  { key: "settings", href: "/panel/#settings", label: "Settings" },
];