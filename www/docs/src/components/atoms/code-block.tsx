import clsx from "clsx";
import Highlight, { type Language, defaultProps } from "prism-react-renderer";
import { Fragment } from "react";

interface CodeBlockProps {
  code: string;
  language: Language;
}

export function CodeBlock({ code, language }: CodeBlockProps) {
  return (
    <div className="flex items-start px-1 text-sm">
      <div
        aria-hidden="true"
        className="select-none border-r border-zinc-300/5 pr-4 font-mono text-zinc-600"
      >
        {Array.from({
          length: code.split("\n").length,
        }).map((_, index) => (
          <Fragment key={`line_number_${index}`}>
            {(index + 1).toString().padStart(2, "0")}
            <br />
          </Fragment>
        ))}
      </div>
      <Highlight
        {...defaultProps}
        code={code}
        language={language}
        theme={undefined}
      >
        {({ className, style, tokens, getLineProps, getTokenProps }) => (
          <pre
            className={clsx(className, "flex overflow-x-auto pb-6")}
            style={style}
          >
            <code className="px-4">
              {tokens.map((line, lineIndex) => (
                <div key={`line_${lineIndex}`} {...getLineProps({ line })}>
                  {line.map((token, tokenIndex) => (
                    <span
                      key={`token_${tokenIndex}`}
                      {...getTokenProps({ token })}
                    />
                  ))}
                </div>
              ))}
            </code>
          </pre>
        )}
      </Highlight>
    </div>
  );
}
