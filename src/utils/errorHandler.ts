export enum ErrorCategory {
  CONFIG = 'config',
  PROVIDER = 'provider',
  THEME = 'theme',
  TERMINAL = 'terminal',
  DATABASE = 'database',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

export class AppError extends Error {
  constructor(
    message: string,
    public category: ErrorCategory,
    public userMessage?: string,
    public cause?: Error
  ) {
    super(message);
    this.name = 'AppError';
  }
}

export function handleError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  if (error instanceof Error) {
    return new AppError(error.message, ErrorCategory.UNKNOWN, undefined, error);
  }

  if (typeof error === 'string') {
    return new AppError(error, ErrorCategory.UNKNOWN);
  }

  return new AppError('An unknown error occurred', ErrorCategory.UNKNOWN);
}

export function getUserFriendlyMessage(error: AppError): string {
  if (error.userMessage) {
    return error.userMessage;
  }

  switch (error.category) {
    case ErrorCategory.CONFIG:
      return 'Configuration error. Please check your settings.';
    case ErrorCategory.PROVIDER:
      return 'AI provider error. The service may be unavailable.';
    case ErrorCategory.THEME:
      return 'Theme error. Falling back to default theme.';
    case ErrorCategory.TERMINAL:
      return 'Terminal error. Please check your terminal settings.';
    case ErrorCategory.DATABASE:
      return 'Database error. Your session data may be affected.';
    case ErrorCategory.NETWORK:
      return 'Network error. Please check your connection.';
    default:
      return 'An unexpected error occurred.';
  }
}

export function logError(error: AppError): void {
  const timestamp = new Date().toISOString();
  console.error(`[${timestamp}] [${error.category.toUpperCase()}] ${error.message}`);
  if (error.cause) {
    console.error(`Caused by: ${error.cause.message}`);
  }
}
