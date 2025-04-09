import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();
  const [openFaq, setOpenFaq] = React.useState(null);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column'
    }}>
      <Navigation />
      
      <main style={{
        flex: '1',
        paddingTop: '80px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <section style={{
          background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
          padding: '4rem 1rem',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 3rem)',
              marginBottom: '1.5rem',
              color: '#333'
            }}>
              Create Viral Videos in Minutes
            </h1>
            <p style={{
              fontSize: 'clamp(1rem, 3vw, 1.25rem)',
              color: '#666',
              marginBottom: '2rem',
              lineHeight: '1.6'
            }}>
              Transform your ideas into engaging video scripts with AI. Perfect for YouTube, TikTok, Instagram, and moree!
            </p>
            <button
              onClick={() => router.push('/generate')}
              style={{
                background: '#FF3366',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '8px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'transform 0.2s ease, background 0.2s ease',
                ':hover': {
                  background: '#FF1A53',
                  transform: 'translateY(-2px)'
                }
              }}
            >
              Start Creating Now
            </button>
          </div>
        </section>

        <section style={{
          padding: '4rem 1rem',
          background: '#fff'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto',
            textAlign: 'center'
          }}>
            <h2 style={{
              fontSize: 'clamp(1.5rem, 4vw, 2rem)',
              marginBottom: '3rem',
              color: '#333'
            }}>
              Why Choose Our Script Generator?
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '2rem',
              padding: '0 1rem'
            }}>
              <div style={{
                padding: '2rem',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease',
                ':hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <h3 style={{ color: '#333', marginBottom: '1rem' }}>AI-Powered Writing</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Advanced AI technology that understands viral content patterns and creates engaging scripts.
                </p>
              </div>
              <div style={{
                padding: '2rem',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease',
                ':hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <h3 style={{ color: '#333', marginBottom: '1rem' }}>Platform Optimized</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Scripts tailored for different social media platforms and their specific requirements.
                </p>
              </div>
              <div style={{
                padding: '2rem',
                background: '#fff',
                borderRadius: '12px',
                boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease',
                ':hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <h3 style={{ color: '#333', marginBottom: '1rem' }}>Quick & Easy</h3>
                <p style={{ color: '#666', lineHeight: '1.6' }}>
                  Generate professional scripts in minutes, saving you hours of writing and planning.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" style={{
          padding: '60px 20px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          <h2 style={{
            fontSize: '2rem',
            textAlign: 'center',
            marginBottom: '40px',
            color: '#333'
          }}>
            Frequently Asked Questions
          </h2>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}>
            {[
              {
                question: 'How does the script generator work?',
                answer: 'Our AI-powered script generator analyzes successful viral content patterns and creates engaging scripts tailored to your chosen platform and style.'
              },
              {
                question: 'Which platforms are supported?',
                answer: 'We support all major social media platforms including YouTube, TikTok, Instagram, and Facebook.'
              },
              {
                question: 'Can I edit the generated scripts?',
                answer: 'Yes! All generated scripts are fully editable and customizable to match your voice and style.'
              },
              {
                question: 'Is there a free plan available?',
                answer: 'Yes, you can try our script generator for free with limited features. Premium plans unlock additional capabilities.'
              }
            ].map((faq, index) => (
              <div 
                key={index} 
                onClick={() => setOpenFaq(openFaq === index ? null : index)}
                style={{
                  background: 'white',
                  borderRadius: '12px',
                  boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                  cursor: 'pointer',
                  transition: 'all 0.3s ease'
                }}
              >
                <div style={{
                  padding: '20px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  gap: '20px'
                }}>
                  <h3 style={{
                    fontSize: '1.1rem',
                    color: '#333',
                    fontWeight: '500',
                    margin: 0
                  }}>
                    {faq.question}
                  </h3>
                  <div style={{
                    color: '#FF3366',
                    transform: openFaq === index ? 'rotate(180deg)' : 'rotate(0)',
                    transition: 'transform 0.3s ease'
                  }}>
                    ▼
                  </div>
                </div>
                <div style={{
                  padding: openFaq === index ? '0 20px 20px' : '0 20px',
                  maxHeight: openFaq === index ? '200px' : '0',
                  overflow: 'hidden',
                  transition: 'all 0.3s ease',
                  opacity: openFaq === index ? 1 : 0
                }}>
                  <p style={{
                    color: '#666',
                    lineHeight: '1.6',
                    margin: 0
                  }}>
                    {faq.answer}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
  }
  