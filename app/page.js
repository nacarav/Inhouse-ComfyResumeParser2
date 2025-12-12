'use client'

import React from 'react';
import { useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function App() {
  const [output, setOutput] = useState('Upload a PDF to get started');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [analysisType, setAnalysisType] = useState('resume');
  const [showLengthTooltip, setShowLengthTooltip] = useState(false);
  const [showPersonalityTooltip, setShowPersonalityTooltip] = useState(false);
  const fileInputRef = React.useRef(null);

  // Universal token range
  const minTokens = 400;
  const maxTokens = 1800;
  const defaultTokens = 1100;

  const [maxResponseTokens, setMaxResponseTokens] = useState(defaultTokens);
  const [temperature, setTemperature] = useState(0.9); // Default middle value

  const updateFile = (e) => {
    setFile(e.target.files[0]);
  };

  const handleChooseFile = () => {
    fileInputRef.current?.click();
  };

  const handleLengthSliderChange = (e) => {
    setMaxResponseTokens(parseInt(e.target.value));
  };

  const handlePersonalitySliderChange = (e) => {
    setTemperature(parseFloat(e.target.value));
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

    const isSummary = analysisType === 'summary';
    setOutput(isResume ? 'Processing PDF and analyzing resume...' : 'Processing PDF and generating summary...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', analysisType);
      formData.append('maxTokens', maxResponseTokens.toString());
      formData.append('temperature', temperature.toString());

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
    <div className='container'>
      <h1>Inhouse Parser</h1>

      <div className='main-grid'>
        {/* Upload Quadrant */}
        <div className='upload-quadrant'>
          <h2>Upload & Configure</h2>

          {/* Analysis Type Selector */}
          <div className='type-selector'>
            <label className='type-option'>
              <input
                type='radio'
                name='analysisType'
                value='resume'
                checked={analysisType === 'resume'}
                onChange={(e) => setAnalysisType(e.target.value)}
              />
              <span>Resume Reviewer</span>
            </label>
            <label className='type-option'>
              <input
                type='radio'
                name='analysisType'
                value='summary'
                checked={analysisType === 'summary'}
                onChange={(e) => setAnalysisType(e.target.value)}
              />
              <span>PDF Summarizer</span>
            </label>
          </div>

          {/* Detail Level slider */}
          <div className='length-control'>
            <div className='length-header'>
              <span className='length-label'>Detail Level</span>
              <div className='info-icon-container'>
                <span
                  className='info-icon'
                  onMouseEnter={() => setShowLengthTooltip(true)}
                  onMouseLeave={() => setShowLengthTooltip(false)}
                >
                  ℹ️
                </span>
                {showLengthTooltip && (
                  <div className='tooltip'>
                    Controls response depth ({minTokens}-{maxTokens} tokens)
                  </div>
                )}
              </div>
            </div>
            <div className='slider-container'>
              <span className='slider-label'>Brief</span>
              <input
                type='range'
                min={minTokens}
                max={maxTokens}
                value={maxResponseTokens}
                onChange={handleLengthSliderChange}
                className='length-slider'
              />
              <span className='slider-label'>Detailed</span>
            </div>
            <div className='token-display'>{maxResponseTokens} tokens</div>
          </div>

          {/* File Input */}
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

        {/* Personality Slider Quadrant */}
        <div className='personality-quadrant'>
          <div className='personality-control'>
            <div className='personality-header'>
              <span className='personality-label'>Response Personality</span>
              <div className='info-icon-container'>
                <span
                  className='info-icon'
                  onMouseEnter={() => setShowPersonalityTooltip(true)}
                  onMouseLeave={() => setShowPersonalityTooltip(false)}
                >
                  ℹ️
                </span>
                {showPersonalityTooltip && (
                  <div className='tooltip'>
                    Controls creativity (temperature: 0.2-1.6)
                  </div>
                )}
              </div>
            </div>

            <div className='vertical-slider-container'>
              <span className='vertical-slider-label'>Vibrant</span>
              <input
                type='range'
                min='0.2'
                max='1.6'
                step='0.1'
                value={temperature}
                onChange={handlePersonalitySliderChange}
                className='personality-slider'
                orient='vertical'
              />
              <span className='vertical-slider-label'>Stoic</span>
            </div>

            <div className='temperature-display'>{temperature.toFixed(1)} temp</div>
          </div>
        </div>
      </div>

      {/* Output Section */}
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
