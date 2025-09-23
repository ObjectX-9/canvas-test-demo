import { useEffect, useState } from "react";
import CanvasContainer from "./components/CanvasContainer";
import { initState } from "./core/init/init";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    // 用后端存储数据初始化节点树
    initState({});
    setIsInitialized(true);
  }, []);

  if (!isInitialized) {
    return <div>Loading...</div>; // 显示加载状态
  }

  return (
    <>
      <CanvasContainer />
    </>
  );
}

export default App;
