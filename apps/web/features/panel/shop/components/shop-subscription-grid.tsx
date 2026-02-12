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
            <div className={shopClasses.cardTitle}>Key activation.</div>

            <div className={shopClasses.inputRow} style={{ margin: "16px 0 14px" }}>
               <input
                  id="shopKeyInput"
                  className={shopClasses.input}
                  type="text"
                  placeholder="key"
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
                  style={{ borderBottomColor: "var(--line)" }}
                  type="button"
                  disabled={isLoading}
                  onClick={onActivate}
               >
                  {isLoading ? "Activating..." : "Activate"}
               </button>
            </div>
         </div>

         <div className={[shopClasses.cardBase, shopClasses.cardStatus].join(" ")}>
            <div className={shopClasses.cardTitle}>Subscription status.</div>
            <div
               id="shopStatusTitle"
               className={[shopClasses.statusTitle, isVip ? "text-[#ff3b3b]" : "text-white"].join(" ")}
            >
               {statusTitle}
            </div>
            <div className={shopClasses.statusText}>Subscription until</div>
            <div id="shopStatusUntil" className={shopClasses.statusUntil}>
               {until}
            </div>
         </div>
      </div>
   );
}