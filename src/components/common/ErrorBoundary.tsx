'use client';

import { Component, type ErrorInfo, type ReactNode } from 'react';
import i18n from '@/i18n';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}
interface State {
  failed: boolean;
}

/** Catches render errors so one broken card/section never blanks the whole dashboard. Details are logged, not shown. */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { failed: false };

  static getDerivedStateFromError(): State {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error.message, info.componentStack?.split('\n')[1]?.trim());
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      this.props.fallback ?? (
        <div role="alert" className="rounded-card border border-danger/30 bg-danger/5 p-6 text-center">
          <p className="font-semibold">{i18n.t('error.boundaryTitle')}</p>
          <button type="button" className="btn-secondary mt-4" onClick={() => this.setState({ failed: false })}>
            {i18n.t('common.retry')}
          </button>
        </div>
      )
    );
  }
}
