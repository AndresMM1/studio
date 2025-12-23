import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, X as RemoveIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

// Declare dotlottie-wc custom element for TypeScript
declare global {
    namespace JSX {
        interface IntrinsicElements {
            'dotlottie-wc': any;
        }
    }
}

import mascotImage from '@/assets/mascot.png';

// Use the imported image for both avatar and typing state
const MASCOT_AVATAR = mascotImage;
const MASCOT_TYPING = mascotImage;

interface Message {
    id: string;
    text: string;
    sender: 'user' | 'bot';
    timestamp: Date;
    image?: string;
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
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
    const [displayedText, setDisplayedText] = useState<string>('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Typewriter effect
    useEffect(() => {
        if (!typingMessageId) return;

        const message = messages.find(m => m.id === typingMessageId);
        if (!message) return;

        const fullText = message.text;
        let currentIndex = 0;

        const typingInterval = setInterval(() => {
            if (currentIndex <= fullText.length) {
                setDisplayedText(fullText.slice(0, currentIndex));
                currentIndex++;
            } else {
                clearInterval(typingInterval);
                setTypingMessageId(null);
            }
        }, 20); // Speed of typing (milliseconds per character)

        return () => clearInterval(typingInterval);
    }, [typingMessageId, messages]);

    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]');
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight;
            }
        }
    }, [messages, isOpen, selectedImage, displayedText]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setSelectedImage(reader.result as string);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !selectedImage) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            text: inputValue,
            image: selectedImage || undefined,
            sender: 'user',
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsLoading(true);

        try {
            // Use the absolute URL as requested by the user, though /api/ask is recommended for production
            const response = await fetch('https://alvaro-extrapolative-pseudoimpartially.ngrok-free.dev/ask', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    question: userMessage.text,
                    image: userMessage.image
                }),
            });

            if (!response.ok) {
                throw new Error('Network response was not ok');
            }

            const data = await response.json();

            let botResponseText = 'Lo siento, no pude procesar tu solicitud.';

            // Check content type or assume JSON
            if (data.answer) botResponseText = data.answer;
            else if (data.response) botResponseText = data.response;
            else if (data.text) botResponseText = data.text;
            else if (typeof data === 'string') botResponseText = data;
            else botResponseText = JSON.stringify(data);

            const botMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: botResponseText,
                sender: 'bot',
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, botMessage]);
            setTypingMessageId(botMessage.id);
            setDisplayedText('');
        } catch (error) {
            console.error('Error sending message:', error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                text: 'Lo siento, hubo un error al conectar con el servidor. Por favor, intenta de nuevo más tarde.',
                sender: 'bot',
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
            setTypingMessageId(errorMessage.id);
            setDisplayedText('');
        } finally {
            setIsLoading(false);
        }
    };

    const formatMessageText = (text: string) => {
        // Regex to match "incident 12", "id 12", "ticket 12", "#12", "ID: 12"
        // Uses word boundary \b to avoid matching inside words like "grid 12"

        return text.replace(/(?:(?:\b(?:incident|incidente|ticket|id))\s*:?\s*(?:#)?|#)(\d+)/gi, (match, id) => {
            return `[${match}](/incident/${id})`;
        });
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSendMessage();
        }
    };

    return (
        <div className="fixed bottom-4 right-4 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <div className="w-[400px] h-[600px] bg-background border rounded-lg shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
                    {/* Header */}
                    <div className="p-4 border-b bg-primary text-primary-foreground flex justify-between items-center">
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
                                    {message.image && (
                                        <div className="mb-2 rounded-md overflow-hidden bg-black/10">
                                            <img src={message.image} alt="Uploaded content" className="max-w-full h-auto object-cover max-h-[200px]" />
                                        </div>
                                    )}
                                    {message.sender === 'bot' && typingMessageId === message.id ? (
                                        <div className="flex items-start gap-3">
                                            {/* Mascot avatar while typing */}
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <img
                                                    src={MASCOT_TYPING}
                                                    alt="Mascot typing"
                                                    className="w-14 h-14 object-contain"
                                                    onError={(e) => {
                                                        // Fallback to a simple icon if image not found
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <div className="flex-1">
                                                <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            a: ({ node, ...props }) => <a {...props} className="underline font-medium text-blue-600 dark:text-blue-400" target="_blank" rel="noopener noreferrer" />,
                                                            code: ({ node, ...props }) => <code {...props} className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5" />,
                                                            pre: ({ node, ...props }) => <pre {...props} className="bg-black/10 dark:bg-white/10 rounded p-2 overflow-x-auto my-2" />,
                                                        }}
                                                    >
                                                        {formatMessageText(displayedText)}
                                                    </ReactMarkdown>
                                                </div>
                                                {/* Typing animation below text */}
                                                <div className="mt-1">
                                                    <dotlottie-wc
                                                        src="https://lottie.host/3f3e821d-2eac-415d-b247-3e834227acaa/mCAwvZO7MO.lottie"
                                                        autoplay
                                                        loop
                                                        style={{ width: '60px', height: '30px', opacity: 0.6 }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    ) : message.sender === 'bot' ? (
                                        <div className="flex items-start gap-3">
                                            {/* Mascot avatar for completed messages */}
                                            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                                <img
                                                    src={MASCOT_AVATAR}
                                                    alt="Mascot"
                                                    className="w-14 h-14 object-contain"
                                                    onError={(e) => {
                                                        e.currentTarget.style.display = 'none';
                                                    }}
                                                />
                                            </div>
                                            <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4 flex-1">
                                                <ReactMarkdown
                                                    remarkPlugins={[remarkGfm]}
                                                    components={{
                                                        a: ({ node, ...props }) => <a {...props} className="underline font-medium text-blue-600 dark:text-blue-400" target="_blank" rel="noopener noreferrer" />,
                                                        code: ({ node, ...props }) => <code {...props} className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5" />,
                                                        pre: ({ node, ...props }) => <pre {...props} className="bg-black/10 dark:bg-white/10 rounded p-2 overflow-x-auto my-2" />,
                                                    }}
                                                >
                                                    {formatMessageText(message.text)}
                                                </ReactMarkdown>
                                            </div>
                                        </div>
                                    ) : (
                                        <div className="prose prose-sm dark:prose-invert max-w-none break-words [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4">
                                            <ReactMarkdown
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    a: ({ node, ...props }) => <a {...props} className="underline font-medium text-blue-600 dark:text-blue-400" target="_blank" rel="noopener noreferrer" />,
                                                    code: ({ node, ...props }) => <code {...props} className="bg-black/10 dark:bg-white/10 rounded px-1 py-0.5" />,
                                                    pre: ({ node, ...props }) => <pre {...props} className="bg-black/10 dark:bg-white/10 rounded p-2 overflow-x-auto my-2" />,
                                                }}
                                            >
                                                {formatMessageText(message.text)}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            ))}
                            {isLoading && (
                                <div className="bg-muted self-start rounded-lg p-3 max-w-[80%]">
                                    <div className="flex items-center gap-3">
                                        {/* Mascot avatar while loading */}
                                        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                                            <img
                                                src={MASCOT_AVATAR}
                                                alt="Mascot thinking"
                                                className="w-14 h-14 object-contain animate-bounce"
                                                onError={(e) => {
                                                    e.currentTarget.style.display = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </ScrollArea>

                    {/* Input Area */}
                    <div className="p-4 border-t bg-background">
                        {selectedImage && (
                            <div className="mb-3 relative inline-block">
                                <div className="h-16 w-16 rounded-md border overflow-hidden relative group">
                                    <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
                                    <button
                                        onClick={handleRemoveImage}
                                        className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors"
                                    >
                                        <RemoveIcon className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        )}
                        <div className="flex gap-2 items-center">
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                ref={fileInputRef}
                                onChange={handleFileSelect}
                            />
                            <Button
                                size="icon"
                                variant="ghost"
                                className="shrink-0"
                                onClick={() => fileInputRef.current?.click()}
                                title="Adjuntar imagen"
                            >
                                <Paperclip className="h-4 w-4" />
                            </Button>
                            <Input
                                placeholder="Escribe tu pregunta..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                className="flex-1"
                            />
                            <Button
                                size="icon"
                                onClick={handleSendMessage}
                                disabled={isLoading || (!inputValue.trim() && !selectedImage)}
                            >
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
