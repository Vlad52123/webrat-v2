export type CommunityLine =
  | { type: "text"; text: string }
  | { type: "link"; prefix: string; href: string; label: string };

export type CommunityItem = {
  key: string;
  title: string;
  author: string;
  date: string;
  detailsTitle: string;
  lines: CommunityLine[];
};