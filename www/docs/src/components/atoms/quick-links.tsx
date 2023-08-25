import Link from "next/link";

import { Icon } from "../icons/icon";
import { PropsWithChildren } from "react";

interface BadgeProps {
  text: string;
  className: string;
}

function Badge({ text, className }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-md px-1.5 py-0.5 text-xs font-medium  ring-1 ring-inset ${className}`}
    >
      {text}
    </span>
  );
}

export function QuickLinks({ children }: PropsWithChildren) {
  return (
    <div className="not-prose my-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
      {children}
    </div>
  );
}

interface QuickLinkProps {
  title: string;
  description: string;
  href?: string;
  icon: string;
  tag?: string;
}

export function QuickLink({
  title,
  description,
  href,
  icon,
  tag,
}: QuickLinkProps) {
  const Wrapper = href ? Link : "div";
  let tagClasses = "bg-zinc-400/10 text-zinc-400 ring-zinc-400/20";

  if (tag === "New") {
    tagClasses = "bg-green-500/10 text-green-400 ring-green-500/20";
  } else if (tag === "Alpha") {
    tagClasses = "bg-yellow-400/10 text-yellow-500 ring-yellow-400/20";
  } else if (tag === "Beta") {
    tagClasses = "bg-blue-400/10 text-blue-400 ring-blue-400/30";
  }

  return (
    <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="absolute -inset-px rounded-xl border-2 border-transparent opacity-0 [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.indigo.50)),var(--quick-links-hover-bg,theme(colors.indigo.50)))_padding-box,linear-gradient(to_top,theme(colors.indigo.400),theme(colors.cyan.400),theme(colors.indigo.500))_border-box] group-hover:opacity-100 dark:[--quick-links-hover-bg:theme(colors.zinc.800)]" />
      <div className="relative overflow-hidden rounded-xl p-6">
        <Icon icon={icon} className="h-10 w-10" />
        <div className="flex items-center mt-4">
          <h2 className="font-display text-base text-zinc-900 dark:text-white">
            <Wrapper href={href}>
              <span className="absolute -inset-px rounded-xl" />
              {title}
            </Wrapper>
          </h2>
          {tag && <Badge text={tag} className={`ml-2 ${tagClasses}`} />}
        </div>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}
