import { DarkMode, Gradient, LightMode } from "../icons/icon";

export function PubSubIcon({ id, color }) {
  return (
    <>
      <defs>
        <Gradient
          id={`${id}-gradient`}
          color={color}
          gradientTransform="matrix(0 21 -21 0 12 3)"
        />
        <Gradient
          id={`${id}-gradient-dark`}
          color={color}
          gradientTransform="matrix(0 21 -21 0 16 7)"
        />
      </defs>
      <LightMode>
        <circle cx={12} cy={12} r={12} fill={`url(#${id}-gradient)`} />
        <path
          d="M7.217 10.907a2.25 2.25 0 100 2.186m0-2.186c.18.324.283.696.283 1.093s-.103.77-.283 1.093m0-2.186l9.566-5.314m-9.566 7.5l9.566 5.314m0 0a2.25 2.25 0 103.935 2.186 2.25 2.25 0 00-3.935-2.186zm0-12.814a2.25 2.25 0 103.933-2.185 2.25 2.25 0 00-3.933 2.185z"
          strokeLinecap="round"
          strokeLinejoin="round"
          fillOpacity={0.5}
          className="fill-[var(--icon-background)] stroke-[color:var(--icon-foreground)]"
          strokeWidth={2}
        />
      </LightMode>
      <DarkMode>
        <path
          d="M15.75 4.5a3 3 0 11.825 2.066l-8.421 4.679a3.002 3.002 0 010 1.51l8.421 4.679a3 3 0 11-.729 1.31l-8.421-4.678a3 3 0 110-4.132l8.421-4.679a3 3 0 01-.096-.755z"
          fill={`url(#${id}-gradient-dark)`}
          stroke={`url(#${id}-gradient-dark)`}
          fillRule="evenodd"
          clipRule="evenodd"
          strokeWidth={0}
        />
      </DarkMode>
    </>
  );
}
