import chalk from "chalk";

// 日志级别枚举
export enum LogLevel {
  DEBUG = 0,
  INFO = 1,
  SUCCESS = 2,
  WARN = 3,
  ERROR = 4,
}

// 日志配置接口
interface LoggerConfig {
  level: LogLevel;
  showTimestamp: boolean;
  showLevel: boolean;
}

// 默认配置
const defaultConfig: LoggerConfig = {
  level: LogLevel.INFO,
  showTimestamp: true,
  showLevel: true,
};

class Logger {
  private config: LoggerConfig;

  constructor(config: Partial<LoggerConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  // 获取时间戳
  private getTimestamp(): string {
    return new Date().toISOString();
  }

  // 格式化日志消息
  private formatMessage(level: LogLevel, message: string): string {
    const parts: string[] = [];

    // 添加时间戳
    if (this.config.showTimestamp) {
      parts.push(chalk.gray(`[${this.getTimestamp()}]`));
    }

    // 添加日志级别
    if (this.config.showLevel) {
      const levelNames = {
        [LogLevel.DEBUG]: chalk.blue("DEBUG"),
        [LogLevel.INFO]: chalk.cyan("INFO"),
        [LogLevel.SUCCESS]: chalk.green("SUCCESS"),
        [LogLevel.WARN]: chalk.yellow("WARN"),
        [LogLevel.ERROR]: chalk.red("ERROR"),
      };
      parts.push(levelNames[level]);
    }

    // 添加消息内容
    parts.push(message);

    return parts.join(" ");
  }

  // 检查是否应该输出日志
  private shouldLog(level: LogLevel): boolean {
    return level >= this.config.level;
  }

  // 调试日志
  debug(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.DEBUG)) {
      console.log(
        this.formatMessage(LogLevel.DEBUG, chalk.blue(message)),
        ...args
      );
    }
  }

  // 信息日志
  info(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.INFO)) {
      console.log(
        this.formatMessage(LogLevel.INFO, chalk.cyan(message)),
        ...args
      );
    }
  }

  // 成功日志
  success(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.SUCCESS)) {
      console.log(
        this.formatMessage(LogLevel.SUCCESS, chalk.green(message)),
        ...args
      );
    }
  }

  // 警告日志
  warn(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.WARN)) {
      console.warn(
        this.formatMessage(LogLevel.WARN, chalk.yellow(message)),
        ...args
      );
    }
  }

  // 错误日志
  error(message: string, ...args: unknown[]): void {
    if (this.shouldLog(LogLevel.ERROR)) {
      console.error(
        this.formatMessage(LogLevel.ERROR, chalk.red(message)),
        ...args
      );
    }
  }

  // 更新配置
  setConfig(config: Partial<LoggerConfig>): void {
    this.config = { ...this.config, ...config };
  }

  // 设置日志级别
  setLevel(level: LogLevel): void {
    this.config.level = level;
  }
}

// 创建默认logger实例
const logger = new Logger();

// 导出logger实例和类
export { Logger, logger };

// 便捷函数
export const log = {
  debug: (message: string, ...args: unknown[]) =>
    logger.debug(message, ...args),
  info: (message: string, ...args: unknown[]) => logger.info(message, ...args),
  success: (message: string, ...args: unknown[]) =>
    logger.success(message, ...args),
  warn: (message: string, ...args: unknown[]) => logger.warn(message, ...args),
  error: (message: string, ...args: unknown[]) =>
    logger.error(message, ...args),
};

// 默认导出
export default logger;
