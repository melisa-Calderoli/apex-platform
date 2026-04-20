"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function BackButton({ href, label = "Volver" }: { href: string; label?: string }) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-2 text-sm text-[#6b7280] hover:text-[#f97316] mb-4 transition"
    >
      <ArrowLeft size={16} />
      {label}
    </Link>
  );
}
