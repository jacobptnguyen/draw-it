import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { type, ...params } = body;

    switch (type) {
      case 'chat':
        return await handleChatCompletion(params);
      
      case 'image':
        return await handleImageGeneration(params);
      
      default:
        return Response.json(
          { error: 'Invalid request type. Use "chat" or "image".' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return Response.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}

async function handleChatCompletion(params: {
  model: string;
  messages: OpenAI.Chat.Completions.ChatCompletionMessageParam[];
  max_tokens?: number;
  temperature?: number;
}) {
  try {
    const completion = await openai.chat.completions.create({
      model: params.model || 'gpt-4o',
      messages: params.messages,
      max_tokens: params.max_tokens || 1000,
      temperature: params.temperature || 0.7,
    });

    return Response.json({
      success: true,
      data: completion,
    });
  } catch (error) {
    console.error('Chat completion error:', error);
    throw error;
  }
}

async function handleImageGeneration(params: {
  model?: string;
  prompt: string;
  size?: '1024x1024' | '1792x1024' | '1024x1792';
  n?: number;
}) {
  try {
    const imageResponse = await openai.images.generate({
      model: params.model || 'dall-e-3',
      prompt: params.prompt,
      size: params.size || '1024x1024',
      n: params.n || 1,
    });

    return Response.json({
      success: true,
      data: imageResponse,
    });
  } catch (error) {
    console.error('Image generation error:', error);
    throw error;
  }
}
