import type { HTMLAttributes } from 'react';

export default function GeometricBackground({
    className = '',
    ...props
}: HTMLAttributes<HTMLDivElement>) {
    return (
        <div
            aria-hidden="true"
            className={`pointer-events-none absolute inset-0 z-0 h-full w-full overflow-hidden select-none ${className}`}
            {...props}
        >
            <svg
                className="absolute inset-0 h-full w-full"
                viewBox="0 0 1920 1080"
                preserveAspectRatio="none"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <defs>
                    <linearGradient
                        id="gb-band1"
                        gradientUnits="userSpaceOnUse"
                        x1="474"
                        y1="0"
                        x2="761"
                        y2="0"
                    >
                        <stop offset="0%" stopColor="#e0e0e0" stopOpacity="0.85" />
                        <stop offset="35%" stopColor="#efefef" stopOpacity="0.7" />
                        <stop offset="70%" stopColor="#f8f8f8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>

                    {/* Band 2 gradient — same style, offset further right */}
                    <linearGradient
                        id="gb-band2"
                        gradientUnits="userSpaceOnUse"
                        x1="975"
                        y1="0"
                        x2="1262"
                        y2="0"
                    >
                        <stop offset="0%" stopColor="#e0e0e0" stopOpacity="0.85" />
                        <stop offset="35%" stopColor="#efefef" stopOpacity="0.7" />
                        <stop offset="70%" stopColor="#f8f8f8" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>

                    {/* Band 3 gradient — third strip, faintest */}
                    <linearGradient
                        id="gb-band3"
                        gradientUnits="userSpaceOnUse"
                        x1="1480"
                        y1="0"
                        x2="1760"
                        y2="0"
                    >
                        <stop offset="0%" stopColor="#e8e8e8" stopOpacity="0.6" />
                        <stop offset="40%" stopColor="#f4f4f4" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                    </linearGradient>
                </defs>

                {/*
                 * White base fill covering the entire background
                 */}
                <rect width="1920" height="1080" fill="#ffffff" />

                {/*
                 * Band 1 — primary diagonal strip
                 * Polygon points (1920×1080 viewBox, based on 1024×608 reference scaled ×1.875/×1.776):
                 *   Top edge:  x=474 to x=761 at y=0
                 *   Left edge: x=0 at y=449 to y=721
                 * The band runs at ~45° from upper-right to lower-left.
                 *
                 * Exact polygon: (474,0) → (761,0) → (0,721) → (0,449)
                 */}
                <polygon
                    points="474,0 761,0 0,721 0,449"
                    fill="url(#gb-band1)"
                />

                {/*
                 * Thin hairline edge on the left (darker) side of Band 1
                 * This creates the crisp "edge" look visible in the reference
                 */}
                <line
                    x1="474"
                    y1="0"
                    x2="0"
                    y2="449"
                    stroke="#d8d8d8"
                    strokeWidth="1"
                    strokeOpacity="0.6"
                />
                <line
                    x1="761"
                    y1="0"
                    x2="0"
                    y2="721"
                    stroke="#e8e8e8"
                    strokeWidth="0.75"
                    strokeOpacity="0.4"
                />

                {/*
                 * Band 2 — second parallel diagonal strip
                 * Offset 500px to the right from Band 1 (original: ~267px × 1.875 ≈ 500px)
                 *   Top edge:  x=975 to x=1262 at y=0
                 *   Bottom: right edge exits at x=182 at y=1080, left edge exits left at y≈975
                 * Polygon: (975,0) → (1262,0) → (182,1080) → (0,1080) → (0,975)
                 */}
                <polygon
                    points="975,0 1262,0 182,1080 0,1080 0,975"
                    fill="url(#gb-band2)"
                />

                <line
                    x1="975"
                    y1="0"
                    x2="0"
                    y2="975"
                    stroke="#d8d8d8"
                    strokeWidth="1"
                    strokeOpacity="0.55"
                />
                <line
                    x1="1262"
                    y1="0"
                    x2="182"
                    y2="1080"
                    stroke="#e8e8e8"
                    strokeWidth="0.75"
                    strokeOpacity="0.35"
                />

                {/*
                 * Band 3 — optional third band further right, very faint
                 * Adds rhythm/depth to the pattern for wide screens
                 * Polygon: (1480,0) → (1760,0) → (680,1080) → (400,1080)
                 */}
                <polygon
                    points="1480,0 1760,0 680,1080 400,1080"
                    fill="url(#gb-band3)"
                />

                <line
                    x1="1480"
                    y1="0"
                    x2="400"
                    y2="1080"
                    stroke="#e0e0e0"
                    strokeWidth="0.75"
                    strokeOpacity="0.4"
                />
            </svg>
        </div>
    );
}
