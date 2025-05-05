// components/ui/HeaderWrapper.tsx
"use client";

import { usePathname } from "next/navigation";
import Header from "./header";

export default function HeaderWrapper() {
  const pathname = usePathname();

  // Show Header only if not on /user-info
  const showHeader = pathname !== "/user-info";

  return showHeader ? <Header /> : null;
}
