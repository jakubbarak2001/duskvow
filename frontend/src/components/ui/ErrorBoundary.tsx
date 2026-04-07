"use client";

import { Component, type ErrorInfo, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  message: string;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, message: "" };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // In production, pipe this to an error tracking service (Sentry, etc.)
    if (process.env.NODE_ENV !== "production") {
      console.error("[ErrorBoundary]", error, info.componentStack);
    }
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "200px",
            gap: "1rem",
            padding: "2rem",
            background: "var(--bg-shadow)",
            border: "1px solid rgba(139, 0, 0, 0.4)",
            borderRadius: "4px",
          }}
        >
          <p
            style={{
              fontFamily: "var(--font-heading), 'Cinzel', serif",
              fontSize: "0.75rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--accent-blood)",
            }}
          >
            Something broke
          </p>
          <p
            style={{
              fontFamily: "var(--font-body), 'Inter', sans-serif",
              fontSize: "0.8rem",
              color: "var(--text-muted)",
              textAlign: "center",
              maxWidth: "360px",
            }}
          >
            {this.state.message || "An unexpected error occurred. Refresh to try again."}
          </p>
          <button
            onClick={() => this.setState({ hasError: false, message: "" })}
            style={{
              fontFamily: "var(--font-heading), 'Cinzel', serif",
              fontSize: "0.6rem",
              letterSpacing: "0.2em",
              textTransform: "uppercase",
              color: "var(--text-secondary)",
              background: "transparent",
              border: "1px solid var(--border-default)",
              padding: "0.5rem 1.25rem",
              cursor: "pointer",
            }}
          >
            Try Again
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
