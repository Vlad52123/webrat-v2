import type { CommunityItem } from "./types";

export const communityItems: CommunityItem[] = [
   {
      key: "information",
      title: "information",
      author: "Autor: akashi",
      date: "14.01.2026, 22:27",
      detailsTitle: "INFORMATION | ИНФОРМАЦИЯ",
      lines: [
         { type: "text", text: "Наши зеркала:" },
         { type: "link", prefix: "1.", href: "https://webcrystal.sbs", label: "webcrystal.sbs" },
         { type: "text", text: "Бот для покупок ключей :" },
         { type: "link", prefix: "1.", href: "https://t.me/webcrystalbot", label: "webcrystalbot" },
      ],
   },
   {
      key: "rules",
      title: "rules",
      author: "Autor: akashi",
      date: "14.01.2026, 22:27",
      detailsTitle: "RULES | ПРАВИЛА СООБЩЕСТВА",
      lines: [
         { type: "text", text: "1. Запрещённый контент" },
         { type: "text", text: "1.1 Распространение рекламы без согласования с администрацией" },
         { type: "text", text: "1.2 Распространение вредоносного программного обеспечения" },
         { type: "text", text: "1.3 Запрещено спамить, флудить и оскорблять других участников" },
         { type: "text", text: "1.4 Запрещено размещать 18+ материалы и любой детский контент" },
      ],
   },
   {
      key: "updates",
      title: "updates/improvements",
      author: "Autor: akashi",
      date: "14.01.2026, 22:27",
      detailsTitle: "UPDATE | ОБНОВЛЕНИЯ",
      lines: [
         { type: "text", text: "1. Обновления и доработки" },
         {
            type: "text",
            text: "1.1 Улучшен интерфейс панели (Filters: компактная модалка, выровнены чекбоксы, улучшена кнопка фильтра)",
         },
         { type: "text", text: "1.2 Добавлено: перетаскивание колонок таблицы (drag & drop reorder) + сохранение порядка" },
         { type: "text", text: "1.3 Исправлено: фильтрация online / all / offline" },
         { type: "text", text: "1.4 Улучшено: контекстное меню (Connect/Database/Delete) и UX клика по строкам" },
      ],
   },
];

export const communityMessageCounts = new Map<string, number>(communityItems.map((it) => [it.key, it.lines.length]));