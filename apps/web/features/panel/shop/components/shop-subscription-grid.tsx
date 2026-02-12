import { shopClasses } from "../styles";

export function ShopSubscriptionGrid(props: {
   keyValue: string;
   onKeyChange: (next: string) => void;
   onKeyFocus: () => void;
   onActivate: () => void;
   isLoading: boolean;
   isVip: boolean;
   statusTitle: string;
   until: string;
}) {
   const { keyValue, onKeyChange, onKeyFocus, onActivate, isLoading, isVip, statusTitle, until } = props;

   return (
      <div className={shopClasses.grid}>
         <div className={[shopClasses.cardBase, shopClasses.cardKey].join(" ")}>
            <div className={shopClasses.cardTitle}>Activate your key</div>

            <div className={shopClasses.inputRow}>
               <input
                  id="shopKeyInput"
                  className={shopClasses.input}
                  type="text"
                  placeholder="Enter your license key"
                  autoComplete="off"
                  name="shop-key-input"
                  value={keyValue}
                  onChange={(e) => onKeyChange(e.target.value)}
                  onFocus={onKeyFocus}
               />
            </div>

            <button
               id="shopActivateBtn"
               className={shopClasses.activateBtn}
               type="button"
               disabled={isLoading}
               onClick={onActivate}
            >
               {isLoading ? "Activating..." : "Activate Key"}
            </button>
         </div>

         <div className={[shopClasses.cardBase, shopClasses.cardStatus].join(" ")}>
            <div className={shopClasses.statusText}>Status</div>
            <div
               id="shopStatusTitle"
               className={[shopClasses.statusTitle, isVip ? "text-emerald-400" : "text-white/30"].join(" ")}
            >
               {statusTitle}
            </div>
            <div className={shopClasses.statusText}>Active until</div>
            <div id="shopStatusUntil" className={shopClasses.statusUntil}>
               {until}
            </div>
         </div>
      </div>
   );
}