export function resetUi(p: {
   thumbRef: React.RefObject<HTMLDivElement | null>;
   trackRef: React.RefObject<HTMLDivElement | null>;
   moverRef: React.RefObject<HTMLDivElement | null>;
   startAngleRef: React.MutableRefObject<number>;
}) {
   const { thumbRef, trackRef, moverRef, startAngleRef } = p;

   const thumb = thumbRef.current;
   const track = trackRef.current;
   if (thumb) {
      thumb.style.left = "0px";
      thumb.setAttribute("aria-valuenow", "0");
   }
   if (track) track.style.width = "0px";

   const mover = moverRef.current;
   if (mover) {
      mover.style.transform = `translateY(-50%) rotate(${startAngleRef.current}deg)`;
   }
}