import { GoogleGenerativeAI } from '@google/generative-ai';
import { saveAs } from 'file-saver';
import { Document, Packer, Paragraph, TextRun } from 'docx';
import Footer from '../components/Footer';
import ProtectedRoute from '../components/ProtectedRoute';
import { useRouter } from 'next/router';
import { useAuth } from '../context/AuthContext';
import SubscriptionModal from '../components/SubscriptionModal';
import ProfileModal from '../components/ProfileModal';
import { db } from '../lib/firebase';
import { doc, updateDoc } from 'firebase/firestore';
import { toast } from 'react-hot-toast'; // or your preferred notification library
import React, { useState, useEffect, useRef } from 'react'; // Add this at the top with your other imports

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// GeneratePageNav Component
const GeneratePageNav = ({ showSubscriptionModal, setShowSubscriptionModal }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);

  return (
    <>
      <header style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        backdropFilter: 'blur(8px)',
        padding: '15px 0',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        zIndex: 1000
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <a href="/" style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            background: 'linear-gradient(135deg, #FF3366, #FF6B6B)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            textDecoration: 'none'
          }}>
            ScriptSea
          </a>

          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '20px'
          }}>
            {/* Upgrade Button */}
            <button
              onClick={() => setShowSubscriptionModal(true)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 16px',
                backgroundColor: '#FF3366',
                color: 'white',
                border: 'none',
                borderRadius: '20px',
                fontSize: '0.9rem',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 2px 8px rgba(255, 51, 102, 0.2)'
              }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7L12 12L22 7L12 2Z" />
                <path d="M2 17L12 22L22 17" />
                <path d="M2 12L12 17L22 12" />
              </svg>
              Upgrade
            </button>

            {/* Contact Button */}
            <button
              onClick={() => setShowContactModal(true)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9ff',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" />
              </svg>
            </button>

            {/* Profile Button */}
            <button
              onClick={() => setShowProfileModal(true)}
              style={{
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#f8f9ff',
                border: 'none',
                borderRadius: '50%',
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Contact Modal */}
      {showContactModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1001
        }}>
          <div style={{
            backgroundColor: 'white',
            borderRadius: '20px',
            padding: '30px',
            maxWidth: '400px',
            width: '90%',
            position: 'relative'
          }}>
            <button
              onClick={() => setShowContactModal(false)}
              style={{
                position: 'absolute',
                top: '15px',
                right: '15px',
                background: 'none',
                border: 'none',
                fontSize: '1.5rem',
                cursor: 'pointer',
                color: '#666'
              }}
            >
              ×
            </button>

            <h2 style={{
              fontSize: '1.5rem',
              marginBottom: '20px',
              color: '#333'
            }}>
              Contact Us
            </h2>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '15px'
            }}>
              <a
                href="mailto:support@scriptsea.com"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#f8f9ff',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#333',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#FF3366" strokeWidth="2">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
                support@scriptsea.com
              </a>

              <a
                href="https://wa.me/1234567890"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px',
                  padding: '12px',
                  backgroundColor: '#f8f9ff',
                  borderRadius: '12px',
                  textDecoration: 'none',
                  color: '#333',
                  transition: 'all 0.2s'
                }}
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="#25D366">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
                </svg>
                Chat on WhatsApp
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Profile Modal */}
      {showProfileModal && (
        <ProfileModal
          onClose={() => setShowProfileModal(false)}
          user={user}
        />
      )}
    </>
  );
};

// Update creator styles data
const creatorStyles = {
  youtube: [
    { name: 'MrBeast', description: 'High-energy, big-budget challenges and philanthropy' },
    { name: 'Ryan Trahan', description: 'Adventure and travel content with storytelling' },
    { name: 'Airrack', description: 'Fast-paced challenges and viral experiments' },
    { name: 'Dream', description: 'Gaming and challenge content with high energy' },
    { name: 'Kai Cenat', description: 'Reaction and gaming content with humor' },
    { name: 'Ishowspeed', description: 'Gaming and reaction content with high energy' },
    { name: 'Kwebbelkop', description: 'Gaming and challenge content with humor' },
    { name: 'Alex Hormozi', description: 'Business and entrepreneurship with direct, high-value advice' },
    { name: 'Andrew Tate', description: 'Controversial business and lifestyle content with strong opinions' },
    { name: 'NDL', description: 'Gaming and challenge content with high energy and humor' },
    { name: 'Sidemen', description: 'Variety content, challenges, and group dynamics with British humor' }
  ],
  tiktok: [
    { name: 'Dylan Mulvaney', description: 'Daily life and transformation content with humor' },
    { name: 'Chris Olsen', description: 'Comedy and lifestyle content with storytelling' },
    { name: 'Brittany Broski', description: 'Comedy and reaction content with personality' },
    { name: 'Drew Afualo', description: 'Comedy and commentary with strong personality' },
    { name: 'Matt Rife', description: 'Stand-up comedy and viral skits' },
    { name: "The D'Amelio Show", description: 'Reality and lifestyle content with voice' },
    { name: 'Bella Hadid', description: 'Fashion and lifestyle with voiceovers' }
  ],
  instagram: [
    { name: 'Alex Cooper', description: 'Podcast and lifestyle content with personality' },
    { name: 'Emma Chamberlain', description: 'Lifestyle and vlog content with humor' },
    { name: 'Alix Earle', description: 'Lifestyle and beauty content with voice' },
    { name: 'Tinx', description: 'Lifestyle and advice content with personality' },
    { name: 'Mikayla Nogueira', description: 'Beauty and lifestyle with voiceovers' },
    { name: 'Gary Vee', description: 'Business and motivation with voice' },
    { name: "Dixie D'Amelio", description: 'Lifestyle and music content with voice' }
  ],
  facebook: [
    { name: 'Nas Daily', description: 'Travel and storytelling content with voice' },
    { name: '5-Minute Crafts', description: 'DIY and life hacks with voiceovers' },
    { name: 'BuzzFeed', description: 'Entertainment and lifestyle content with voice' },
    { name: 'Tasty', description: 'Food and cooking content with voiceovers' },
    { name: 'LadBible', description: 'Entertainment and viral content with voice' },
    { name: 'UNILAD', description: 'Entertainment and viral content with voice' },
    { name: 'ViralNova', description: 'Viral stories and content with voiceovers' }
  ]
};

// Add this to force dynamic behavior
export const dynamic = 'force-dynamic';

export default function Generate() {
  const router = useRouter();
  const { user, userProfile, updateUserProfile } = useAuth();
  const [videoTopic, setVideoTopic] = useState('');
  const [viralReference, setViralReference] = useState('');
  const [selectedTone, setSelectedTone] = useState('casual');
  const [selectedPlatform, setSelectedPlatform] = useState('youtube');
  const [duration, setDuration] = useState('60 sec');
  const [scriptType, setScriptType] = useState('viral');
  const [includeVisuals, setIncludeVisuals] = useState(true);
  const [generatedScript, setGeneratedScript] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState('');
  const [isProcessingVideo, setIsProcessingVideo] = useState(false);
  const [videoInfo, setVideoInfo] = useState(null);
  const [thumbnailSuggestions, setThumbnailSuggestions] = useState('');
  const [isGeneratingThumbnail, setIsGeneratingThumbnail] = useState(false);
  const [savedScripts, setSavedScripts] = useState([]);
  const [showTemplates, setShowTemplates] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [keywords, setKeywords] = useState('');
  const [hashtags, setHashtags] = useState('');
  const [seoTips, setSeoTips] = useState('');
  const [isGeneratingAdvanced, setIsGeneratingAdvanced] = useState(false);
  const [selectedCreator, setSelectedCreator] = useState('');
  const [showLoadConfirm, setShowLoadConfirm] = useState(false);
  const [scriptToLoad, setScriptToLoad] = useState(null);
  const [loadedScript, setLoadedScript] = useState(null);
  const [showSavedScripts, setShowSavedScripts] = useState(false);
  const [expandedScriptId, setExpandedScriptId] = useState(null);
  const [isRecording, setIsRecording] = useState(false);
  const [recognition, setRecognition] = useState(null);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);

  // Add ref for the response section
  const responseRef = useRef(null);

  // Load saved scripts from localStorage on component mount
  useEffect(() => {
    const saved = localStorage.getItem('savedScripts');
    if (saved) {
      setSavedScripts(JSON.parse(saved));
    }
  }, []);

  // Load a saved script with confirmation
  const loadScript = (script) => {
    console.log('Loading script:', script); // Debug log
    setScriptToLoad(script);
    setShowLoadConfirm(true);
  };

  // Update confirmLoadScript to show in its own box
  const confirmLoadScript = () => {
    console.log('Confirming load of script:', scriptToLoad); // Debug log
    if (scriptToLoad) {
      // Load all script data
      setVideoTopic(scriptToLoad.title);
      setGeneratedScript(scriptToLoad.script);
      setSelectedPlatform(scriptToLoad.platform);
      setScriptType(scriptToLoad.type);
      setSelectedTone(scriptToLoad.tone || 'casual');
      setDuration(scriptToLoad.duration || '60 sec');
      setSelectedCreator(scriptToLoad.creator || '');
      setIncludeVisuals(scriptToLoad.includeVisuals ?? true);
      
      // Set loaded script for display
      setLoadedScript(scriptToLoad);
      
      // Close modal and reset states
      setShowLoadConfirm(false);
      setScriptToLoad(null);
      
      // Show success message
      setError('Script loaded successfully!');
      setTimeout(() => setError(''), 2000);
    }
  };

  // Update saveScript to include all relevant data
  const saveScript = () => {
    if (!generatedScript || !videoTopic) {
      setError('Please generate a script first');
      return;
    }
    
    // Check if script with same title already exists
    const existingScript = savedScripts.find(script => script.title === videoTopic);
    if (existingScript) {
      setError('A script with this title already exists');
      return;
    }
    
    const newScript = {
      id: Date.now(),
      title: videoTopic,
      script: generatedScript,
      date: new Date().toLocaleDateString(),
      platform: selectedPlatform,
      type: scriptType,
      tone: selectedTone,
      duration: duration,
      creator: selectedCreator,
      includeVisuals: includeVisuals
    };

    const updatedScripts = [...savedScripts, newScript];
    setSavedScripts(updatedScripts);
    localStorage.setItem('savedScripts', JSON.stringify(updatedScripts));
    
    // Show success message
    setError('Script saved successfully!');
    setTimeout(() => setError(''), 2000);
  };

  // Delete a saved script
  const deleteScript = (id) => {
    const updatedScripts = savedScripts.filter(script => script.id !== id);
    setSavedScripts(updatedScripts);
    localStorage.setItem('savedScripts', JSON.stringify(updatedScripts));
    setError('Script deleted successfully!');
    setTimeout(() => setError(''), 2000); // Clear success message after 2 seconds
  };

  // Update exportToPDF function to handle saved scripts
  const exportToPDF = async (script = null) => {
    try {
      const { jsPDF } = await import('jspdf');
      const doc = new jsPDF();
      
      // Use either the provided script or current form data, with fallbacks
      const title = script?.title || videoTopic || 'Untitled Script';
      const content = script?.script || generatedScript || '';
      const type = script?.type || scriptType || 'viral';
      const platform = script?.platform || selectedPlatform || 'youtube';
      const scriptDuration = script?.duration || duration || '60 sec';
      const tone = script?.tone || selectedTone || 'casual';
      
      // Title
      doc.setFontSize(20);
      doc.setFont(undefined, 'bold');
      doc.text(title || 'Untitled Script', 20, 20);
      
      // Script Type and Platform
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');
      doc.text(`Type: ${(type || 'viral').charAt(0).toUpperCase() + (type || 'viral').slice(1)} Script`, 20, 30);
      doc.text(`Platform: ${(platform || 'youtube').charAt(0).toUpperCase() + (platform || 'youtube').slice(1)}`, 20, 37);
      doc.text(`Duration: ${scriptDuration || '60 sec'}`, 20, 44);
      doc.text(`Tone: ${(tone || 'casual').charAt(0).toUpperCase() + (tone || 'casual').slice(1)}`, 20, 51);
      
      // Script Content
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.text('Script Content:', 20, 65);
      
      // Clean and format the script content
      const cleanScript = content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '') // Remove style tags
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();

      // Split into sections
      const sections = cleanScript.split(/(?=Hook|Intro|Body|Conclusion|CTA|Trending)/);
      
      let yPos = 75;
      doc.setFontSize(12);
      doc.setFont(undefined, 'normal');

      sections.forEach(section => {
        if (section.trim()) {
          // Check if we need a new page
          if (yPos > 250) {
            doc.addPage();
            yPos = 20; // Reset Y position for new page
          }

          // Add section title in bold
          const sectionTitle = section.match(/^(Hook|Intro|Body|Conclusion|CTA|Trending)/)?.[0];
          if (sectionTitle) {
            doc.setFont(undefined, 'bold');
            doc.text(sectionTitle, 20, yPos);
            yPos += 10;
            doc.setFont(undefined, 'normal');
          }

          // Add section content
          const content = section.replace(/^(Hook|Intro|Body|Conclusion|CTA|Trending)/, '').trim();
          const splitText = doc.splitTextToSize(content, 170);
          
          // Check if content will fit on current page
          if (yPos + (splitText.length * 7) > 250) {
            doc.addPage();
            yPos = 20;
          }
          
          doc.text(splitText, 20, yPos);
          yPos += (splitText.length * 7) + 10; // Add spacing between sections
        }
      });
      
      // Add page numbers to all pages
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.text(`Page ${i} of ${pageCount}`, 20, 280);
      }
      
      doc.save(`${title}.pdf`);
    } catch (err) {
      console.error('Error exporting to PDF:', err);
      setError('Error exporting to PDF. Please try again.');
    }
  };

  // Update exportToWord function to handle saved scripts
  const exportToWord = async (script = null) => {
    try {
      // Use either the provided script or current form data, with fallbacks
      const title = script?.title || videoTopic || 'Untitled Script';
      const content = (script?.script || generatedScript || '').toString();
      const type = script?.type || scriptType || 'viral';
      const platform = script?.platform || selectedPlatform || 'youtube';
      const scriptDuration = script?.duration || duration || '60 sec';
      const tone = script?.tone || selectedTone || 'casual';

      // Clean and format the script content
      const cleanScript = content
        .replace(/<style[^>]*>[\s\S]*?<\/style>/g, '') // Remove style tags
        .replace(/<[^>]+>/g, '') // Remove HTML tags
        .replace(/\s+/g, ' ') // Replace multiple spaces with single space
        .trim();

      // Split into sections, with fallback for empty content
      const sections = cleanScript ? cleanScript.split(/(?=Hook|Intro|Body|Conclusion|CTA|Trending)/) : [];

      const doc = new Document({
        sections: [{
          properties: {
            page: {
              margin: {
                top: 1440, // 1 inch
                right: 1440,
                bottom: 1440,
                left: 1440
              }
            }
          },
          children: [
            // Title
            new Paragraph({
              children: [
                new TextRun({
                  text: title,
                  bold: true,
                  size: 32 // 16pt
                })
              ],
              spacing: { after: 400 }
            }),
            // Metadata
            new Paragraph({
              children: [
                new TextRun({
                  text: `Type: ${type.charAt(0).toUpperCase() + type.slice(1)} Script\n`,
                  bold: true,
                  size: 24 // 12pt
                }),
                new TextRun({
                  text: `Platform: ${platform.charAt(0).toUpperCase() + platform.slice(1)}\n`,
                  bold: true,
                  size: 24
                }),
                new TextRun({
                  text: `Duration: ${scriptDuration}\n`,
                  bold: true,
                  size: 24
                }),
                new TextRun({
                  text: `Tone: ${tone.charAt(0).toUpperCase() + tone.slice(1)}`,
                  bold: true,
                  size: 24
                })
              ],
              spacing: { after: 400 }
            }),
            // Script Content Header
            new Paragraph({
              children: [
                new TextRun({
                  text: 'Script Content:',
                  bold: true,
                  size: 28 // 14pt
                })
              ],
              spacing: { after: 300, before: 300 }
            }),
            // Add each section with proper formatting
            ...sections.map(section => {
              if (!section?.trim()) return null;
              
              const sectionTitle = section.match(/^(Hook|Intro|Body|Conclusion|CTA|Trending)/)?.[0] || '';
              const sectionContent = section.replace(/^(Hook|Intro|Body|Conclusion|CTA|Trending)/, '').trim();
              
              if (!sectionContent) return null;

              return new Paragraph({
                children: [
                  new TextRun({
                    text: sectionTitle + '\n',
                    bold: true,
                    size: 28 // 14pt
                  }),
                  new TextRun({
                    text: sectionContent,
                    size: 24 // 12pt
                  })
                ],
                spacing: { after: 300, before: 300 },
                pageBreakBefore: sectionTitle === 'Body' // Add page break before main content
              });
            }).filter(Boolean)
          ]
        }]
      });

      const buffer = await Packer.toBlob(doc);
      saveAs(buffer, `${title}.docx`);
    } catch (err) {
      console.error('Error exporting to Word:', err);
      setError('Error exporting to Word. Please try again.');
    }
  };

  // Generate SEO tips and hashtags
  const generateAdvancedContent = async () => {
    try {
      setIsGeneratingAdvanced(true);
      setError('');

      const model = genAI.getGenerativeModel({ 
        model: "models/gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.9,
        }
      });

      const prompt = `Based on this video topic: "${videoTopic}", provide:
      1. 5 relevant keywords for SEO
      2. 10 trending hashtags for ${selectedPlatform}
      3. 3 SEO optimization tips
      
      Format the response in a clear, concise way without markdown symbols.`;

      const result = await model.generateContent({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      });

      const response = await result.response;
      const content = response.text();
      
      // Parse the response into sections
      const sections = content.split('\n\n');
      setKeywords(sections[0]);
      setHashtags(sections[1]);
      setSeoTips(sections[2]);
    } catch (err) {
      console.error('Error generating advanced content:', err);
      setError('Error generating advanced content. Please try again.');
    } finally {
      setIsGeneratingAdvanced(false);
    }
  };

  const processVideoLink = async (link) => {
    if (!link) return null;
    
    try {
      setIsProcessingVideo(true);
      // Extract video ID and platform
      let videoData = null;
      
      if (link.includes('youtube.com') || link.includes('youtu.be')) {
        const videoId = link.includes('youtu.be') 
          ? link.split('youtu.be/')[1]
          : link.split('v=')[1]?.split('&')[0];
          
        if (videoId) {
          videoData = {
            platform: 'YouTube',
            id: videoId,
            url: `https://www.youtube.com/watch?v=${videoId}`,
            embedUrl: `https://www.youtube.com/embed/${videoId}`
          };
        }
      } else if (link.includes('tiktok.com')) {
        const videoId = link.split('/video/')[1]?.split('?')[0];
        if (videoId) {
          videoData = {
            platform: 'TikTok',
            id: videoId,
            url: link,
            embedUrl: `https://www.tiktok.com/embed/${videoId}`
          };
        }
      }

      if (videoData) {
        setVideoInfo(videoData);
        return {
          platform: videoData.platform,
          id: videoData.id,
          url: videoData.url,
          embedUrl: videoData.embedUrl
        };
      }
      
      return null;
    } catch (err) {
      console.error('Error processing video link:', err);
      return null;
    } finally {
      setIsProcessingVideo(false);
    }
  };

  const formatScript = (text) => {
    // First clean up the titles section and fix title numbering
    let cleanedText = text
      .replace(/\*\s*Title\s*(\d+):/g, (match, num) => `\nTitle ${num}:`) // Fix title numbering
      .replace(/\[Top 3 Viral Title Options\]/g, '# Viral Title Options\n')
      .replace(/\*/g, '')
      .replace(/\n{3,}/g, '\n\n')
      // Remove any visual/audio directions if they're not in their dedicated sections
      .replace(/\((.*?camera.*?)\)/gi, '')
      .replace(/\((.*?visual.*?)\)/gi, '')
      .replace(/\((.*?music.*?)\)/gi, '')
      .replace(/\((.*?sound.*?)\)/gi, '');

    // Convert markdown to HTML with better formatting
    const htmlContent = cleanedText
      .replace(/^# (.*$)/gm, '<h1 class="script-title">$1</h1>')
      .replace(/^## (.*$)/gm, '<h2 class="script-section">$1</h2>')
      .replace(/Title (\d+):(.*?)(?=Title \d+:|$)/gs, (match, num, content) => {
        return `<div class="title-option">
          <span class="title-number">Title ${num}</span>
          <div class="title-content">${content.trim()}</div>
        </div>`;
      })
      // Add paragraph tags for better spacing
      .split('\n\n')
      .map(paragraph => {
        // Don't wrap headers or title options in <p> tags
        if (paragraph.startsWith('<h1') || 
            paragraph.startsWith('<h2') || 
            paragraph.startsWith('<div class="title-option"')) {
          return paragraph;
        }
        return `<p class="script-paragraph">${paragraph}</p>`;
      })
      .join('\n');

    return `
      <div class="script-content">
        <style>
          .script-content {
            font-family: system-ui, -apple-system, sans-serif;
            line-height: 1.6;
            color: #333;
          }
          .script-content h1 {
            font-size: 1.5rem;
            color: #333;
            margin: 2rem 0 1.5rem;
            font-weight: 700;
            border-bottom: 2px solid #FF3366;
            padding-bottom: 0.5rem;
          }
          .script-content h2 {
            font-size: 1.2rem;
            color: #FF3366;
            margin: 1.5rem 0 1rem;
            font-weight: 600;
          }
          .script-content .title-option {
            background: #f8f9ff;
            padding: 1.5rem;
            margin: 1rem 0;
            border-radius: 8px;
            border-left: 4px solid #FF3366;
          }
          .script-content .title-number {
            display: inline-block;
            font-weight: 600;
            color: #FF3366;
            margin-bottom: 0.5rem;
          }
          .script-content .title-content {
            font-size: 1.1rem;
            font-weight: 500;
            color: #333;
            line-height: 1.4;
          }
          .script-content p {
            margin-bottom: 1rem;
            line-height: 1.8;
            color: #444;
          }
          .script-content strong {
            color: #333;
            font-weight: 600;
            background: #FFE5EC;
            padding: 0.1em 0.3em;
            border-radius: 3px;
          }
          .script-content ul, .script-content ol {
            margin: 1rem 0;
            padding-left: 1.5rem;
          }
          .script-content li {
            margin-bottom: 0.5rem;
            color: #444;
          }
          .script-content blockquote {
            border-left: 4px solid #FF3366;
            margin: 1.5rem 0;
            padding: 1rem;
            background: #f8f9ff;
            font-style: italic;
            color: #555;
          }
        </style>
        ${htmlContent}
      </div>
    `;
  };

  // Update generatePrompt to handle visuals correctly
  const generatePrompt = async () => {
    const videoReference = viralReference ? await processVideoLink(viralReference) : null;
    
    let prompt = `As a master ${scriptType === 'viral' ? 'viral content creator' : 'advertising copywriter'} and storytelling expert, create an incredibly engaging ${scriptType} script for a ${duration} ${selectedPlatform} video about "${videoTopic}". Make it sound completely human, conversational, and naturally compelling.

    ${!includeVisuals ? 'Important: Create a voiceover-only script. Do not include any visual directions, camera movements, or audio suggestions in the main content.' : ''}

    Tone: ${selectedTone} but always engaging and authentic

    ${scriptType === 'ad' ? `
    Advertisement Script Requirements:
    - Focus on clear value proposition and benefits
    - Include specific product/service features
    - Create urgency and FOMO (Fear of Missing Out)
    - Use social proof and testimonials
    - Include clear pricing and call-to-action
    - Emphasize unique selling points
    - Create emotional connection with target audience
    - Use persuasive techniques (scarcity, reciprocity, authority)
    - Include specific product demonstrations or use cases
    - End with strong conversion-focused CTA
    ` : `
    Viral Script Requirements:
    - Focus on entertainment and engagement
    - Create shareable moments and "water cooler" moments
    - Use pattern interrupts and unexpected twists
    - Build emotional investment through storytelling
    - Create multiple "share triggers"
    - Use trending topics and cultural references
    - Include audience participation elements
    - Create suspense and curiosity gaps
    - End with community-focused CTA
    `}

    ${selectedCreator ? `
    Channel Style Reference: ${selectedCreator}
    ${creatorStyles[selectedPlatform].find(c => c.name === selectedCreator)?.description}
    
    Key style elements to incorporate:
    - Match their unique energy and personality
    - Use their signature transitions and hooks
    - Mirror their storytelling techniques
    - Adapt their emotional engagement style
    - Maintain their authentic voice and delivery
    ` : ''}
    
    ${videoReference ? `
    Viral Reference Analysis:
    Platform: ${videoReference.platform}
    Video ID: ${videoReference.id}
    URL: ${videoReference.url}
    
    Incorporate these viral elements:
    - Similar emotional hooks and pattern interrupts
    - Matching energy levels and pacing
    - Comparable storytelling structure
    - Related audience engagement techniques
    - Equivalent tension and resolution patterns
    ` : ''}
    
    Format the script with these sections:

    # ${scriptType === 'ad' ? 'Advertisement Title Options' : 'Viral Title Options'}

    Title 1: [${scriptType === 'ad' ? 'Create a benefit-focused title that highlights value proposition' : 'Create a shocking/intriguing title that makes people stop scrolling'}]
    
    Title 2: [${scriptType === 'ad' ? 'Create a problem-solution title that addresses pain points' : 'Create a value-focused title that promises clear benefits'}]
    
    Title 3: [${scriptType === 'ad' ? 'Create a social proof title that builds credibility' : 'Create an emotionally compelling title that connects personally'}]

    ## Hook
    [${scriptType === 'ad' ? 'Attention-grabbing opening that highlights main benefit or solves key pain point' : 'Attention-grabbing opening that creates instant investment'}]

    ## Intro
    [${scriptType === 'ad' ? 'Problem statement and solution introduction' : 'Compelling setup that justifies the hook and builds curiosity'}]

    ## Body
    [${scriptType === 'ad' ? 'Main content broken into key benefits, features, and social proof' : 'Main content broken into easily digestible chunks with mini-cliffhangers'}]

    ## Conclusion
    [${scriptType === 'ad' ? 'Value proposition reinforcement and urgency creation' : 'Satisfying payoff that delivers on the hook\'s promise'}]

    ## CTA
    [${scriptType === 'ad' ? 'Strong conversion-focused call to action with clear next steps' : 'Natural, value-driven call to action that feels like a gift, not a demand'}]

    ${includeVisuals ? `## Visual Elements
    [${scriptType === 'ad' ? 'Product demonstrations, before/after comparisons, and testimonial visuals' : 'Strategic camera angles, transitions, and effects that enhance the story'}]

    ## Audio Elements
    [${scriptType === 'ad' ? 'Professional background music and sound effects that enhance product presentation' : 'Music and sound design suggestions that amplify emotional impact'}]
    ` : ''}

    Key Requirements:
    - Make every word count - no filler content
    - Keep the energy high but authentic
    - Use ${selectedPlatform}-optimized pacing and structure
    ${scriptType === 'ad' ? '- Focus on conversion and sales psychology' : '- Create multiple "share triggers"'}
    - Make it feel like a human wrote it, not AI
    - Focus on emotional connection and storytelling
    ${!includeVisuals ? '- Create a compelling voiceover-only script that works without visual elements' : '- Include viral hooks every 15-20 seconds'}
    - Use power words and emotional triggers naturally
    - Create "quote-worthy" moments
    - Make it impossible to stop watching`;

    return prompt;
  };

  const handleGenerate = async () => {
    if (!videoTopic) {
      setError('Please enter a video topic');
      return;
    }

    // Check if user has scripts remaining
    if (userProfile?.scriptsRemaining <= 0) {
      setError('You have reached your script limit. Please upgrade to Pro to generate more scripts.');
      return;
    }

    try {
      setIsGenerating(true);
      setError('');

      const model = genAI.getGenerativeModel({ 
        model: "models/gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 2048,
          temperature: 0.9,
        }
      });

      const prompt = await generatePrompt();
      const result = await model.generateContent({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      });

      const response = await result.response;
      const formattedScript = formatScript(response.text());
      setGeneratedScript(formattedScript);

      // Update script count in Firebase
      if (userProfile) {
        const userRef = doc(db, 'users', user.uid);
        await updateDoc(userRef, {
          scriptsRemaining: userProfile.scriptsRemaining - 1
        });
        
        // Update local user profile state
        await updateUserProfile({
          ...userProfile,
          scriptsRemaining: userProfile.scriptsRemaining - 1
        });
      }
    } catch (err) {
      console.error('Generation error:', err);
      setError('Error generating script. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateThumbnailPrompt = (script) => {
    return `Based on this YouTube video script, suggest 3 viral thumbnail ideas that would grab attention and increase CTR:

${script}

For each thumbnail idea, provide these details in a clear, concise format:
1. Main visual concept
2. Text overlay suggestions
3. Color scheme
4. Emotional trigger
5. Why it would be effective

Format each thumbnail idea as a clear section with a title, followed by bullet points for each detail. Do not use markdown symbols like # or **.`;
  };

  const handleGenerateThumbnail = async () => {
    if (!generatedScript) return;

    try {
      setIsGeneratingThumbnail(true);
      setError('');

      const model = genAI.getGenerativeModel({ 
        model: "models/gemini-2.0-flash",
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.9,
        }
      });

      const prompt = generateThumbnailPrompt(generatedScript.replace(/<[^>]+>/g, ''));
      const result = await model.generateContent({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      });

      const response = await result.response;
      setThumbnailSuggestions(response.text());
    } catch (err) {
      console.error('Thumbnail generation error:', err);
      setError('Error generating thumbnail suggestions. Please try again.');
    } finally {
      setIsGeneratingThumbnail(false);
    }
  };

  const handleGenerateAnother = () => {
    // Reset all form fields
    setVideoTopic('');
    setViralReference('');
    setSelectedTone('casual');
    setSelectedPlatform('youtube');
    setDuration('60 sec');
    setScriptType('viral');
    setGeneratedScript('');
    setThumbnailSuggestions('');
    setVideoInfo(null);
    setError('');
  };

  // Update voice recognition setup
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Check for secure context
      const isSecureContext = window.isSecureContext;
      const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
      
      // Check for browser support
      if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        console.log('Speech recognition not supported');
        return;
      }

      try {
        const SpeechRecognition = window.webkitSpeechRecognition || window.SpeechRecognition;
        const newRecognition = new SpeechRecognition();
        
        newRecognition.continuous = false;
        newRecognition.interimResults = false;
        newRecognition.lang = 'en-US';

        newRecognition.onstart = () => {
          setIsRecording(true);
          setError('');
        };

        newRecognition.onresult = (event) => {
          try {
            const transcript = event.results[0][0].transcript;
            setVideoTopic(transcript);
            setIsRecording(false);
            setError(''); // Clear any previous errors
          } catch (err) {
            console.error('Error processing speech result:', err);
            setError('Could not process voice input. Please try again.');
            setIsRecording(false);
          }
        };

        newRecognition.onerror = (event) => {
          console.error('Speech recognition error:', event.error);
          setIsRecording(false);
          
          // Provide more specific error messages
          switch (event.error) {
            case 'not-allowed':
              if (!isSecureContext && !isLocalhost) {
                setError('Voice input requires a secure connection (HTTPS). Please use HTTPS or localhost.');
              } else {
                setError('Please allow microphone access to use voice input.');
              }
              break;
            case 'no-speech':
              setError('No speech was detected. Please try again.');
              break;
            case 'network':
              setError('Network error occurred. Please check your connection.');
              break;
            case 'audio-capture':
              setError('No microphone was found. Please check your device settings.');
              break;
            default:
              setError('Voice input error. Please try again.');
          }
        };

        newRecognition.onend = () => {
          setIsRecording(false);
        };

        setRecognition(newRecognition);
      } catch (err) {
        console.error('Error setting up speech recognition:', err);
        setError('Could not initialize voice input. Please try again.');
      }
    }
  }, []);

  // Update toggleRecording function
  const toggleRecording = async () => {
    if (!recognition) {
      setError('Voice input is not supported in your browser. Please try using Chrome.');
      return;
    }

    // Check for secure context
    const isSecureContext = window.isSecureContext;
    const isLocalhost = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

    if (!isSecureContext && !isLocalhost) {
      setError('Voice input requires a secure connection (HTTPS). Please use HTTPS or localhost.');
      return;
    }

    try {
      if (isRecording) {
        recognition.stop();
        setIsRecording(false);
      } else {
        try {
          // Check if running on localhost
          if (isLocalhost) {
            // For localhost, try to start recognition directly
            recognition.start();
            setIsRecording(true);
            setError('');
          } else {
            // For non-localhost, check microphone access
            const stream = await navigator.mediaDevices?.getUserMedia({ audio: true });
            if (stream) {
              stream.getTracks().forEach(track => track.stop());
              recognition.start();
              setIsRecording(true);
              setError('');
            }
          }
        } catch (err) {
          console.error('Microphone access error:', err);
          if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
            setError('Please allow microphone access to use voice input.');
          } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
            setError('No microphone found. Please check your device settings.');
          } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
            setError('Could not access your microphone. Please check if another application is using it.');
          } else if (!isSecureContext && !isLocalhost) {
            setError('Voice input requires a secure connection (HTTPS). Please use HTTPS or localhost.');
          } else {
            setError('Error accessing microphone. Please try again.');
          }
          setIsRecording(false);
        }
      }
    } catch (err) {
      console.error('Error toggling recording:', err);
      setError('Error with voice input. Please try again.');
      setIsRecording(false);
    }
  };

  useEffect(() => {
    // Handle payment status
    const { payment } = router.query;
    
    if (payment) {
      switch (payment) {
        case 'success':
          toast.success('Payment successful! Your subscription is now active.');
          router.replace('/generate', undefined, { shallow: true });
          break;
        case 'failed':
          toast.error('Payment failed. Please try again or contact support.');
          router.replace('/generate', undefined, { shallow: true });
          break;
        case 'error':
          toast.error('An error occurred. Please contact support if payment was deducted.');
          router.replace('/generate', undefined, { shallow: true });
          break;
      }
    }
  }, [router.query]);

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        {/* Pass the state and setter to GeneratePageNav */}
        <GeneratePageNav 
          showSubscriptionModal={showSubscriptionModal}
          setShowSubscriptionModal={setShowSubscriptionModal}
        />

        <main className="flex-1 p-4 bg-gray-100">
          <div className="max-w-8xl mx-auto flex flex-col gap-6">
            {/* Header */}
            <h1 className="text-2xl text-gray-800 text-center mb-4">
              Generate Viral Video Script
            </h1>

            {/* Script Counter */}
            <div className="bg-white rounded-lg p-4 mb-4 shadow-md flex justify-center items-center gap-4">
              <span className="text-gray-600">
                Scripts Generated:
              </span>
              <span className="text-lg font-semibold text-gray-800">
                {userProfile?.scriptsRemaining || 0} scripts remaining out of {userProfile?.subscription === 'pro' ? 100 : 3}
              </span>
              {userProfile?.subscription === 'free' && userProfile?.scriptsRemaining === 0 && (
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  className="ml-2 px-4 py-2 bg-red-500 text-white rounded-lg transition duration-200"
                >
                  Upgrade to Pro
                </button>
              )}
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-lg p-6 shadow-md">
              {/* Error/Success Message */}
              {error && (
                <div className="bg-green-100 text-green-700 p-3 rounded mb-4 flex items-center gap-2">
                  <span className="text-xl">
                    {error.includes('successfully') ? '✓' : '!'}
                  </span>
                  {error}
                  {!error.includes('successfully') && (
                    <button
                      onClick={() => setError('')}
                      className="ml-auto bg-transparent border-none p-2 text-green-500 text-sm opacity-70 hover:opacity-100"
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              {/* Script Type Selection */}
              <div className="mb-5">
                <label className="block text-gray-600 mb-2 text-sm">
                  Script type
                </label>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { value: 'viral', label: 'Viral Video Script' },
                    { value: 'ad', label: 'Advertisement Script' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setScriptType(type.value)}
                      className="px-4 py-2 rounded border-none bg-gray-100 text-gray-600 transition duration-300 hover:bg-red-100 flex items-center justify-center gap-2"
                    >
                      {type.value === 'viral' ? '🎥' : '💼'}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Topic/Ideas Input */}
              <div className="mb-5">
                <label className="block text-gray-600 mb-2 text-sm flex items-center gap-2">
                  Video Topic or Ideas
                  <span className="text-gray-400 text-sm font-normal">
                    (Type or record your thoughts)
                  </span>
                </label>
                <div className="relative flex flex-col gap-2">
                  <div className="relative flex items-start">
                    <textarea
                      value={videoTopic}
                      onChange={(e) => setVideoTopic(e.target.value)}
                      placeholder="Enter your video topic or share your creative ideas here..."
                      className="w-full p-4 pr-12 text-gray-800 border rounded-lg bg-gray-50 transition duration-200 focus:border-red-300 focus:ring-2 focus:ring-red-200 focus:outline-none"
                    />
                    <button
                      onClick={toggleRecording}
                      title={isRecording ? 'Stop recording' : 'Start recording'}
                      className="absolute top-4 right-4 bg-transparent border-none p-2 rounded-full flex items-center justify-center transition duration-200"
                    >
                      <svg 
                        viewBox="0 0 24 24" 
                        width="24" 
                        height="24" 
                        fill={isRecording ? 'white' : '#666'}
                        className="transition duration-200"
                      >
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                    </button>
                  </div>
                  {isRecording && (
                    <div className="p-3 bg-red-100 rounded text-red-700 text-sm flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-red-500 inline-block animate-pulse"></span>
                      Recording your ideas...
                    </div>
                  )}
                  <p className="mt-2 text-gray-500 text-sm italic">
                    Share your topic or brainstorm ideas - they'll be crafted into an engaging script
                  </p>
                </div>
              </div>

              {/* Viral Reference Input */}
              <div className="mb-5">
                <label className="block text-gray-600 mb-2 text-sm">
                  Viral video reference (optional)
                </label>
                <div className="border border-gray-300 rounded-lg p-4 bg-gray-50 transition duration-300 hover:border-red-300">
                  <div className="flex flex-col items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-2xl">
                      📎
                    </div>
                    <div className="text-center">
                      <p className="text-gray-700 mb-2">
                        Paste your video link here
                      </p>
                      <p className="text-gray-500">
                        Supports YouTube and TikTok links
                      </p>
                    </div>
                    <textarea
                      value={viralReference}
                      onChange={(e) => setViralReference(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      className="w-full p-4 text-gray-800 border rounded-lg bg-gray-50 transition duration-200 focus:border-red-300 focus:ring-2 focus:ring-red-200 focus:outline-none"
                    />
                  </div>
                </div>

                {isProcessingVideo && (
                  <div className="mt-4 p-4 bg-gray-100 rounded flex items-center gap-4">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center animate-spin">
                      ⌛
                    </div>
                    <div className="text-gray-600">
                      Analyzing video style...
                    </div>
                  </div>
                )}

                {videoInfo && (
                  <div className="mt-4 p-4 bg-gray-100 rounded flex items-center gap-4 border border-red-200">
                    <div className="w-8 h-8 rounded-full bg-red-100 text-red-500 flex items-center justify-center text-xl">
                      ✓
                    </div>
                    <div className="flex-1">
                      <div className="text-gray-700 font-semibold mb-2">
                        {videoInfo.platform} video detected
                      </div>
                      <div className="text-gray-500 flex items-center gap-2">
                        <span className="px-2 py-1 bg-white rounded text-gray-500 border border-gray-300">
                          ID: {videoInfo.id}
                        </span>
                        <a 
                          href={videoInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-red-500 text-sm hover:underline"
                        >
                          View video →
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => setViralReference('')}
                      className="text-gray-500 hover:text-red-500"
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Duration Selection */}
              <div className="mb-5">
                <label className="block text-gray-600 mb-2 text-sm">
                  Duration
                </label>
                <div className="flex gap-4 flex-wrap items-center">
                  {['30 sec', '60 sec', '2 min', '3 min'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setDuration(time)}
                      className="px-4 py-2 rounded border-none bg-gray-100 text-gray-600 transition duration-300 hover:bg-red-100"
                    >
                      {time}
                    </button>
                  ))}
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    className="px-4 py-2 rounded border-gray-300 bg-white text-gray-600 cursor-pointer font-medium shadow-sm focus:border-red-300 focus:ring-2 focus:ring-red-200 appearance-none bg-url('data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23666666\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E') no-repeat right 12px center py-2 pr-8"
                  >
                    <option value="" disabled>More options...</option>
                    <option value="5 min">5 minutes</option>
                    <option value="10 min">10 minutes</option>
                    <option value="15 min">15 minutes</option>
                    <option value="20 min">20 minutes</option>
                    <option value="30 min">30 minutes</option>
                    <option value="45 min">45 minutes</option>
                    <option value="60 min">60 minutes</option>
                    <option value="custom">Custom duration...</option>
                  </select>
                  {duration === 'custom' && (
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter minutes"
                        onChange={(e) => setDuration(`${e.target.value} min`)}
                        className="px-4 py-2 rounded border-gray-300 bg-white text-gray-600 font-medium shadow-sm focus:border-red-300 focus:ring-2 focus:ring-red-200"
                      />
                      <span className="text-gray-600 text-sm">minutes</span>
                    </div>
                  )}
                </div>
                <p className="mt-2 text-gray-500 text-sm">
                  Select from common durations or choose a custom length
                </p>
              </div>

              {/* Tone Selection */}
              <div className="mb-5">
                <label className="block text-gray-600 mb-2 text-sm">
                  Tone
                </label>
                <div className="flex gap-4 flex-wrap">
                  {['Casual', 'Funny', 'Informative', 'Inspirational', 'Creative'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone.toLowerCase())}
                      className="px-4 py-2 rounded border-none bg-gray-100 text-gray-600 transition duration-300 hover:bg-red-100"
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Selection */}
              <div className="mb-6">
                <label className="block text-gray-600 mb-2 text-sm">
                  Social media
                </label>
                <div className="flex gap-4 flex-wrap">
                  {['YouTube', 'TikTok', 'Instagram', 'Facebook'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        setSelectedPlatform(platform.toLowerCase());
                        setSelectedCreator(''); // Reset creator when platform changes
                      }}
                      className="px-4 py-2 rounded border-none bg-gray-100 text-gray-600 transition duration-300 hover:bg-red-100"
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Style Selection */}
              {selectedPlatform && (
                <div className="mb-6">
                  <label className="block text-gray-600 mb-2 text-sm">
                    Creator Style (Optional)
                  </label>
                  <div className="grid grid-cols-auto-fit minmax(250px, 1fr) gap-4">
                    {creatorStyles[selectedPlatform].map((creator) => (
                      <button
                        key={creator.name}
                        onClick={() => setSelectedCreator(creator.name)}
                        className="px-4 py-3 rounded border border-gray-300 bg-white text-gray-600 transition duration-300 hover:bg-red-100 flex flex-col gap-2"
                      >
                        <span className="font-semibold">{creator.name}</span>
                        <span className="text-sm opacity-70">
                          {creator.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Suggestions Toggle */}
              <div className="mb-5">
                <label className="block text-gray-600 mb-2 text-sm">
                  Include Visual Suggestions
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setIncludeVisuals(!includeVisuals)}
                    className="w-10 h-6 rounded-lg bg-gray-100 text-gray-600 transition duration-200"
                  >
                    <div className="w-6 h-6 rounded-full bg-white absolute top-1 left-1 transition duration-200" />
                  </button>
                  <span className="text-gray-600 text-sm">
                    {includeVisuals ? 'On' : 'Off'}
                  </span>
                </div>
                <p className="mt-2 text-gray-500 text-sm">
                  {includeVisuals 
                    ? 'Script will include visual suggestions like transitions, effects, and thumbnail ideas'
                    : 'Script will focus on content and dialogue only'}
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                className="w-full px-4 py-3 bg-red-500 text-white rounded-lg font-semibold text-lg transition duration-300 hover:bg-red-600 flex items-center justify-center gap-4"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin">⌛</span>
                    Generating...
                  </>
                ) : (
                  'Generate script →'
                )}
              </button>
            </div>

            {/* Generated Script Section */}
            {generatedScript && (
              <div 
                ref={responseRef}
                className="bg-white rounded-lg p-6 shadow-md transition duration-300"
              >
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-lg text-gray-700 mb-0">
                    Generated Script
                  </h2>
                  <button 
                    onClick={async () => {
                      try {
                        // Create a temporary div to handle HTML content
                        const tempDiv = document.createElement('div');
                        tempDiv.innerHTML = generatedScript;
                        
                        // Remove all style tags and their content
                        const styleTags = tempDiv.getElementsByTagName('style');
                        while (styleTags.length > 0) {
                          styleTags[0].parentNode.removeChild(styleTags[0]);
                        }
                        
                        // Get text content and clean up
                        let cleanText = tempDiv.textContent
                          .replace(/\s+/g, ' ') // Replace multiple spaces with single space
                          .replace(/\n\s*\n/g, '\n\n') // Replace multiple newlines with double newline
                          .trim();
                        
                        // Format section headers
                        cleanText = cleanText
                          .replace(/(Viral Title Options|Hook|Intro|Body|Conclusion|CTA)/g, '\n\n$1\n')
                          .replace(/(Title \d+:)/g, '\n$1\n');
                        
                        await navigator.clipboard.writeText(cleanText);
                        
                        // Show success message
                        setError('Script copied to clipboard successfully!');
                        setTimeout(() => setError(''), 2000);
                      } catch (err) {
                        console.error('Error copying script:', err);
                        setError('Could not copy script. Please try again.');
                      }
                    }}
                    className="px-4 py-2 bg-transparent text-red-500 border border-red-500 rounded-lg text-sm transition duration-200 flex items-center gap-2 hover:bg-red-100"
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      width="16" 
                      height="16" 
                      fill="currentColor"
                      className="mr-2"
                    >
                      <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copy script
                  </button>
                </div>
                
                <div 
                  className="bg-gray-50 rounded-lg p-4 text-gray-700 line-height-6 text-base"
                  dangerouslySetInnerHTML={{ __html: generatedScript }}
                />

                {/* SEO & Hashtags Section */}
                {selectedPlatform === 'youtube' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg text-gray-600 mb-0">
                        SEO & Social Media Tips
                      </h3>
                      <button
                        onClick={generateAdvancedContent}
                        disabled={isGeneratingAdvanced}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm transition duration-300 hover:bg-red-100 flex items-center gap-4"
                      >
                        {isGeneratingAdvanced ? (
                          <>
                            <span className="animate-spin">⌛</span>
                            Generating...
                          </>
                        ) : (
                          'Generate SEO Tips'
                        )}
                      </button>
                    </div>

                    {(keywords || hashtags || seoTips) && (
                      <div className="grid grid-cols-auto-fit minmax(250px, 1fr) gap-6">
                        {keywords && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-red-500 mb-2">Keywords</h4>
                            <p className="text-gray-700">{keywords}</p>
                          </div>
                        )}
                        {hashtags && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-red-500 mb-2">Hashtags</h4>
                            <p className="text-gray-700">{hashtags}</p>
                          </div>
                        )}
                        {seoTips && (
                          <div className="bg-gray-50 rounded-lg p-4">
                            <h4 className="text-red-500 mb-2">SEO Tips</h4>
                            <p className="text-gray-700">{seoTips}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Thumbnail Section */}
                {selectedPlatform === 'youtube' && (
                  <div className="mt-6 pt-6 border-t border-gray-200">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg text-gray-600 mb-0">
                        Thumbnail Ideas
                      </h3>
                      <button
                        onClick={handleGenerateThumbnail}
                        disabled={isGeneratingThumbnail}
                        className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg text-sm transition duration-300 hover:bg-red-100 flex items-center gap-4"
                      >
                        {isGeneratingThumbnail ? (
                          <>
                            <span className="animate-spin">⌛</span>
                            Generating...
                          </>
                        ) : (
                          'Suggest Thumbnail'
                        )}
                      </button>
                    </div>

                    {thumbnailSuggestions && (
                      <div 
                        className="bg-gray-50 rounded-lg p-4 text-gray-700 line-height-6 text-base"
                      >
                        {thumbnailSuggestions.split('\n\n').map((section, index) => {
                          const lines = section.split('\n');
                          const title = lines[0];
                          const content = lines.slice(1);
                          
                          return (
                            <div key={index} className="mb-4">
                              <h4 className="text-red-500 font-semibold mb-2">
                                {title}
                              </h4>
                              <ul className="list-none p-0 m-0">
                                {content.map((line, lineIndex) => (
                                  <li key={lineIndex} className="mb-2 pl-6 relative">
                                    <span className="absolute left-0 top-0 text-red-500">•</span>
                                    {line}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Load Script Confirmation Modal - Moved outside saved scripts section */}
                {showLoadConfirm && (
                  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-lg">
                      <h3 className="text-lg text-gray-700 mb-4">
                        Load Saved Script
                      </h3>
                      <p className="text-gray-600 mb-4">
                        Are you sure you want to load "{scriptToLoad?.title}"? This will replace your current form data.
                      </p>
                      <div className="flex justify-end gap-4">
                        <button
                          onClick={() => {
                            setShowLoadConfirm(false);
                            setScriptToLoad(null);
                          }}
                          className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg transition duration-200"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmLoadScript}
                          className="px-4 py-2 bg-red-500 text-white rounded-lg transition duration-200"
                        >
                          Load Script
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div className="mt-6 pt-6 border-t border-gray-200 flex justify-end gap-4">
                  <button 
                    onClick={saveScript}
                    className="px-4 py-2 bg-transparent text-red-500 border border-red-500 rounded-lg text-sm transition duration-200"
                  >
                    Save Script
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => {
                        const dropdown = document.getElementById('exportDropdown');
                        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                      }}
                      className="px-4 py-2 bg-red-500 text-white rounded-lg transition duration-200"
                    >
                      Export
                    </button>
                    <div 
                      id="exportDropdown"
                      className="absolute top-16 right-0 bg-white rounded-lg shadow-lg p-4 hidden z-50"
                    >
                      <button
                        onClick={exportToPDF}
                        className="w-full px-4 py-2 bg-transparent text-gray-700 transition duration-200"
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={exportToWord}
                        className="w-full px-4 py-2 bg-transparent text-gray-700 transition duration-200"
                      >
                        Export as Word
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generate Another Button */}
                <div className="mt-6 pt-6 border-t border-gray-200 text-center">
                  <button
                    onClick={handleGenerateAnother}
                    className="px-6 py-3 bg-red-500 text-white rounded-lg font-semibold text-lg transition duration-300 flex items-center gap-4 shadow-md"
                  >
                    <span className="text-2xl">✨</span>
                    Generate Another Script
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saved Scripts Section - Near footer */}
          {savedScripts.length > 0 && (
            <div className="bg-white rounded-lg p-6 shadow-md mt-8 w-full box-border max-w-8xl mx-auto">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg text-gray-700 mb-0">
                  Saved Scripts
                </h3>
                <button
                  onClick={() => {
                    if (confirm('Are you sure you want to delete all saved scripts?')) {
                      setSavedScripts([]);
                      localStorage.setItem('savedScripts', JSON.stringify([]));
                      setError('All scripts deleted successfully!');
                      setTimeout(() => setError(''), 2000);
                    }
                  }}
                  className="px-4 py-2 bg-transparent text-red-500 border border-red-500 rounded-lg text-sm transition duration-200"
                >
                  Clear All
                </button>
              </div>
              <div className="grid grid-cols-auto-fit minmax(250px, 1fr) gap-6">
                {savedScripts.map(script => (
                  <div
                    key={script.id}
                    className="bg-white rounded-lg p-4 shadow-md border border-gray-200 transition duration-200 hover:shadow-lg cursor-pointer"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="text-gray-700 font-semibold mb-0 max-w-full overflow-hidden text-ellipsis whitespace-nowrap">
                        {script.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScript(script.id);
                        }}
                        className="px-2 py-1 bg-transparent text-red-500 border border-red-500 rounded-lg text-sm transition duration-200 hover:bg-red-100"
                      >
                        Delete
                      </button>
                    </div>
                    <div className="flex gap-2 flex-wrap mb-2">
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                        {script.date}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                        {script.type}
                      </span>
                      <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded text-sm">
                        {script.platform}
                      </span>
                    </div>
                    <div 
                      onClick={() => setExpandedScriptId(expandedScriptId === script.id ? null : script.id)}
                      className="text-red-500 font-medium text-sm flex items-center gap-2 cursor-pointer"
                    >
                      {expandedScriptId === script.id ? 'Hide script ▼' : 'View script ▲'}
                    </div>

                    {/* Collapsible Script Content */}
                    {expandedScriptId === script.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <div className="bg-gray-50 rounded-lg p-4 text-gray-700 line-height-6 text-base">
                          <div dangerouslySetInnerHTML={{ __html: script.script }} />
                        </div>
                        <div className="flex justify-end gap-4 mt-4">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportToPDF(script);
                            }}
                            className="px-4 py-2 bg-transparent text-red-500 border border-red-500 rounded-lg text-sm transition duration-200"
                          >
                            Export PDF
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportToWord(script);
                            }}
                            className="px-4 py-2 bg-red-500 text-white rounded-lg transition duration-200"
                          >
                            Export Word
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </main>

        <Footer />
      </div>

      {/* Single instance of SubscriptionModal */}
      <SubscriptionModal
        isOpen={showSubscriptionModal}
        onClose={() => setShowSubscriptionModal(false)}
        userProfile={userProfile}
      />
    </ProtectedRoute>
  );
} 