import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

// 临时禁用StrictMode来避免事件系统重复创建销毁问题
const enableStrictMode = false; // 可以根据需要设置为true

createRoot(document.getElementById("root")!).render(
  enableStrictMode ? (
    <StrictMode>
      <App />
    </StrictMode>
  ) : (
    <App />
  )
);
