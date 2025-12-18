'use client'

import React from 'react';
import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';

const INDUSTRY_ROLES_DATA = [
  {industry: "Software & IT", roles: ["Software Engineer (Backend/Frontend/Full Stack)", "IT Support / Help Desk", "DevOps / Cloud (Junior)", "Cybersecurity Analyst (Junior)"]},
  {industry: "Data & Analytics", roles: ["Data Analyst", "Business Intelligence (BI) Analyst", "Data Engineer (Junior)", "Data Scientist (Entry-Level)"]},
  {industry: "Engineering", roles: ["Mechanical Engineer (Junior)", "Electrical Engineer (Junior)", "Civil Engineer (Junior)", "Industrial / Manufacturing Engineer (Junior)"]},
  {industry: "Business & Operations", roles: ["Business Analyst", "Operations Coordinator / Operations Analyst", "Project Coordinator", "Supply Chain / Logistics Analyst"]},
  {industry: "Finance & Accounting", roles: ["Financial Analyst", "Staff Accountant", "Audit / Assurance Associate", "FP&A Analyst (Junior)"]},
  {industry: "Marketing, Sales & Customer", roles: ["Marketing Coordinator", "Sales Development Rep (SDR) / BDR", "Customer Success Associate", "Account Manager (Junior) / Account Executive (Entry)"]},
  {industry: "Healthcare & Life Sciences", roles: ["Clinical Research Coordinator (Junior)", "Lab Technician / Research Assistant", "Healthcare Administration Coordinator", "Quality Assurance (QA) / Regulatory Associate (Junior)"]},
  {industry: "Education & Training", roles: ["Teacher / Credential Candidate", "Academic Advisor / Student Success Coordinator", "Instructional Designer (Junior)", "Tutor / Teaching Assistant"]},
  {industry: "Design & Creative", roles: ["UX/UI Designer (Junior)", "Graphic Designer", "Product Designer (Junior)", "Content Writer / Copywriter"]},
  {industry: "Public Sector & Nonprofit", roles: ["Program Coordinator", "Policy Analyst (Junior)", "Community Outreach Coordinator", "Grants / Development Assistant"]},
  {industry: "Other / Undeclared", roles: ["General / Not Sure Yet", "Internship / Co-op", "Rotational / New Grad Program", "Other (Custom Role)"]}
];

export default function App() {
  const [output, setOutput] = useState('Upload a PDF to get started');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [analysisType, setAnalysisType] = useState('resume');
  const [showLengthTooltip, setShowLengthTooltip] = useState(false);
  const [showPersonalityTooltip, setShowPersonalityTooltip] = useState(false);
  const [showIndustryTooltip, setShowIndustryTooltip] = useState(false);
  const [showLengthDefaultTooltip, setShowLengthDefaultTooltip] = useState(false);
  const [showPersonalityDefaultTooltip, setShowPersonalityDefaultTooltip] = useState(false);
  const fileInputRef = React.useRef(null);

  // Universal token range
  const minTokens = 400;
  const maxTokens = 1800;
  const defaultTokens = 900;

  const [maxResponseTokens, setMaxResponseTokens] = useState(defaultTokens);
  const [temperature, setTemperature] = useState(0.3); // Default value for objective/professional use
  const [selectedIndustry, setSelectedIndustry] = useState('');
  const [selectedRole, setSelectedRole] = useState('');

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

  const handleIndustryChange = (e) => {
    setSelectedIndustry(e.target.value);
    setSelectedRole(''); // Reset role when industry changes
  };

  const handleRoleChange = (e) => {
    setSelectedRole(e.target.value);
  };

  // Reset industry/role when switching to summary mode
  useEffect(() => {
    if (analysisType === 'summary') {
      setSelectedIndustry('');
      setSelectedRole('');
    }
  }, [analysisType]);

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
    setOutput(!isSummary ? 'Processing PDF and analyzing resume...' : 'Processing PDF and generating summary...');

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('type', analysisType);
      formData.append('maxTokens', maxResponseTokens.toString());
      formData.append('temperature', temperature.toString());

      // Add industry/role if resume mode
      if (analysisType === 'resume') {
        formData.append('industry', selectedIndustry);
        formData.append('role', selectedRole);
      }

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
          let reviewHeader = '=== RESUME REVIEW ===';
          if (data.industry) {
            reviewHeader += `\n[Industry-Specific Review: ${data.industry}`;
            if (data.role) reviewHeader += ` - ${data.role}`;
            reviewHeader += ']';
          }
          setOutput(`${reviewHeader}\n\n${data.result.response}\n\n=== INFO ===\nResume Text Length: ${data.text.length} characters\n${tokenInfo}`);
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
      <h1>Inhouse Resume Reviewer + PDF Summarizer</h1>

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

          {/* Industry/Role Selection - Only for Resume Reviewer */}
          {analysisType === 'resume' && (
            <div className='industry-role-selector'>
              <div className='industry-header'>
                <span className='industry-title'>Industry & Role Targeting</span>
                <div className='info-icon-container'>
                  <span
                    className='info-icon'
                    onMouseEnter={() => setShowIndustryTooltip(true)}
                    onMouseLeave={() => setShowIndustryTooltip(false)}
                  >
                    ℹ️
                  </span>
                  {showIndustryTooltip && (
                    <div className='tooltip'>
                      Choosing a Job Industry and Specific Role will help tailor the response to be more accurate and relevant
                    </div>
                  )}
                </div>
              </div>
              {/* Industry Dropdown */}
              <div className='dropdown-group'>
                <label className='dropdown-label'>Job Industry (Optional)</label>
                <select
                  className='industry-dropdown'
                  value={selectedIndustry}
                  onChange={handleIndustryChange}
                >
                  <option value=''>-- Select Industry --</option>
                  {INDUSTRY_ROLES_DATA.map(item => (
                    <option key={item.industry} value={item.industry}>
                      {item.industry}
                    </option>
                  ))}
                </select>
              </div>

              {/* Role Dropdown - Only show when industry is selected */}
              {selectedIndustry && (
                <div className='dropdown-group'>
                  <label className='dropdown-label'>Specific Role (Optional)</label>
                  <select
                    className='role-dropdown'
                    value={selectedRole}
                    onChange={handleRoleChange}
                  >
                    <option value=''>-- Select Role --</option>
                    {INDUSTRY_ROLES_DATA
                      .find(item => item.industry === selectedIndustry)
                      ?.roles.map(role => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                  </select>
                </div>
              )}
            </div>
          )}

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

        {/* Controls Quadrant (Personality + Detail Level) */}
        <div className='personality-quadrant'>
          {/* Response Personality */}
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
              <div className='vertical-slider-with-marker'>
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
                <div
                  className='default-marker-vertical'
                  style={{top: `${(1 - ((0.3 - 0.2) / (1.6 - 0.2))) * 100}%`}}
                  onMouseEnter={() => setShowPersonalityDefaultTooltip(true)}
                  onMouseLeave={() => setShowPersonalityDefaultTooltip(false)}
                >
                  {showPersonalityDefaultTooltip && (
                    <div className='default-tooltip-vertical'>
                      0.2-0.4 is the recommended range for something objective and professional such as a Resume Reviewer or PDF Summarizer. Going above 0.8 may result in crazy, nonsensical outputs. (For experimentation).
                    </div>
                  )}
                </div>
              </div>
              <span className='vertical-slider-label'>Stoic</span>
            </div>

            <div className='temperature-display'>{temperature.toFixed(1)} temp</div>
          </div>

          {/* Detail Level slider */}
          <div className='length-control-vertical'>
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
              <div className='slider-with-marker'>
                <input
                  type='range'
                  min={minTokens}
                  max={maxTokens}
                  value={maxResponseTokens}
                  onChange={handleLengthSliderChange}
                  className='length-slider'
                />
                <div
                  className='default-marker'
                  style={{left: `${((defaultTokens - minTokens) / (maxTokens - minTokens)) * 100}%`}}
                  onMouseEnter={() => setShowLengthDefaultTooltip(true)}
                  onMouseLeave={() => setShowLengthDefaultTooltip(false)}
                >
                  {showLengthDefaultTooltip && (
                    <div className='default-tooltip'>
                      900 tokens is the default response length for a balance of good response and preserving processing time.
                    </div>
                  )}
                </div>
              </div>
              <span className='slider-label'>Detailed</span>
            </div>
            <div className='token-display'>{maxResponseTokens} tokens</div>
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
