# Inhouse Resume Reviewer + PDF Summarizer

**CPSC 481 Project** by Nick Caravaggio, Angel Penaloza, Greycin Kim, Thien La.

An AI-powered tool that reviews resumes with industry-specific feedback and summarizes PDF documents. Built with Next.js and OpenAI API.

Live Deployment Link: https://inhouse-comfy-resume-parser2.vercel.app/

## Features

- 📄 **Resume Reviewer**: Get detailed feedback with strengths, issues, ATS keywords, and improved bullet points
- 🎯 **Industry Targeting**: Choose from 11 industries and 40+ specific roles for tailored recommendations
- 📊 **PDF Summarizer**: Quickly summarize any PDF document with key points and action items
- ⚙️ **Configurable Controls**: Adjust response detail level and personality/creativity
- 📈 **Token Tracking**: Monitor OpenAI API usage with detailed token counts

## Prerequisites

- Node.js 18+ installed
- OpenAI API key ([Get one here](https://platform.openai.com/api-keys))

## Setup Instructions

### 1. Clone the Repository

```bash
git clone https://github.com/nacarav/Inhouse-ComfyResumeParser2.git
cd Inhouse-ComfyResumeParser2
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Configure Environment Variables

Create a `.env.local` file in the project root:

```bash
# .env.local
OPENAI_API_KEY=your-openai-api-key-here
```

Replace `your-openai-api-key-here` with your actual OpenAI API key.

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

1. **Select Mode**: Choose "Resume Reviewer" or "PDF Summarizer"
2. **Configure (Optional)**:
   - For resumes: Select industry and specific role for tailored feedback
   - Adjust Detail Level (400-1800 tokens, default: 900)
   - Adjust Response Personality (0.2-1.6 temperature, default: 0.3)
3. **Upload PDF**: Click "Choose File" and select your PDF
4. **Analyze**: Click "Upload & Analyze"
5. **Review Results**: View AI-generated feedback with token usage stats

## Technologies Used

- **Framework**: Next.js 16 with React 19
- **AI**: OpenAI API (gpt-4o-mini)
- **PDF Processing**: pdf2json
- **Styling**: Custom CSS with CSS variables
- **Markdown**: react-markdown for formatted output

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
