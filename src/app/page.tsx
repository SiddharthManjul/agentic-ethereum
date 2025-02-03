"use client"
import { AuroraBackgroundDemo } from "@/components/ui/AuroraBackgroundDemo";
import ScrollDownArrow from "@/components/ui/ScrollDownArrow";
import Why from "@/components/Why";
import { useRef, useEffect } from "react";
import { Navbar } from "@/components/ui/Navbar";

export default function Home() {
  const homeSectionRef = useRef<HTMLDivElement>(null);
  const whySectionRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!homeSectionRef.current || !whySectionRef.current) {
      throw new Error("Refs are not assigned correctly");
    }
  }, []);

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