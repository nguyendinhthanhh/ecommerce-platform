import React, { useState, useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getSmartFallbackImage } from '../../utils/smartImageFallback';

import aiService from '../../services/aiService';

const Chatbot = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState([
        {
            id: 1,
            sender: 'bot',
            text: 'Chào bạn! 👋 Bạn đang xem sản phẩm, bạn có muốn so sánh với bản khác để xem hiệu năng chênh lệch thế nào không?',
            timestamp: new Date()
        }
    ]);
    const [inputMessage, setInputMessage] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const toggleChat = () => setIsOpen(!isOpen);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isTyping]);

    const handleSendMessage = async (e, quickText = null) => {
        if (e) e.preventDefault();

        const textToSend = quickText || inputMessage;
        if (!textToSend.trim()) return;

        // Add user message to chat immediately
        const userMsg = {
            id: Date.now(),
            sender: 'user',
            text: textToSend.trim(),
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        setInputMessage('');
        setIsTyping(true);

        try {
            const response = await aiService.sendMessage(textToSend);

            // Log ra để kiểm tra cấu trúc chính xác trong Console
            console.log("Dữ liệu từ BE:", response);

            const botMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                // Thử cấu trúc này nếu response là object chứa data từ API
                text: response.message || response.data?.message || "Không có dữ liệu",
                suggestedProducts: response.suggestedProducts || response.data?.suggestedProducts || [],
                timestamp: new Date()
            };

            setMessages(prev => [...prev, botMsg]);
        } catch (err) {
            console.error('Failed to get AI response:', err);
            const errorMsg = {
                id: Date.now() + 1,
                sender: 'bot',
                text: 'Xin lỗi, tôi đang gặp lỗi kết nối. Vui lòng thử lại sau nhé! 😢',
                timestamp: new Date(),
                isError: true
            };
            setMessages(prev => [...prev, errorMsg]);
        } finally {
            setIsTyping(false);
        }
    };

    const handleQuickAction = (actionText) => {
        handleSendMessage(null, actionText);
    };

    // Function to render text with basic bolding and line breaks
    const formatText = (text) => {
        if (!text) return null;

        // Split by double newline for paragraphs
        const paragraphs = text.split('\n\n');

        return paragraphs.map((paragraph, pIdx) => {
            // Handle bold formatting (*text* or **text**)
            const parts = paragraph.split(/(\*\*.*?\*\*|\*.*?\*)/g);

            return (
                <p key={pIdx} className={pIdx < paragraphs.length - 1 ? "mb-2" : ""}>
                    {parts.map((part, i) => {
                        if (part.startsWith('**') && part.endsWith('**')) {
                            return <strong key={i} className="font-bold text-gray-900">{part.slice(2, -2)}</strong>;
                        }
                        if (part.startsWith('*') && part.endsWith('*')) {
                            return <strong key={i} className="font-bold text-gray-900">{part.slice(1, -1)}</strong>;
                        }
                        // Handle single newlines within a paragraph
                        return part.split('\n').map((line, lIdx, arr) => (
                            <React.Fragment key={`${i}-${lIdx}`}>
                                {line}
                                {lIdx < arr.length - 1 && <br />}
                            </React.Fragment>
                        ));
                    })}
                </p>
            );
        });
    };

    return (
        <div className="fixed bottom-6 right-6 z-[100] font-sans flex flex-col items-end">

            {/* Search Input Box / Chatbot Container */}
            {isOpen && (
                <div className="bg-white rounded-xl shadow-2xl w-[360px] md:w-[400px] sm:h-[600px] h-[80vh] mb-4 flex flex-col overflow-hidden border border-gray-100 transition-all origin-bottom-right duration-300">

                    {/* Header */}
                    <div className="bg-primary px-4 py-3 text-white flex justify-between items-center shrink-0">
                        <div className="flex items-center gap-2">
                            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></span>
                            <h3 className="font-bold text-sm tracking-wide">Trợ lý TechRed</h3>
                        </div>
                        <button
                            onClick={toggleChat}
                            className="hover:bg-white/20 p-1.5 rounded-full transition-colors flex items-center justify-center"
                        >
                            <span className="material-symbols-outlined text-lg">close</span>
                        </button>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-4 bg-[#f8f9fa] flex flex-col gap-4">

                        {/* Timestamp */}
                        <div className="text-center text-[10px] text-gray-400 my-1 font-medium select-none uppercase tracking-wider">
                            {new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} Hôm nay
                        </div>

                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`flex gap-3 max-w-[85%] ${msg.sender === 'user' ? 'self-end flex-row-reverse' : 'self-start'}`}
                            >
                                {/* Avatar for bot */}
                                {msg.sender === 'bot' && (
                                    <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 shrink-0 flex items-center justify-center align-top relative mt-1">
                                        <span className="material-symbols-outlined text-primary text-sm font-bold">smart_toy</span>
                                        {msg.isError && (
                                            <span className="absolute -bottom-1 -right-1 material-symbols-outlined text-[10px] bg-white rounded-full text-red-500">warning</span>
                                        )}
                                    </div>
                                )}

                                {/* Message Bubble */}
                                <div className="flex flex-col gap-1 w-full min-w-0">
                                    <div
                                        className={`px-4 py-2.5 rounded-2xl text-[13px] leading-relaxed shadow-sm ${msg.sender === 'user'
                                            ? 'bg-primary text-white rounded-tr-sm'
                                            : 'bg-white text-gray-700 border border-gray-100 rounded-tl-sm'
                                            }`}
                                    >
                                        {msg.sender === 'user' ? msg.text : formatText(msg.text)}
                                    </div>

                                    {/* Render suggested products if any */}
                                    {msg.suggestedProducts && msg.suggestedProducts.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-1 mb-2 w-full">
                                            <div className="text-[11px] font-medium text-gray-500 uppercase tracking-wider ml-1">Sản phẩm gợi ý</div>
                                            {msg.suggestedProducts.map(product => (
                                                <Link
                                                    key={product.id}
                                                    to={`/products/${product.id}`}
                                                    className="flex items-center gap-3 p-2 bg-white border border-gray-100 rounded-lg hover:border-primary hover:shadow-sm transition-all group"
                                                >
                                                    <div className="w-12 h-12 shrink-0 bg-gray-50 rounded-md overflow-hidden flex items-center justify-center">
                                                        {product.imageUrl ? (
                                                            <img
                                                                    src={product.imageUrl}
                                                                    alt={product.name}
                                                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform"
                                                                    onError={(e) => {
                                                                        e.target.src = getSmartFallbackImage(product);
                                                                        e.target.onerror = null;
                                                                    }}
                                                                />
                                                        ) : (
                                                            <span className="material-symbols-outlined text-gray-300">image</span>
                                                        )}
                                                    </div>
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="text-[13px] font-medium text-gray-900 truncate group-hover:text-primary transition-colors">
                                                            {product.name}
                                                        </h4>
                                                        <div className="flex items-center gap-2 mt-0.5">
                                                            <span className="text-[12px] font-bold text-primary">
                                                                {(product.discountPrice || product.price)?.toLocaleString('vi-VN')}đ
                                                            </span>
                                                            {product.discountPrice && product.discountPrice < product.price && (
                                                                <span className="text-[10px] text-gray-400 line-through">
                                                                    {product.price.toLocaleString('vi-VN')}đ
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </Link>
                                            ))}
                                        </div>
                                    )}

                                    {/* Suggestion actions if it's the first bot message */}
                                    {msg.id === 1 && (
                                        <div className="flex flex-col gap-2 mt-2">
                                            <button
                                                onClick={() => handleQuickAction('So sánh cấu hình i5 vs i7')}
                                                className="bg-primary hover:bg-red-700 text-white text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors uppercase shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">compare_arrows</span>
                                                So sánh cấu hình i5 vs i7
                                            </button>
                                            <button
                                                onClick={() => handleQuickAction('Xem lịch trả góp cho Laptop MSI Katana')}
                                                className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 text-xs font-bold py-2.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-colors uppercase text-primary shadow-sm"
                                            >
                                                <span className="material-symbols-outlined text-[14px]">event_note</span>
                                                Xem lịch trả góp
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}

                        {isTyping && (
                            <div className="flex gap-3 max-w-[85%] self-start">
                                <div className="w-8 h-8 rounded-full bg-red-100 border border-red-200 shrink-0 flex items-center justify-center mt-1">
                                    <span className="material-symbols-outlined text-primary text-sm font-bold">smart_toy</span>
                                </div>
                                <div className="px-4 py-3.5 rounded-2xl bg-white border border-gray-100 rounded-tl-sm flex items-center gap-1 shadow-sm h-10">
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                    <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce"></span>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <form
                        onSubmit={handleSendMessage}
                        className="p-3 bg-white border-t border-gray-100 shrink-0 relative flex items-center"
                    >
                        <div className="flex-1 bg-gray-50 border border-gray-200 rounded-full flex items-center pr-2 focus-within:border-primary focus-within:ring-1 focus-within:ring-primary/20 transition-all">
                            <input
                                type="text"
                                value={inputMessage}
                                onChange={(e) => setInputMessage(e.target.value)}
                                placeholder="Nhập câu hỏi của bạn..."
                                className="w-full bg-transparent border-none focus:ring-0 text-[13px] py-2.5 pl-4 text-gray-700 placeholder-gray-400"
                                disabled={isTyping}
                            />
                            <button
                                type="submit"
                                disabled={!inputMessage.trim() || isTyping}
                                className="p-1.5 rounded-full text-primary hover:bg-red-50 disabled:opacity-50 disabled:hover:bg-transparent transition-colors flex items-center justify-center shrink-0"
                            >
                                <span className="material-symbols-outlined text-[20px] ml-0.5">send</span>
                            </button>
                        </div>
                    </form>
                </div>
            )}

            {/* Floating Toggle Button */}
            <button
                onClick={toggleChat}
                className={`w-14 h-14 rounded-full bg-primary hover:bg-red-700 text-white shadow-xl shadow-red-500/30 flex items-center justify-center transition-transform hover:scale-105 active:scale-95 ${isOpen ? 'rotate-90 scale-0 opacity-0 absolute' : 'rotate-0 scale-100 opacity-100 relative'}`}
            >
                <span className="material-symbols-outlined text-[24px]">chat_bubble</span>
            </button>

        </div>
    );
};

export default Chatbot;
