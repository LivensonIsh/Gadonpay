"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getMerchantToken } from "@/lib/auth";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.replace(getMerchantToken() ? "/dashboard/projects" : "/login");
  }, [router]);

  return null;
}
