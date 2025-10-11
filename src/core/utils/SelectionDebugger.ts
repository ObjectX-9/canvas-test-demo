import { smartHitTest } from "./SmartHitTest";
import { BaseNode } from "../nodeTree/node/baseNode";

/**
 * 选择系统调试和性能监控工具
 * 帮助开发者分析和优化选择性能
 */
export class SelectionDebugger {
  private static instance: SelectionDebugger;
  private isDebugMode = false;
  private performanceLogs: Array<{
    timestamp: number;
    operation: string;
    duration: number;
    nodeCount: number;
    details?: Record<string, unknown>;
  }> = [];

  static getInstance(): SelectionDebugger {
    if (!SelectionDebugger.instance) {
      SelectionDebugger.instance = new SelectionDebugger();
    }
    return SelectionDebugger.instance;
  }

  /**
   * 启用调试模式
   */
  enableDebugMode(): void {
    this.isDebugMode = true;
    console.log("🐛 选择系统调试模式已启用");

    // 监听选择事件
    this.attachPerformanceMonitors();
  }

  /**
   * 禁用调试模式
   */
  disableDebugMode(): void {
    this.isDebugMode = false;
    console.log("🐛 选择系统调试模式已禁用");
  }

  /**
   * 记录性能数据
   */
  logPerformance(
    operation: string,
    duration: number,
    nodeCount: number,
    details?: Record<string, unknown>
  ): void {
    if (!this.isDebugMode) return;

    const logEntry = {
      timestamp: Date.now(),
      operation,
      duration,
      nodeCount,
      details,
    };

    this.performanceLogs.push(logEntry);

    // 保持最近1000条记录
    if (this.performanceLogs.length > 1000) {
      this.performanceLogs = this.performanceLogs.slice(-1000);
    }

    // 实时性能警告
    if (duration > 16) {
      // 超过一帧时间
      console.warn(
        `⚠️ 选择性能警告: ${operation} 耗时 ${duration.toFixed(
          2
        )}ms (节点数: ${nodeCount})`
      );
    }
  }

  /**
   * 获取性能统计报告
   */
  getPerformanceReport(): Record<string, unknown> {
    if (this.performanceLogs.length === 0) {
      return { message: "暂无性能数据" };
    }

    const operations = this.performanceLogs.reduce(
      (acc: Record<string, Record<string, number>>, log) => {
        if (!acc[log.operation]) {
          acc[log.operation] = {
            count: 0,
            totalDuration: 0,
            maxDuration: 0,
            minDuration: Infinity,
            avgNodesPerOperation: 0,
            totalNodes: 0,
          };
        }

        const op = acc[log.operation];
        op.count++;
        op.totalDuration += log.duration;
        op.maxDuration = Math.max(op.maxDuration, log.duration);
        op.minDuration = Math.min(op.minDuration, log.duration);
        op.totalNodes += log.nodeCount;
        op.avgNodesPerOperation = op.totalNodes / op.count;

        return acc;
      },
      {}
    );

    // 计算每个操作的平均时间
    Object.keys(operations).forEach((key) => {
      operations[key].avgDuration =
        operations[key].totalDuration / operations[key].count;
    });

    return {
      summary: {
        totalOperations: this.performanceLogs.length,
        timeSpan:
          this.performanceLogs.length > 0
            ? this.performanceLogs[this.performanceLogs.length - 1].timestamp -
              this.performanceLogs[0].timestamp
            : 0,
        avgOperationsPerSecond:
          this.performanceLogs.length > 0
            ? (this.performanceLogs.length * 1000) /
              (this.performanceLogs[this.performanceLogs.length - 1].timestamp -
                this.performanceLogs[0].timestamp)
            : 0,
      },
      operations,
      recentLogs: this.performanceLogs.slice(-10),
    };
  }

  /**
   * 打印性能报告到控制台
   */
  printPerformanceReport(): void {
    const report = this.getPerformanceReport();

    console.group("📊 选择系统性能报告");

    if (report.message) {
      console.log(report.message);
    } else {
      console.log("📈 总览:", report.summary);
      console.log("🔍 操作详情:");

      Object.entries(
        report.operations as Record<string, Record<string, number>>
      ).forEach(([operation, stats]) => {
        console.log(`  ${operation}:`, {
          调用次数: stats.count,
          平均耗时: `${stats.avgDuration.toFixed(2)}ms`,
          最大耗时: `${stats.maxDuration.toFixed(2)}ms`,
          最小耗时: `${stats.minDuration.toFixed(2)}ms`,
          平均节点数: Math.round(stats.avgNodesPerOperation),
        });
      });

      console.log("📋 最近操作:", report.recentLogs);
    }

    console.groupEnd();
  }

  /**
   * 清除性能日志
   */
  clearPerformanceLogs(): void {
    this.performanceLogs = [];
    console.log("🗑️ 性能日志已清除");
  }

  /**
   * 模拟性能测试
   */
  async runPerformanceTest(nodeCount: number = 1000): Promise<void> {
    console.log(`🚀 开始性能测试 (${nodeCount} 个节点)`);

    // 创建测试节点
    const testNodes = Array.from({ length: nodeCount }, (_, i) => ({
      id: `test-node-${i}`,
      type: "rectangle",
      x: Math.random() * 2000,
      y: Math.random() * 2000,
      w: 50 + Math.random() * 100,
      h: 50 + Math.random() * 100,
      rotation: 0,
    })) as BaseNode[];

    // 测试点选性能
    const pointTestCount = 100;
    let totalPointTime = 0;

    for (let i = 0; i < pointTestCount; i++) {
      const testPoint = {
        x: Math.random() * 2000,
        y: Math.random() * 2000,
      };

      const startTime = performance.now();
      smartHitTest.findBestNodeAtPoint(testPoint, testNodes);
      const endTime = performance.now();

      totalPointTime += endTime - startTime;
    }

    // 测试框选性能
    const rectTestCount = 50;
    let totalRectTime = 0;

    for (let i = 0; i < rectTestCount; i++) {
      const testRect = {
        x: Math.random() * 1500,
        y: Math.random() * 1500,
        width: 100 + Math.random() * 400,
        height: 100 + Math.random() * 400,
      };

      const startTime = performance.now();
      smartHitTest.findNodesInRectangle(testRect, testNodes);
      const endTime = performance.now();

      totalRectTime += endTime - startTime;
    }

    const avgPointTime = totalPointTime / pointTestCount;
    const avgRectTime = totalRectTime / rectTestCount;

    console.log("📊 性能测试结果:");
    console.log(`  节点数: ${nodeCount}`);
    console.log(`  点选平均耗时: ${avgPointTime.toFixed(3)}ms`);
    console.log(`  框选平均耗时: ${avgRectTime.toFixed(3)}ms`);
    console.log(`  点选性能评级: ${this.getPerformanceGrade(avgPointTime)}`);
    console.log(`  框选性能评级: ${this.getPerformanceGrade(avgRectTime)}`);
  }

  private getPerformanceGrade(duration: number): string {
    if (duration < 1) return "🟢 优秀 (< 1ms)";
    if (duration < 4) return "🟡 良好 (1-4ms)";
    if (duration < 8) return "🟠 一般 (4-8ms)";
    if (duration < 16) return "🔴 较慢 (8-16ms)";
    return "🔴 慢 (> 16ms)";
  }

  private attachPerformanceMonitors(): void {
    // 这里可以添加更多的性能监控钩子
    console.log("🔧 性能监控器已附加");
  }

  /**
   * 创建可视化的性能图表数据
   */
  getVisualizationData(): Record<string, unknown> | null {
    const report = this.getPerformanceReport();

    if (report.message) return null;

    return {
      timeSeriesData: this.performanceLogs.map((log) => ({
        time: log.timestamp,
        duration: log.duration,
        operation: log.operation,
        nodeCount: log.nodeCount,
      })),
      operationStats: report.operations,
      summary: report.summary,
    };
  }
}

// 全局调试器实例
export const selectionDebugger = SelectionDebugger.getInstance();

// 开发环境下自动启用调试模式
if (
  typeof window !== "undefined" &&
  (window as unknown as Record<string, unknown>).__DEV__
) {
  selectionDebugger.enableDebugMode();
}
