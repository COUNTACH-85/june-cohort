"use client"

import Footer from "./Footer";
import { usePathname } from "next/navigation";

export default function ConditionalFooter() {
  const pathname = usePathname();
  const hideFooterPaths = ["/signin", "/signup"];

  if (hideFooterPaths.includes(pathname)) {
    return null;
  }

  return <Footer />;
}