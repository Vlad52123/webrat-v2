import { shopClasses } from "../styles";

const PRODUCTS = [
   { period: "for a month", subtitle: "Buy WebCrystal for a month", price: "$3,78" },
   { period: "for a year", subtitle: "Buy WebCrystal for a year", price: "$7,58" },
   { period: "forever", subtitle: "Buy WebCrystal forever", price: "$16,43" },
] as const;

export function ShopProductsGrid() {
   return (
      <div className={shopClasses.productsGrid}>
         {PRODUCTS.map((p) => (
            <div key={p.period} className={shopClasses.productCard}>
               <div className={shopClasses.productVip}>RATER</div>
               <div className={shopClasses.productPeriod}>{p.period}</div>
               <div className={shopClasses.productSubtitle}>{p.subtitle}</div>
               <div className={shopClasses.productPrice}>{p.price}</div>
            </div>
         ))}
      </div>
   );
}