/**
 * Topographic contour lines decoration
 * Used in Trust & Safety section background
 */
export function TopographicLines() {
  return (
    <svg
      className="absolute inset-0 w-full h-full opacity-10"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1200 800"
      preserveAspectRatio="none"
    >
      <path
        d="M0,200 Q300,150 600,200 T1200,200"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M0,300 Q300,250 600,300 T1200,300"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M0,400 Q300,350 600,400 T1200,400"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M0,500 Q300,450 600,500 T1200,500"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
      <path
        d="M0,600 Q300,550 600,600 T1200,600"
        stroke="white"
        strokeWidth="2"
        fill="none"
      />
    </svg>
  );
}
