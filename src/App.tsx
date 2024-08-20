import { useEffect } from "react";
import CanvasContainer from "./components/CanvasContainer";
import { initJsdState } from "./core/init/init";

function App() {
  useEffect(() => {
    initJsdState({})
  }, [])
  return (
    <>
      <CanvasContainer />
    </>
  );
}

export default App;
