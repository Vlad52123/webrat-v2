import { shopClasses } from "../styles";

export function ShopResellerSection() {
   return (
      <div className={shopClasses.resellerSection}>
         <div className={shopClasses.resellerSeparator} />
         <div className={shopClasses.resellerWarning}>
            ⚠ Only buy from official resellers listed below
         </div>
         <div className={shopClasses.resellerHeader}>Official Resellers</div>

         <div className={shopClasses.resellerGrid}>
            <div className={shopClasses.resellerCard}>
               <div className={shopClasses.resellerTitle}>WebCrystalbot</div>
               <div className={shopClasses.resellerLine} />

               <div className={shopClasses.resellerRow}>
                  <span className="font-medium text-white/60">Contact</span>
                  <span className="font-semibold text-white/90">@WebCrystalbot</span>
               </div>

               <div className={shopClasses.resellerRow}>
                  <span className="font-medium text-white/60">Payment</span>
                  <span className="font-semibold text-white/90">Crypto</span>
               </div>

               <button
                  className={shopClasses.resellerBtn}
                  type="button"
                  onClick={() => {
                     try {
                        window.open("https://t.me/webcrystalbot", "_blank", "noopener,noreferrer");
                     } catch {
                     }
                  }}
               >
                  Open Telegram
               </button>
            </div>
         </div>
      </div>
   );
}