import { useEffect, useState } from "react";
import CanvasContainer from "./components/CanvasContainer";
import { initJsdState } from "./core/init/init";

function App() {
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    initJsdState({})
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
