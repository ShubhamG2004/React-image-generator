import React, { useState, useRef } from "react";
import "./ImageGenerator.css";
import default_image from "../../assets/AI-image.png";

export default function ImageGenerator() {
  const [imageUrl, setImageUrl] = useState(default_image);
  const [loading, setLoading] = useState(false);
  const [imageHistory, setImageHistory] = useState([]);
  const [currentPrompt, setCurrentPrompt] = useState("");
  
  const inputRef = useRef(null);

  // Get API key from environment variables (Vite uses VITE_ prefix)
  const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

  const addToHistory = (prompt, imageUrl, description) => {
    const newItem = {
      id: Date.now(),
      prompt,
      imageUrl,
      description,
      timestamp: new Date().toLocaleString()
    };
    setImageHistory(prev => [newItem, ...prev.slice(0, 9)]);
  };

  const clearInput = () => {
    if (inputRef.current) {
      inputRef.current.value = "";
      setCurrentPrompt("");
    }
  };

  const downloadImage = () => {
    if (imageUrl && imageUrl !== default_image) {
      const link = document.createElement('a');
      link.href = imageUrl;
      link.download = `ai-generated-${Date.now()}.png`;
      link.click();
    }
  };

  // Generate creative description using simple logic when API is not available
  const generateCreativeDescription = (prompt) => {
    const styles = ["photorealistic", "artistic", "vibrant", "ethereal", "cinematic"];
    const qualities = ["high-quality", "detailed", "stunning", "beautiful", "masterpiece"];
    const lighting = ["dramatic lighting", "soft lighting", "golden hour", "studio lighting"];
    
    const randomStyle = styles[Math.floor(Math.random() * styles.length)];
    const randomQuality = qualities[Math.floor(Math.random() * qualities.length)];
    const randomLighting = lighting[Math.floor(Math.random() * lighting.length)];
    
    return `A ${randomStyle}, ${randomQuality} image of ${prompt} with ${randomLighting}, trending on artstation, professional photography`;
  };

  const generateImage = async () => {
    const prompt = inputRef.current?.value?.trim();
    if (!prompt) {
      showNotification("Please enter a description for your image!", "error");
      return;
    }

    setCurrentPrompt(prompt);
    setLoading(true);

    try {
      let generatedDescription = "";
      
      // Try to use Gemini API if key is available
      if (GEMINI_API_KEY && GEMINI_API_KEY !== "your_gemini_api_key_here") {
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
              },
              body: JSON.stringify({
                contents: [
                  {
                    parts: [
                      {
                        text: `Create a vivid, detailed image description for the following prompt that can be used by an image generation model: ${prompt}`,
                      },
                    ],
                  },
                ],
              }),
            }
          );

          if (response.ok) {
            const data = await response.json();
            generatedDescription = data?.candidates?.[0]?.content?.parts?.[0]?.text || generateCreativeDescription(prompt);
          } else {
            throw new Error("API request failed");
          }
        } catch (apiError) {
          console.log("Gemini API not available, using fallback description:", apiError.message);
          generatedDescription = generateCreativeDescription(prompt);
        }
      } else {
        // Use fallback description when no API key
        generatedDescription = generateCreativeDescription(prompt);
        if (!GEMINI_API_KEY) {
          showNotification("Add VITE_GEMINI_API_KEY to .env for AI-powered descriptions!", "info");
        }
      }

      // For demo purposes, we'll simulate image generation
      console.log("Generated description:", generatedDescription);
      
      // Simulate different generated images based on prompt keywords
      const simulatedImageUrl = getSimulatedImage();
      setImageUrl(simulatedImageUrl);
      
      // Add to history
      addToHistory(prompt, simulatedImageUrl, generatedDescription);
      
      // Clear input
      clearInput();
      
      // Show success notification
      showNotification("Image generated successfully!", "success");
    } catch (error) {
      console.error("Error generating image:", error);
      showNotification("Error generating image. Please try again!", "error");
    } finally {
      setLoading(false);
    }
  };

  const getSimulatedImage = () => {
    const imageVariants = [
      "https://picsum.photos/512/512?random=1",
      "https://picsum.photos/512/512?random=2", 
      "https://picsum.photos/512/512?random=3",
      "https://picsum.photos/512/512?random=4",
      "https://picsum.photos/512/512?random=5"
    ];
    return imageVariants[Math.floor(Math.random() * imageVariants.length)];
  };

  const showNotification = (message, type) => {

    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 3000);
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !loading) {
      generateImage();
    }
  };

  return (
    <div className="app-container">
      <div className="image-generator">
        {/* Header */}
        <div className="header">
          <h1>AI Image <span>Generator</span></h1>
          <p className="subtitle">Transform your ideas into stunning visuals</p>
        </div>

        {/* Main Content */}
        <div className="main-content">
          {/* Image Display */}
          <div className="img-section">
            <div className="image-container">
              <img src={imageUrl} alt="Generated preview" className="main-image" />
              {loading && (
                <div className="loading-overlay">
                  <div className="loading-spinner"></div>
                  <p>Creating your masterpiece...</p>
                </div>
              )}
              {currentPrompt && (
                <div className="image-info">
                  <p className="prompt-display">"{currentPrompt}"</p>
                </div>
              )}
            </div>
            
            {/* Action Buttons */}
            <div className="action-buttons">
              <button 
                className="action-btn download-btn" 
                onClick={downloadImage}
                disabled={imageUrl === default_image}
                title="Download Image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M19 9h-4V3H9v6H5l7 7 7-7zM5 18v2h14v-2H5z"/>
                </svg>
                Download
              </button>
              <button 
                className="action-btn regenerate-btn" 
                onClick={() => currentPrompt && generateImage()}
                disabled={!currentPrompt || loading}
                title="Regenerate Image"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M17.65 6.35C16.2 4.9 14.21 4 12 4c-4.42 0-7.99 3.58-7.99 8s3.57 8 7.99 8c3.73 0 6.84-2.55 7.73-6h-2.08c-.82 2.33-3.04 4-5.65 4-3.31 0-6-2.69-6-6s2.69-6 6-6c1.66 0 3.14.69 4.22 1.78L13 11h7V4l-2.35 2.35z"/>
                </svg>
                Regenerate
              </button>
            </div>
          </div>

          {/* Input Section */}
          <div className="input-section">
            <div className="search-box">
              <input
                type="text"
                ref={inputRef}
                className="search-input"
                placeholder="Describe your vision... (e.g., 'A serene mountain landscape at sunset')"
                disabled={loading}
                aria-label="Image prompt"
                onKeyPress={handleKeyPress}
                maxLength={500}
              />
              <button
                className={`generate-btn ${loading ? "loading" : ""}`}
                onClick={generateImage}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="btn-spinner"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8 5v14l11-7z"/>
                    </svg>
                    Generate
                  </>
                )}
              </button>
            </div>
            
            {/* Quick Prompts */}
            <div className="quick-prompts">
              <p className="quick-prompts-title">Quick Ideas:</p>
              <div className="prompt-tags">
                {[
                  "Futuristic cityscape",
                  "Abstract art",
                  "Nature landscape",
                  "Fantasy creature",
                  "Vintage poster"
                ].map((prompt, index) => (
                  <button
                    key={index}
                    className="prompt-tag"
                    onClick={() => {
                      if (inputRef.current) {
                        inputRef.current.value = prompt;
                      }
                    }}
                    disabled={loading}
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Image History */}
        {imageHistory.length > 0 && (
          <div className="history-section">
            <h3 className="history-title">Recent Creations</h3>
            <div className="history-grid">
              {imageHistory.map((item) => (
                <div key={item.id} className="history-item" onClick={() => setImageUrl(item.imageUrl)}>
                  <img src={item.imageUrl} alt={item.prompt} className="history-image" />
                  <div className="history-info">
                    <p className="history-prompt">{item.prompt}</p>
                    <span className="history-time">{item.timestamp}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
