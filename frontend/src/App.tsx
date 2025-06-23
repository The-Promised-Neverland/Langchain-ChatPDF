import React, { useState, useRef, useEffect } from 'react';
import { Upload, Send, FileText, MessageCircle, RotateCcw, Check, AlertCircle, Loader2, Sparkles, Zap, Rocket } from 'lucide-react';

interface Message {
  id: string;
  type: 'user' | 'bot';
  content: string;
  timestamp: Date;
}

interface ToastMessage {
  id: string;
  type: 'success' | 'error';
  message: string;
}

function App() {
  const [sessionId, setSessionId] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [isAsking, setIsAsking] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const [isDragOver, setIsDragOver] = useState(false);
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Generate or retrieve session ID
  useEffect(() => {
    let storedSessionId = localStorage.getItem('pdfChatSessionId');
    if (!storedSessionId) {
      storedSessionId = crypto.randomUUID();
      localStorage.setItem('pdfChatSessionId', storedSessionId);
    }
    setSessionId(storedSessionId);
  }, []);

  // Auto-scroll chat to bottom
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
    }
  }, [currentQuestion]);

  const showToast = (type: 'success' | 'error', message: string) => {
    const id = crypto.randomUUID();
    const toast: ToastMessage = { id, type, message };
    setToasts(prev => [...prev, toast]);
    
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  const handleFileSelect = (file: File) => {
    if (file.type === 'application/pdf') {
      setUploadedFile(file);
    } else {
      showToast('error', 'Please select a valid PDF file');
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileSelect(e.target.files[0]);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleUpload = async () => {
    if (!uploadedFile) {
      showToast('error', 'Please select a PDF file first');
      return;
    }

    setIsUploading(true);
    
    try {
      const formData = new FormData();
      formData.append('file', uploadedFile);

      const response = await fetch('http://localhost:8080/api/mission/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.status}`);
      }

      showToast('success', '✅ PDF embedded into memory and vector store.');
    } catch (error) {
      console.error('Upload error:', error);
      showToast('error', error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAskQuestion = async () => {
    if (!currentQuestion.trim()) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      type: 'user',
      content: currentQuestion.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setCurrentQuestion('');
    setIsAsking(true);

    // Add loading bot message
    const loadingMessage: Message = {
      id: 'loading',
      type: 'bot',
      content: '',
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, loadingMessage]);

    try {
      const response = await fetch('http://localhost:8080/api/mission/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          question: userMessage.content,
          sessionId: sessionId,
        }),
      });

      if (!response.ok) {
        throw new Error(`Request failed: ${response.status}`);
      }

      const data = await response.json();
      
      const botMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: data.answer || 'No response received',
        timestamp: new Date(),
      };

      // Replace loading message with actual response
      setMessages(prev => prev.filter(m => m.id !== 'loading').concat(botMessage));
    } catch (error) {
      console.error('Ask error:', error);
      const errorMessage: Message = {
        id: crypto.randomUUID(),
        type: 'bot',
        content: `Error: ${error instanceof Error ? error.message : 'Failed to get response'}`,
        timestamp: new Date(),
      };
      
      setMessages(prev => prev.filter(m => m.id !== 'loading').concat(errorMessage));
    } finally {
      setIsAsking(false);
    }
  };

  const handleReset = async () => {
    try {
      await fetch('http://localhost:8080/api/mission/reset', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ sessionId }),
      });

      setMessages([]);
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
      showToast('success', 'Session reset successfully');
    } catch (error) {
      console.error('Reset error:', error);
      showToast('error', 'Failed to reset session');
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleAskQuestion();
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute top-3/4 right-1/4 w-80 h-80 bg-cyan-500/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-pink-500/20 rounded-full blur-3xl animate-pulse delay-2000"></div>
        <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-blue-500/20 rounded-full blur-3xl animate-pulse delay-3000"></div>
      </div>

      {/* Floating Stars */}
      <div className="absolute inset-0">
        {[...Array(50)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/40 rounded-full animate-twinkle"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 3}s`,
              animationDuration: `${2 + Math.random() * 2}s`
            }}
          ></div>
        ))}
      </div>

      {/* Toast Container */}
      <div className="fixed top-4 right-4 z-50 space-y-2">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`
              px-6 py-4 rounded-2xl shadow-2xl backdrop-blur-md border transition-all duration-500 transform translate-x-0 animate-slideIn
              ${toast.type === 'success' 
                ? 'bg-emerald-500/20 border-emerald-400/30 text-emerald-100' 
                : 'bg-red-500/20 border-red-400/30 text-red-100'
              }
            `}
          >
            <div className="flex items-center gap-3">
              {toast.type === 'success' ? (
                <Check className="w-5 h-5 text-emerald-400" />
              ) : (
                <AlertCircle className="w-5 h-5 text-red-400" />
              )}
              <span className="font-medium">{toast.message}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* Header */}
        <div className="bg-black/20 backdrop-blur-xl border-b border-white/10 px-6 py-6">
          <div className="max-w-4xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative w-12 h-12 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full flex items-center justify-center animate-spin-slow">
                <Rocket className="w-6 h-6 text-white" />
                <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-cyan-500 rounded-full animate-ping opacity-20"></div>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-white via-purple-200 to-cyan-200 bg-clip-text text-transparent">
                  Cosmic PDF Assistant
                </h1>
                <p className="text-gray-300">Explore the universe of your documents</p>
              </div>
            </div>
            <button
              onClick={handleReset}
              className="flex items-center gap-2 px-4 py-2 text-gray-300 hover:text-white hover:bg-white/10 rounded-xl transition-all duration-300 backdrop-blur-sm border border-white/10"
            >
              <RotateCcw className="w-4 h-4" />
              Reset Mission
            </button>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-black/10 backdrop-blur-xl border-b border-white/10 px-6 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex flex-col lg:flex-row gap-6 items-end">
              <div className="flex-1">
                <label className="block text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  Launch Your PDF Into Space
                </label>
                <div
                  className={`
                    relative border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all duration-300 group
                    ${isDragOver 
                      ? 'border-cyan-400 bg-cyan-500/20 scale-105 shadow-2xl shadow-cyan-500/25' 
                      : uploadedFile
                      ? 'border-emerald-400 bg-emerald-500/20 shadow-2xl shadow-emerald-500/25'
                      : 'border-white/30 hover:border-purple-400 hover:bg-purple-500/10 hover:shadow-2xl hover:shadow-purple-500/25'
                    }
                  `}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".pdf"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  
                  <div className="space-y-4">
                    {uploadedFile ? (
                      <>
                        <div className="relative">
                          <Check className="w-16 h-16 text-emerald-400 mx-auto animate-bounce" />
                          <div className="absolute inset-0 bg-emerald-400/30 rounded-full animate-ping"></div>
                        </div>
                        <div>
                          <p className="text-emerald-300 font-semibold text-lg">{uploadedFile.name}</p>
                          <p className="text-emerald-400 text-sm mt-1">
                            {(uploadedFile.size / 1024 / 1024).toFixed(2)} MB • Ready for cosmic analysis
                          </p>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="relative">
                          <Upload className="w-16 h-16 text-white/60 mx-auto group-hover:text-purple-400 transition-colors duration-300 animate-float" />
                          <div className="absolute inset-0 bg-purple-400/20 rounded-full opacity-0 group-hover:opacity-100 animate-ping transition-opacity duration-300"></div>
                        </div>
                        <div>
                          <p className="text-white font-semibold text-lg mb-2">
                            Drop your PDF into the cosmic void
                          </p>
                          <p className="text-gray-300 text-sm">
                            Or <span className="text-purple-400 font-medium">click to browse</span> the galaxy
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleUpload}
                disabled={!uploadedFile || isUploading}
                className="px-8 py-4 bg-gradient-to-r from-purple-600 via-pink-600 to-cyan-600 text-white rounded-2xl font-semibold hover:from-purple-700 hover:via-pink-700 hover:to-cyan-700 focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105 disabled:hover:scale-100 shadow-2xl shadow-purple-500/25 flex items-center gap-3"
              >
                {isUploading ? (
                  <>
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                      <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                    </div>
                    Launching...
                  </>
                ) : (
                  <>
                    <Rocket className="w-5 h-5" />
                    Launch & Ingest
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Chat Interface */}
        <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center py-16">
                <div className="relative mb-8">
                  <MessageCircle className="w-20 h-20 text-white/30 mx-auto animate-pulse" />
                  <div className="absolute inset-0 bg-purple-400/20 rounded-full animate-ping"></div>
                </div>
                <p className="text-white/60 text-lg">Launch a PDF and start your cosmic conversation!</p>
                <div className="flex justify-center mt-4 space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-pink-400 rounded-full animate-bounce delay-100"></div>
                  <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce delay-200"></div>
                </div>
              </div>
            ) : (
              messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'} animate-slideUp`}
                >
                  <div
                    className={`
                      max-w-xs sm:max-w-md lg:max-w-lg xl:max-w-xl px-6 py-4 rounded-3xl shadow-2xl backdrop-blur-md border transition-all duration-300 hover:scale-105
                      ${message.type === 'user'
                        ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white border-purple-400/30 rounded-br-lg shadow-purple-500/25'
                        : 'bg-white/10 border-white/20 text-white rounded-bl-lg shadow-cyan-500/25'
                      }
                    `}
                  >
                    {message.id === 'loading' ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <Zap className="w-5 h-5 text-cyan-400 animate-pulse" />
                          <span className="text-cyan-300 font-medium">AI is thinking in hyperspace...</span>
                        </div>
                        <div className="flex justify-center space-x-2">
                          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce"></div>
                          <div className="w-3 h-3 bg-purple-400 rounded-full animate-bounce delay-100"></div>
                          <div className="w-3 h-3 bg-pink-400 rounded-full animate-bounce delay-200"></div>
                          <div className="w-3 h-3 bg-cyan-400 rounded-full animate-bounce delay-300"></div>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-pink-400 rounded-full animate-pulse"></div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <p className="leading-relaxed whitespace-pre-wrap">{message.content}</p>
                        <div className={`text-xs mt-3 flex items-center gap-2 ${message.type === 'user' ? 'text-purple-100' : 'text-gray-300'}`}>
                          <Sparkles className="w-3 h-3" />
                          {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Input Section */}
          <div className="border-t border-white/10 bg-black/20 backdrop-blur-xl px-6 py-6">
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  value={currentQuestion}
                  onChange={(e) => setCurrentQuestion(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask the cosmos about your PDF..."
                  rows={1}
                  className="w-full px-6 py-4 bg-white/10 border border-white/20 rounded-2xl text-white placeholder-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none max-h-32 backdrop-blur-sm transition-all duration-300"
                  style={{ minHeight: '56px' }}
                />
              </div>
              <button
                onClick={handleAskQuestion}
                disabled={!currentQuestion.trim() || isAsking}
                className="px-6 py-4 bg-gradient-to-r from-cyan-500 to-purple-600 text-white rounded-2xl hover:from-cyan-600 hover:to-purple-700 focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 focus:ring-offset-transparent disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center transform hover:scale-105 disabled:hover:scale-100 shadow-2xl shadow-cyan-500/25"
              >
                {isAsking ? (
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-100"></div>
                    <div className="w-2 h-2 bg-white rounded-full animate-bounce delay-200"></div>
                  </div>
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes twinkle {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 1; transform: scale(1.2); }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-10px); }
        }
        @keyframes slideIn {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        .animate-twinkle {
          animation: twinkle 2s ease-in-out infinite;
        }
        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
        .animate-slideIn {
          animation: slideIn 0.5s ease-out;
        }
        .animate-slideUp {
          animation: slideUp 0.3s ease-out;
        }
        .animate-spin-slow {
          animation: spin-slow 8s linear infinite;
        }
      `}</style>
    </div>
  );
}

export default App;