"use client";

export default function ScrollDownArrow({ targetRef }: { targetRef: React.RefObject<HTMLDivElement | null> }) {
  const scrollToTarget = () => {
    if (targetRef.current) {
      const offset = 60; // Adjust this value as needed
      const targetPosition = targetRef.current.getBoundingClientRect().top + window.pageYOffset - offset;
      window.scrollTo({ top: targetPosition, behavior: "smooth" });
    }
  };

  return (
    <div
      className="absolute bottom-10 left-1/2 transform -translate-x-1/2 cursor-pointer"
      onClick={scrollToTarget}
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        className="h-10 w-10 text-white animate-bounce"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}