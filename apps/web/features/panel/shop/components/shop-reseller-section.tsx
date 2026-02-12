import { shopClasses } from "../styles";

export function ShopResellerSection() {
   return (
      <div className={shopClasses.resellerSection}>
         <div className={shopClasses.resellerSeparator} />
         <div className={shopClasses.resellerWarning}>
            DON&apos;T BUY FROM USERS OUTSIDE OF THE OFFICIAL RESELLER LIST, YOU WILL BE SCAMMED.
         </div>
         <div className={shopClasses.resellerHeader}>Official Reseller Contacts</div>

         <div className={shopClasses.resellerGrid}>
            <div className={shopClasses.resellerCard}>
               <div className={shopClasses.resellerTitle}>WebCrystalbot</div>
               <div className={shopClasses.resellerLine} />

               <div className={shopClasses.resellerRow}>
                  <span className="text-[12px] font-bold text-[rgba(255,255,255,0.50)]">Contacts</span>
                  <span className="text-[13px] font-medium text-[rgba(255,255,255,0.80)]">Telegram: @WebCrystalbot</span>
               </div>

               <div className={shopClasses.resellerRow}>
                  <span className="text-[12px] font-bold text-[rgba(255,255,255,0.50)]">Payment</span>
                  <span className="text-[13px] font-medium text-[rgba(255,255,255,0.80)]">Crypto</span>
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
                  Open telegram
               </button>
            </div>
         </div>
      </div>
   );
}