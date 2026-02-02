import type { Victim } from "../api/victims";
import { useVictimsQuery } from "../hooks/use-victims-query";
import type { VictimsFilter } from "../state/victims-filter";
import { VictimsTable } from "../panel/victims-table/victims-table";
import { DetailView } from "../panel/detail/detail-view";
import { usePanelDetailView } from "../panel/detail/panel-detail-view-provider";

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
  const detail = usePanelDetailView();

  // Keep old filtering behavior.
  const visibleVictims = victims.filter((v) => {
    const online = isVictimOnline(v);
    if (filter === "online") return online;
    if (filter === "offline") return !online;
    return true;
  });

  return (
    <>
      {!detail.isOpen && (
        <div id="panelView" className="h-full">
          <VictimsTable
            victims={visibleVictims}
            isLoading={victimsQuery.isLoading}
            isError={victimsQuery.isError}
            selectedVictimId={detail.selectedVictimId}
            onSelectVictim={detail.selectVictim}
            onOpenDetail={detail.openDetailForVictim}
          />
        </div>
      )}

      <DetailView victims={victims} />
    </>
  );
}