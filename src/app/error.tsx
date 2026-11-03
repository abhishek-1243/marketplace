"use client";
import Link from "next/link";
import { RefreshCw } from "lucide-react";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return <div className="mx-auto max-w-xl px-4 py-20 text-center" role="alert"><RefreshCw aria-hidden="true" className="mx-auto mb-6 h-9 w-9 text-accent-300" /><h1 className="page-title">Let’s try that again.</h1><p className="page-description">We couldn’t load this page. Please try again, or contact the team if the problem continues.</p><div className="mt-8 flex flex-wrap justify-center gap-3"><button onClick={reset} className="soundfuel-button">Try again</button><Link href="/contact" className="soundfuel-button-secondary">Contact support</Link></div></div>;
}
