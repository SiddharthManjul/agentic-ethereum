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
    <>
      <Navbar homeSectionRef={homeSectionRef} />
      <div ref={homeSectionRef} className="h-screen w-screen bg-black overflow-x-hidden relative">
        <AuroraBackgroundDemo />
        <ScrollDownArrow targetRef={whySectionRef} />
      </div>
      <div ref={whySectionRef} className="h-screen w-screen overflow-x-hidden">
        <Why />
      </div>
    </>
  );
}