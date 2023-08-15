import Link from "next/link";

function NotFoundComponent() {
  return (
    <p>
      The page you're looking for does not exist, or has been moved. Try heading{" "}
      <Link href="/">home</Link> instead.
    </p>
  );
}

export default NotFoundComponent;
