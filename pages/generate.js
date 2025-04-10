import React, { useState, useEffect, useRef } from 'react';
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
import { doc, updateDoc, getDoc } from 'firebase/firestore';

// Initialize Gemini API
const genAI = new GoogleGenerativeAI(process.env.NEXT_PUBLIC_GEMINI_API_KEY);

// GeneratePageNav Component
const GeneratePageNav = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [showContactModal, setShowContactModal] = useState(false);
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  // Add this function to handle subscription upgrades
  const handleUpgrade = async (plan) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          email: user.email,
          name: user.displayName || user.email
        })
      });

      const data = await response.json();

      if (data.success && data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error(data.message || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to process subscription. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Add this to fetch user profile when modal opens
  useEffect(() => {
    if (showSubscriptionModal && user) {
      const fetchUserProfile = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.email));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      };
      fetchUserProfile();
    }
  }, [showSubscriptionModal, user]);
                          
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

      {/* Subscription Modal */}
      {showSubscriptionModal && (
        <SubscriptionModal
          onClose={() => setShowSubscriptionModal(false)}
          userProfile={userProfile}
        />
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

export default function Generate() {
  const router = useRouter();
  const { user } = useAuth();
  const [showSubscriptionModal, setShowSubscriptionModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [userProfile, setUserProfile] = useState(null);

  // Fetch user profile when component mounts
  useEffect(() => {
    if (user) {
      const fetchUserProfile = async () => {
        const userDoc = await getDoc(doc(db, 'users', user.email));
        if (userDoc.exists()) {
          setUserProfile(userDoc.data());
        }
      };
      fetchUserProfile();
    }
  }, [user]);

  const handleUpgrade = async (plan) => {
    try {
      setLoading(true);
      setError('');

      const response = await fetch('/api/create-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          plan,
          email: user.email,
          name: user.displayName || user.email
        })
      });

      const data = await response.json();

      if (data.success && data.paymentLink) {
        window.location.href = data.paymentLink;
      } else {
        throw new Error(data.message || 'Failed to create subscription');
      }
    } catch (error) {
      console.error('Subscription error:', error);
      setError('Failed to process subscription. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        paddingTop: '80px' // Add padding to account for fixed header
      }}>
        <GeneratePageNav />
        
        <main style={{
          flex: 1,
          padding: '20px',
          background: 'linear-gradient(to bottom, #f8f9ff, #ffffff)',
          fontFamily: 'system-ui, -apple-system, sans-serif'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '30px'
          }}>
            {/* Header */}
            <h1 style={{
              fontSize: '2rem',
              color: '#333',
              textAlign: 'center',
              marginBottom: '20px'
            }}>
              Generate Viral Video Script
            </h1>

            {/* Script Counter */}
            <div style={{
              background: 'white',
              borderRadius: '12px',
              padding: '15px 20px',
              marginBottom: '20px',
              boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              gap: '10px'
            }}>
              <span style={{
                fontSize: '1rem',
                color: '#666'
              }}>
                Scripts Generated:
              </span>
              <span style={{
                fontSize: '1.2rem',
                fontWeight: '600',
                color: userProfile?.subscription === 'pro' ? '#FF3366' : '#666'
              }}>
                {userProfile?.scriptsRemaining || 0} scripts remaining out of {userProfile?.subscription === 'pro' ? 100 : 3}
              </span>
              {userProfile?.subscription === 'free' && userProfile?.scriptsRemaining === 0 && (
                <button
                  onClick={() => setShowSubscriptionModal(true)}
                  style={{
                    marginLeft: '10px',
                    padding: '6px 12px',
                    backgroundColor: '#FF3366',
                    color: 'white',
                    border: 'none',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Upgrade to Pro
                </button>
              )}
            </div>

            {/* Main Card */}
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '30px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              boxSizing: 'border-box'
            }}>
              {/* Error/Success Message */}
              {error && (
                <div style={{
                  backgroundColor: error.includes('successfully') ? '#E8F5E9' : '#FFF2F2',
                  color: error.includes('successfully') ? '#2E7D32' : '#FF3366',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  marginBottom: '20px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  <span style={{
                    fontSize: '1.2rem'
                  }}>
                    {error.includes('successfully') ? '✓' : '!'}
                  </span>
                  {error}
                  {!error.includes('successfully') && (
                    <button
                      onClick={() => setError('')}
                      style={{
                        marginLeft: 'auto',
                        background: 'none',
                        border: 'none',
                        padding: '4px',
                        cursor: 'pointer',
                        color: '#FF3366',
                        fontSize: '1.2rem',
                        opacity: 0.7,
                        ':hover': { opacity: 1 }
                      }}
                    >
                      ×
                    </button>
                  )}
                </div>
              )}

              {/* Script Type Selection */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem'
                }}>
                  Script type
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  {[
                    { value: 'viral', label: 'Viral Video Script' },
                    { value: 'ad', label: 'Advertisement Script' }
                  ].map((type) => (
                    <button
                      key={type.value}
                      onClick={() => setScriptType(type.value)}
                      style={{
                        padding: '12px 24px',
                        borderRadius: '12px',
                        border: 'none',
                        backgroundColor: scriptType === type.value ? '#FF3366' : 'white',
                        color: scriptType === type.value ? 'white' : '#666',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.3s ease',
                        flex: '1 1 200px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        ':hover': {
                          transform: 'translateY(-2px)',
                          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                        }
                      }}
                    >
                      {type.value === 'viral' ? '🎥' : '💼'}
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Video Topic/Ideas Input */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  Video Topic or Ideas
                  <span style={{
                    fontSize: '0.8rem',
                    color: '#999',
                    fontWeight: 'normal'
                  }}>
                    (Type or record your thoughts)
                  </span>
                </label>
                <div style={{
                  position: 'relative',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '8px'
                }}>
                  <div style={{
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'flex-start'
                  }}>
                    <textarea
                      value={videoTopic}
                      onChange={(e) => setVideoTopic(e.target.value)}
                      placeholder="Enter your video topic or share your creative ideas here..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        paddingRight: '48px',
                        fontSize: '1rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        backgroundColor: '#fafafa',
                        color: '#333',
                        outline: 'none',
                        transition: 'all 0.2s',
                        boxSizing: 'border-box',
                        minHeight: '60px',
                        maxHeight: '200px',
                        resize: 'vertical',
                        lineHeight: '1.5',
                        ':focus': {
                          borderColor: '#FF3366',
                          backgroundColor: '#fff',
                          boxShadow: '0 0 0 3px rgba(255, 51, 102, 0.1)'
                        }
                      }}
                    />
                    <button
                      onClick={toggleRecording}
                      title={isRecording ? 'Stop recording' : 'Start recording'}
                      style={{
                        position: 'absolute',
                        right: '12px',
                        top: '12px',
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        cursor: 'pointer',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s',
                        backgroundColor: isRecording ? '#FF3366' : 'transparent',
                        width: '32px',
                        height: '32px'
                      }}
                    >
                      <svg 
                        viewBox="0 0 24 24" 
                        width="20" 
                        height="20" 
                        fill={isRecording ? 'white' : '#666'}
                        style={{
                          transition: 'all 0.2s'
                        }}
                      >
                        <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z"/>
                        <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z"/>
                      </svg>
                    </button>
                  </div>
                  {isRecording && (
                    <div style={{
                      padding: '8px 12px',
                      backgroundColor: '#FFF2F2',
                      borderRadius: '8px',
                      color: '#FF3366',
                      fontSize: '0.9rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      animation: 'slideIn 0.3s ease-out'
                    }}>
                      <span style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: '#FF3366',
                        display: 'inline-block',
                        animation: 'pulse 1s infinite'
                      }}></span>
                      Recording your ideas...
                    </div>
                  )}
                  <p style={{
                    margin: '4px 0 0',
                    fontSize: '0.8rem',
                    color: '#999',
                    fontStyle: 'italic'
                  }}>
                    Share your topic or brainstorm ideas - they'll be crafted into an engaging script
                  </p>
                </div>
              </div>

              {/* Viral Reference Input */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem'
                }}>
                  Viral video reference (optional)
                </label>
                <div style={{
                  border: '2px dashed #e0e0e0',
                  borderRadius: '16px',
                  padding: '20px',
                  backgroundColor: '#fafafa',
                  transition: 'all 0.3s ease',
                  ':hover': {
                    borderColor: '#FF3366',
                    backgroundColor: '#fff'
                  }
                }}>
                  <div style={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '12px'
                  }}>
                    <div style={{
                      width: '48px',
                      height: '48px',
                      borderRadius: '50%',
                      backgroundColor: '#FFE5EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FF3366',
                      fontSize: '24px'
                    }}>
                      📎
                    </div>
                    <div style={{
                      textAlign: 'center'
                    }}>
                      <p style={{
                        fontSize: '1rem',
                        color: '#333',
                        marginBottom: '4px'
                      }}>
                        Paste your video link here
                      </p>
                      <p style={{
                        fontSize: '0.8rem',
                        color: '#999'
                      }}>
                        Supports YouTube and TikTok links
                      </p>
                    </div>
                    <textarea
                      value={viralReference}
                      onChange={(e) => setViralReference(e.target.value)}
                      placeholder="https://youtube.com/watch?v=..."
                      style={{
                        width: '100%',
                        padding: '12px 16px',
                        fontSize: '1rem',
                        border: '1px solid #e0e0e0',
                        borderRadius: '12px',
                        backgroundColor: 'white',
                        color: '#333',
                        outline: 'none',
                        transition: 'all 0.3s ease',
                        boxSizing: 'border-box',
                        minHeight: '60px',
                        resize: 'vertical',
                        ':focus': {
                          borderColor: '#FF3366',
                          boxShadow: '0 0 0 3px rgba(255, 51, 102, 0.1)'
                        }
                      }}
                    />
                  </div>
                </div>

                {isProcessingVideo && (
                  <div style={{
                    marginTop: '12px',
                    padding: '12px 16px',
                    backgroundColor: '#f8f9ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    animation: 'slideIn 0.3s ease-out'
                  }}>
                    <div style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: '#FFE5EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FF3366',
                      animation: 'spin 1s linear infinite'
                    }}>
                      ⌛
                    </div>
                    <div style={{
                      fontSize: '0.9rem',
                      color: '#666'
                    }}>
                      Analyzing video style...
                    </div>
                  </div>
                )}

                {videoInfo && (
                  <div style={{
                    marginTop: '12px',
                    padding: '16px',
                    backgroundColor: '#f8f9ff',
                    borderRadius: '12px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    animation: 'slideIn 0.3s ease-out',
                    border: '1px solid #FFE5EC'
                  }}>
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: '#FFE5EC',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: '#FF3366',
                      fontSize: '20px'
                    }}>
                      ✓
                    </div>
                    <div style={{
                      flex: 1
                    }}>
                      <div style={{
                        fontSize: '0.95rem',
                        color: '#333',
                        fontWeight: '500',
                        marginBottom: '4px'
                      }}>
                        {videoInfo.platform} video detected
                      </div>
                      <div style={{
                        fontSize: '0.8rem',
                        color: '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                      }}>
                        <span style={{
                          padding: '2px 8px',
                          backgroundColor: '#fff',
                          borderRadius: '12px',
                          border: '1px solid #e0e0e0'
                        }}>
                          ID: {videoInfo.id}
                        </span>
                        <a 
                          href={videoInfo.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{
                            color: '#FF3366',
                            textDecoration: 'none',
                            fontSize: '0.8rem',
                            ':hover': {
                              textDecoration: 'underline'
                            }
                          }}
                        >
                          View video →
                        </a>
                      </div>
                    </div>
                    <button
                      onClick={() => setViralReference('')}
                      style={{
                        padding: '8px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        color: '#999',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        ':hover': {
                          color: '#FF3366'
                        }
                      }}
                    >
                      ✕
                    </button>
                  </div>
                )}
              </div>

              {/* Duration Selection */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem'
                }}>
                  Duration
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap',
                  alignItems: 'center'
                }}>
                  {['30 sec', '60 sec', '2 min', '3 min'].map((time) => (
                    <button
                      key={time}
                      onClick={() => setDuration(time)}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: duration === time ? '#FF3366' : 'white',
                        color: duration === time ? 'white' : '#666',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s',
                        ':hover': {
                          backgroundColor: duration === time ? '#FF3366' : '#f8f9ff'
                        }
                      }}
                    >
                      {time}
                    </button>
                  ))}
                  <select
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: '1px solid #e0e0e0',
                      backgroundColor: 'white',
                      color: '#666',
                      cursor: 'pointer',
                      fontSize: '0.9rem',
                      boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                      transition: 'all 0.2s',
                      appearance: 'none',
                      backgroundImage: 'url("data:image/svg+xml,%3Csvg xmlns=\'http://www.w3.org/2000/svg\' width=\'12\' height=\'12\' viewBox=\'0 0 12 12\'%3E%3Cpath fill=\'%23666666\' d=\'M6 8L2 4h8z\'/%3E%3C/svg%3E")',
                      backgroundRepeat: 'no-repeat',
                      backgroundPosition: 'right 12px center',
                      paddingRight: '32px',
                      minWidth: '120px'
                    }}
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
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <input
                        type="number"
                        min="1"
                        placeholder="Enter minutes"
                        onChange={(e) => setDuration(`${e.target.value} min`)}
                        style={{
                          padding: '8px 12px',
                          borderRadius: '20px',
                          border: '1px solid #e0e0e0',
                          backgroundColor: 'white',
                          color: '#666',
                          fontSize: '0.9rem',
                          width: '100px',
                          outline: 'none',
                          ':focus': {
                            borderColor: '#FF3366',
                            boxShadow: '0 0 0 2px rgba(255, 51, 102, 0.1)'
                          }
                        }}
                      />
                      <span style={{ color: '#666', fontSize: '0.9rem' }}>minutes</span>
                    </div>
                  )}
                </div>
                <p style={{
                  marginTop: '8px',
                  fontSize: '0.8rem',
                  color: '#999'
                }}>
                  Select from common durations or choose a custom length
                </p>
              </div>

              {/* Tone Selection */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem'
                }}>
                  Tone
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  {['Casual', 'Funny', 'Informative', 'Inspirational', 'Creative'].map((tone) => (
                    <button
                      key={tone}
                      onClick={() => setSelectedTone(tone.toLowerCase())}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: selectedTone === tone.toLowerCase() ? '#FF3366' : 'white',
                        color: selectedTone === tone.toLowerCase() ? 'white' : '#666',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {tone}
                    </button>
                  ))}
                </div>
              </div>

              {/* Platform Selection */}
              <div style={{ marginBottom: '30px' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem'
                }}>
                  Social media
                </label>
                <div style={{
                  display: 'flex',
                  gap: '10px',
                  flexWrap: 'wrap'
                }}>
                  {['YouTube', 'TikTok', 'Instagram', 'Facebook'].map((platform) => (
                    <button
                      key={platform}
                      onClick={() => {
                        setSelectedPlatform(platform.toLowerCase());
                        setSelectedCreator(''); // Reset creator when platform changes
                      }}
                      style={{
                        padding: '8px 16px',
                        borderRadius: '20px',
                        border: 'none',
                        backgroundColor: selectedPlatform === platform.toLowerCase() ? '#FF3366' : 'white',
                        color: selectedPlatform === platform.toLowerCase() ? 'white' : '#666',
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.05)',
                        transition: 'all 0.2s'
                      }}
                    >
                      {platform}
                    </button>
                  ))}
                </div>
              </div>

              {/* Creator Style Selection */}
              {selectedPlatform && (
                <div style={{ marginBottom: '30px' }}>
                  <label style={{
                    display: 'block',
                    color: '#666',
                    marginBottom: '8px',
                    fontSize: '0.9rem'
                  }}>
                    Creator Style (Optional)
                  </label>
                  <div style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                    gap: '15px'
                  }}>
                    {creatorStyles[selectedPlatform].map((creator) => (
                      <button
                        key={creator.name}
                        onClick={() => setSelectedCreator(creator.name)}
                        style={{
                          padding: '12px 16px',
                          borderRadius: '12px',
                          border: '1px solid #e0e0e0',
                          backgroundColor: selectedCreator === creator.name ? '#FF3366' : 'white',
                          color: selectedCreator === creator.name ? 'white' : '#333',
                          cursor: 'pointer',
                          fontSize: '0.9rem',
                          textAlign: 'left',
                          transition: 'all 0.2s',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '4px'
                        }}
                      >
                        <span style={{ fontWeight: '600' }}>{creator.name}</span>
                        <span style={{ 
                          fontSize: '0.8rem',
                          opacity: selectedCreator === creator.name ? 0.9 : 0.7
                        }}>
                          {creator.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Visual Suggestions Toggle */}
              <div style={{ marginBottom: '25px' }}>
                <label style={{
                  display: 'block',
                  color: '#666',
                  marginBottom: '8px',
                  fontSize: '0.9rem'
                }}>
                  Include Visual Suggestions
                </label>
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '10px'
                }}>
                  <button
                    onClick={() => setIncludeVisuals(!includeVisuals)}
                    style={{
                      width: '50px',
                      height: '26px',
                      borderRadius: '13px',
                      backgroundColor: includeVisuals ? '#FF3366' : '#e0e0e0',
                      position: 'relative',
                      cursor: 'pointer',
                      border: 'none',
                      transition: 'background-color 0.2s'
                    }}
                  >
                    <div style={{
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      backgroundColor: 'white',
                      position: 'absolute',
                      top: '2px',
                      left: includeVisuals ? '26px' : '2px',
                      transition: 'left 0.2s'
                    }} />
                  </button>
                  <span style={{
                    color: '#666',
                    fontSize: '0.9rem'
                  }}>
                    {includeVisuals ? 'On' : 'Off'}
                  </span>
                </div>
                <p style={{
                  marginTop: '8px',
                  fontSize: '0.8rem',
                  color: '#999'
                }}>
                  {includeVisuals 
                    ? 'Script will include visual suggestions like transitions, effects, and thumbnail ideas'
                    : 'Script will focus on content and dialogue only'}
                </p>
              </div>

              {/* Generate Button */}
              <button
                onClick={handleGenerate}
                disabled={isGenerating}
                style={{
                  width: '100%',
                  padding: '16px',
                  backgroundColor: isGenerating ? '#FFE5EC' : '#FF3366',
                  color: isGenerating ? '#FF3366' : 'white',
                  border: 'none',
                  borderRadius: '12px',
                  fontSize: '1rem',
                  fontWeight: '600',
                  cursor: isGenerating ? 'not-allowed' : 'pointer',
                  boxShadow: '0 4px 15px rgba(255, 51, 102, 0.2)',
                  transition: 'all 0.3s ease',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                {isGenerating ? (
                  <>
                    <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⌛</span>
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
                style={{
                  background: 'white',
                  borderRadius: '20px',
                  padding: '30px',
                  boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                  animation: 'fadeIn 0.5s ease-out',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '20px'
                }}>
                  <h2 style={{
                    fontSize: '1.2rem',
                    color: '#333',
                    margin: 0
                  }}>
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
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#FF3366',
                      border: '1px solid #FF3366',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      ':hover': {
                        backgroundColor: '#FFF2F2'
                      }
                    }}
                  >
                    <svg 
                      viewBox="0 0 24 24" 
                      width="16" 
                      height="16" 
                      fill="currentColor"
                      style={{ marginRight: '4px' }}
                    >
                      <path d="M16 1H4C2.9 1 2 1.9 2 3v14h2V3h12V1zm3 4H8C6.9 5 6 5.9 6 7v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
                    </svg>
                    Copy script
                  </button>
                </div>
                
                <div 
                  style={{
                    backgroundColor: '#f8f9ff',
                    borderRadius: '12px',
                    padding: '20px',
                    color: '#444',
                    lineHeight: '1.6',
                    fontSize: '1rem'
                  }}
                  dangerouslySetInnerHTML={{ __html: generatedScript }}
                />

                {/* SEO & Hashtags Section */}
                {selectedPlatform === 'youtube' && (
                  <div style={{
                    marginTop: '30px',
                    paddingTop: '30px',
                    borderTop: '1px solid #eee'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      <h3 style={{
                        fontSize: '1.1rem',
                        color: '#333',
                        margin: 0
                      }}>
                        SEO & Social Media Tips
                      </h3>
                      <button
                        onClick={generateAdvancedContent}
                        disabled={isGeneratingAdvanced}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: isGeneratingAdvanced ? '#FFE5EC' : '#FF3366',
                          color: isGeneratingAdvanced ? '#FF3366' : 'white',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          cursor: isGeneratingAdvanced ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {isGeneratingAdvanced ? (
                          <>
                            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⌛</span>
                            Generating...
                          </>
                        ) : (
                          'Generate SEO Tips'
                        )}
                      </button>
                    </div>

                    {(keywords || hashtags || seoTips) && (
                      <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                        gap: '20px'
                      }}>
                        {keywords && (
                          <div style={{
                            backgroundColor: '#f8f9ff',
                            borderRadius: '12px',
                            padding: '20px'
                          }}>
                            <h4 style={{ color: '#FF3366', marginBottom: '10px' }}>Keywords</h4>
                            <p style={{ color: '#444', lineHeight: '1.6' }}>{keywords}</p>
                          </div>
                        )}
                        {hashtags && (
                          <div style={{
                            backgroundColor: '#f8f9ff',
                            borderRadius: '12px',
                            padding: '20px'
                          }}>
                            <h4 style={{ color: '#FF3366', marginBottom: '10px' }}>Hashtags</h4>
                            <p style={{ color: '#444', lineHeight: '1.6' }}>{hashtags}</p>
                          </div>
                        )}
                        {seoTips && (
                          <div style={{
                            backgroundColor: '#f8f9ff',
                            borderRadius: '12px',
                            padding: '20px'
                          }}>
                            <h4 style={{ color: '#FF3366', marginBottom: '10px' }}>SEO Tips</h4>
                            <p style={{ color: '#444', lineHeight: '1.6' }}>{seoTips}</p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Thumbnail Section */}
                {selectedPlatform === 'youtube' && (
                  <div style={{
                    marginTop: '30px',
                    paddingTop: '30px',
                    borderTop: '1px solid #eee'
                  }}>
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '20px'
                    }}>
                      <h3 style={{
                        fontSize: '1.1rem',
                        color: '#333',
                        margin: 0
                      }}>
                        Thumbnail Ideas
                      </h3>
                      <button
                        onClick={handleGenerateThumbnail}
                        disabled={isGeneratingThumbnail}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: isGeneratingThumbnail ? '#FFE5EC' : '#FF3366',
                          color: isGeneratingThumbnail ? '#FF3366' : 'white',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          cursor: isGeneratingThumbnail ? 'not-allowed' : 'pointer',
                          transition: 'all 0.2s',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        {isGeneratingThumbnail ? (
                          <>
                            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⌛</span>
                            Generating...
                          </>
                        ) : (
                          'Suggest Thumbnail'
                        )}
                      </button>
                    </div>

                    {thumbnailSuggestions && (
                      <div 
                        style={{
                          backgroundColor: '#f8f9ff',
                          borderRadius: '12px',
                          padding: '20px',
                          color: '#444',
                          lineHeight: '1.6',
                          fontSize: '1rem'
                        }}
                      >
                        {thumbnailSuggestions.split('\n\n').map((section, index) => {
                          const lines = section.split('\n');
                          const title = lines[0];
                          const content = lines.slice(1);
                          
                          return (
                            <div key={index} style={{ marginBottom: '20px' }}>
                              <h4 style={{
                                color: '#FF3366',
                                fontSize: '1.1rem',
                                marginBottom: '10px',
                                fontWeight: '600'
                              }}>
                                {title}
                              </h4>
                              <ul style={{
                                listStyle: 'none',
                                padding: 0,
                                margin: 0
                              }}>
                                {content.map((line, lineIndex) => (
                                  <li key={lineIndex} style={{
                                    marginBottom: '8px',
                                    paddingLeft: '20px',
                                    position: 'relative'
                                  }}>
                                    <span style={{
                                      position: 'absolute',
                                      left: 0,
                                      color: '#FF3366'
                                    }}>•</span>
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
                    zIndex: 1000
                  }}>
                    <div style={{
                      background: 'white',
                      borderRadius: '20px',
                      padding: '30px',
                      maxWidth: '500px',
                      width: '90%',
                      boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                      animation: 'slideIn 0.3s ease-out'
                    }}>
                      <h3 style={{
                        fontSize: '1.2rem',
                        color: '#333',
                        marginBottom: '20px'
                      }}>
                        Load Saved Script
                      </h3>
                      <p style={{
                        color: '#666',
                        marginBottom: '20px',
                        lineHeight: '1.5'
                      }}>
                        Are you sure you want to load "{scriptToLoad?.title}"? This will replace your current form data.
                      </p>
                      <div style={{
                        display: 'flex',
                        gap: '10px',
                        justifyContent: 'flex-end'
                      }}>
                        <button
                          onClick={() => {
                            setShowLoadConfirm(false);
                            setScriptToLoad(null);
                          }}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: 'transparent',
                            color: '#666',
                            border: '1px solid #ddd',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={confirmLoadScript}
                          style={{
                            padding: '10px 20px',
                            backgroundColor: '#FF3366',
                            color: 'white',
                            border: 'none',
                            borderRadius: '12px',
                            cursor: 'pointer',
                            transition: 'all 0.2s'
                          }}
                        >
                          Load Script
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Action Buttons */}
                <div style={{
                  marginTop: '30px',
                  paddingTop: '30px',
                  borderTop: '1px solid #eee',
                  display: 'flex',
                  gap: '10px',
                  justifyContent: 'flex-end'
                }}>
                  <button 
                    onClick={saveScript}
                    style={{
                      padding: '8px 16px',
                      backgroundColor: 'transparent',
                      color: '#FF3366',
                      border: '1px solid #FF3366',
                      borderRadius: '20px',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    Save Script
                  </button>
                  <div style={{ position: 'relative' }}>
                    <button
                      onClick={() => {
                        const dropdown = document.getElementById('exportDropdown');
                        dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
                      }}
                      style={{
                        padding: '8px 16px',
                        backgroundColor: '#FF3366',
                        color: 'white',
                        border: 'none',
                        borderRadius: '20px',
                        fontSize: '0.9rem',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      Export
                    </button>
                    <div 
                      id="exportDropdown"
                      style={{
                        position: 'absolute',
                        top: '100%',
                        right: 0,
                        backgroundColor: 'white',
                        borderRadius: '12px',
                        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.1)',
                        padding: '10px',
                        display: 'none',
                        zIndex: 1000
                      }}
                    >
                      <button
                        onClick={exportToPDF}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          color: '#333',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          width: '100%',
                          textAlign: 'left'
                        }}
                      >
                        Export as PDF
                      </button>
                      <button
                        onClick={exportToWord}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: 'transparent',
                          color: '#333',
                          border: 'none',
                          borderRadius: '20px',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          width: '100%',
                          textAlign: 'left'
                        }}
                      >
                        Export as Word
                      </button>
                    </div>
                  </div>
                </div>

                {/* Generate Another Button */}
                <div style={{
                  marginTop: '30px',
                  paddingTop: '30px',
                  borderTop: '1px solid #eee',
                  textAlign: 'center'
                }}>
                  <button
                    onClick={handleGenerateAnother}
                    style={{
                      padding: '12px 24px',
                      backgroundColor: '#FF3366',
                      color: 'white',
                      border: 'none',
                      borderRadius: '20px',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      transition: 'all 0.2s',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(255, 51, 102, 0.2)'
                    }}
                  >
                    <span style={{ fontSize: '1.2rem' }}>✨</span>
                    Generate Another Script
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Saved Scripts Section - Near footer */}
          {savedScripts.length > 0 && (
            <div style={{
              background: 'white',
              borderRadius: '20px',
              padding: '20px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              marginTop: '30px',
              width: '100%',
              boxSizing: 'border-box',
              maxWidth: '800px',
              margin: '30px auto 0'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h3 style={{
                  fontSize: '1.2rem',
                  color: '#333',
                  margin: 0
                }}>
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
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#FF3366',
                    border: '1px solid #FF3366',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  Clear All
                </button>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
                gap: '15px'
              }}>
                {savedScripts.map(script => (
                  <div
                    key={script.id}
                    style={{
                      background: 'white',
                      borderRadius: '16px',
                      padding: '15px',
                      boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                      border: '1px solid #eee',
                      transition: 'all 0.2s',
                      cursor: 'pointer',
                      ':hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <div style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'flex-start',
                      marginBottom: '10px'
                    }}>
                      <h4 style={{ 
                        color: '#333', 
                        margin: 0,
                        fontSize: '1rem',
                        fontWeight: '600',
                        maxWidth: '70%',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {script.title}
                      </h4>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteScript(script.id);
                        }}
                        style={{
                          padding: '4px 8px',
                          backgroundColor: 'transparent',
                          color: '#FF3366',
                          border: 'none',
                          borderRadius: '12px',
                          fontSize: '0.8rem',
                          cursor: 'pointer',
                          transition: 'all 0.2s',
                          ':hover': {
                            backgroundColor: '#FFF2F2'
                          }
                        }}
                      >
                        Delete
                      </button>
                    </div>
                    <div style={{
                      display: 'flex',
                      gap: '6px',
                      flexWrap: 'wrap',
                      marginBottom: '12px'
                    }}>
                      <span style={{
                        padding: '3px 6px',
                        backgroundColor: '#f8f9ff',
                        color: '#666',
                        borderRadius: '10px',
                        fontSize: '0.75rem'
                      }}>
                        {script.date}
                      </span>
                      <span style={{
                        padding: '3px 6px',
                        backgroundColor: '#f8f9ff',
                        color: '#666',
                        borderRadius: '10px',
                        fontSize: '0.75rem'
                      }}>
                        {script.type}
                      </span>
                      <span style={{
                        padding: '3px 6px',
                        backgroundColor: '#f8f9ff',
                        color: '#666',
                        borderRadius: '10px',
                        fontSize: '0.75rem'
                      }}>
                        {script.platform}
                      </span>
                    </div>
                    <div 
                      onClick={() => setExpandedScriptId(expandedScriptId === script.id ? null : script.id)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                        color: '#FF3366',
                        fontSize: '0.85rem',
                        fontWeight: '500',
                        cursor: 'pointer'
                      }}
                    >
                      {expandedScriptId === script.id ? 'Hide script ▼' : 'View script ▲'}
                    </div>

                    {/* Collapsible Script Content */}
                    {expandedScriptId === script.id && (
                      <div style={{
                        marginTop: '15px',
                        paddingTop: '15px',
                        borderTop: '1px solid #eee',
                        animation: 'slideDown 0.3s ease-out'
                      }}>
                        <div style={{
                          backgroundColor: '#f8f9ff',
                          borderRadius: '12px',
                          padding: '15px',
                          color: '#444',
                          lineHeight: '1.6',
                          fontSize: '0.9rem'
                        }}>
                          <div dangerouslySetInnerHTML={{ __html: script.script }} />
                        </div>
                        <div style={{
                          display: 'flex',
                          gap: '10px',
                          marginTop: '15px',
                          justifyContent: 'flex-end'
                        }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportToPDF(script);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: 'transparent',
                              color: '#FF3366',
                              border: '1px solid #FF3366',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
                          >
                            Export PDF
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              exportToWord(script);
                            }}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#FF3366',
                              color: 'white',
                              border: 'none',
                              borderRadius: '20px',
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              transition: 'all 0.2s'
                            }}
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
    </ProtectedRoute>
  );
} 