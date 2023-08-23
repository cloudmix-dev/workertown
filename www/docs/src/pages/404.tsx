import Link from "next/link";

function NotFoundComponent() {
  return (
    <div>
      <span className="text-zinc-100 text-5xl font-display uppercase">
        Whoops...
      </span>
      <p>
        The page you're looking for does not exist, or has been moved. Try
        heading <Link href="/">home</Link> instead.
      </p>
    </div>
  );
}

export default NotFoundComponent;
