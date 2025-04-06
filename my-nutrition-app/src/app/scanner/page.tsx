"use client";
import React, { useState } from 'react';
import Tesseract from 'tesseract.js';
import { queryGemini } from '@/lib/gemini';

const ImageUpload = () => {
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [text, setText] = useState<string>(''); 
  const [medicalConditions, setMedicalConditions] = useState<string>('');
  const [response, setResponse] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImage(URL.createObjectURL(file)); 
      setText('');
      setResponse(null);
      setError(null);
    }
  };

  const handleImageAnalysis = async () => {
    if (!image) {
      alert('Please upload an image first!');
      return;
    }

    if (!medicalConditions.trim()) {
      alert('Please enter your medical conditions');
      return;
    }

    setIsProcessing(true);
    setText(''); 
    setResponse(null);
    setError(null);

    try {
      const { data: { text: extractedText } } = await Tesseract.recognize(image, 'eng');
      setText(extractedText);  
      await sendToGeminiAPI(extractedText, medicalConditions);
    } catch (err) {
      console.error(err);
      setError('Failed to process image. Please try again.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMedicalConditionsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMedicalConditions(event.target.value);
  };

  const sendToGeminiAPI = async (tesseractText: string, conditions: string) => {
    try {
      const geminiResponse = await queryGemini(tesseractText, conditions);
      setResponse(geminiResponse);  
    } catch (error) {
      console.error('Error calling Gemini API:', error);
      setError('Error analyzing nutrition data. Please try again.');
    }
  };

  const renderResponse = () => {
    if (!response) return null;

    // If the response is a string (failed to parse as JSON)
    if (typeof response === 'string') {
      return (
        <div className="response-container">
          <h2>Analysis Results</h2>
          <div className="response-text">{response}</div>
        </div>
      );
    }

    // If the response is a proper JSON object
    return (
      <div className="response-container">
        <h2>Analysis Results</h2>
        <div className="risk-level">
          <strong>Risk Assessment:</strong> <span className={`risk-${response.riskAssessment.toLowerCase()}`}>{response.riskAssessment}</span>
        </div>
        
        {response.harmfulComponents?.length > 0 && (
          <div className="harmful-components">
            <h3>Potential Issues:</h3>
            <ul>
              {response.harmfulComponents.map((item: any, index: number) => (
                <li key={index}>
                  <strong>{item.name}</strong>: {item.reason}
                  {item.recommendation && <div>Recommendation: {item.recommendation}</div>}
                  {item.alternative && <div>Alternative: {item.alternative}</div>}
                </li>
              ))}
            </ul>
          </div>
        )}
        
        {response.generalAdvice && (
          <div className="general-advice">
            <h3>General Advice:</h3>
            <p>{response.generalAdvice}</p>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="container">
      <h1>Upload Nutrition Label and Enter Medical Conditions</h1>
      
      <div className="upload-section">
        <label>
          Upload Nutrition Label:
          <input type="file" accept="image/*" onChange={handleFileChange} />
        </label>
        {image && <img src={image} alt="Uploaded nutrition label" className="image-preview" />}
      </div>
      
      <div className="conditions-section">
        <label>
          Your Medical Conditions:
          <textarea
            placeholder="e.g. Diabetes, High Blood Pressure, Gluten Intolerance"
            value={medicalConditions}
            onChange={handleMedicalConditionsChange}
            className="medical-conditions-input"
            rows={4}
          />
        </label>
      </div>

      <button 
        onClick={handleImageAnalysis} 
        disabled={isProcessing || !image || !medicalConditions.trim()}
        className="analyze-button"
      >
        {isProcessing ? 'Processing...' : 'Analyze Nutrition Label'}
      </button>

      {isProcessing && (
        <div className="processing-message">
          <p>Analyzing nutrition information...</p>
          <div className="spinner"></div>
        </div>
      )}

      {error && <div className="error-message">{error}</div>}

      {text && (
        <div className="extracted-text">
          <h2>Extracted Text</h2>
          <div className="text-content">{text}</div>
        </div>
      )}

      {renderResponse()}
    </div>
  );
};

export default ImageUpload;