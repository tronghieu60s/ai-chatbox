import { Avatar, AvatarFallback, AvatarImage } from '@/base/components/shadcn/ui/avatar';
import { Button } from '@/base/components/shadcn/ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from '@/base/components/shadcn/ui/command';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/base/components/shadcn/ui/dialog';
import { Input } from '@/base/components/shadcn/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/base/components/shadcn/ui/popover';
import { ScrollArea } from '@/base/components/shadcn/ui/scroll-area';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { CheckIcon, SendIcon } from 'lucide-react';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { toast } from 'sonner';

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
};

type AIModel = 'gemini';

const AIModels = {
  gemini: { name: 'Gemini', icon: 'gemini' }
};

export default function FullScreenAIChatBox() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 1, text: 'Xin chào! Tôi có thể giúp gì cho bạn?', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [aiModel, setAiModel] = useState<AIModel>('gemini');
  const [isThinking, setIsThinking] = useState(false);

  const scrollAreaRef = useRef<HTMLDivElement>(null);

  const [genAI, setGenAI] = useState<GoogleGenerativeAI | null>(null);
  const [apiKey, setApiKey] = useState('');

  const [isLoading, setIsLoading] = useState(false);

  const [openModelSelect, setOpenModelSelect] = useState(false);
  const [visibleApiKeyDialog, setVisibleApiKeyDialog] = useState(false);

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight;
    }
  }, [messages]);

  const handleSend = useCallback(async () => {
    if (input.trim() && !isLoading && genAI) {
      const newMessage: Message = {
        id: messages.length + 1,
        text: input,
        sender: 'user'
      };
      setMessages([...messages, newMessage]);
      setInput('');
      setIsLoading(true);
      setIsThinking(true);

      try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
        const result = await model.generateContent(input);
        const response = result.response;
        const aiResponse: Message = {
          id: messages.length + 2,
          text: response.text(),
          sender: 'ai'
        };
        setMessages((prevMessages) => [...prevMessages, aiResponse]);
      } catch (error) {
        console.error('Error generating AI response:', error);
        const errorMessage: Message = {
          id: messages.length + 2,
          text: 'Rất tiếc, tôi đã gặp lỗi khi xử lý yêu cầu của bạn.',
          sender: 'ai'
        };
        setMessages((prevMessages) => [...prevMessages, errorMessage]);
      } finally {
        setIsLoading(false);
        setIsThinking(false);
      }
    }
  }, [genAI, input, isLoading, messages]);

  const handleValidateGenAI = useCallback(async (key: string) => {
    const genAI = new GoogleGenerativeAI(key);

    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });
    await model.generateContent('Test');

    setGenAI(genAI);

    localStorage.setItem('geminiApiKey', key);
    setVisibleApiKeyDialog(false);
  }, []);

  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open && !genAI) {
        return;
      }

      setVisibleApiKeyDialog(open);
    },
    [genAI]
  );

  const onValidateGenAI = useCallback(
    (key: string) => {
      setIsLoading(true);

      toast.promise(
        handleValidateGenAI(key).finally(() => {
          setIsLoading(false);
        }),
        {
          loading: 'Đang kết nối API Key',
          success: 'API Key của bạn đã được xác thực.',
          error: 'API Key được cung cấp không hợp lệ. Vui lòng thử lại.'
        }
      );
    },
    [handleValidateGenAI]
  );

  useEffect(() => {
    const storedApiKey = localStorage.getItem('geminiApiKey');
    if (storedApiKey) {
      onValidateGenAI(storedApiKey);
    } else {
      setVisibleApiKeyDialog(true);
    }
  }, [onValidateGenAI]);

  const handleApiKeySubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      if (apiKey.trim()) {
        onValidateGenAI(apiKey);
      }
    },
    [apiKey, onValidateGenAI]
  );

  return (
    <div className='flex flex-col h-screen bg-background font-sans'>
      <Dialog open={visibleApiKeyDialog} onOpenChange={onOpenChange}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Gemini API Key</DialogTitle>
            <DialogDescription>
              Hãy nhập Gemini API Key để sử dụng chức năng trò chuyện AI.
              <p className='mt-2 text-sm text-gray-500 dark:text-gray-400'>
                {`Truy cập vào `}
                <a
                  href='https://aistudio.google.com/app/apikey'
                  className='font-medium text-blue-600 hover:underline dark:text-blue-500'
                  rel='noreferrer'
                  target='_blank'
                >
                  AI Google
                </a>
                {` để lấy API Key. Hoặc bạn có thể xem video này: `}
                <a
                  href='https://youtu.be/Gno0ZGl94RM'
                  className='font-medium text-blue-600 hover:underline dark:text-blue-500'
                  rel='noreferrer'
                  target='_blank'
                >
                  https://youtu.be/Gno0ZGl94RM
                </a>
              </p>
            </DialogDescription>
          </DialogHeader>
          <form className='flex flex-col gap-4' onSubmit={handleApiKeySubmit}>
            <div className='flex flex-col justify-center gap-2'>
              <Input
                id='apiKey'
                placeholder='Nhập API Key của bạn.'
                className='col-span-4'
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
              />
            </div>
            <DialogFooter>
              <Button type='submit' disabled={isLoading}>
                {isLoading ? 'Đang xác minh...' : 'Lưu API Key'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <header className='bg-primary text-primary-foreground p-4 flex justify-between items-center'>
        <h1 className='text-2xl font-bold'>AI Chat</h1>
        <Popover open={openModelSelect} onOpenChange={setOpenModelSelect}>
          <PopoverTrigger asChild>
            <Button variant='secondary' className='ml-auto'>
              {AIModels[aiModel].name}
            </Button>
          </PopoverTrigger>
          <PopoverContent className='p-0' align='end'>
            <Command>
              <CommandInput placeholder='Chọn một mô hình AI...' />
              <CommandList>
                <CommandEmpty>Không có kết quả.</CommandEmpty>
                <CommandGroup>
                  <CommandItem
                    onSelect={() => {
                      setAiModel('gemini');
                      setOpenModelSelect(false);
                    }}
                  >
                    <CheckIcon className={`mr-2 h-4 w-4 ${aiModel === 'gemini' ? 'opacity-100' : 'opacity-0'}`} />
                    Gemini
                  </CommandItem>
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </header>
      <ScrollArea className='flex-1 p-4' ref={scrollAreaRef}>
        {messages.map((message) => (
          <div key={message.id} className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'} mb-4`}>
            <div
              className={`flex items-start max-w-[80%] ${message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'}`}
            >
              <Avatar className='w-8 h-8'>
                <AvatarFallback>{message.sender === 'user' ? 'U' : 'AI'}</AvatarFallback>
                <AvatarImage
                  src={
                    message.sender === 'user'
                      ? '/placeholder.svg?height=32&width=32'
                      : '/placeholder.svg?height=32&width=32'
                  }
                />
              </Avatar>
              <div
                className={`mx-2 p-3 rounded-lg whitespace-pre-wrap ${
                  message.sender === 'user' ? 'bg-primary text-primary-foreground' : 'bg-secondary'
                }`}
              >
                {message.text}
              </div>
            </div>
          </div>
        ))}
        {isThinking && (
          <div className='flex justify-start mb-4'>
            <div className='flex items-start max-w-[80%] flex-row'>
              <Avatar className='w-8 h-8'>
                <AvatarFallback>AI</AvatarFallback>
                <AvatarImage src='/placeholder.svg?height=32&width=32' />
              </Avatar>
              <div className='mx-2 p-3 rounded-lg bg-secondary'>
                <div className='flex items-center space-x-2'>
                  <div className='w-2 h-2 bg-gray-500 rounded-full animate-pulse'></div>
                  <div className='w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-75'></div>
                  <div className='w-2 h-2 bg-gray-500 rounded-full animate-pulse delay-150'></div>
                </div>
              </div>
            </div>
          </div>
        )}
      </ScrollArea>
      <div className='p-4 border-t'>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className='flex items-center space-x-2'
        >
          <Input
            type='text'
            placeholder='Bạn có câu hỏi nào không?'
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className='flex-1'
            disabled={isLoading}
          />
          <Button type='submit' size='icon' disabled={isLoading}>
            <SendIcon className='h-4 w-4' />
            <span className='sr-only'>Gửi</span>
          </Button>
        </form>
      </div>
    </div>
  );
}
