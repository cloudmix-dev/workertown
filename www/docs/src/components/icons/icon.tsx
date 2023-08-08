import clsx from "clsx";
import { useId } from "react";

import { AuthIcon } from "./auth-icon";
import { CMSIcon } from "./cms-icon";
import { EventsIcon } from "./events-icon";
import { FilesIcon } from "./files-icon";
import { FlagsIcon } from "./flags-icon";
import { InstallationIcon } from "./installation-icon";
import { KVIcon } from "./kv-icon";
import { LightbulbIcon } from "./lightbulb-icon";
import { PluginsIcon } from "./plugins-icon";
import { PresetsIcon } from "./presets-icon";
import { PubSubIcon } from "./pubsub-icon";
import { QueuesIcon } from "./queues-icon";
import { SearchIcon } from "./search-icon";
import { ThemingIcon } from "./theming-icon";
import { WarningIcon } from "./warning-icon";

const icons = {
  auth: AuthIcon,
  cms: CMSIcon,
  events: EventsIcon,
  files: FilesIcon,
  flags: FlagsIcon,
  installation: InstallationIcon,
  kv: KVIcon,
  lightbulb: LightbulbIcon,
  plugins: PluginsIcon,
  presets: PresetsIcon,
  pubsub: PubSubIcon,
  queues: QueuesIcon,
  search: SearchIcon,
  theming: ThemingIcon,
  warning: WarningIcon,
};

const iconStyles = {
  blue: "[--icon-foreground:theme(colors.zinc.900)] [--icon-background:theme(colors.white)]",
  amber:
    "[--icon-foreground:theme(colors.amber.900)] [--icon-background:theme(colors.amber.100)]",
};

export function Icon({ color = "blue", icon, className, ...props }) {
  const id = useId();
  const IconComponent = icons[icon];

  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 32 32"
      fill="none"
      className={clsx(className, iconStyles[color])}
      {...props}
    >
      <title>Icon</title>
      <IconComponent id={id} color={color} />
    </svg>
  );
}

const gradients = {
  blue: [
    { stopColor: "#6366f1" }, // indigo-500
    { stopColor: "#818cf8", offset: ".527" }, // indigo-400
    { stopColor: "#6366f1", offset: 1 }, // indigo-500
  ],
  amber: [
    { stopColor: "#fde68a", offset: ".08" }, // amber-200
    { stopColor: "#f59e0b", offset: ".837" }, // amber-500
  ],
};

export function Gradient({ color = "blue", ...props }) {
  return (
    <radialGradient
      cx={0}
      cy={0}
      r={1}
      gradientUnits="userSpaceOnUse"
      {...props}
    >
      {gradients[color].map((stop, stopIndex) => (
        <stop key={`stop_${stopIndex}`} {...stop} />
      ))}
    </radialGradient>
  );
}

interface ThemeModeProps {
  className?: string;
  // rome-ignore lint/suspicious/noExplicitAny: We need to allow any props to be passed through
  [x: string]: any;
}

export function LightMode({ className, ...props }: ThemeModeProps) {
  return <g className={clsx("dark:hidden", className)} {...props} />;
}

export function DarkMode({ className, ...props }: ThemeModeProps) {
  return <g className={clsx("hidden dark:inline", className)} {...props} />;
}
