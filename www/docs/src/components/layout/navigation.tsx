import clsx from "clsx";
import Link from "next/link";
import { useRouter } from "next/router";

interface NavigationProps {
  navigation: {
    title: string;
    links: {
      title: string;
      href: string;
    }[];
  }[];
  className?: string;
}

export function Navigation({ navigation, className }: NavigationProps) {
  let router = useRouter();

  return (
    <nav className={clsx("text-base lg:text-sm", className)}>
      <ul role="list" className="space-y-9">
        {navigation.map((section) => (
          <li key={section.title}>
            <h2 className="font-display font-medium text-zinc-900 dark:text-white">
              {section.title}
            </h2>
            <ul
              role="list"
              className="mt-2 space-y-2 border-l-2 border-zinc-50 dark:border-zinc-800 lg:mt-4 lg:space-y-4 lg:border-zinc-200"
            >
              {section.links.map((link) => (
                <li key={link.href} className="relative">
                  <Link
                    href={link.href}
                    className={clsx(
                      "block w-full pl-3.5 before:pointer-events-none before:absolute before:-left-1 before:top-1/2 before:h-1.5 before:w-1.5 before:-translate-y-1/2 before:rounded-full",
                      link.href === router.pathname
                        ? "font-semibold text-indigo-500 before:bg-indigo-500"
                        : "text-zinc-500 before:hidden before:bg-zinc-300 hover:text-zinc-600 hover:before:block dark:text-zinc-400 dark:before:bg-zinc-700 dark:hover:text-zinc-300"
                    )}
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ul>
    </nav>
  );
}
