# 画布缩放处理器 (CanvasZoomHandler)

## 概述

`CanvasZoomHandler` 是一个完整的画布缩放解决方案，支持多种缩放方式，为用户提供流畅的画布操作体验。

## 功能特性

### 🖱️ 鼠标滚轮缩放
- **鼠标滚轮向上**: 放大画布
- **鼠标滚轮向下**: 缩小画布
- **缩放中心**: 以鼠标位置为缩放中心

### 🖱️ 触控板缩放
- 支持触控板的精密滚动
- 自动检测触控板和鼠标滚轮的差异
- 提供更平滑的缩放体验

### ⌨️ 键盘快捷键缩放
- **Command/Ctrl + "="**: 放大画布
- **Command/Ctrl + "-"**: 缩小画布  
- **Command/Ctrl + "0"**: 重置缩放为100%
- **缩放中心**: 以画布中心为缩放中心

## 技术规格

### 缩放配置
- **最小缩放**: 10% (0.1x)
- **最大缩放**: 1000% (10.0x)
- **键盘缩放步长**: 10%
- **滚轮缩放因子**: 自适应（触控板精确，鼠标滚轮离散）

### 处理器优先级
- **优先级**: 100
- **处理顺序**: 在移动处理器之后，保证缩放和平移功能的协调工作

## API 接口

### 主要方法

```typescript
// 获取当前缩放比例
getCurrentScale(): number

// 设置缩放比例
setScale(scale: number, centerX?: number, centerY?: number): void

// 重置缩放到100%
resetZoom(): void

// 适应画布大小
fitToCanvas(canvas: HTMLCanvasElement): void
```

### 事件处理

处理器自动响应以下事件：
- `mouse.wheel` - 滚轮缩放
- `key.down` / `key.up` - 键盘快捷键

## 使用示例

```typescript
import { eventSystem } from './core/event/EventSystem';
import { CanvasZoomHandler } from './core/event/handlers/CanvasZoomHandler';

// 处理器已自动注册，无需手动注册
// 可以通过事件系统获取处理器实例进行高级操作

// 监听缩放状态变化
eventSystem.getEventEmitter().on('event:processed', (data) => {
  if (data.event.type === 'mouse.wheel') {
    console.log('画布已缩放');
  }
});
```

## 交互体验

### 缩放中心逻辑
1. **鼠标滚轮/触控板缩放**: 以鼠标光标位置为中心
2. **键盘快捷键缩放**: 以画布视口中心为中心

### 边界处理
- 自动限制在最小/最大缩放范围内
- 平滑的缩放过渡
- 防止过度缩放导致的性能问题

### 兼容性
- ✅ macOS 触控板
- ✅ Windows 精密触控板
- ✅ 传统鼠标滚轮
- ✅ 所有主流浏览器

## 性能优化

1. **事件节流**: 防止过于频繁的缩放操作
2. **边界检查**: 避免无效的缩放计算
3. **矩阵复用**: 高效的视图变换管理
4. **内存管理**: 避免内存泄漏

## 注意事项

1. 缩放操作会触发画布重新渲染，频繁缩放时注意性能
2. 触控板的精密滚动可能在某些浏览器上表现不同
3. 键盘快捷键仅在画布获得焦点时生效
4. 与移动处理器配合使用，提供完整的画布操作体验

## 调试信息

处理器在执行缩放操作时会输出控制台日志：
- `🔍 CanvasZoomHandler - 滚轮缩放: x.xx → x.xx`
- `⌨️ CanvasZoomHandler - 键盘缩放: x.xx → x.xx`

这些信息可以帮助调试缩放行为和性能问题。

