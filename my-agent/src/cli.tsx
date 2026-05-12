import React, { useState, useEffect, useCallback } from 'react';
import { render, Box, Text, useInput, useApp } from 'ink';
import { Agent, Message } from './agent.js';

// Get API key from environment
const API_KEY = process.env.OPENROUTER_API_KEY || '';

if (!API_KEY) {
  console.error('Error: OPENROUTER_API_KEY environment variable is required');
  console.error('Set it with: export OPENROUTER_API_KEY=your-key-here');
  process.exit(1);
}

// Chat message component
const ChatMessage: React.FC<{ message: Message }> = ({ message }) => {
  const isUser = message.role === 'user';
  return (
    <Box flexDirection="column" marginBottom={1}>
      <Text color={isUser ? 'cyan' : 'green'} bold>
        {isUser ? '👤 You' : '🤖 Agent'}
      </Text>
      <Box marginLeft={2}>
        <Text wrap="wrap">{message.content}</Text>
      </Box>
    </Box>
  );
};

// Input component
const InputLine: React.FC<{
  value: string;
  onChange: (value: string) => void;
  onSubmit: () => void;
  disabled: boolean;
}> = ({ value, onChange, onSubmit, disabled }) => {
  useInput((input, key) => {
    if (disabled) return;

    if (key.return) {
      onSubmit();
    } else if (key.backspace || key.delete) {
      onChange(value.slice(0, -1));
    } else if (input && !key.ctrl && !key.meta) {
      onChange(value + input);
    }
  });

  return (
    <Box>
      <Text color="yellow" bold>{'> '}</Text>
      <Text>{value}</Text>
      {!disabled && <Text color="gray">▌</Text>}
    </Box>
  );
};

// Main App component
const App: React.FC = () => {
  const { exit } = useApp();
  const [agent] = useState(() =>
    new Agent({
      apiKey: API_KEY,
      model: 'openrouter/auto',
      instructions: 'You are a helpful AI assistant. Be concise and helpful.',
    })
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [streamingText, setStreamingText] = useState('');

  // Set up agent event listeners
  useEffect(() => {
    agent.on('thinking:start', () => {
      setIsThinking(true);
      setStreamingText('');
    });

    agent.on('thinking:end', () => {
      setIsThinking(false);
    });

    agent.on('stream:delta', (_, accumulated) => {
      setStreamingText(accumulated);
    });

    agent.on('message:assistant', (message) => {
      setMessages((prev) => [...prev, message]);
      setStreamingText('');
    });

    agent.on('error', (err) => {
      setError(err.message);
      setIsThinking(false);
    });

    return () => {
      agent.removeAllListeners();
    };
  }, [agent]);

  // Handle sending messages
  const handleSubmit = useCallback(async () => {
    if (!input.trim() || isThinking) return;

    const userMessage: Message = { role: 'user', content: input.trim() };
    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setError(null);

    // Check for exit commands
    if (['exit', 'quit', 'q'].includes(input.trim().toLowerCase())) {
      exit();
      return;
    }

    // Check for clear command
    if (input.trim().toLowerCase() === 'clear') {
      setMessages([]);
      agent.clearHistory();
      return;
    }

    try {
      await agent.send(input.trim());
    } catch {
      // Error handled by event listener
    }
  }, [input, isThinking, agent, exit]);

  return (
    <Box flexDirection="column" padding={1}>
      {/* Header */}
      <Box marginBottom={1} borderStyle="round" borderColor="blue" paddingX={2}>
        <Text color="blue" bold>
          🚀 OpenRouter AI Agent
        </Text>
        <Text color="gray"> | Type 'exit' to quit, 'clear' to reset</Text>
      </Box>

      {/* Messages */}
      <Box flexDirection="column" marginBottom={1}>
        {messages.map((msg, i) => (
          <ChatMessage key={i} message={msg} />
        ))}

        {/* Streaming response */}
        {isThinking && streamingText && (
          <Box flexDirection="column" marginBottom={1}>
            <Text color="green" bold>🤖 Agent</Text>
            <Box marginLeft={2}>
              <Text wrap="wrap">{streamingText}</Text>
              <Text color="gray">▌</Text>
            </Box>
          </Box>
        )}

        {/* Thinking indicator */}
        {isThinking && !streamingText && (
          <Box marginBottom={1}>
            <Text color="yellow">⏳ Thinking...</Text>
          </Box>
        )}

        {/* Error display */}
        {error && (
          <Box marginBottom={1}>
            <Text color="red">❌ Error: {error}</Text>
          </Box>
        )}
      </Box>

      {/* Input */}
      <Box borderStyle="single" borderColor="gray" paddingX={1}>
        <InputLine
          value={input}
          onChange={setInput}
          onSubmit={handleSubmit}
          disabled={isThinking}
        />
      </Box>
    </Box>
  );
};

// Start the app
render(<App />);
