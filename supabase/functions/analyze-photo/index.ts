import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageData, userApiKeys } = await req.json();
    
    if (!imageData) {
      return new Response(
        JSON.stringify({ error: 'Missing imageData' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if user has provided their own API keys
    let response;
    
    if (userApiKeys?.deepseek) {
      console.log('Using user DeepSeek API key...');
      response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userApiKeys.deepseek}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'system',
              content: 'You are an expert photo analyzer. Analyze images and determine if they are blurry, screenshots, and whether they contain people. Respond with a JSON object containing: {"isBlurry": boolean, "isScreenshot": boolean, "blurScore": number (0-100, where 100 is very blurry), "confidence": number (0-100), "hasPeople": boolean}. A screenshot is an image captured from a screen, typically showing UI elements, apps, or desktop content. hasPeople should be true if there are any humans/people visible in the photo.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image. Is it blurry? Is it a screenshot? Does it contain any people/humans? Return only JSON.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 300,
        }),
      });
    } else if (userApiKeys?.openai) {
      console.log('Using user OpenAI API key...');
      response = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${userApiKeys.openai}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: 'You are an expert photo analyzer. Analyze images and determine if they are blurry, screenshots, and whether they contain people. Respond with a JSON object containing: {"isBlurry": boolean, "isScreenshot": boolean, "blurScore": number (0-100, where 100 is very blurry), "confidence": number (0-100), "hasPeople": boolean}. A screenshot is an image captured from a screen, typically showing UI elements, apps, or desktop content. hasPeople should be true if there are any humans/people visible in the photo.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image. Is it blurry? Is it a screenshot? Does it contain any people/humans? Return only JSON.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          max_tokens: 300,
        }),
      });
    } else if (userApiKeys?.gemini) {
      console.log('Using user Gemini API key...');
      // Gemini uses a different format
      const base64Data = imageData.split(',')[1];
      response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${userApiKeys.gemini}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [
              { text: 'You are an expert photo analyzer. Analyze this image and determine if it is blurry, a screenshot, and whether it contains people. Respond with ONLY a JSON object containing: {"isBlurry": boolean, "isScreenshot": boolean, "blurScore": number (0-100, where 100 is very blurry), "confidence": number (0-100), "hasPeople": boolean}. A screenshot is an image captured from a screen, typically showing UI elements, apps, or desktop content. hasPeople should be true if there are any humans/people visible in the photo.' },
              {
                inline_data: {
                  mime_type: 'image/jpeg',
                  data: base64Data
                }
              }
            ]
          }],
          generationConfig: {
            temperature: 0.3,
          }
        }),
      });
    } else if (userApiKeys?.anthropic) {
      console.log('Using user Anthropic API key...');
      response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'x-api-key': userApiKeys.anthropic,
          'anthropic-version': '2023-06-01',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'claude-3-5-haiku-20241022',
          max_tokens: 300,
          messages: [
            {
              role: 'user',
              content: [
                {
                  type: 'image',
                  source: {
                    type: 'base64',
                    media_type: 'image/jpeg',
                    data: imageData.split(',')[1],
                  }
                },
                {
                  type: 'text',
                  text: 'You are an expert photo analyzer. Analyze this image and determine if it is blurry, a screenshot, and whether it contains people. Respond with ONLY a JSON object containing: {"isBlurry": boolean, "isScreenshot": boolean, "blurScore": number (0-100, where 100 is very blurry), "confidence": number (0-100), "hasPeople": boolean}. A screenshot is an image captured from a screen, typically showing UI elements, apps, or desktop content. hasPeople should be true if there are any humans/people visible in the photo.'
                }
              ]
            }
          ]
        }),
      });
    } else {
      // Use Lovable AI as fallback
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      console.log('Using Lovable AI...');
      response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${LOVABLE_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'google/gemini-2.5-flash',
          messages: [
            {
              role: 'system',
              content: 'You are an expert photo analyzer. Analyze images and determine if they are blurry, screenshots, and whether they contain people. Respond with a JSON object containing: {"isBlurry": boolean, "isScreenshot": boolean, "blurScore": number (0-100, where 100 is very blurry), "confidence": number (0-100), "hasPeople": boolean}. A screenshot is an image captured from a screen, typically showing UI elements, apps, or desktop content. hasPeople should be true if there are any humans/people visible in the photo.'
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this image. Is it blurry? Is it a screenshot? Does it contain any people/humans? Return only JSON.'
                },
                {
                  type: 'image_url',
                  image_url: {
                    url: imageData
                  }
                }
              ]
            }
          ],
          temperature: 0.3,
        }),
      });
    }

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    
    // Parse response based on which API was used
    let aiResponse;
    if (userApiKeys?.gemini) {
      aiResponse = data.candidates?.[0]?.content?.parts?.[0]?.text;
    } else if (userApiKeys?.anthropic) {
      aiResponse = data.content?.[0]?.text;
    } else {
      // OpenAI, DeepSeek, and Lovable AI all use the same format
      aiResponse = data.choices?.[0]?.message?.content;
    }
    
    console.log('AI Response:', aiResponse);

    // Parse the AI response
    let analysis;
    try {
      // Extract JSON from response (in case it's wrapped in markdown)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : JSON.parse(aiResponse);
    } catch (e) {
      console.error('Failed to parse AI response:', e);
      // Fallback - try to detect keywords
      const lowerResponse = aiResponse.toLowerCase();
      analysis = {
        isBlurry: lowerResponse.includes('blurry') || lowerResponse.includes('blur'),
        isScreenshot: lowerResponse.includes('screenshot'),
        blurScore: lowerResponse.includes('blurry') ? 70 : 20,
        confidence: 60,
        hasPeople: lowerResponse.includes('people') || lowerResponse.includes('person') || lowerResponse.includes('human')
      };
    }

    console.log('Parsed analysis:', analysis);

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in analyze-photo function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
