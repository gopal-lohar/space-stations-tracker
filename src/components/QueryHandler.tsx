import type { UseQueryResult } from "@tanstack/react-query";
import type { ReactNode } from "react";
import Loading from "./Loading";

type QueryHandlerProps<T> = {
  query: UseQueryResult<T>;
  loading?: ReactNode;
  error?: (error: Error) => ReactNode;
  empty?: ReactNode;
  disabled?: ReactNode;
  children: (data: T) => ReactNode;
};

export const QueryHandler = <T,>({
  query,
  loading = <DefaultLoading />,
  error = (err) => <DefaultError error={err} />,
  disabled = <DefaultLoading />,
  empty = <DefaultEmpty />,
  children,
}: QueryHandlerProps<T>) => {
  if (query.isLoading) return <>{loading}</>;

  if (query.isError) {
    return <>{error(query.error as Error)}</>;
  }

  if (query.fetchStatus === "idle" && query.status === "pending") {
    return <>{disabled}</>;
  }

  if (!query.data || (Array.isArray(query.data) && query.data.length === 0)) {
    return <>{empty}</>;
  }

  return <>{children(query.data)}</>;
};

const DefaultLoading = () => <Loading />;
const DefaultError = ({ error }: { error: Error }) => (
  <div className="text-red-500">Error: {error.message}</div>
);
const DefaultEmpty = () => <div>No data found</div>;
