import { useMemo } from "react";

interface ErrorProps {
  statusCode?: number;
}

function ErrorComponent({ statusCode }: ErrorProps) {
  const isServer = useMemo(() => typeof statusCode !== "undefined", []);

  return (
    <p>
      {isServer
        ? `An error ${statusCode} occurred on server`
        : "An error occurred on client"}
    </p>
  );
}

ErrorComponent.getInitialProps = ({ res, err }) => {
  const statusCode = res ? res.statusCode : err ? err.statusCode : 404;

  return { statusCode };
};

export default ErrorComponent;
