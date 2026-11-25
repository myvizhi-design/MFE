import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Icon } from './Icon';
import { Button } from './Button';

interface Props {
  /** Shown in the fallback, e.g. the module name. */
  name?: string;
  children: ReactNode;
  /** Change this value (e.g. location.pathname) to reset the boundary. */
  resetKey?: unknown;
}

interface State {
  error: Error | null;
}

/**
 * Isolates a failing micro-frontend so the rest of the portal keeps working.
 * Every remote is mounted inside one of these by the shell.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    // Hook point for Sentry / Datadog / App Insights.
    console.error(`[mfe] ${this.props.name ?? 'module'} crashed`, error, info.componentStack);
  }

  componentDidUpdate(prev: Props) {
    if (this.state.error && prev.resetKey !== this.props.resetKey) {
      this.setState({ error: null });
    }
  }

  render() {
    if (!this.state.error) return this.props.children;
    return (
      <div className="mx-auto mt-10 max-w-lg rounded-xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-200">
        <div className="mx-auto mb-4 flex size-12 items-center justify-center rounded-full bg-red-50 text-red-600">
          <Icon name="alert" />
        </div>
        <h2 className="text-lg font-semibold text-slate-900">
          {this.props.name ? `The ${this.props.name} module is unavailable` : 'Something went wrong'}
        </h2>
        <p className="mt-2 text-sm text-slate-500">
          The rest of the portal still works. Try again, or come back later.
        </p>
        <pre className="mt-4 overflow-auto rounded bg-slate-50 p-3 text-left text-xs text-slate-600">
          {this.state.error.message}
        </pre>
        <Button className="mt-6" onClick={() => this.setState({ error: null })}>
          Try again
        </Button>
      </div>
    );
  }
}
