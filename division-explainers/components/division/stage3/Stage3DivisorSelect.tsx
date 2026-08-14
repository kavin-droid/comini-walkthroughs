import { STAGE3_META } from "@/lib/division/stage3";

export function Stage3DivisorSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-[88px] h-11 rounded-xl border-2 border-line-2 bg-card px-1 font-mono text-xl text-center text-ink cursor-pointer focus:outline-none focus:border-accent"
      style={{ textAlignLast: "center" }}
    >
      {STAGE3_META.divisorOptions.map((d) => (
        <option key={d} value={d}>
          {d}
        </option>
      ))}
    </select>
  );
}
