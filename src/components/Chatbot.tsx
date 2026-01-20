import React, { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Paperclip, X as RemoveIcon, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useAuth } from '@/contexts/auth-context';


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

// Markdown component overrides - defined outside to prevent re-creation on each render
const createMarkdownComponents = (isUserMessage: boolean) => ({
    a: ({ node: _node, children, ...props }: any) => (
        <a 
            {...props} 
            className={cn("underline font-medium", isUserMessage ? "text-white/90 hover:text-white" : "text-blue-600 dark:text-blue-400")} 
            target="_blank" 
            rel="noopener noreferrer"
        >
            {children || props.href}
        </a>
    ),
    code: ({ node: _node, ...props }: any) => (
        <code {...props} className={cn("rounded px-1 py-0.5", isUserMessage ? "bg-white/20" : "bg-black/10 dark:bg-white/10")} />
    ),
    pre: ({ node: _node, ...props }: any) => (
        <pre {...props} className={cn("rounded p-2 overflow-x-auto my-2", isUserMessage ? "bg-white/20" : "bg-black/10 dark:bg-white/10")} />
    ),
});

function formatMessageText(text: string) {
    // Link incident/ticket identifiers to detail pages
    return text.replace(/(?:(?:\b(?:incident|incidente|ticket|id))\s*:?\s*(?:#)?|#)(\d+)/gi, (match, id) => {
        return `[${match}](/incident/${id})`;
    });
}

function buildUserMessage(inputValue: string, selectedImage: string | null): Message {
    return {
        id: Date.now().toString(),
        text: inputValue,
        image: selectedImage || undefined,
        sender: 'user',
        timestamp: new Date(),
    };
}

function buildBotMessage(text: string): Message {
    return {
        id: (Date.now() + 1).toString(),
        text,
        sender: 'bot',
        timestamp: new Date(),
    };
}

type MessageItemProps = {
    message: Message;
    lastBotMessageId?: string;
    typingMessageId: string | null;
    displayedText: string;
    isLoading: boolean;
};

const MessageItem = ({ message, lastBotMessageId, typingMessageId, displayedText, isLoading }: MessageItemProps) => {
    const isUser = message.sender === 'user';
    const showTyping = message.sender === 'bot' && typingMessageId === message.id;

    return (
        <div
            className={cn(
                "flex gap-3 max-w-[85%]",
                isUser ? "self-end flex-row-reverse" : "self-start"
            )}
        >
            {isUser ? (
                <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-auto">
                    <User className="w-6 h-6 text-primary" />
                </div>
            ) : (
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-auto">
                    <img
                        src={typingMessageId === message.id ? MASCOT_TYPING : MASCOT_AVATAR}
                        alt="Mascot"
                        className={cn(
                            "w-14 h-14 object-contain transition-all duration-300",
                            (isLoading || (message.id !== lastBotMessageId && typingMessageId !== message.id)) && "grayscale opacity-50"
                        )}
                        onError={(e) => {
                            e.currentTarget.style.display = 'none';
                        }}
                    />
                </div>
            )}

            <div
                className={cn(
                    "rounded-2xl p-4 text-sm shadow-sm relative",
                    isUser ? "bg-primary text-primary-foreground rounded-br-sm" : "bg-muted rounded-bl-sm"
                )}
            >
                {message.image && (
                    <div className="mb-3 rounded-lg overflow-hidden bg-black/10">
                        <img src={message.image} alt="Uploaded content" className="max-w-full h-auto object-cover max-h-[200px]" />
                    </div>
                )}

                <div className={cn(
                    "prose prose-sm max-w-none break-words [&>p]:mb-2 [&>p:last-child]:mb-0 [&>ul]:list-disc [&>ul]:pl-4 [&>ol]:list-decimal [&>ol]:pl-4",
                    isUser ? "dark:prose-invert text-primary-foreground" : "dark:prose-invert"
                )}>
                    <ReactMarkdown
                        remarkPlugins={[remarkGfm]}
                        components={createMarkdownComponents(isUser)}
                    >
                        {message.sender === 'bot' && typingMessageId === message.id
                            ? formatMessageText(displayedText)
                            : formatMessageText(message.text)}
                    </ReactMarkdown>
                </div>

                {showTyping && (
                    <div className="mt-2">
                        <dotlottie-wc
                            src="https://lottie.host/3f3e821d-2eac-415d-b247-3e834227acaa/mCAwvZO7MO.lottie"
                            autoplay
                            loop
                            style={{ width: '40px', height: '20px', opacity: 0.6 }}
                        />
                    </div>
                )}
            </div>
        </div>
    );
};

const LoadingMessage = () => (
    <div className="flex gap-3 max-w-[85%] self-start">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-auto">
            <img
                src={MASCOT_AVATAR}
                alt="Mascot thinking"
                className="w-14 h-14 object-contain animate-bounce"
                onError={(e) => {
                    e.currentTarget.style.display = 'none';
                }}
            />
        </div>
        <div className="bg-muted rounded-2xl rounded-bl-sm p-4 text-sm flex items-center shadow-sm h-fit self-center">
            <span className="flex gap-1">
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                <span className="w-2 h-2 bg-primary/40 rounded-full animate-bounce"></span>
            </span>
        </div>
    </div>
);

function MessageList({
    messages,
    typingMessageId,
    displayedText,
    isLoading,
}: {
    messages: Message[];
    typingMessageId: string | null;
    displayedText: string;
    isLoading: boolean;
}) {
    const lastBotMessageId = messages.reduce<string | undefined>((acc, message) => (
        message.sender === 'bot' ? message.id : acc
    ), undefined);

    return (
        <div className="flex flex-col gap-6">
            {messages.map((message) => (
                <MessageItem
                    key={message.id}
                    message={message}
                    lastBotMessageId={lastBotMessageId}
                    typingMessageId={typingMessageId}
                    displayedText={displayedText}
                    isLoading={isLoading}
                />
            ))}

            {isLoading && <LoadingMessage />}
        </div>
    );
}

function AttachmentPreview({ selectedImage, onRemove }: { selectedImage: string; onRemove: () => void }) {
    return (
        <div className="mb-3 relative inline-block">
            <div className="h-16 w-16 rounded-md border overflow-hidden relative group">
                <img src={selectedImage} alt="Preview" className="h-full w-full object-cover" />
                <button
                    onClick={onRemove}
                    className="absolute top-0.5 right-0.5 bg-black/50 text-white rounded-full p-0.5 hover:bg-black/70 transition-colors"
                >
                    <RemoveIcon className="h-3 w-3" />
                </button>
            </div>
        </div>
    );
}

export function Chatbot() {
    const { user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);

    const [messages, setMessages] = useState<Message[]>([
        {
            id: '1',
            text: 'Hola! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?',
            sender: 'bot',
            timestamp: new Date(),
        },
    ]);

    useEffect(() => {
        if (!user?.name) {
            return;
        }

        setMessages((currentMessages) => {
            if (currentMessages.length === 1 && currentMessages[0].id === '1') {
                return [
                    {
                        ...currentMessages[0],
                        text: `Hola ${user.name}! Soy tu asistente virtual. ¿En qué puedo ayudarte hoy?`,
                    }
                ];
            }

            return currentMessages;
        });
    }, [user?.name]);

    const [inputValue, setInputValue] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [typingMessageId, setTypingMessageId] = useState<string | null>(null);
    const [displayedText, setDisplayedText] = useState<string>('');
    const scrollAreaRef = useRef<HTMLDivElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Typewriter effect (word by word)
    useEffect(() => {
        if (!typingMessageId) return;

        const message = messages.find(m => m.id === typingMessageId);
        if (!message) return;

        const fullText = message.text;
        let currentIndex = 0;

        const typingInterval = setInterval(() => {
            if (currentIndex < fullText.length) {
                const nextSpace = fullText.indexOf(' ', currentIndex + 1);
                currentIndex = nextSpace === -1 ? fullText.length : nextSpace + 1;
                setDisplayedText(fullText.slice(0, currentIndex));
                return;
            }

            setDisplayedText(fullText);
            clearInterval(typingInterval);
            setTypingMessageId(null);
        }, 30);

        return () => clearInterval(typingInterval);
    }, [typingMessageId, messages]);

    useEffect(() => {
        const container = scrollAreaRef.current?.querySelector('[data-radix-scroll-area-viewport]');
        if (container) {
            container.scrollTop = container.scrollHeight;
        }
    }, [messages, isOpen, selectedImage, displayedText]);

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onloadend = () => {
            setSelectedImage(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    const handleRemoveImage = () => {
        setSelectedImage(null);
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    const sendQuestion = async (userMessage: Message) => {
        const response = await fetch('https://fbc428c71a0a.ngrok-free.app/ask', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                question: user?.name ? `${user.name}: ${userMessage.text}` : userMessage.text,
                image: userMessage.image,
            }),
        });

        if (!response.ok) {
            throw new Error('Network response was not ok');
        }

        const data = await response.json();
        return data.answer || data.response || data.text || (typeof data === 'string' ? data : JSON.stringify(data));
    };

    const handleSendMessage = async () => {
        if (!inputValue.trim() && !selectedImage) return;

        const userMessage = buildUserMessage(inputValue, selectedImage);
        setMessages((prev) => [...prev, userMessage]);
        setInputValue('');
        setSelectedImage(null);
        if (fileInputRef.current) fileInputRef.current.value = '';
        setIsLoading(true);

        try {
            const botResponseText = await sendQuestion(userMessage);
            const botMessage = buildBotMessage(botResponseText);
            setMessages((prev) => [...prev, botMessage]);
            setTypingMessageId(botMessage.id);
            setDisplayedText('');
        } catch (error) {
            console.error('Failed to send message:', error);
            const errorMessage = buildBotMessage('Lo siento, hubo un error al conectar con el servidor. Por favor, intenta de nuevo más tarde.');
            setMessages((prev) => [...prev, errorMessage]);
            setTypingMessageId(errorMessage.id);
            setDisplayedText('');
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
                <div className="w-[400px] h-[600px] bg-background border rounded-lg shadow-xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 fade-in duration-300">
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

                    <ScrollArea className="flex-1 p-4" ref={scrollAreaRef}>
                        <MessageList
                            messages={messages}
                            typingMessageId={typingMessageId}
                            displayedText={displayedText}
                            isLoading={isLoading}
                        />
                    </ScrollArea>

                    <div className="p-4 border-t bg-background">
                        {selectedImage && (
                            <AttachmentPreview selectedImage={selectedImage} onRemove={handleRemoveImage} />
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
