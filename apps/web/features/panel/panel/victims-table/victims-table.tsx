import { VictimsTableHeader } from "./victims-table-header";
import type { Victim } from "../../api/victims";
import { VictimRow } from "./victim-row";

export function VictimsTable(props: {
  victims: Victim[];
  isLoading: boolean;
  isError: boolean;
  selectedVictimId: string | null;
  onSelectVictim: (victimId: string) => void;
  onOpenDetail: (victimId: string) => void;
}) {
  const { victims, isLoading, isError, selectedVictimId, onSelectVictim, onOpenDetail } = props;

  return (
    <div
      className={
        "relative box-border mx-auto my-[12px] h-[calc(100%-24px)] w-full max-w-[calc(100%-40px)] overflow-auto rounded-[18px] border border-white/[0.16] bg-[rgba(18,18,18,0.66)] px-[12px] pb-[12px] pt-[8px] shadow-[0_18px_44px_rgba(0,0,0,0.6),0_0_0_4px_rgba(255,255,255,0.04)] backdrop-blur-[10px]"
      }
    >
      {isLoading ? (
        <div className="text-sm text-white/80">loading...</div>
      ) : isError ? (
        <div className="text-sm text-white/80">failed to load</div>
      ) : (
        <table className="w-full border-collapse text-[20px] font-[550] leading-[1.05] text-white/[0.99]">
          <VictimsTableHeader />
          <tbody>
            {victims.map((v, idx) => {
              const id = String(v.id ?? "");
              const key = id ? id : `row-${idx}`;

              return (
                <VictimRow
                  key={key}
                  victim={v}
                  isSelected={!!selectedVictimId && String(selectedVictimId) === id}
                  onClick={() => onSelectVictim(id)}
                  onDoubleClick={() => onOpenDetail(id)}
                />
              );
            })}
          </tbody>
        </table>
      )}
    </div>
  );
}
