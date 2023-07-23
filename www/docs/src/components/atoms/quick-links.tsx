import Link from "next/link";

import { Icon } from "../icons/icon";
import { PropsWithChildren } from "react";

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
}

export function QuickLink({ title, description, href, icon }: QuickLinkProps) {
  const comingSoon = !href;
  const Wrapper = !comingSoon ? Link : "div";

  return (
    <div className="group relative rounded-xl border border-zinc-200 dark:border-zinc-800">
      <div className="absolute -inset-px rounded-xl border-2 border-transparent opacity-0 [background:linear-gradient(var(--quick-links-hover-bg,theme(colors.indigo.50)),var(--quick-links-hover-bg,theme(colors.indigo.50)))_padding-box,linear-gradient(to_top,theme(colors.indigo.400),theme(colors.cyan.400),theme(colors.indigo.500))_border-box] group-hover:opacity-100 dark:[--quick-links-hover-bg:theme(colors.zinc.800)]" />
      {comingSoon && (
        <div className="absolute hidden justify-center items-center inset-0.5 bg-zinc-100/70 rounded-lg z-10 group-hover:flex dark:bg-zinc-900/70">
          <span className="text-zinc-900 font-semibold dark:text-zinc-100">
            Coming soon...
          </span>
        </div>
      )}
      <div className="relative overflow-hidden rounded-xl p-6">
        <Icon icon={icon} className="h-10 w-10" />
        <h2 className="mt-4 font-display text-base text-zinc-900 dark:text-white">
          <Wrapper href={href}>
            <span className="absolute -inset-px rounded-xl" />
            {title}
          </Wrapper>
        </h2>
        <p className="mt-1 text-sm text-zinc-700 dark:text-zinc-400">
          {description}
        </p>
      </div>
    </div>
  );
}
