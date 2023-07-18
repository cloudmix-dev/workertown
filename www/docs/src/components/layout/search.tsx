import { createAutocomplete } from "@algolia/autocomplete-core";
import { Dialog } from "@headlessui/react";
import clsx from "clsx";
import { useRouter } from "next/router";
import {
  Fragment,
  forwardRef,
  useEffect,
  useId,
  useRef,
  useState,
} from "react";
import Highlighter from "react-highlight-words";

import { navigation } from "./layout";

function SearchIcon(props) {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" {...props}>
      <title>Search icon</title>
      <path d="M16.293 17.707a1 1 0 0 0 1.414-1.414l-1.414 1.414ZM9 14a5 5 0 0 1-5-5H2a7 7 0 0 0 7 7v-2ZM4 9a5 5 0 0 1 5-5V2a7 7 0 0 0-7 7h2Zm5-5a5 5 0 0 1 5 5h2a7 7 0 0 0-7-7v2Zm8.707 12.293-3.757-3.757-1.414 1.414 3.757 3.757 1.414-1.414ZM14 9a4.98 4.98 0 0 1-1.464 3.536l1.414 1.414A6.98 6.98 0 0 0 16 9h-2Zm-1.464 3.536A4.98 4.98 0 0 1 9 14v2a6.98 6.98 0 0 0 4.95-2.05l-1.414-1.414Z" />
    </svg>
  );
}

function useAutocomplete() {
  const id = useId();
  const router = useRouter();
  const [autocompleteState, setAutocompleteState] = useState<{
    [x: string]: unknown;
  }>({});
  const [autocomplete] = useState(() =>
    createAutocomplete({
      id,
      placeholder: "Find something...",
      defaultActiveItemId: 0,
      onStateChange({ state }) {
        // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the state
        setAutocompleteState(state as any);
      },
      shouldPanelOpen({ state }) {
        return state.query !== "";
      },
      getSources({ query }) {
        // rome-ignore lint/suspicious/noExplicitAny: Dealing with dyanmic import
        return import("../../markdoc/search.mjs").then(({ search }: any) => {
          return [
            {
              sourceId: "documentation",
              getItems() {
                return search(query, { limit: 5 });
              },
              getItemUrl({ item }) {
                return item.url as string;
              },
              onSelect({ itemUrl }) {
                router.push(itemUrl);
              },
            },
          ];
        });
      },
    }),
  );

  return { autocomplete, autocompleteState };
}

function LoadingIcon(props) {
  const id = useId();

  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden="true" {...props}>
      <title>Loading icon</title>
      <circle cx="10" cy="10" r="5.5" strokeLinejoin="round" />
      <path
        stroke={`url(#${id})`}
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M15.5 10a5.5 5.5 0 1 0-5.5 5.5"
      />
      <defs>
        <linearGradient
          id={id}
          x1="13"
          x2="9.5"
          y1="9"
          y2="15"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="currentColor" />
          <stop offset="1" stopColor="currentColor" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}

function HighlightQuery({ text, query }) {
  return (
    <Highlighter
      highlightClassName="group-aria-selected:underline bg-transparent text-indigo-600 dark:text-indigo-400"
      searchWords={[query]}
      autoEscape={true}
      textToHighlight={text}
    />
  );
}

function SearchResult({ result, autocomplete, collection, query }) {
  const id = useId();
  const sectionTitle = navigation.find((section) =>
    section.links.find((link) => link.href === result.url.split("#")[0]),
  )?.title;
  const hierarchy = [sectionTitle, result.pageTitle].filter(Boolean);

  return (
    <li
      className="group block cursor-default rounded-lg px-3 py-2 aria-selected:bg-zinc-50 dark:aria-selected:bg-zinc-700/30"
      aria-labelledby={`${id}-hierarchy ${id}-title`}
      {...autocomplete.getItemProps({
        item: result,
        source: collection.source,
      })}
    >
      <div
        id={`${id}-title`}
        aria-hidden="true"
        className="text-sm text-zinc-700 group-aria-selected:text-indigo-600 dark:text-zinc-300 dark:group-aria-selected:text-indigo-400"
      >
        <HighlightQuery text={result.title} query={query} />
      </div>
      {hierarchy.length > 0 && (
        <div
          id={`${id}-hierarchy`}
          aria-hidden="true"
          className="mt-0.5 truncate whitespace-nowrap text-xs text-zinc-500 dark:text-zinc-400"
        >
          {hierarchy.map((item, itemIndex, items) => (
            <Fragment key={`item_${itemIndex}`}>
              <HighlightQuery text={item} query={query} />
              <span
                className={
                  itemIndex === items.length - 1
                    ? "sr-only"
                    : "mx-2 text-zinc-300 dark:text-zinc-700"
                }
              >
                /
              </span>
            </Fragment>
          ))}
        </div>
      )}
    </li>
  );
}

function SearchResults({ autocomplete, query, collection }) {
  if (collection.items.length === 0) {
    return (
      <p className="px-4 py-8 text-center text-sm text-zinc-700 dark:text-zinc-400">
        No results for &ldquo;
        <span className="break-words text-zinc-900 dark:text-white">
          {query}
        </span>
        &rdquo;
      </p>
    );
  }

  return (
    <ul role="list" {...autocomplete.getListProps()}>
      {collection.items.map((result) => (
        <SearchResult
          key={result.url}
          result={result}
          autocomplete={autocomplete}
          collection={collection}
          query={query}
        />
      ))}
    </ul>
  );
}

interface SearchInputProps {
  // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the autocomplete here
  autocomplete: any;
  autocompleteState: { [x: string]: unknown };
  onClose: () => void;
}

const SearchInput = forwardRef(function SearchInput(
  { autocomplete, autocompleteState, onClose }: SearchInputProps,
  inputRef,
) {
  const inputProps = autocomplete.getInputProps({});

  return (
    <div className="group relative flex h-12">
      <SearchIcon className="pointer-events-none absolute left-4 top-0 h-full w-5 fill-zinc-400 dark:fill-zinc-500" />
      <input
        ref={inputRef}
        className={clsx(
          "flex-auto appearance-none bg-transparent pl-12 text-zinc-900 outline-none placeholder:text-zinc-400 focus:w-full focus:flex-none dark:text-white sm:text-sm [&::-webkit-search-cancel-button]:hidden [&::-webkit-search-decoration]:hidden [&::-webkit-search-results-button]:hidden [&::-webkit-search-results-decoration]:hidden",
          autocompleteState.status === "stalled" ? "pr-11" : "pr-4",
        )}
        {...inputProps}
        onKeyDown={(event) => {
          if (
            event.key === "Escape" &&
            !autocompleteState.isOpen &&
            autocompleteState.query === ""
          ) {
            // In Safari, closing the dialog with the escape key can sometimes cause the scroll position to jump to the
            // bottom of the page. This is a workaround for that until we can figure out a proper fix in Headless UI.
            (document.activeElement as HTMLInputElement)?.blur();

            onClose();
          } else {
            inputProps.onKeyDown(event);
          }
        }}
      />
      {autocompleteState.status === "stalled" && (
        <div className="absolute inset-y-0 right-3 flex items-center">
          <LoadingIcon className="h-6 w-6 animate-spin stroke-zinc-200 text-zinc-400 dark:stroke-zinc-700 dark:text-zinc-500" />
        </div>
      )}
    </div>
  );
});

interface SearchDialogProps {
  open?: boolean;
  setOpen: (value: boolean) => void;
  className?: string;
}

function SearchDialog({ open, setOpen, className }: SearchDialogProps) {
  const router = useRouter();
  const formRef = useRef();
  const panelRef = useRef();
  const inputRef = useRef();
  const { autocomplete, autocompleteState } = useAutocomplete();

  useEffect(() => {
    if (!open) {
      return;
    }

    function onRouteChange() {
      setOpen(false);
    }

    router.events.on("routeChangeStart", onRouteChange);
    router.events.on("hashChangeStart", onRouteChange);

    return () => {
      router.events.off("routeChangeStart", onRouteChange);
      router.events.off("hashChangeStart", onRouteChange);
    };
  }, [open, setOpen, router]);

  useEffect(() => {
    if (open) {
      return;
    }

    function onKeyDown(event) {
      if (event.key === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen(true);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, setOpen]);

  return (
    <Dialog
      open={open}
      onClose={() => {
        setOpen(false);
        autocomplete.setQuery("");
      }}
      className={clsx("fixed inset-0 z-50", className)}
    >
      <div className="fixed inset-0 bg-zinc-900/50 backdrop-blur" />

      <div className="fixed inset-0 overflow-y-auto px-4 py-4 sm:px-6 sm:py-20 md:py-32 lg:px-8 lg:py-[15vh]">
        <Dialog.Panel className="mx-auto overflow-hidden rounded-xl bg-white shadow-xl dark:bg-zinc-800 dark:ring-1 dark:ring-zinc-700 sm:max-w-xl">
          <div {...autocomplete.getRootProps({})}>
            <form
              ref={formRef}
              {...(autocomplete.getFormProps({
                inputElement: inputRef.current,
                // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the props here
              }) as any)}
            >
              <SearchInput
                ref={inputRef}
                autocomplete={autocomplete}
                autocompleteState={autocompleteState}
                onClose={() => setOpen(false)}
              />
              <div
                ref={panelRef}
                className="border-t border-zinc-200 bg-white px-2 py-3 empty:hidden dark:border-zinc-400/10 dark:bg-zinc-800"
                // rome-ignore lint/suspicious/noExplicitAny: We don't care about the shape of the the props here
                {...(autocomplete.getPanelProps({}) as any)}
              >
                {autocompleteState.isOpen && (
                  <SearchResults
                    autocomplete={autocomplete}
                    query={autocompleteState.query}
                    collection={autocompleteState.collections[0]}
                  />
                )}
              </div>
            </form>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

function useSearchProps() {
  const buttonRef = useRef();
  const [open, setOpen] = useState(false);

  return {
    buttonProps: {
      ref: buttonRef,
      onClick() {
        setOpen(true);
      },
    },
    dialogProps: {
      open,
      setOpen(open) {
        const el = buttonRef.current;

        if (el) {
          const { width, height } = (el as HTMLElement).getBoundingClientRect();

          if (!open || (width !== 0 && height !== 0)) {
            setOpen(open);
          }
        }
      },
    },
  };
}

export function Search() {
  const [modifierKey, setModifierKey] = useState<string | undefined>();
  const { buttonProps, dialogProps } = useSearchProps();

  useEffect(() => {
    setModifierKey(
      /(Mac|iPhone|iPod|iPad)/i.test(navigator.platform) ? "⌘" : "Ctrl ",
    );
  }, []);

  return (
    <>
      <button
        type="button"
        className="group flex h-6 w-6 items-center justify-center sm:justify-start md:h-auto md:w-80 md:flex-none md:rounded-lg md:py-2.5 md:pl-4 md:pr-3.5 md:text-sm md:ring-1 md:ring-zinc-200 md:hover:ring-zinc-300 dark:md:bg-zinc-800/75 dark:md:ring-inset dark:md:ring-white/5 dark:md:hover:bg-zinc-700/40 dark:md:hover:ring-zinc-500 lg:w-96"
        {...buttonProps}
      >
        <SearchIcon className="h-5 w-5 flex-none fill-zinc-400 group-hover:fill-zinc-500 dark:fill-zinc-500 md:group-hover:fill-zinc-400" />
        <span className="sr-only md:not-sr-only md:ml-2 md:text-zinc-500 md:dark:text-zinc-400">
          Search docs
        </span>
        {modifierKey && (
          <kbd className="ml-auto hidden font-medium text-zinc-400 dark:text-zinc-500 md:block">
            <kbd className="font-sans">{modifierKey}</kbd>
            <kbd className="font-sans">K</kbd>
          </kbd>
        )}
      </button>
      <SearchDialog {...dialogProps} />
    </>
  );
}
