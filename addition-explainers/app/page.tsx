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
          Adding
        </h1>
        <StageCard
          href="/stage1/"
          title="Putting Dots Together"
          ageBand="Ages 5–6"
          description="Move all the dots into one box, then count."
        />
        <StageCard
          href="/stage2/"
          title="2-Digit Addition"
          ageBand="Ages 6–7"
          description="Guess the answer, then move the tens and ones to check."
        />
        <StageCard
          href="/stage3/"
          title="3-Digit Addition with Regrouping"
          ageBand="Ages 7–8"
          description="Bigger numbers — now you pack 10 ones into a ten."
        />
      </div>
    </div>
  );
}
