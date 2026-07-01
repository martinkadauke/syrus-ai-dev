import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

const base = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.6,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

export function AppleIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M16.365 12.68c.02 2.29 2.01 3.052 2.03 3.06-.016.05-.318 1.09-1.05 2.163-.632.93-1.29 1.856-2.323 1.875-1.016.019-1.343-.6-2.503-.6-1.16 0-1.523.581-2.485.62-.999.038-1.76-1.005-2.398-1.932-1.303-1.897-2.3-5.36-.962-7.697.664-1.16 1.852-1.895 3.14-1.914.98-.02 1.905.66 2.503.66.598 0 1.723-.816 2.905-.696.495.02 1.884.2 2.777 1.507-.073.045-1.658.968-1.64 2.888M14.79 6.35c.528-.64.884-1.53.787-2.415-.76.03-1.68.506-2.226 1.145-.49.567-.919 1.472-.803 2.34.847.066 1.714-.43 2.242-1.07" />
    </svg>
  );
}

export function GitHubIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden {...props}>
      <path d="M12 1.5A10.5 10.5 0 0 0 1.5 12a10.5 10.5 0 0 0 7.18 9.96c.525.096.716-.228.716-.507 0-.25-.009-.912-.014-1.79-2.92.635-3.536-1.408-3.536-1.408-.478-1.214-1.167-1.537-1.167-1.537-.954-.652.073-.639.073-.639 1.055.074 1.61 1.083 1.61 1.083.938 1.607 2.46 1.143 3.06.874.096-.679.367-1.143.667-1.406-2.33-.265-4.783-1.166-4.783-5.187 0-1.146.41-2.083 1.082-2.817-.109-.266-.469-1.334.103-2.78 0 0 .882-.283 2.89 1.076A10.05 10.05 0 0 1 12 6.32c.894.004 1.795.121 2.636.355 2.006-1.36 2.887-1.076 2.887-1.076.573 1.446.213 2.514.104 2.78.674.734 1.08 1.671 1.08 2.817 0 4.031-2.457 4.919-4.796 5.179.377.325.714.964.714 1.943 0 1.404-.013 2.536-.013 2.881 0 .281.189.608.722.505A10.5 10.5 0 0 0 22.5 12 10.5 10.5 0 0 0 12 1.5Z" />
    </svg>
  );
}

export function ArrowRight(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

export function ArrowDown(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M12 5v14M6 13l6 6 6-6" />
    </svg>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

/* Feature-pillar icons ---------------------------------------------------- */
export function FeatureIcon({ id, ...props }: IconProps & { id: string }) {
  switch (id) {
    case "context": // </>
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <path d="m8 8-4 4 4 4M16 8l4 4-4 4M14 4l-4 16" />
        </svg>
      );
    case "keys":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <circle cx="8" cy="8" r="4" />
          <path d="m10.8 10.8 8.2 8.2M16 16l2.5-2.5M14 18l2.5-2.5" />
        </svg>
      );
    case "audit":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <path d="M6 3h9l5 5v13a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1Z" />
          <path d="M14 3v5h5M8.5 13l1.8 1.8 3.2-3.3M8.5 18h7" />
        </svg>
      );
    case "github":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <circle cx="6" cy="6" r="2.4" />
          <circle cx="6" cy="18" r="2.4" />
          <circle cx="18" cy="9" r="2.4" />
          <path d="M6 8.4v7.2M8.2 7.2A6 6 0 0 0 15.6 10" />
        </svg>
      );
    case "approve":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <path d="M12 3 5 6v5c0 4.2 2.9 7.6 7 9 4.1-1.4 7-4.8 7-9V6l-7-3Z" />
          <path d="m9 11.5 2 2 4-4" />
        </svg>
      );
    case "leverage": // more output
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <circle cx="9" cy="8" r="3" />
          <path d="M3.5 19a5.5 5.5 0 0 1 11 0" />
          <path d="M16 5.5a3 3 0 0 1 0 5.8M20.5 19a5.5 5.5 0 0 0-4.2-5.3" />
        </svg>
      );
    case "visibility": // see what's being built
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <path d="M2 12s3.6-6.5 10-6.5S22 12 22 12s-3.6 6.5-10 6.5S2 12 2 12Z" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      );
    default:
      return null;
  }
}

/* Entry-point icons ------------------------------------------------------- */
export function EntryIcon({ id, ...props }: IconProps & { id: string }) {
  switch (id) {
    case "issue":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <circle cx="12" cy="12" r="8" />
          <circle cx="12" cy="12" r="2.3" />
        </svg>
      );
    case "feedback":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <path d="M5 5h14a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H9l-4 4V6a1 1 0 0 1 1-1Z" />
          <path d="M9 10h6M9 13h3" />
        </svg>
      );
    case "ci":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <path d="M3 12h4l2 5 4-12 2 7h6" />
        </svg>
      );
    case "direct":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <rect x="3" y="4" width="18" height="16" rx="2" />
          <path d="m7 9 3 3-3 3M13 15h4" />
        </svg>
      );
    case "scheduled":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <circle cx="12" cy="12" r="8" />
          <path d="M12 8v4l3 2" />
        </svg>
      );
    case "rebase":
      return (
        <svg viewBox="0 0 24 24" aria-hidden {...base} {...props}>
          <circle cx="6" cy="6" r="2.2" />
          <circle cx="6" cy="18" r="2.2" />
          <circle cx="18" cy="18" r="2.2" />
          <path d="M6 8.2v7.6M8.2 18h7.6M18 15.8V12a6 6 0 0 0-6-6" />
        </svg>
      );
    default:
      return null;
  }
}
