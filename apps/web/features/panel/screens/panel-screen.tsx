import type { Victim } from "../api/victims";
import { useVictimsQuery } from "../hooks/use-victims-query";
import type { VictimsFilter } from "../state/victims-filter";

function isVictimOnline(v: Victim): boolean {
  if (typeof v.online === "boolean") return v.online;
  const status = typeof v.status === "string" ? v.status.toLowerCase() : "";
  if (status === "online") return true;
  if (status === "offline") return false;
  return false;
}

export function PanelScreen(props: { filter: VictimsFilter }) {
  const { filter } = props;
  const victimsQuery = useVictimsQuery();

  const victims = Array.isArray(victimsQuery.data) ? victimsQuery.data : [];
  const visibleVictims = victims.filter((v) => {
    const online = isVictimOnline(v);
    if (filter === "online") return online;
    if (filter === "offline") return !online;
    return true;
  });

  return (
    <div id="panelView" className="h-full">
      <div className="mx-auto h-[calc(100%-24px)] max-w-[calc(100%-40px)] overflow-auto rounded-[18px] border border-white/15 bg-black/50 p-4 shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.04)] backdrop-blur-md">
        {victimsQuery.isLoading ? (
          <div className="text-sm text-white/80">loading...</div>
        ) : victimsQuery.isError ? (
          <div className="text-sm text-white/80">failed to load</div>
        ) : (
          <table className="w-full border-collapse text-[14px] text-white/95">
            <thead>
              <tr className="border-b border-white/10">
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">country</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">user</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">admin</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">pc-name</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">active-window</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">last active</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">id</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">ip</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">os</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">cpu</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">ram</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">gpu</th>
                <th className="sticky top-0 bg-[#202020] px-2 py-2 text-left font-normal">comment</th>
              </tr>
            </thead>
            <tbody>
              {visibleVictims.map((v, idx) => {
                const online = isVictimOnline(v);
                const id = typeof v.id === "number" ? String(v.id) : v.id ?? "";
                const lastActive =
                  typeof v.last_active === "number"
                    ? new Date(v.last_active > 1_000_000_000_000 ? v.last_active : v.last_active * 1000).toLocaleString()
                    : typeof v.last_active === "string"
                      ? v.last_active
                      : "";

                return (
                  <tr key={`${id || "row"}-${idx}`} className="border-b border-white/5 hover:bg-white/5">
                    <td className="px-2 py-1">{v.country ?? ""}</td>
                    <td className="px-2 py-1">
                      <span className={online ? "text-pink-400" : ""}>{v.user ?? ""}</span>
                    </td>
                    <td className="px-2 py-1">{v.admin ? "True" : "False"}</td>
                    <td className="px-2 py-1">{v.hostname ?? ""}</td>
                    <td className="px-2 py-1">{v.window ?? ""}</td>
                    <td className="px-2 py-1">{lastActive}</td>
                    <td className="px-2 py-1">{id}</td>
                    <td className="px-2 py-1">{v.ip ?? ""}</td>
                    <td className="px-2 py-1">{v.os ?? ""}</td>
                    <td className="px-2 py-1">{v.cpu ?? ""}</td>
                    <td className="px-2 py-1">{v.ram ?? ""}</td>
                    <td className="px-2 py-1">{v.gpu ?? ""}</td>
                    <td className="px-2 py-1">{v.comment ?? ""}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
