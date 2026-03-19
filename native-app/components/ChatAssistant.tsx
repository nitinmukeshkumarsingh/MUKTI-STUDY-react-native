import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, ActivityIndicator } from 'react-native';
import { Send, Loader2, Sparkles, ChevronLeft } from 'lucide-react-native';
import { ChatMessage } from '../types';
import { preprocessMath } from '../utils/math';
import { getChatResponseStream } from '../services/geminiService';
import Markdown from 'react-native-markdown-display'; // Replaced react-markdown

interface ChatAssistantProps {
  onBack?: () => void;
}

export const ChatAssistant: React.FC<ChatAssistantProps> = ({ onBack }) => {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isStreaming, setIsStreaming] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);

  useEffect(() => {
    setMessages([
        { id: '1', role: 'model', text: 'Hey there! 👋 I\'m MUKTI AI, your study bestie. I\'m so ready to help you crush your goals today! What\'s on your mind? ☕️📚', timestamp: Date.now() }
    ]);
  }, []);

  useEffect(() => {
    if (scrollViewRef.current) {
        scrollViewRef.current.scrollToEnd({ animated: true });
    }
  }, [messages, isStreaming]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      text: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    try {
        const history = messages.map(m => ({
            role: m.role,
            parts: [{ text: m.text }]
        }));

        const stream = await getChatResponseStream(history, input);
        
        const aiMsgId = (Date.now() + 1).toString();
        const aiMsg: ChatMessage = {
            id: aiMsgId,
            role: 'model',
            text: '',
            timestamp: Date.now()
        };
        
        setMessages(prev => [...prev, aiMsg]);
        setIsLoading(false); 
        setIsStreaming(true);

        let fullText = "";
        let fullReasoning = "";
        let currentTool = "";
        for await (const chunk of stream) {
          const c = chunk as any;
          if (c.tool) currentTool = c.tool;
          else if (c.doneTool) currentTool = "";
          
          if (c.reasoning) fullReasoning += c.reasoning;
          if (c.text) fullText += c.text;

          setMessages(prev => 
            prev.map(m => m.id === aiMsgId ? { 
                ...m, 
                tool: currentTool || undefined,
                reasoning: fullReasoning,
                text: fullText 
            } : m)
          );
        }
    } catch (error: any) {
        console.error("Chat error", error);
        setIsLoading(false);
        setIsStreaming(false);
        
        let errorMessage = 'I encountered an error. Please check your API keys in Settings! ⚠️';
        if (error?.message) errorMessage = `⚠️ ${error.message}`;

        setMessages(prev => [...prev, { 
            id: Date.now().toString(), 
            role: 'model', 
            text: errorMessage, 
            timestamp: Date.now() 
        }]);
    } finally {
        setIsStreaming(false);
    }
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={100}
    >
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <ChevronLeft size={24} color="white" />
        </TouchableOpacity>
        <Text style={styles.navTitle}>MUKTI AI</Text>
      </View>
      <ScrollView 
        ref={scrollViewRef}
        style={styles.messagesArea}
        contentContainerStyle={styles.messagesContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.map((msg) => (
          <View
            key={msg.id}
            style={[
              styles.messageWrapper,
              msg.role === 'user' ? styles.userWrapper : styles.modelWrapper
            ]}
          >
            <View
              style={[
                styles.messageBubble,
                msg.role === 'user' ? styles.userBubble : styles.modelBubble
              ]}
            >
              {msg.role === 'model' ? (
                 <View style={styles.modelContent}>
                    {msg.tool && (
                        <View style={styles.toolBadge}>
                            <ActivityIndicator size="small" color="#22d3ee" />
                            <Text style={styles.toolText}>{msg.tool}...</Text>
                        </View>
                    )}
                    
                    {isStreaming && msg.reasoning && (
                        <View style={styles.reasoningBox}>
                            <View style={styles.reasoningHeader}>
                                <Sparkles size={12} color="#22d3ee" />
                                <Text style={styles.reasoningHeaderText}>Thinking Process...</Text>
                            </View>
                            <Text style={styles.reasoningText}>{msg.reasoning}</Text>
                        </View>
                    )}

                    {msg.text ? (
                        <Markdown style={markdownStyles}>
                            {preprocessMath(msg.text)}
                        </Markdown>
                    ) : !msg.tool && !msg.reasoning && (
                        <View style={styles.typingDots}>
                            <Text style={styles.dot}>.</Text>
                            <Text style={styles.dot}>.</Text>
                            <Text style={styles.dot}>.</Text>
                        </View>
                    )}
                 </View>
              ) : (
                <Text style={styles.userText}>{msg.text}</Text>
              )}
            </View>
            <Text style={styles.timestamp}>
                {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </Text>
          </View>
        ))}
        
        {isLoading && !isStreaming && (
             <View style={styles.loadingWrapper}>
                 <View style={styles.loadingBubble}>
                    <ActivityIndicator size="small" color="#22d3ee" />
                    <Text style={styles.loadingText}>MUKTI is typing</Text>
                    <Sparkles size={12} color="#fbbf24" />
                 </View>
             </View>
        )}
      </ScrollView>

      <View style={styles.inputArea}>
          <View style={styles.inputContainer}>
                <TextInput
                    value={input}
                    onChangeText={setInput}
                    placeholder="Say hi to MUKTI..."
                    placeholderTextColor="#475569"
                    style={styles.input}
                    multiline
                />
                <TouchableOpacity
                    onPress={handleSend}
                    disabled={isLoading || !input.trim()}
                    style={[
                        styles.sendButton,
                        (!input.trim() || isLoading) && styles.sendButtonDisabled
                    ]}
                >
                    <Send size={20} color="white" />
                </TouchableOpacity>
          </View>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0b1221',
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    backgroundColor: '#0b1221',
  },
  backBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  navTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  messagesArea: {
    flex: 1,
  },
  messagesContent: {
    paddingBottom: 100,
    paddingTop: 8,
  },
  messageWrapper: {
    marginBottom: 16,
    maxWidth: '96%',
  },
  userWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
  },
  modelWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    width: '100%',
  },
  messageBubble: {
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  userBubble: {
    backgroundColor: '#0891b2',
    borderBottomRightRadius: 4,
  },
  modelBubble: {
    backgroundColor: '#1e293b',
    borderBottomLeftRadius: 4,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
    width: '100%',
  },
  userText: {
    color: 'white',
    fontSize: 14,
  },
  modelContent: {
    width: '100%',
  },
  timestamp: {
    fontSize: 10,
    color: '#475569',
    marginTop: 6,
    fontWeight: 'bold',
  },
  toolBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(8, 145, 178, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 8,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: 'rgba(34, 211, 238, 0.2)',
  },
  toolText: {
    color: '#22d3ee',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reasoningBox: {
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(51, 65, 85, 0.5)',
  },
  reasoningHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  reasoningHeaderText: {
    color: '#22d3ee',
    fontSize: 10,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  reasoningText: {
    color: '#94a3b8',
    fontSize: 10,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  typingDots: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  dot: {
    color: '#22d3ee',
    fontSize: 24,
    fontWeight: 'bold',
    marginHorizontal: 2,
  },
  loadingWrapper: {
    alignSelf: 'flex-start',
    marginBottom: 16,
  },
  loadingBubble: {
    backgroundColor: '#1e293b',
    borderRadius: 24,
    borderBottomLeftRadius: 4,
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  loadingText: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    marginHorizontal: 8,
  },
  inputArea: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#0b1221',
    paddingBottom: 24,
    paddingTop: 12,
    paddingHorizontal: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1e293b',
    borderRadius: 28,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  input: {
    flex: 1,
    color: 'white',
    fontSize: 15,
    paddingVertical: 12,
    maxHeight: 100,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#0891b2',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  sendButtonDisabled: {
    backgroundColor: '#1e293b',
  },
});

const markdownStyles = {
  body: {
    color: '#e2e8f0',
    fontSize: 14,
  },
  code_inline: {
    backgroundColor: 'rgba(255,255,255,0.1)',
    color: '#67e8f9',
    borderRadius: 4,
    paddingHorizontal: 4,
  },
  code_block: {
    backgroundColor: 'rgba(0,0,0,0.4)',
    color: '#e2e8f0',
    borderRadius: 12,
    padding: 16,
    marginVertical: 12,
  },
  table: {
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 12,
    marginVertical: 12,
  },
};
