import clsx from "clsx";

import { Icon } from "../icons/icon";

const styles = {
  note: {
    container:
      "bg-indigo-50 dark:bg-zinc-800/60 dark:ring-1 dark:ring-zinc-300/10",
    title: "text-indigo-900 dark:text-indigo-400",
    body: "text-indigo-800 [--tw-prose-background:theme(colors.indigo.50)] prose-a:text-indigo-900 prose-code:text-indigo-900 dark:text-zinc-300 dark:prose-code:text-zinc-300",
  },
  warning: {
    container:
      "bg-amber-50 dark:bg-zinc-800/60 dark:ring-1 dark:ring-zinc-300/10",
    title: "text-amber-900 dark:text-amber-500",
    body: "text-amber-800 [--tw-prose-underline:theme(colors.amber.400)] [--tw-prose-background:theme(colors.amber.50)] prose-a:text-amber-900 prose-code:text-amber-900 dark:text-zinc-300 dark:[--tw-prose-underline:theme(colors.indigo.700)] dark:prose-code:text-zinc-300",
  },
};

const icons = {
  note: (props) => <Icon icon="lightbulb" {...props} />,
  warning: (props) => <Icon icon="warning" color="amber" {...props} />,
};

interface CalloutProps {
  type?: keyof typeof styles;
  title: string;
  children: React.ReactNode;
}

export function Callout({ type = "note", title, children }: CalloutProps) {
  const IconComponent = icons[type];

  return (
    <div
      className={clsx(
        "my-8 flex rounded-3xl p-6 overflow-auto",
        styles[type].container,
      )}
    >
      <IconComponent className="h-8 w-8 flex-none" />
      <div className="ml-4 flex-auto">
        <p
          className={clsx(
            "m-0 font-display text-xl max-w-full",
            styles[type].title,
          )}
        >
          {title}
        </p>
        <div className={clsx("prose mt-2.5", styles[type].body)}>
          {children}
        </div>
      </div>
    </div>
  );
}
