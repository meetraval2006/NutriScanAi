"use client";
import React, { useState } from 'react';
import Tesseract from 'tesseract.js';

const ImageUpload = () => {
  // Explicitly define the state types as string | null
  const [image, setImage] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [text, setText] = useState<string | null>(''); // Initialized as empty string or null
  const [medicalConditions, setMedicalConditions] = useState<string>('');
  const [response, setResponse] = useState<any>(null);

  // Handle file selection
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files ? event.target.files[0] : null;
    if (file) {
      setImage(URL.createObjectURL(file)); // Preview the image
    }
  };

  // Handle the image analysis with Tesseract
  const handleImageAnalysis = () => {
    if (!image) {
      alert('Please upload an image first!');
      return;
    }

    setIsProcessing(true);
    setText(''); // Reset text
    setResponse(null); // Reset the response from Gemini API

    // Use Tesseract.js to recognize text from the uploaded image
    Tesseract.recognize(
      image,
      'eng',  // language (English in this case)
      {
        logger: (m) => console.log(m),  // Optional: log the progress
      }
    )
      .then(({ data: { text } }) => {
        setText(text);  // Set the recognized text
        setIsProcessing(false);

        // Now, send the extracted text + medical conditions to Gemini API
        sendToGeminiAPI(text, medicalConditions);
      })
      .catch((err) => {
        console.error(err);
        setIsProcessing(false);
      });
  };

  // Handle medical conditions text change
  const handleMedicalConditionsChange = (event: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMedicalConditions(event.target.value);
  };

  // Function to send data to Gemini API
  const sendToGeminiAPI = async (tesseractText: string, conditions: string) => {
    // Combine Tesseract text with user medical conditions
    const payload = {
      nutritionText: tesseractText,
      medicalConditions: conditions,
    };

    try {
      const response = await fetch('https://your-gemini-api-endpoint.com/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
      const data = await response.json();
      setResponse(data);  // Assuming the response contains analysis results
    } catch (error) {
      console.error('Error sending data to Gemini API:', error);
      alert('Error sending data to Gemini API. Please try again later.');
    }
  };

  return (
    <div className="container">
      <h1>Upload Nutrition Label and Enter Medical Conditions</h1>
      
      {/* Image upload */}
      <input type="file" accept="image/*" onChange={handleFileChange} />
      
      {/* Display the image preview */}
      {image && <img src={image} alt="Uploaded" style={{ width: '300px', marginTop: '10px' }} />}
      
      {/* Medical conditions text box */}
      <textarea
        placeholder="Enter your medical conditions"
        value={medicalConditions}
        onChange={handleMedicalConditionsChange}
        className="medical-conditions-input"
        style={{ width: '100%', marginTop: '10px', padding: '10px' }}
      />

      {/* Button to trigger image analysis */}
      <button onClick={handleImageAnalysis} disabled={isProcessing}>
        {isProcessing ? 'Processing...' : 'Analyze Image'}
      </button>

      {/* Display recognized text */}
      {text && (
        <div style={{ marginTop: '20px' }}>
          <h2>Extracted Text</h2>
          <pre>{text}</pre>
        </div>
      )}

      {/* Display response from Gemini API */}
      {response && (
        <div style={{ marginTop: '20px' }}>
          <h2>Analysis Results</h2>
          <pre>{JSON.stringify(response, null, 2)}</pre> {/* Display formatted response */}
        </div>
      )}
    </div>
  );
};

export default ImageUpload;
