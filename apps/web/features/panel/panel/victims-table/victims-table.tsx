import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useQueryClient } from "@tanstack/react-query";

import { VictimsTableHeader } from "./victims-table-header";
import type { Victim } from "../../api/victims";
import { VictimRow } from "./victim-row";
import { useVictimsTablePrefs } from "./victims-table-prefs-provider";
import { csrfHeaders } from "../../builder/utils/csrf";
import { showToast } from "../../toast";

export function VictimsTable(props: {
  victims: Victim[];
  isLoading: boolean;
  isError: boolean;
  selectedVictimId: string | null;
  onSelectVictim: (victimId: string) => void;
  onOpenDetail: (victimId: string) => void;
  onSnapshotVictim?: (victim: Victim) => void;
}) {
  const { victims, isLoading, isError, selectedVictimId, onSelectVictim, onOpenDetail, onSnapshotVictim } = props;
  const prefs = useVictimsTablePrefs();

  const qc = useQueryClient();

  const tableContainerRef = useRef<HTMLDivElement | null>(null);
  const dragScrollRef = useRef<{
    dragging: boolean;
    armed: boolean;
    moved: boolean;
    startX: number;
    startScrollLeft: number;
    pointerId: number | null;
  }>({
    dragging: false,
    armed: false,
    moved: false,
    startX: 0,
    startScrollLeft: 0,
    pointerId: null,
  });

  const [ctxOpen, setCtxOpen] = useState(false);
  const [ctxDbOpen, setCtxDbOpen] = useState(false);
  const [ctxVictimId, setCtxVictimId] = useState<string>("");
  const [ctxPos, setCtxPos] = useState<{ left: number; top: number } | null>(null);
  const ctxMenuRef = useRef<HTMLDivElement | null>(null);

  const closeCtx = useMemo(
    () => () => {
      setCtxOpen(false);
      setCtxDbOpen(false);
      setCtxVictimId("");
      setCtxPos(null);
    },
    [],
  );

  useEffect(() => {
    if (!ctxOpen) return;

    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node | null;
      if (!t) {
        closeCtx();
        return;
      }
      const menu = ctxMenuRef.current;
      if (menu && menu.contains(t)) return;
      closeCtx();
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeCtx();
    };

    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [closeCtx, ctxOpen]);

  useEffect(() => {
    const el = tableContainerRef.current;
    if (!el) return;

    const clearDrag = () => {
      const st = dragScrollRef.current;
      st.dragging = false;
      st.armed = false;
      st.moved = false;
      try {
        if (st.pointerId != null) el.releasePointerCapture(st.pointerId);
      } catch {
      }
      st.pointerId = null;
      try {
        el.classList.remove("isDragScrolling");
      } catch {
      }
    };

    const onPointerDown = (e: PointerEvent) => {
      if (!e || e.button !== 0) return;
      try {
        const th = (e.target as Element | null)?.closest?.("th");
        if (th) return;
      } catch {
      }

      const st = dragScrollRef.current;
      st.dragging = false;
      st.armed = true;
      st.moved = false;
      st.startX = e.clientX;
      st.startScrollLeft = el.scrollLeft;
      st.pointerId = e.pointerId;
    };

    const onPointerMove = (e: PointerEvent) => {
      const st = dragScrollRef.current;
      if (!st.armed && !st.dragging) return;
      if (st.pointerId != null && e.pointerId !== st.pointerId) return;

      const dx = e.clientX - st.startX;
      if (!st.moved && Math.abs(dx) > 10) {
        st.moved = true;
        st.dragging = true;
        try {
          if (st.pointerId != null) el.setPointerCapture(st.pointerId);
        } catch {
        }
        try {
          el.classList.add("isDragScrolling");
        } catch {
        }
      }

      if (st.moved) {
        el.scrollLeft = st.startScrollLeft - dx;
        try {
          e.preventDefault();
        } catch {
        }
      }
    };

    const onClickCapture = (e: MouseEvent) => {
      const st = dragScrollRef.current;
      if (!st.moved) return;
      try {
        e.preventDefault();
        e.stopPropagation();
      } catch {
      }
    };

    el.addEventListener("pointerdown", onPointerDown);
    el.addEventListener("pointermove", onPointerMove, { passive: false });
    el.addEventListener("pointerup", clearDrag);
    el.addEventListener("pointercancel", clearDrag);
    el.addEventListener("click", onClickCapture, true);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      el.removeEventListener("pointermove", onPointerMove);
      el.removeEventListener("pointerup", clearDrag);
      el.removeEventListener("pointercancel", clearDrag);
      el.removeEventListener("click", onClickCapture, true);
    };
  }, []);

  const onDeleteVictim = async (victimId: string) => {
    const id = String(victimId || "").trim();
    if (!id) return;

    try {
      const res = await fetch(`/api/victims?id=${encodeURIComponent(id)}`, {
        method: "DELETE",
        credentials: "same-origin",
        headers: {
          ...csrfHeaders(),
        },
      });
      if (!res.ok) {
        let msg = "Failed to delete victim";
        try {
          const t = await res.text();
          if (t && String(t).trim()) msg = String(t).trim();
        } catch {
        }
        showToast("error", msg);
        return;
      }

      qc.setQueryData(["victims"], (prev: unknown) => {
        const arr = Array.isArray(prev) ? (prev as Victim[]) : [];
        return arr.filter((v) => String((v as { id?: unknown }).id ?? "") !== id);
      });
      try {
        await qc.invalidateQueries({ queryKey: ["victims"] });
      } catch {
      }
    } catch {
      showToast("error", "Failed to delete victim");
    }
  };

  return (
    <div
      ref={tableContainerRef}
      className={
        "relative box-border mx-auto my-[12px] h-[calc(100%-24px)] w-full max-w-[calc(100%-40px)] overflow-x-auto overflow-y-auto rounded-[18px] border border-white/[0.16] bg-[rgba(18,18,18,0.66)] px-[12px] pb-[12px] pt-[8px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.04)] backdrop-blur-[10px] touch-auto"
      }
      style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(120,120,120,0.9) transparent" }}
    >
      {isLoading ? (
        <div className="text-sm text-white/80">loading...</div>
      ) : isError ? (
        <div className="text-sm text-white/80">failed to load</div>
      ) : (
        <div className="inline-block min-w-full align-top">
          <table className="victims-table table-auto w-max border-collapse text-[20px] font-[550] leading-[1.05] text-white/[0.99]">
            <VictimsTableHeader />
            <tbody>
              {victims.map((v, idx) => {
                const id = String(v.id ?? "");
                const key = id ? id : `row-${idx}`;

                return (
                  <VictimRow
                    key={key}
                    victim={v}
                    columnOrder={prefs.columnOrder}
                    isSelected={id === selectedVictimId}
                    onClick={() => {
                      onSelectVictim(id);
                    }}
                    onDoubleClick={() => {
                      onOpenDetail(id);
                    }}
                    onContextMenu={(e) => {
                      try {
                        e.preventDefault();
                        e.stopPropagation();
                      } catch {
                      }
                      const vid = String(id || "").trim();
                      if (!vid) return;

                      try {
                        if (onSnapshotVictim) onSnapshotVictim(v);
                      } catch {
                      }

                      const menuWidth = 160;
                      const menuHeight = 40;
                      const pad = 4;
                      const vw = window.innerWidth || 0;
                      const vh = window.innerHeight || 0;

                      let x = e.clientX;
                      let y = e.clientY;
                      if (x + menuWidth > vw) x = Math.max(pad, vw - menuWidth - pad);
                      if (y + menuHeight > vh) y = Math.max(pad, vh - menuHeight - pad);

                      setCtxVictimId(vid);
                      setCtxDbOpen(false);
                      setCtxPos({ left: x, top: y });
                      setCtxOpen(true);
                    }}
                  />
                );
              })}
            </tbody>
          </table>

          {ctxOpen && ctxPos
            ? createPortal(
              <div
                ref={ctxMenuRef}
                style={{ left: ctxPos.left, top: ctxPos.top }}
                className="fixed z-[9999] w-[160px] select-none overflow-hidden rounded-[12px] border border-white/[0.14] bg-[rgba(12,12,12,0.96)] shadow-[0_22px_54px_rgba(0,0,0,0.65)]"
              >
                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-[12px] py-[10px] text-left text-[13px] font-bold text-white hover:bg-white/[0.06]"
                  onClick={() => {
                    const vid = ctxVictimId;
                    if (!vid) return;
                    closeCtx();
                    onOpenDetail(vid);
                  }}
                >
                  <span>Connect</span>
                  <span className="text-white/50">›</span>
                </button>

                <button
                  type="button"
                  className="flex w-full items-center justify-between gap-2 px-[12px] py-[10px] text-left text-[13px] font-bold text-white hover:bg-white/[0.06]"
                  onClick={(e) => {
                    try {
                      e.preventDefault();
                      e.stopPropagation();
                    } catch {
                    }
                    setCtxDbOpen((v) => !v);
                  }}
                >
                  <span>Database</span>
                  <span className="text-white/50">›</span>
                </button>

                {ctxDbOpen ? (
                  <div className="border-t border-white/[0.08]">
                    <button
                      type="button"
                      className="flex w-full items-center justify-between gap-2 px-[12px] py-[10px] text-left text-[13px] font-bold text-[#ff7070] hover:bg-[rgba(255,75,75,0.10)]"
                      onClick={() => {
                        const vid = ctxVictimId;
                        closeCtx();
                        void onDeleteVictim(vid);
                      }}
                    >
                      <span>Delete</span>
                    </button>
                  </div>
                ) : null}
              </div>,
              document.body,
            )
            : null}
        </div>
      )}
    </div>
  );
}
