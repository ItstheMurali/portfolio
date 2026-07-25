"use client";

import { useState } from "react";
import Loader from "@/components/Loader";
import SmoothScroll from "@/components/SmoothScroll";
import PenCursor from "@/components/PenCursor";
import StormCanvas from "@/components/hero/StormCanvas";
import Nav from "@/components/Nav";
import Marquee from "@/components/Marquee";
import Hero from "@/components/hero/Hero";
import ScaleSection from "@/components/sections/ScaleSection";
import WorkSection from "@/components/sections/WorkSection";
import ArchitectureSection from "@/components/sections/ArchitectureSection";
import ToolsSection from "@/components/sections/ToolsSection";
import ImpactDashboard from "@/components/sections/ImpactDashboard";
import StandardsSection from "@/components/sections/StandardsSection";
import ApiDemoSection from "@/components/sections/ApiDemoSection";
import BuiltWithSection from "@/components/sections/BuiltWithSection";
import FilmsSection from "@/components/sections/FilmsSection";
import ContactSection from "@/components/sections/ContactSection";
import type {
  Identity,
  StatCounter,
  CaseStudy,
  Tool,
  Film,
  WorkCategory,
} from "@/lib/defaultContent";
import type { sectionCopy } from "@/lib/defaultContent";

export interface PortfolioContent {
  identity: Identity;
  stats: StatCounter[];
  cases: CaseStudy[];
  tools: Tool[];
  films: Film[];
  work: WorkCategory[];
  copy: typeof sectionCopy;
}

export default function PortfolioPage({ content }: { content: PortfolioContent }) {
  const [loaded, setLoaded] = useState(false);

  return (
    <SmoothScroll>
      <Loader onDone={() => setLoaded(true)} />
      <PenCursor />
      <Nav />
      <div className="grain-overlay" aria-hidden="true" />
      <div className="vignette-overlay" aria-hidden="true" />

      {/* the storm lives behind the entire site: falling in the hero,
          ambient documentation-fragment drift behind every section after */}
      <div
        className="pointer-events-none fixed inset-0 z-0 transition-opacity duration-[400ms]"
        style={{ opacity: loaded ? 1 : 0 }}
        aria-hidden="true"
      >
        <StormCanvas />
      </div>

      <main
        className="relative z-[1] transition-opacity duration-[400ms]"
        style={{ opacity: loaded ? 1 : 0 }}
      >
        <Hero identity={content.identity} />
        <ScaleSection stats={content.stats} />
        <Marquee />
        <WorkSection categories={content.work} heading={content.copy.workHeading} />
        <Marquee />
        <ArchitectureSection
          cases={content.cases}
          heading={content.copy.architectureHeading}
        />
        <Marquee />
        <ToolsSection
          tools={content.tools}
          heading={content.copy.toolsHeading}
          closing={content.copy.toolsClosing}
        />
        <ImpactDashboard />
        <StandardsSection />
        <ApiDemoSection
          heading={content.copy.apiHeading}
          closing={content.copy.apiClosing}
          detailHref="/api-experience"
        />
        <BuiltWithSection />
        <Marquee />
        <FilmsSection
          films={content.films}
          lineA={content.copy.filmsLineA}
          lineB={content.copy.filmsLineB}
          closing={content.copy.filmsClosing}
        />
        <ContactSection
          identity={content.identity}
          question={content.copy.contactQuestion}
          invite={content.copy.contactInvite}
          note={content.copy.contactNote}
        />

        <footer className="border-t border-white/5 px-6 py-8 text-center">
          <p className="font-mono text-[10px] text-human/30">
            © {new Date().getFullYear()} Murali Krishna Kolipaka · built with
            intention.
          </p>
        </footer>
      </main>
    </SmoothScroll>
  );
}
