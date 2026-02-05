export function generateArchivePassword(): string {
   return Math.floor(1000 + Math.random() * 9000).toString();
}

export function generateBuildId(): string {
   const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
   let id = "";
   const len = 10 + Math.floor(Math.random() * 6);
   for (let i = 0; i < len; i++) id += chars.charAt(Math.floor(Math.random() * chars.length));
   return id;
}