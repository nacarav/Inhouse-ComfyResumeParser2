import { NextResponse } from 'next/server';
import PDFParser from 'pdf2json';
import OpenAI from 'openai';

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    const type = formData.get('type'); // 'resume' or 'summary'
    const maxTokens = parseInt(formData.get('maxTokens')) || 1100;
    const temperature = parseFloat(formData.get('temperature')) || 0.9;
    const industry = formData.get('industry') || '';
    const role = formData.get('role') || '';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Extract text from PDF using pdf2json
    const extractedText = await new Promise((resolve, reject) => {
      const pdfParser = new PDFParser();

      pdfParser.on('pdfParser_dataError', (errData) => {
        reject(new Error(errData.parserError));
      });

      pdfParser.on('pdfParser_dataReady', (pdfData) => {
        // Try multiple methods to extract text
        let text = '';

        // Method 1: getRawTextContent()
        try {
          text = pdfParser.getRawTextContent();
        } catch (e) {
          console.error('getRawTextContent failed:', e);
        }

        // Method 2: Manual extraction from Pages if getRawTextContent didn't work
        if (!text || text.trim().length === 0) {
          try {
            const pages = pdfData.Pages || pdfData.formImage?.Pages;
            if (pages && pages.length > 0) {
              text = pages.map(page => {
                if (!page.Texts) return '';
                return page.Texts.map(textItem => {
                  return decodeURIComponent(textItem.R[0].T);
                }).join(' ');
              }).join('\n\n');
            }
          } catch (e) {
            console.error('Manual extraction failed:', e);
          }
        }

        resolve(text);
      });

      pdfParser.parseBuffer(buffer);
    });

    // Log the extracted text info
    console.log('========================================');
    console.log('Extracted text length:', extractedText.length);
    console.log('Extracted text preview:', extractedText.substring(0, 200));
    console.log('========================================');

    // Send to OpenAI based on type
    let result;
    if (type === 'summary') {
      result = await callOpenAIForSummary(extractedText, maxTokens, temperature);
    } else {
      result = await callOpenAIForResume(extractedText, maxTokens, temperature, industry, role);
    }

    return NextResponse.json({
      success: true,
      text: extractedText,
      result: result,
      industry: type === 'resume' ? industry : undefined,
      role: type === 'resume' ? role : undefined
    });

  } catch (error) {
    console.error('Error processing PDF:', error);
    return NextResponse.json({
      error: 'Failed to process PDF',
      details: error.message
    }, { status: 500 });
  }
}

async function callOpenAIForResume(resumeText, maxTokens, temperature, industry = '', role = '') {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Replicate the prompt structure from the ComfyUI workflow
    const reviewPrompt = "Tasks: Give a 6–10 bullet \"Strengths\" section. Give a 6–10 bullet \"Issues / Gaps\" section (specific). Provide 8–15 ATS keywords to add (tailored to the role). Rewrite the top 3 weakest bullet points into stronger accomplishment bullets (quantified where possible). End with a \"90-second elevator pitch\" the candidate could say.";
    const constraints = "Keep feedback concise; focus on ATS keywords";

    // Industry-specific guidance
    let industryGuidance = '';
    if (industry) {
      industryGuidance = `\n\nIMPORTANT: This resume is being reviewed for the ${industry} industry`;
      if (role) {
        industryGuidance += `, specifically for the role: ${role}`;
      }
      industryGuidance += `. Please tailor ALL feedback, keywords, and recommendations specifically for this industry/role. Focus on industry-specific skills, certifications, and accomplishments that matter most in ${industry}.`;
    }

    // Concatenate the full prompt
    const fullPrompt = reviewPrompt + constraints + industryGuidance + "\n\nRESUME TEXT:\n" + resumeText;

    console.log('========================================');
    console.log('Calling OpenAI API directly');
    console.log('Resume text length:', resumeText.length);
    console.log('Full prompt length:', fullPrompt.length);
    console.log('Max tokens:', maxTokens);
    console.log('Temperature:', temperature);
    console.log('========================================');

    // Call OpenAI API with parameters matching the ComfyUI workflow
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini", // Using gpt-4o-mini instead of "gpt-4.1-nano" which doesn't exist
      messages: [
        {
          role: "system",
          content: industry
            ? `You are a resume review expert specializing in ${industry}${role ? ` with deep knowledge of ${role} positions` : ''}. Provide constructive feedback focusing on ATS optimization, industry-specific keywords, and impactful accomplishments relevant to this field.`
            : "You are a resume review expert. Provide constructive feedback focusing on ATS optimization and impactful accomplishments."
        },
        {
          role: "user",
          content: fullPrompt
        }
      ],
      temperature: temperature, // User-selected value from personality slider
      max_tokens: maxTokens, // User-selected value from slider
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const response = completion.choices[0].message.content;

    console.log('========================================');
    console.log('OpenAI API call successful');
    console.log('Response length:', response.length);
    console.log('Response preview:', response.substring(0, 200));
    console.log('========================================');

    return {
      response: response,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      }
    };

  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

async function callOpenAIForSummary(pdfText, maxTokens, temperature) {
  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  try {
    // Initialize OpenAI client
    const openai = new OpenAI({
      apiKey: OPENAI_API_KEY,
    });

    // Prompt for PDF summarization
    const summaryPrompt = `Tasks:  Give a 6 bullet "Key Points" section.  Give a 3 bullet "Risks / Concerns" section.  Give a 3 bullet "Action Items / Next Steps" section.  End with a 1 paragraph "Plain-English Summary".`;

    // Concatenate the full prompt
    const fullPrompt = summaryPrompt + pdfText;

    console.log('========================================');
    console.log('Calling OpenAI API for PDF Summary');
    console.log('PDF text length:', pdfText.length);
    console.log('Full prompt length:', fullPrompt.length);
    console.log('Max tokens:', maxTokens);
    console.log('Temperature:', temperature);
    console.log('========================================');

    // Call OpenAI API with parameters for summarization
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: "You are a document summarization expert. Provide clear, actionable summaries with focus on key information."
        },
        {
          role: "user",
          content: fullPrompt
        }
      ],
      temperature: temperature, // User-selected value from personality slider
      max_tokens: maxTokens, // User-selected value from slider
      top_p: 1.0,
      frequency_penalty: 0,
      presence_penalty: 0,
    });

    const response = completion.choices[0].message.content;

    console.log('========================================');
    console.log('OpenAI API call successful (Summary)');
    console.log('Response length:', response.length);
    console.log('Response preview:', response.substring(0, 200));
    console.log('========================================');

    return {
      response: response,
      usage: {
        promptTokens: completion.usage.prompt_tokens,
        completionTokens: completion.usage.completion_tokens,
        totalTokens: completion.usage.total_tokens,
      }
    };

  } catch (error) {
    console.error('Error calling OpenAI for summary:', error);
    throw error;
  }
}
