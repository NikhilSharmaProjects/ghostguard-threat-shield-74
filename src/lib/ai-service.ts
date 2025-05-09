
import OpenAI from 'openai';

// Initialize the OpenAI client with NVIDIA API credentials
const openai = new OpenAI({
  apiKey: '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',
  baseURL: 'https://integrate.api.nvidia.com/v1',
});

interface AIAnalysisRequest {
  url?: string;
  content?: string;
}

interface AIAnalysisResponse {
  threatAnalysis: string;
  securityRecommendations: string[];
  confidenceScore: number;
}

/**
 * Analyzes a URL or content for security threats using AI
 */
export async function analyzeWithAI({ url, content }: AIAnalysisRequest): Promise<AIAnalysisResponse> {
  try {
    // Prepare the prompt based on what we're analyzing
    let prompt = '';
    if (url) {
      prompt = `Analyze this URL for potential security threats: "${url}". 
      Provide a detailed assessment of whether this URL might be phishing, malware, or legitimate.
      Include specific indicators that led to your conclusion.
      Give a confidence score between 0-100 (higher means more confident in the threat assessment).
      Format your response as JSON with the following structure:
      {
        "threatAnalysis": "detailed explanation of threats detected",
        "securityRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
        "confidenceScore": number
      }`;
    } else if (content) {
      prompt = `Analyze this content for potential security threats: "${content}".
      Provide a detailed assessment of whether this content might be phishing, malware, or legitimate.
      Include specific indicators that led to your conclusion.
      Give a confidence score between 0-100 (higher means more confident in the threat assessment).
      Format your response as JSON with the following structure:
      {
        "threatAnalysis": "detailed explanation of threats detected",
        "securityRecommendations": ["recommendation 1", "recommendation 2", "recommendation 3"],
        "confidenceScore": number
      }`;
    } else {
      throw new Error('Either URL or content must be provided');
    }

    // Make the API call to the AI model
    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/deepseek-r1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.6,
      top_p: 0.7,
      max_tokens: 2048,
    });

    const responseContent = completion.choices[0]?.message?.content || '';
    
    // Parse the JSON response
    try {
      // The model should return JSON, but let's be safe
      const jsonResponse = JSON.parse(responseContent);
      return {
        threatAnalysis: jsonResponse.threatAnalysis || "No analysis available",
        securityRecommendations: jsonResponse.securityRecommendations || [],
        confidenceScore: jsonResponse.confidenceScore || 50,
      };
    } catch (parseError) {
      console.error("Failed to parse AI response as JSON:", parseError);
      // Fallback if the response isn't valid JSON
      return {
        threatAnalysis: "Failed to parse AI analysis. The response wasn't in the expected format.",
        securityRecommendations: ["Try scanning again", "Contact support if the issue persists"],
        confidenceScore: 0,
      };
    }
  } catch (error) {
    console.error("AI Analysis error:", error);
    throw new Error(`Failed to analyze with AI: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get AI-powered security tips based on threat level
 */
export async function getSecurityTips(threatLevel: 'critical' | 'high' | 'medium' | 'low'): Promise<string[]> {
  try {
    const prompt = `Provide 3 security tips for users dealing with ${threatLevel} level security threats. 
    Make them specific, actionable, and easy to understand. 
    Format the response as a JSON array of strings.`;
    
    const completion = await openai.chat.completions.create({
      model: "deepseek-ai/deepseek-r1",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1024,
    });

    const responseContent = completion.choices[0]?.message?.content || '[]';
    
    try {
      return JSON.parse(responseContent);
    } catch (parseError) {
      console.error("Failed to parse security tips as JSON:", parseError);
      return ["Keep your software updated", "Use strong passwords", "Enable two-factor authentication"];
    }
  } catch (error) {
    console.error("Failed to get security tips:", error);
    return ["Keep your software updated", "Use strong passwords", "Enable two-factor authentication"];
  }
}
