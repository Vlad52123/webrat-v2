import { shopClasses } from "../styles";

export function ShopResellerSection() {
   return (
      <div className={shopClasses.resellerSection}>
         <div className={shopClasses.resellerSeparator} style={{ background: "var(--line)" }} />
         <div className={shopClasses.resellerWarning}>
            DON&apos;T BUY FROM USERS OUTSIDE OF THE OFFICIAL RESELLER LIST, YOU WILL BE SCAMMED.
         </div>
         <div className={shopClasses.resellerHeader}>Official Reseller Contacts</div>

         <div className={shopClasses.resellerGrid}>
            <div className={shopClasses.resellerCard}>
               <div className={shopClasses.resellerTitle}>WebCrystalbot</div>
               <div className={shopClasses.resellerLine} style={{ background: "var(--line)" }} />

               <div className={shopClasses.resellerRow}>
                  <span className="font-semibold text-white">Contacts:</span>
                  <span className="text-[rgba(220,220,220,0.96)]">Telegram: @WebCrystalbot</span>
               </div>

               <div className={shopClasses.resellerRow}>
                  <span className="font-semibold text-white">Payment:</span>
                  <span className="text-[rgba(220,220,220,0.96)]">Crypto</span>
               </div>

               <button
                  className={shopClasses.resellerBtn}
                  style={{ borderBottomColor: "var(--line)" }}
                  type="button"
                  onClick={() => {
                     try {
                        window.open("https://t.me/webcrystalbot", "_blank", "noopener,noreferrer");
                     } catch {
                     }
                  }}
               >
                  Open telegram
               </button>
            </div>
         </div>
      </div>
   );
}