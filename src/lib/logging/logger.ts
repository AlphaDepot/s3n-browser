import pino from 'pino';

/**
 * Logger instance configured using the `pino` library.
 *
 * The logger's configuration depends on the environment:
 * - In non-production environments, it uses `pino-pretty` for human-readable logs with colorization.
 * - In production, it defaults to a standard JSON format.
 *
 * The log level can be set using the `LOG_LEVEL` environment variable. If not provided, it defaults to `info`.
 */
const logger = pino({
  /** The log level for the logger (e.g., 'info', 'debug', 'error'). */
  level: process.env.LOG_LEVEL || 'info',
  /** Transport configuration for non-production environments. */
  transport:
    process.env.NODE_ENV !== 'production'
      ? {
          /** Specifies the target transport as `pino-pretty` for formatted logs. */
          target: 'pino-pretty',
          options: {
            /** Enables colorized output in the logs. */
            colorize: true,
          },
        }
      : undefined,
});

export default logger;
