export const SITELENZ_API_URL = (
  process.env.NEXT_PUBLIC_SITELENZ_API_URL ?? ""
).replace(/\/+$/, "");

export const DEFAULT_NETWORK: "testnet" | "mainnet" =
  process.env.NEXT_PUBLIC_DEFAULT_NETWORK === "mainnet" ? "mainnet" : "testnet";

export const DOCS_URL = process.env.NEXT_PUBLIC_DOCS_URL ?? "";

export const GITHUB_URL = process.env.NEXT_PUBLIC_GITHUB_URL ?? "";

export function apiUrl(path: string): string {
  return `${SITELENZ_API_URL}${path.startsWith("/") ? path : `/${path}`}`;
}
