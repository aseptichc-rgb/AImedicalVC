import Anthropic from '@anthropic-ai/sdk';

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export async function callClaude(systemPrompt: string, userMessage: string) {
  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  const textBlock = response.content.find((b) => b.type === 'text');
  return {
    content: textBlock?.text || '',
    tokenCount: response.usage.input_tokens + response.usage.output_tokens,
  };
}

export async function callClaudeStream(
  systemPrompt: string,
  userMessage: string,
  onChunk: (chunk: string) => void
) {
  const stream = anthropic.messages.stream({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 4096,
    system: systemPrompt,
    messages: [{ role: 'user', content: userMessage }],
  });

  let fullContent = '';

  for await (const event of stream) {
    if (event.type === 'content_block_delta' && event.delta.type === 'text_delta') {
      fullContent += event.delta.text;
      onChunk(event.delta.text);
    }
  }

  const finalMessage = await stream.finalMessage();
  return {
    content: fullContent,
    tokenCount: finalMessage.usage.input_tokens + finalMessage.usage.output_tokens,
  };
}
