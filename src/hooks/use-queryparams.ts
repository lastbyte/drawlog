/**
 * A react based hook to extract query params
 */

import { useLocation } from "react-router";
import { useMemo } from "react";

export function useQueryParam() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}
