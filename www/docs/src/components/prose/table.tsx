import { type PropsWithChildren } from "react";

export function Table({ children }: PropsWithChildren) {
  return (
    <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div className="inline-block min-w-full py-2 px-4 align-middle sm:px-6 lg:px-8">
        <table className="min-w-full">{children}</table>
      </div>
    </div>
  );
}
