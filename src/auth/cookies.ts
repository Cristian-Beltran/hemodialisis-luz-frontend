export function getCookie(name: string): string | null {
  const m = document.cookie.match(
    new RegExp(
      "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, "\\$1") + "=([^;]*)",
    ),
  );
  return m ? decodeURIComponent(m[1]) : null;
}
export function setCookie(name: string, value: string, days = 7): void {
  const expires = new Date(Date.now() + days * 864e5).toUTCString();
  document.cookie = `${name}=${encodeURIComponent(value)}; expires=${expires}; path=/; samesite=lax`;
}
export function deleteCookie(name: string): void {
  document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/; samesite=lax`;
}
