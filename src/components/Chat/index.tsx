import { useState } from 'react';
import { Send } from 'lucide-react';
import { nodeTree } from '../../core/nodeTree';
import { RectangleState } from '../../core/types/nodes/rectangle';
import { pageManager } from '../../core/manage';
import { globalDataObserver } from '../../core/render';

interface Message {
  id: number;
  text: string;
  isUser: boolean;
}

const Chat = () => {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: '你好！我是AI助手，有什么可以帮您的吗？', isUser: false },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // 创建矩形的函数
  const createRectangle = (x: number = 500, y: number = 500, color: string = '#000000') => {
    const currentPage = pageManager.getCurrentPage();
    if (!currentPage) {
      console.error('No current page found');
      return false;
    }

    // 创建矩形状态
    const rectangleState: RectangleState = {
      id: `rect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'rectangle',
      x,
      y,
      w: 120,
      h: 80,
      fill: color,
      rotation: 0,
      radius: 0,
    };

    try {
      // 添加到节点树
      nodeTree.addNode(rectangleState);
      
      // 添加到当前页面
      currentPage.addChild(rectangleState.id);
      
      // 通知渲染系统更新
      globalDataObserver.markChanged();
      
      console.log('Rectangle created:', rectangleState);
      return true;
    } catch (error) {
      console.error('Error creating rectangle:', error);
      return false;
    }
  };

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    // Add user message
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      isUser: true,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    // 检查是否是创建矩形的请求
    const createRectanglePattern = /帮我创建一个矩形|创建矩形|画一个矩形/i;
    if (createRectanglePattern.test(inputValue)) {
      // 直接创建矩形，不调用 AI
      const success = createRectangle(500, 500, '#000000');
      
      const responseMessage: Message = {
        id: Date.now() + 1,
        text: success 
          ? '已为您在位置 (500, 500) 创建了一个黑色矩形！' 
          : '抱歉，创建矩形时出现错误，请稍后重试。',
        isUser: false,
      };
      
      setMessages((prev) => [...prev, responseMessage]);
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [
            ...messages.map(msg => ({
              role: msg.isUser ? 'user' : 'assistant',
              content: msg.text,
            })),
            { role: 'user', content: inputValue },
          ],
          systemPrompt: `你是一个乐于助人的AI助手，可以帮助用户操作画布。请用中文回答用户的问题。

当用户要求创建图形时，请回复特定的指令格式：
- 创建矩形：回复 "CREATE_RECTANGLE:x,y,color" 格式，例如 "CREATE_RECTANGLE:500,500,#000000"
- 如果用户没有指定位置，默认使用 500,500
- 如果用户没有指定颜色，默认使用黑色 #000000

其他情况下正常对话即可。`,
        }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      
      // 检查 AI 回复是否包含创建指令
      const createRectangleCommand = /CREATE_RECTANGLE:(\d+),(\d+),(#[0-9a-fA-F]{6}|#[0-9a-fA-F]{3}|\w+)/;
      const match = data.message.match(createRectangleCommand);
      
      if (match) {
        // 解析创建指令
        const x = parseInt(match[1]);
        const y = parseInt(match[2]);
        const color = match[3];
        
        // 创建矩形
        const success = createRectangle(x, y, color);
        
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: success 
            ? `已为您在位置 (${x}, ${y}) 创建了一个${color === '#000000' ? '黑色' : color}矩形！` 
            : '抱歉，创建矩形时出现错误，请稍后重试。',
          isUser: false,
        };
        
        setMessages((prev) => [...prev, aiMessage]);
      } else {
        // 正常的 AI 回复
        const aiMessage: Message = {
          id: Date.now() + 1,
          text: data.message,
          isUser: false,
        };
        
        setMessages((prev) => [...prev, aiMessage]);
      }
    } catch (error) {
      console.error('Error sending message:', error);
      // Add error message
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: '抱歉，发生错误，请稍后重试。',
        isUser: false,
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.isUser ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.isUser
                  ? 'bg-blue-500 text-white rounded-br-none'
                  : 'bg-gray-200 text-gray-800 rounded-bl-none'
              }`}
            >
              {message.text.split('\n').map((line, i) => (
                <p key={i} className="whitespace-pre-wrap">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-200 text-gray-800 rounded-lg rounded-bl-none p-3 max-w-[80%]">
              <div className="flex space-x-2">
                <div className="w-2 h-2 rounded-full bg-gray-400 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-500 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 rounded-full bg-gray-600 animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSend} className="p-4 border-t border-gray-200">
        <div className="flex space-x-2">
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="输入消息..."
            className="flex-1 p-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            className={`p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              isLoading
                ? 'bg-gray-300 cursor-not-allowed'
                : 'bg-blue-500 hover:bg-blue-600 text-white'
            }`}
            disabled={isLoading}
          >
            <Send size={20} />
          </button>
        </div>
      </form>
    </div>
  );
};

export default Chat;
