import Image from "next/image";

export function BrandMark({ className = "h-9 w-7" }: { className?: string }) {
  return <Image src="/images/soundfuel-mark.svg" alt="" aria-hidden="true" width={28} height={36} priority className={`brand-mark shrink-0 object-contain ${className}`} />;
}

export default function Brand() {
  return <span className="brand-lockup flex items-center gap-2.5 leading-none"><BrandMark /><span className="brand-wordmark block text-lg font-semibold leading-none tracking-[-0.04em] text-foreground">soundfuel<span className="text-accent-300">.</span></span></span>;
}
