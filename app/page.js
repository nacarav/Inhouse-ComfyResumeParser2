'use client'

import React, { FC } from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

const Parser = ({ type, setOutput, setLoading }) => {
  const [file, setFile] = useState(null);
  const fileInputRef = React.useRef(null);

  const updateFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleUpload = async () => {
    console.log('file: ', file);
    if(!file) {
      setOutput('Please select a file first');
      return;
    }

    if(!file.name.toLowerCase().endsWith('.pdf')) {
      setOutput('Please select a PDF file');
      return;
    }

    setLoading(true);

    // Determine type based on parser type
    const isResume = type === 'Resume Reviewer';
    const isSummary = type === 'PDF Summarizer';

    setOutput(isResume ? 'Processing PDF and analyzing resume...' : 'Processing PDF and generating summary...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', isSummary ? 'summary' : 'resume');

      const response = await fetch('/api/parse', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const tokenInfo = `Tokens Used: ${data.result.usage.totalTokens} (Prompt: ${data.result.usage.promptTokens}, Completion: ${data.result.usage.completionTokens})`;

        if (isSummary) {
          setOutput(`=== PDF SUMMARY ===\n\n${data.result.response}\n\n=== INFO ===\nDocument Text Length: ${data.text.length} characters\n${tokenInfo}`);
        } else {
          setOutput(`=== RESUME REVIEW ===\n\n${data.result.response}\n\n=== INFO ===\nResume Text Length: ${data.text.length} characters\n${tokenInfo}`);
        }
      } else {
        setOutput(`Error: ${data.error}\n${data.details || ''}`);
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setOutput(`Error: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className='parser'>
      <h2>{type}</h2>
      <input
        ref={fileInputRef}
        className='file-input-hidden'
        type="file"
        accept=".pdf"
        onChange={updateFile}
      />

      {!file ? (
        <button className='choose-file-btn' onClick={handleChooseFile}>
          📄 Choose File
        </button>
      ) : (
        <div className='file-selected'>
          <div className='file-info'>
            <span className='file-name'>📄 {file.name}</span>
            <button className='change-file-btn' onClick={handleChooseFile}>
              Change
            </button>
          </div>
          <button className='upload-btn' onClick={handleUpload}>
            Upload & Analyze
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const [output, setOutput] = useState('Upload a PDF to get started');
  const [loading, setLoading] = useState(false);

  return (
    <div className='container'>
      <h1>Inhouse Parser</h1>
      <div className='parsers-grid'>
        <Parser type="Resume Reviewer" setOutput={setOutput} setLoading={setLoading}/>
        <Parser type="PDF Summarizer" setOutput={setOutput} setLoading={setLoading}/>
      </div>
      <div className='output'>
        <h2>Output</h2>
        {loading && <p className='processing-text'>Processing...</p>}
        <div className='output-text'>
          <ReactMarkdown>{output}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
}