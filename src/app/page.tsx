"use client";
import { AuroraBackgroundDemo } from "@/components/ui/AuroraBackgroundDemo";
import ScrollDownArrow from "@/components/ui/ScrollDownArrow";
import Why from "@/components/Why";
import { useRef } from "react";
import { Navbar } from "@/components/ui/Navbar";

export default function Home() {
  const homeSectionRef = useRef<HTMLDivElement>(null);
  const whySectionRef = useRef<HTMLDivElement>(null);

  return (
    <div className="min-h-screen bg-black">
      <Navbar 
        homeSectionRef={homeSectionRef} 
        whySectionRef={whySectionRef}
      />
      <div ref={homeSectionRef} className="h-screen bg-black relative">
        <AuroraBackgroundDemo />
        <ScrollDownArrow targetRef={whySectionRef} />
      </div>
      <div ref={whySectionRef} className="h-screen bg-black">
        <Why />
      </div>
    </div>
  );
}