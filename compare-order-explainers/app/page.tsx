import Link from "next/link";

function StageCard({
  href,
  title,
  ageBand,
  description,
}: {
  href: string;
  title: string;
  ageBand: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="block bg-card border border-line rounded-2xl px-6 py-5 hover:border-line-2 transition-colors shadow-sm"
    >
      <div className="font-mono text-[12px] text-ink-3 mb-1">{ageBand}</div>
      <div className="font-serif text-[20px] font-semibold text-ink mb-1">{title}</div>
      <div className="text-[14px] text-ink-2">{description}</div>
    </Link>
  );
}

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center bg-paper px-4 py-10">
      <div className="w-full max-w-md flex flex-col gap-4">
        <h1 className="font-serif text-[24px] font-semibold text-center text-ink mb-2">
          Compare &amp; Order Numbers, Visualized
        </h1>
        <StageCard
          href="/stage2/"
          title="Compare & Order Numbers up to 99"
          ageBand="Ages 6–7"
          description="Compare a set of two-digit numbers by their tens and ones digits, then order them smallest to largest."
        />
        <StageCard
          href="/stage3/"
          title="Compare & Order Numbers up to 999"
          ageBand="Ages 7–8"
          description="The same walkthrough, now with hundreds, tens and ones - and the =, < symbols."
        />
      </div>
    </div>
  );
}
