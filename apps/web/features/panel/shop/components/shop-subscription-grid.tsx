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
            <div className={shopClasses.cardTitle}>Key Activation</div>

            <div className={shopClasses.inputRow} style={{ margin: "14px 0 10px" }}>
               <input
                  id="shopKeyInput"
                  className={shopClasses.input}
                  type="text"
                  placeholder="Enter your key"
                  autoComplete="off"
                  name="shop-key-input"
                  value={keyValue}
                  onChange={(e) => onKeyChange(e.target.value)}
                  onFocus={onKeyFocus}
               />
            </div>

            <div className="flex w-full justify-center">
               <button
                  id="shopActivateBtn"
                  className={shopClasses.activateBtn}
                  type="button"
                  disabled={isLoading}
                  onClick={onActivate}
               >
                  {isLoading ? "Activating..." : "Activate"}
               </button>
            </div>
         </div>

         <div className={[shopClasses.cardBase, shopClasses.cardStatus].join(" ")}>
            <div className={shopClasses.cardTitle}>Subscription</div>
            <div
               id="shopStatusTitle"
               className={[shopClasses.statusTitle, isVip ? "text-[rgba(255,75,75,0.90)]" : "text-[rgba(255,255,255,0.50)]"].join(" ")}
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