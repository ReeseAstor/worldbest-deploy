import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useAIStore } from '../ai-store';

// Mock crypto.randomUUID
vi.stubGlobal('crypto', {
  randomUUID: vi.fn(() => 'mock-uuid-' + Math.random().toString(36).slice(2, 9)),
});

describe('useAIStore', () => {
  beforeEach(() => {
    useAIStore.setState({
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
    });
  });

  describe('initial state', () => {
    it('has correct defaults', () => {
      const state = useAIStore.getState();
      expect(state.activeTab).toBe('chat');
      expect(state.selectedModel).toBe('claude-opus');
      expect(state.selectedProvider).toBe('anthropic');
      expect(state.steamLevel).toBe(3);
      expect(state.voiceMatchingEnabled).toBe(true);
      expect(state.temperature).toBe(0.7);
      expect(state.maxTokens).toBe(4000);
      expect(state.conversations).toHaveLength(0);
    });
  });

  describe('tab management', () => {
    it('switches active tab', () => {
      useAIStore.getState().setActiveTab('workflow');
      expect(useAIStore.getState().activeTab).toBe('workflow');
    });

    it('switches to images tab', () => {
      useAIStore.getState().setActiveTab('images');
      expect(useAIStore.getState().activeTab).toBe('images');
    });
  });

  describe('model selection', () => {
    it('updates model and provider together', () => {
      useAIStore.getState().setSelectedModel('openai-gpt4o', 'openai');
      const state = useAIStore.getState();
      expect(state.selectedModel).toBe('openai-gpt4o');
      expect(state.selectedProvider).toBe('openai');
    });
  });

  describe('conversation management', () => {
    it('creates a new conversation', () => {
      const id = useAIStore.getState().createConversation('claude-opus');
      expect(id).toBeTruthy();

      const state = useAIStore.getState();
      expect(state.conversations).toHaveLength(1);
      expect(state.activeConversationId).toBe(id);
      expect(state.conversations[0].title).toBe('New Conversation');
      expect(state.conversations[0].model).toBe('claude-opus');
      expect(state.conversations[0].messages).toHaveLength(0);
    });

    it('adds new conversations to the front of the list', () => {
      const id1 = useAIStore.getState().createConversation('model-1');
      const id2 = useAIStore.getState().createConversation('model-2');
      const state = useAIStore.getState();
      expect(state.conversations[0].id).toBe(id2);
      expect(state.conversations[1].id).toBe(id1);
    });

    it('adds a message to a conversation', () => {
      const id = useAIStore.getState().createConversation('claude-opus');
      useAIStore.getState().addMessage(id, {
        role: 'user',
        content: 'Hello, help me write a scene',
      });

      const conv = useAIStore.getState().conversations.find((c) => c.id === id)!;
      expect(conv.messages).toHaveLength(1);
      expect(conv.messages[0].role).toBe('user');
      expect(conv.messages[0].content).toBe('Hello, help me write a scene');
    });

    it('sets conversation title from first user message', () => {
      const id = useAIStore.getState().createConversation('claude-opus');
      useAIStore.getState().addMessage(id, {
        role: 'user',
        content: 'Write a romantasy opening scene with a strong heroine',
      });

      const conv = useAIStore.getState().conversations.find((c) => c.id === id)!;
      // Title is first 50 chars + '...' for messages longer than 50 chars
      const content = 'Write a romantasy opening scene with a strong heroine';
      const expected = content.slice(0, 50) + '...';
      expect(conv.title).toBe(expected);
    });

    it('does not change title on subsequent messages', () => {
      const id = useAIStore.getState().createConversation('claude-opus');
      useAIStore.getState().addMessage(id, { role: 'user', content: 'First message' });
      useAIStore.getState().addMessage(id, { role: 'user', content: 'Second message' });

      const conv = useAIStore.getState().conversations.find((c) => c.id === id)!;
      expect(conv.title).toBe('First message');
    });

    it('clears conversation messages', () => {
      const id = useAIStore.getState().createConversation('claude-opus');
      useAIStore.getState().addMessage(id, { role: 'user', content: 'Hello' });
      useAIStore.getState().clearConversation(id);

      const conv = useAIStore.getState().conversations.find((c) => c.id === id)!;
      expect(conv.messages).toHaveLength(0);
    });

    it('deletes a conversation', () => {
      const id = useAIStore.getState().createConversation('claude-opus');
      useAIStore.getState().deleteConversation(id);
      expect(useAIStore.getState().conversations).toHaveLength(0);
      expect(useAIStore.getState().activeConversationId).toBeNull();
    });

    it('does not clear active conversation when deleting a different one', () => {
      const id1 = useAIStore.getState().createConversation('model-1');
      useAIStore.getState().createConversation('model-2');
      useAIStore.getState().setActiveConversation(id1);
      // delete the second (which was at index 0)
      const id2 = useAIStore.getState().conversations[0].id;
      useAIStore.getState().deleteConversation(id2);
      expect(useAIStore.getState().activeConversationId).toBe(id1);
    });
  });

  describe('generating state', () => {
    it('sets generating flag', () => {
      useAIStore.getState().setGenerating(true);
      expect(useAIStore.getState().isGenerating).toBe(true);
    });

    it('clears generating flag', () => {
      useAIStore.getState().setGenerating(true);
      useAIStore.getState().setGenerating(false);
      expect(useAIStore.getState().isGenerating).toBe(false);
    });
  });

  describe('settings', () => {
    it('sets steam level', () => {
      useAIStore.getState().setSteamLevel(5);
      expect(useAIStore.getState().steamLevel).toBe(5);
    });

    it('toggles voice matching', () => {
      useAIStore.getState().setVoiceMatchingEnabled(false);
      expect(useAIStore.getState().voiceMatchingEnabled).toBe(false);
    });

    it('sets temperature', () => {
      useAIStore.getState().setTemperature(0.9);
      expect(useAIStore.getState().temperature).toBe(0.9);
    });

    it('sets max tokens', () => {
      useAIStore.getState().setMaxTokens(8000);
      expect(useAIStore.getState().maxTokens).toBe(8000);
    });
  });

  describe('workflow', () => {
    it('sets workflow step', () => {
      useAIStore.getState().setWorkflowStep(2);
      expect(useAIStore.getState().currentWorkflowStep).toBe(2);
    });

    it('sets workflow input and output', () => {
      useAIStore.getState().setWorkflowInput('Draft a scene');
      useAIStore.getState().setWorkflowOutput('Generated scene content');
      expect(useAIStore.getState().workflowInput).toBe('Draft a scene');
      expect(useAIStore.getState().workflowOutput).toBe('Generated scene content');
    });
  });

  describe('image generation', () => {
    it('sets image prompt', () => {
      useAIStore.getState().setImagePrompt('A mystical castle');
      expect(useAIStore.getState().imagePrompt).toBe('A mystical castle');
    });

    it('sets image style and size', () => {
      useAIStore.getState().setImageStyle('fantasy');
      useAIStore.getState().setImageSize('512x512');
      expect(useAIStore.getState().selectedImageStyle).toBe('fantasy');
      expect(useAIStore.getState().selectedImageSize).toBe('512x512');
    });

    it('adds generated images to front of list', () => {
      useAIStore.getState().addGeneratedImage('url-1');
      useAIStore.getState().addGeneratedImage('url-2');
      const images = useAIStore.getState().generatedImages;
      expect(images).toHaveLength(2);
      expect(images[0]).toBe('url-2');
      expect(images[1]).toBe('url-1');
    });

    it('clears all generated images', () => {
      useAIStore.getState().addGeneratedImage('url-1');
      useAIStore.getState().clearGeneratedImages();
      expect(useAIStore.getState().generatedImages).toHaveLength(0);
    });
  });
});
