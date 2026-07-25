import { marqueeSkills } from "@/lib/defaultContent";

/* Slow continuous skill strip between major sections. */
export default function Marquee() {
  const items = [...marqueeSkills, ...marqueeSkills];
  return (
    <div
      className="relative overflow-hidden border-y border-white/5 py-4"
      style={{ background: "rgba(4,3,3,0.55)" }}
      aria-hidden="true"
    >
      <div className="marquee-track">
        {items.map((skill, i) => (
          <span
            key={i}
            className="label whitespace-nowrap px-6 font-mono text-[11px] text-human/45"
          >
            {skill} <span className="ml-6 text-pen/30">·</span>
          </span>
        ))}
      </div>
    </div>
  );
}
