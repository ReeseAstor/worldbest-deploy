import { create } from 'zustand';
import { persist } from 'zustand/middleware';

/**
 * AI Store
 * 
 * Manages AI-related UI state including conversations, model selection,
 * and generation settings.
 */

export type AIProvider = 'anthropic' | 'openai' | 'venice' | 'gemini';
export type AITab = 'chat' | 'workflow' | 'images';

interface ConversationMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  model?: string;
  tokens?: number;
}

interface Conversation {
  id: string;
  title: string;
  messages: ConversationMessage[];
  model: string;
  createdAt: Date;
  updatedAt: Date;
}

interface AIState {
  // Active tab
  activeTab: AITab;
  
  // Model selection
  selectedModel: string;
  selectedProvider: AIProvider;
  
  // Chat state
  conversations: Conversation[];
  activeConversationId: string | null;
  isGenerating: boolean;
  
  // Workflow state
  currentWorkflowStep: number;
  workflowInput: string;
  workflowOutput: string;
  
  // Settings
  steamLevel: number;
  voiceMatchingEnabled: boolean;
  temperature: number;
  maxTokens: number;
  
  // Image generation
  imagePrompt: string;
  selectedImageStyle: string;
  selectedImageSize: string;
  generatedImages: string[];
  
  // Actions
  setActiveTab: (tab: AITab) => void;
  setSelectedModel: (model: string, provider: AIProvider) => void;
  
  // Chat actions
  createConversation: (model: string) => string;
  setActiveConversation: (id: string | null) => void;
  addMessage: (conversationId: string, message: Omit<ConversationMessage, 'id' | 'timestamp'>) => void;
  clearConversation: (id: string) => void;
  deleteConversation: (id: string) => void;
  setGenerating: (generating: boolean) => void;
  
  // Workflow actions
  setWorkflowStep: (step: number) => void;
  setWorkflowInput: (input: string) => void;
  setWorkflowOutput: (output: string) => void;
  
  // Settings actions
  setSteamLevel: (level: number) => void;
  setVoiceMatchingEnabled: (enabled: boolean) => void;
  setTemperature: (temp: number) => void;
  setMaxTokens: (tokens: number) => void;
  
  // Image actions
  setImagePrompt: (prompt: string) => void;
  setImageStyle: (style: string) => void;
  setImageSize: (size: string) => void;
  addGeneratedImage: (url: string) => void;
  clearGeneratedImages: () => void;
}

export const useAIStore = create<AIState>()(
  persist(
    (set, get) => ({
      // Initial state
      activeTab: 'chat',
      selectedModel: 'claude-opus',
      selectedProvider: 'anthropic',
      conversations: [],
      activeConversationId: null,
      isGenerating: false,
      currentWorkflowStep: 0,
      workflowInput: '',
      workflowOutput: '',
      steamLevel: 3,
      voiceMatchingEnabled: true,
      temperature: 0.7,
      maxTokens: 4000,
      imagePrompt: '',
      selectedImageStyle: 'romantic',
      selectedImageSize: '1024x1024',
      generatedImages: [],

      // Tab actions
      setActiveTab: (tab) => set({ activeTab: tab }),
      
      // Model actions
      setSelectedModel: (model, provider) => set({ selectedModel: model, selectedProvider: provider }),
      
      // Chat actions
      createConversation: (model) => {
        const id = crypto.randomUUID();
        const newConversation: Conversation = {
          id,
          title: 'New Conversation',
          messages: [],
          model,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        set((state) => ({
          conversations: [newConversation, ...state.conversations],
          activeConversationId: id,
        }));
        return id;
      },
      
      setActiveConversation: (id) => set({ activeConversationId: id }),
      
      addMessage: (conversationId, message) => {
        const newMessage: ConversationMessage = {
          ...message,
          id: crypto.randomUUID(),
          timestamp: new Date(),
        };
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === conversationId
              ? {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  updatedAt: new Date(),
                  title: conv.messages.length === 0 && message.role === 'user'
                    ? message.content.slice(0, 50) + (message.content.length > 50 ? '...' : '')
                    : conv.title,
                }
              : conv
          ),
        }));
      },
      
      clearConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.map((conv) =>
            conv.id === id ? { ...conv, messages: [], updatedAt: new Date() } : conv
          ),
        }));
      },
      
      deleteConversation: (id) => {
        set((state) => ({
          conversations: state.conversations.filter((conv) => conv.id !== id),
          activeConversationId: state.activeConversationId === id ? null : state.activeConversationId,
        }));
      },
      
      setGenerating: (generating) => set({ isGenerating: generating }),
      
      // Workflow actions
      setWorkflowStep: (step) => set({ currentWorkflowStep: step }),
      setWorkflowInput: (input) => set({ workflowInput: input }),
      setWorkflowOutput: (output) => set({ workflowOutput: output }),
      
      // Settings actions
      setSteamLevel: (level) => set({ steamLevel: level }),
      setVoiceMatchingEnabled: (enabled) => set({ voiceMatchingEnabled: enabled }),
      setTemperature: (temp) => set({ temperature: temp }),
      setMaxTokens: (tokens) => set({ maxTokens: tokens }),
      
      // Image actions
      setImagePrompt: (prompt) => set({ imagePrompt: prompt }),
      setImageStyle: (style) => set({ selectedImageStyle: style }),
      setImageSize: (size) => set({ selectedImageSize: size }),
      addGeneratedImage: (url) => set((state) => ({ 
        generatedImages: [url, ...state.generatedImages] 
      })),
      clearGeneratedImages: () => set({ generatedImages: [] }),
    }),
    {
      name: 'ember-ai-state',
      partialize: (state) => ({
        selectedModel: state.selectedModel,
        selectedProvider: state.selectedProvider,
        steamLevel: state.steamLevel,
        voiceMatchingEnabled: state.voiceMatchingEnabled,
        temperature: state.temperature,
        maxTokens: state.maxTokens,
        selectedImageStyle: state.selectedImageStyle,
        selectedImageSize: state.selectedImageSize,
        // Persist last 10 conversations
        conversations: state.conversations.slice(0, 10),
      }),
    }
  )
);
