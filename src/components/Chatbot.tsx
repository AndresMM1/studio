import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
}

export function Chatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);
    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isOpen]);

    const handleSendMessage = async () => {
        if (!inputValue.trim()) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setIsLoading(true);

        try {
            const API_URL = import.meta.env.DEV
                ? '/api/ask'
                : 'https://alvaro-extrapolative-pseudoimpartially.ngrok-free.dev/ask';

            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ question: userMessage.text }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            // Assuming the API returns a JSON with an 'answer' or similar field, 
            // or if it returns just text. Adjusting based on common patterns, 
            // but the prompt example showed input: {"question":...}
            // Let's assume the output is also JSON or we might need to adjust.
            // If the response is direct text, we use it. If it's JSON, we extract it.
            // Let's try to handle both or assume a standard structure.
            // Given the prompt didn't specify output format, I'll assume it returns a JSON object.
            // If it's just the text, I'll handle that too.

            let botResponseText = 'Lo siento, no pude procesar tu solicitud.';

            // Check content type
            const contentType = response.headers.get("content-type");
            if (contentType && contentType.indexOf("application/json") !== -1) {
                // The prompt implies a simple Q&A. Let's assume the response has an 'answer' or 'response' field,
                // or just returns the text if it's a simple string response.
                // However, often these simple endpoints might return just the answer string or a JSON.
                // Let's dump the whole JSON if we can't find a specific field, or look for common keys.
                // For now, let's assume the API returns the answer in a field called 'answer' or 'response' or just the body is the answer if it's not JSON.
                // Actually, let's look at the prompt again: 
                // curl -X POST ... -d "{\"question\":\"...\"}"
                // It doesn't show the response. I will assume it returns a JSON with 'answer' or 'text'.

                if (data.answer) botResponseText = data.answer;
                else if (data.response) botResponseText = data.response;
                else if (data.text) botResponseText = data.text;
                else if (typeof data === 'string') botResponseText = data;
                else botResponseText = JSON.stringify(data); // Fallback
            } else {
                botResponseText = await response.text();
            }

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponseText,
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Lo siento, hubo un error al conectar con el servidor. Por favor, intenta de nuevo más tarde.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <div className="w-[350px] h-[500px] bg-background border rounded-lg shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 border-b bg-primary text-primary-foreground flex justify-between items-center">
                        <h3 className="font-semibold">Asistente Virtual</h3>
                        <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground"
                            onClick={() => setIsOpen(false)}
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </div>

                    {/* Messages */}
                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <div className="flex flex-col gap-4">
                            {messages.map((message) => (
                                <div
                                    key={message.id}
                                    className={cn(
                                        "max-w-[80%] rounded-lg p-3 text-sm",
                                        message.sender === 'user'
                                            ? "bg-primary text-primary-foreground self-end"
                                            : "bg-muted self-start"
                                    )}
                                >
                                    <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4">
                                        <ReactMarkdown
                                            remarkPlugins={[remarkGfm]}
                                            components={{
                                                a: ({ node, ...props }) => <a {...props} className="underline font-medium" target="_blank" rel="noopener noreferrer" />,
                                                code: ({ node, ...props }) => <code {...props} className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5" />,
                                                pre: ({ node, ...props }) => <pre {...props} className="bg-black/10 dark:bg-white/10 rounded p-2 overflow-x-auto my-2" />,
                                            }}
                                        >
                                            {message.text}
                                        </ReactMarkdown>
                                    </div>
                                </div>
                            ))}
                            {isLoading && (
                                <div className="bg-muted self-start rounded-lg p-3 max-w-[80%]">
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input */}
                    <div className="p-4 border-t bg-background">
                        <div className="flex gap-2">
                            <Input
                                placeholder="Escribe tu pregunta..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                            />
                            <Button size="icon" onClick={handleSendMessage} disabled={isLoading || !inputValue.trim()}>
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            )}

            <Button
                size="icon"
                className="h-12 w-12 rounded-full shadow-lg"
                onClick={() => setIsOpen(!isOpen)}
            >
                {isOpen ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
            </Button>
        </div>
    );
}
