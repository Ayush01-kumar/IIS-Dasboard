const HF_URL = 'https://api-inference.huggingface.co/models/mistralai/Mistral-7B-Instruct-v0.2';

function makeSystemPrompt(context) {
  return [
    'You are a closed-system ISS dashboard assistant.',
    'You may answer ONLY using the context data provided in the USER_CONTEXT section.',
    'If the user asks anything outside this context, politely refuse and explain your limitation.',
    'Never invent facts or use external knowledge.',
    '',
    `USER_CONTEXT: ${JSON.stringify(context)}`,
  ].join('\n');
}

export function isQuestionInScope(question, context) {
  const q = question.toLowerCase();
  const baseKeywords = [
    'iss',
    'latitude',
    'longitude',
    'speed',
    'news',
    'headline',
    'article',
    'source',
    'astronaut',
    'space',
  ];
  const headlineTokens = context.headlines
    .flatMap((title) => title.toLowerCase().split(/\W+/))
    .filter((token) => token.length > 5);
  const keywords = new Set([...baseKeywords, ...headlineTokens]);
  return [...keywords].some((keyword) => q.includes(keyword));
}

export async function askDashboardAssistant(messages, context) {
  const token = import.meta.env.VITE_AI_TOKEN;
  if (!token) {
    throw new Error('Missing VITE_AI_TOKEN');
  }

  const promptParts = [makeSystemPrompt(context)];
  messages.forEach((msg) => {
    promptParts.push(`${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`);
  });
  promptParts.push('Assistant:');

  const response = await fetch(HF_URL, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: promptParts.join('\n'),
      parameters: {
        max_new_tokens: 220,
        temperature: 0.3,
        return_full_text: false,
      },
      options: {
        wait_for_model: true,
      },
    }),
  });

  if (!response.ok) {
    throw new Error('AI service unavailable');
  }

  const data = await response.json();
  if (!Array.isArray(data) || !data[0]?.generated_text) {
    throw new Error('Unexpected AI response');
  }

  return data[0].generated_text.trim();
}
