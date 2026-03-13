"use client";

import React from "react";

type Props = { children: React.ReactNode };

/**
 * Catches errors from the 3D hero (e.g. R3F/react-reconciler when multiple React instances under Turbopack).
 * Renders nothing so the rest of the hero (image, text) still works.
 */
export class Hero3DErrorBoundary extends React.Component<
  Props,
  { hasError: boolean }
> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(): { hasError: boolean } {
    return { hasError: true };
  }

  componentDidCatch(error: Error): void {
    // R3F/React reconciler errors (e.g. ReactCurrentOwner undefined) are expected when
    // Turbopack loads a different React instance; no need to log as uncaught.
    if (
      error?.message?.includes("ReactCurrentOwner") ||
      error?.message?.includes("ReactCurrentBatchConfig")
    ) {
      return;
    }
    console.warn("[Hero 3D]", error);
  }

  render(): React.ReactNode {
    if (this.state.hasError) return null;
    return this.props.children;
  }
}
