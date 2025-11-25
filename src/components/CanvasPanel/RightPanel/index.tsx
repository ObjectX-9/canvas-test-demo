import Chat from '../../../components/Chat';

const CanvasPanelRight = () => {
  return (
    <div className="h-full w-full flex flex-col border-l-4 border-purple-300">
      <div className="bg-purple-500 text-white p-3 border-b border-purple-400">
        <h3 className="text-lg font-bold">AI 助手</h3>
      </div>
      <div className="flex-1 overflow-hidden">
        <Chat />
      </div>
    </div>
  );
};

export default CanvasPanelRight;
