import { Highlight } from "prism-react-renderer";
import "prismjs/components/prism-bash";
import "prismjs/components/prism-json";
import { Fragment, useState } from "react";

import { cn } from "../../lib/utils";
import { Button } from "../atoms/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../atoms/tooltip";

function ClipboardIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      fill="currentColor"
      {...props}
    >
      <title>Copy to clipboard</title>
      <path
        fillRule="evenodd"
        d="M17.663 3.118c.225.015.45.032.673.05C19.876 3.298 21 4.604 21 6.109v9.642a3 3 0 01-3 3V16.5c0-5.922-4.576-10.775-10.384-11.217.324-1.132 1.3-2.01 2.548-2.114.224-.019.448-.036.673-.051A3 3 0 0113.5 1.5H15a3 3 0 012.663 1.618zM12 4.5A1.5 1.5 0 0113.5 3H15a1.5 1.5 0 011.5 1.5H12z"
        clipRule="evenodd"
      />
      <path d="M3 8.625c0-1.036.84-1.875 1.875-1.875h.375A3.75 3.75 0 019 10.5v1.875c0 1.036.84 1.875 1.875 1.875h1.875A3.75 3.75 0 0116.5 18v2.625c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625v-12z" />
      <path d="M10.5 10.5a5.23 5.23 0 00-1.279-3.434 9.768 9.768 0 016.963 6.963 5.23 5.23 0 00-3.434-1.279h-1.875a.375.375 0 01-.375-.375V10.5z" />
    </svg>
  );
}

function ClipboardSuccessIcon(props: React.ComponentPropsWithoutRef<"svg">) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="currentColor"
      {...props}
    >
      <title>Copied to clipboard</title>
      <path
        fillRule="evenodd"
        d="M7.502 6h7.128A3.375 3.375 0 0118 9.375v9.375a3 3 0 003-3V6.108c0-1.505-1.125-2.811-2.664-2.94a48.972 48.972 0 00-.673-.05A3 3 0 0015 1.5h-1.5a3 3 0 00-2.663 1.618c-.225.015-.45.032-.673.05C8.662 3.295 7.554 4.542 7.502 6zM13.5 3A1.5 1.5 0 0012 4.5h4.5A1.5 1.5 0 0015 3h-1.5z"
        clipRule="evenodd"
      />
      <path
        fillRule="evenodd"
        d="M3 9.375C3 8.339 3.84 7.5 4.875 7.5h9.75c1.036 0 1.875.84 1.875 1.875v11.25c0 1.035-.84 1.875-1.875 1.875h-9.75A1.875 1.875 0 013 20.625V9.375zm9.586 4.594a.75.75 0 00-1.172-.938l-2.476 3.096-.908-.907a.75.75 0 00-1.06 1.06l1.5 1.5a.75.75 0 001.116-.062l3-3.75z"
        clipRule="evenodd"
      />
    </svg>
  );
}

interface CopyButtonProps {
  text: string;
}

function CopyButton({ text }: CopyButtonProps) {
  const [animating, setAnimating] = useState(false);
  const [success, setSuccess] = useState(true);
  const onCopy = async () => {
    if (animating) {
      return;
    }

    setSuccess(true);
    setAnimating(true);

    try {
      await navigator.clipboard.writeText(text);
    } catch (_) {
      setSuccess(false);
    }

    setTimeout(() => {
      setAnimating(false);
    }, 1500);
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            className="absolute top-1.5 right-1.5 px-2.5 py-0 dark:bg-zinc-900 dark:text-zinc-50 dark:hover:bg-zinc-900/90"
            onClick={onCopy}
          >
            <ClipboardIcon
              className={cn(
                "block h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all",
                animating && "-rotate-90 scale-0 hidden",
                "fill-zinc-50",
              )}
            />
            <ClipboardSuccessIcon
              className={cn(
                "hidden h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all",
                animating && "rotate-0 scale-100 block",
                success ? "fill-emerald-400" : "fill-red-400",
              )}
            />
          </Button>
        </TooltipTrigger>
        <TooltipContent className="py-0">
          <p>Copy to clipboard</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function Fence({ children, language }) {
  return (
    <div className="relative">
      <Highlight
        code={children.trimEnd()}
        language={language}
        theme={{
          plain: {},
          styles: [],
        }}
      >
        {({ className, style, tokens, getTokenProps }) => {
          const text = tokens
            .map((line) => line.map((token) => token.content).join(""))
            .join("\n");

          return (
            <>
              <pre className={cn(className, "pr-14")} style={style}>
                <code>
                  {tokens.map((line, lineIndex) => (
                    <Fragment key={`line_${lineIndex}`}>
                      {line
                        .filter((token) => !token.empty)
                        .map((token, tokenIndex) => (
                          <span
                            key={`token_${tokenIndex}`}
                            {...getTokenProps({ token })}
                          />
                        ))}
                      {"\n"}
                    </Fragment>
                  ))}
                </code>
              </pre>
              <CopyButton text={text} />
            </>
          );
        }}
      </Highlight>
    </div>
  );
}
