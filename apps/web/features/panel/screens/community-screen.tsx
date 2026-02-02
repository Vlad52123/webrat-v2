"use client";

import { useMemo, useState } from "react";

type CommunityItem = {
  key: string;
  title: string;
  author: string;
  date: string;
  detailsTitle: string;
  lines: Array<
    | { type: "text"; text: string }
    | { type: "link"; prefix: string; href: string; label: string }
  >;
};

const items: CommunityItem[] = [
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

export function CommunityScreen() {
  const [openKeys, setOpenKeys] = useState<Record<string, boolean>>({});

  const messageCounts = useMemo(() => {
    const counts = new Map<string, number>();
    items.forEach((it) => {
      counts.set(it.key, it.lines.length);
    });
    return counts;
  }, []);

  return (
    <div id="communityView" className="h-full overflow-auto">
      <div className="mx-auto w-full max-w-[min(1500px,calc(100vw-60px))] px-[10px] pb-[10px] pt-[22px]">
        <div className="flex flex-col gap-[14px]">
          {items.map((it) => {
            const isOpen = !!openKeys[it.key];

            return (
              <div
                key={it.key}
                className={
                  "grid cursor-pointer grid-cols-[64px_1fr] items-start gap-[14px] rounded-[14px] border border-white/20 bg-[rgba(32,32,32,0.42)] px-[20px] py-[18px] shadow-[0_18px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.08)] backdrop-blur-[10px] transition-[background,border-color,transform] duration-[140ms] ease-out hover:translate-y-[-2px] hover:bg-[rgba(40,40,40,0.5)] hover:border-[rgba(235,200,255,0.26)]"
                }
                onClick={() =>
                  setOpenKeys((prev) => ({
                    ...prev,
                    [it.key]: !prev[it.key],
                  }))
                }
              >
                <img
                  className="wc-community-logo-shake h-[56px] w-[56px] select-none rounded-[10px] border border-white/20 bg-[rgba(25,25,25,0.55)] object-cover"
                  src="/logo/main_logo.ico"
                  alt="logo"
                  draggable={false}
                />

                <div className="min-w-0">
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0">
                      <div className="text-[15px] font-extrabold leading-[1.15] text-[rgb(240,105,236)]">
                        {it.title}
                      </div>
                      <div className="mt-[2px] text-[12px] text-white/70">{it.author}</div>
                    </div>
                    <div className="shrink-0 whitespace-nowrap text-[12px] text-white/70">{it.date}</div>
                  </div>

                  <div
                    className={
                      "mt-3 overflow-hidden border-t border-white/10 transition-[max-height,opacity,transform] duration-[260ms] ease-out " +
                      (isOpen
                        ? "max-h-[260px] opacity-100 translate-y-0"
                        : "max-h-0 opacity-0 -translate-y-[8px] pointer-events-none")
                    }
                  >
                    <div className="mt-3 rounded-[12px] border border-white/10 bg-[rgba(0,0,0,0.18)] p-3">
                      <div className="mb-2 font-black text-white/95">{it.detailsTitle}</div>
                      <div className="flex flex-col gap-[6px]">
                        {it.lines.map((line, idx) => {
                          if (line.type === "text") {
                            return (
                              <div key={idx} className="text-[13px] leading-[1.3] text-white/85">
                                {line.text}
                              </div>
                            );
                          }

                          return (
                            <div key={idx} className="text-[13px] leading-[1.3] text-white/85">
                              <span className="inline-block w-[18px] cursor-default font-bold text-white/70">
                                {line.prefix}
                              </span>{" "}
                              <a
                                className="font-extrabold text-[rgb(240,105,236)] hover:underline"
                                href={line.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                              >
                                {line.label}
                              </a>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </div>

                  <div className="mt-[10px] text-right text-[12px] text-white/55">
                    Messages: {messageCounts.get(it.key) ?? 0}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
