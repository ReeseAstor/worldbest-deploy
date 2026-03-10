import 'dotenv/config';
import { Agent } from './agent.js';
import { createInterface } from 'readline';

// Get API key from environment
const API_KEY = process.env.OPENROUTER_API_KEY || '';

if (!API_KEY) {
  console.error('Error: OPENROUTER_API_KEY environment variable is required');
  console.error('Set it with: export OPENROUTER_API_KEY=your-key-here');
  process.exit(1);
}

// Create agent instance
const agent = new Agent({
  apiKey: API_KEY,
  model: 'openrouter/auto',
  instructions: 'You are a helpful AI assistant. Provide clear, concise answers.',
});

// Collect streaming text
let streamBuffer = '';

// Set up event listeners for logging
agent.on('thinking:start', () => {
  console.log('\n🤔 Thinking...');
  streamBuffer = '';
});

agent.on('stream:delta', (delta) => {
  streamBuffer += delta;
});

agent.on('stream:end', (fullText) => {
  console.log(fullText);
  console.log('');
});

agent.on('tool:call', (name, args) => {
  console.log(`\n🔧 Tool call: ${name}`, args);
});

agent.on('error', (error) => {
  console.error(`\n❌ Error: ${error.message}`);
});

// Main function
async function main() {
  console.log('🚀 OpenRouter AI Agent - Headless Mode');
  console.log('=====================================\n');

  // Example conversations
  const prompts = [
    "What is the capital of France?",
    "Write a haiku about programming.",
    "Explain quantum computing in one sentence.",
  ];

  for (const prompt of prompts) {
    console.log(`👤 User: ${prompt}`);
    console.log('🤖 Agent:');
    
    try {
      await agent.send(prompt);
      console.log('---\n');
    } catch {
      console.error('Failed to get response');
    }
  }

  // Interactive mode with readline
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  console.log('💬 Interactive mode (type "exit" to quit)\n');

  const askQuestion = () => {
    rl.question('👤 You: ', async (input: string) => {
      if (input.toLowerCase() === 'exit') {
        console.log('👋 Goodbye!');
        rl.close();
        process.exit(0);
      }

      if (input.toLowerCase() === 'clear') {
        agent.clearHistory();
        console.log('🗑️  Conversation cleared\n');
        askQuestion();
        return;
      }

      if (input.trim()) {
        console.log('🤖 Agent:');
        try {
          await agent.send(input);
        } catch {
          // Error handled by event listener
        }
      }
      
      askQuestion();
    });
  };

  askQuestion();
}

// Run
main().catch(console.error);
