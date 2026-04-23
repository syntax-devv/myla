import React from 'react';
import { Box, Text } from 'ink';

import { AppError, getUserFriendlyMessage, logError } from '../../utils/errorHandler.js';

interface ErrorBoundaryState {
  hasError: boolean;
  error: AppError | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: unknown): ErrorBoundaryState {
    const appError = error instanceof AppError ? error : new AppError(
      error instanceof Error ? error.message : String(error),
      'unknown' as any
    );
    return { hasError: true, error: appError };
  }

  componentDidCatch(error: unknown, errorInfo: React.ErrorInfo): void {
    const appError = error instanceof AppError ? error : new AppError(
      error instanceof Error ? error.message : String(error),
      'unknown' as any
    );
    logError(appError);
    console.error('Error Info:', errorInfo);
  }

  render(): React.ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Box flexDirection="column" padding={1}>
          <Text color="red" bold>
            ⚠️ Error
          </Text>
          <Text>{getUserFriendlyMessage(this.state.error!)}</Text>
          {this.state.error?.cause && (
            <Text color="gray">
              Details: {this.state.error.cause.message}
            </Text>
          )}
          <Text color="gray">
            Press Ctrl+C to exit
          </Text>
        </Box>
      );
    }

    return this.props.children;
  }
}
