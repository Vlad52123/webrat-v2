import { shopClasses } from "../styles";

const PRODUCTS = [
   {
      period: "1 Month",
      subtitle: "Perfect for getting started",
      price: "$3.78",
      highlight: false,
   },
   {
      period: "1 Year",
      subtitle: "Best value for regular users",
      price: "$7.58",
      highlight: true,
   },
   {
      period: "Lifetime",
      subtitle: "One-time payment, forever access",
      price: "$16.43",
      highlight: false,
   },
] as const;

export function ShopProductsGrid() {
   return (
      <div className={shopClasses.productsGrid}>
         {PRODUCTS.map((p) => (
            <div
               key={p.period}
               className={[
                  shopClasses.productCard,
                  p.highlight ? "border-violet-500/20 bg-gradient-to-br from-violet-500/[0.08] via-transparent to-blue-500/[0.04]" : "",
               ].join(" ")}
            >
               {p.highlight && (
                  <div className="mb-3 inline-flex rounded-full bg-violet-500/15 px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider text-violet-400">
                     Popular
                  </div>
               )}
               {!p.highlight && <div className={shopClasses.productVip}>RATER</div>}
               <div className={shopClasses.productPeriod}>{p.period}</div>
               <div className={shopClasses.productSubtitle}>{p.subtitle}</div>
               <div className={shopClasses.productPrice}>{p.price}</div>
            </div>
         ))}
      </div>
   );
}