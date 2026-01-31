import type { ReactNode } from "react";
import dynamic from "next/dynamic";

const ClientProviders = dynamic(() => import("./ClientProviders"), { ssr: false });

export default function Providers({ children }: { children: ReactNode }) {
  return <ClientProviders>{children}</ClientProviders>;
}
