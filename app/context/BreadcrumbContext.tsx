"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";

/**
 * Lets a page add a last breadcrumb for a sub-view of its route, such as
 * "Add Carousel" or "Create Exam", and optionally say how to go back to the
 * page's main view when the crumb before it is clicked.
 */
type Crumb = { label: string; hasBack: boolean } | null;

interface BreadcrumbContextValue {
  crumb: Crumb;
  setCrumb: (crumb: Crumb) => void;
  goBack: () => void;
  setBack: (handler: (() => void) | null) => void;
}

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

export function BreadcrumbProvider({ children }: { children: React.ReactNode }) {
  const [crumb, setCrumb] = useState<Crumb>(null);
  const backRef = useRef<(() => void) | null>(null);
  const goBack = useCallback(() => backRef.current?.(), []);
  const setBack = useCallback((handler: (() => void) | null) => {
    backRef.current = handler;
  }, []);
  const value = useMemo(
    () => ({ crumb, setCrumb, goBack, setBack }),
    [crumb, goBack, setBack],
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
}

/** Read by the header. */
export function useBreadcrumbExtra() {
  const ctx = useContext(BreadcrumbContext);
  return {
    label: ctx?.crumb?.label ?? null,
    hasBack: ctx?.crumb?.hasBack ?? false,
    goBack: ctx?.goBack,
  };
}

/** Called by a page. Pass null when the page is showing its main view. */
export function usePageCrumb(label: string | null, onBack?: () => void) {
  const ctx = useContext(BreadcrumbContext);
  const setCrumb = ctx?.setCrumb;
  const setBack = ctx?.setBack;
  const hasBack = !!onBack;

  // keep the latest back handler without re-publishing the crumb
  useEffect(() => {
    setBack?.(onBack ?? null);
  });

  useEffect(() => {
    setCrumb?.(label ? { label, hasBack } : null);
    return () => setCrumb?.(null);
  }, [label, hasBack, setCrumb]);
}
