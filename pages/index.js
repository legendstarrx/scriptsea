import React from 'react';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useRouter } from 'next/router';
import { useAuthRedirect } from '../hooks/useAuthRedirect';

export default function Home() {
  useAuthRedirect();
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
        paddingTop: '37px',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* Hero Section */}
        <section style={{
          background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
          padding: '4rem 1rem',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto',
            position: 'relative',
            zIndex: 1
          }}>
            <div style={{
              display: 'inline-block',
              background: '#FFE5EC',
              color: '#FF3366',
              padding: '0.5rem 1rem',
              borderRadius: '20px',
              fontSize: '0.9rem',
              fontWeight: '500',
              marginBottom: '1.5rem'
            }}>
              Used by 10,000+ Content Creators
            </div>

            <h1 style={{
              fontSize: 'clamp(2rem, 5vw, 2.5rem)',
              marginBottom: '1.5rem',
              color: '#333',
              fontWeight: '700',
              lineHeight: '1.2'
            }}>
              Generate <span style={{ color: '#FF3366' }}>Viral-Ready Scripts</span> in Seconds
            </h1>

            <p style={{
              fontSize: 'clamp(1rem, 2vw, 1.1rem)',
              color: '#666',
              marginBottom: '2rem',
              maxWidth: '600px',
              margin: '0 auto 2rem'
            }}>
              Turn your ideas into engaging scripts that hook viewers instantly. Used by creators who generate millions of views.
            </p>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem',
              alignItems: 'center'
            }}>
              <button
                onClick={() => router.push('/register')}
                style={{
                  background: '#FF3366',
                  color: 'white',
                  border: 'none',
                  padding: '1rem 2rem',
                  borderRadius: '12px',
                  fontSize: '1.1rem',
                  fontWeight: '600',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  boxShadow: '0 4px 15px rgba(255, 51, 102, 0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
              >
                Start Creating Now
                <span style={{ fontSize: '1.2rem' }}>→</span>
              </button>
              <p style={{
                fontSize: '0.9rem',
                color: '#666'
              }}>
                <span style={{ fontWeight: '600', color: '#FF3366' }}>Special Offer:</span> 50% off your first month
              </p>
            </div>

            {/* Stats Section */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '2rem',
              marginTop: '3rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: '#FF3366',
                  marginBottom: '0.5rem' 
                }}>
                  30s
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#666' 
                }}>
                  Average Script Time
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: '#FF3366',
                  marginBottom: '0.5rem' 
                }}>
                  1M+
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#666' 
                }}>
                  Scripts Generated
                </div>
              </div>
              <div style={{ textAlign: 'center' }}>
                <div style={{ 
                  fontSize: '2rem', 
                  fontWeight: '700', 
                  color: '#FF3366',
                  marginBottom: '0.5rem' 
                }}>
                  97%
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: '#666' 
                }}>
                  Success Rate
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section style={{
          padding: '4rem 1rem',
          background: '#fff'
        }}>
          <div style={{
            maxWidth: '1200px',
            margin: '0 auto'
          }}>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
              gap: '2rem',
              padding: '0 1rem'
            }}>
              <div style={{
                padding: '2rem',
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease',
                ':hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <div style={{ 
                  color: '#FF3366', 
                  fontSize: '1.5rem', 
                  marginBottom: '1rem' 
                }}>⚡</div>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '1rem', 
                  fontSize: '1.2rem', 
                  fontWeight: '600' 
                }}>
                  AI-Powered Viral Formulas
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: '1.6' 
                }}>
                  Proven patterns from millions of viral videos, optimized for maximum engagement.
                </p>
              </div>
              <div style={{
                padding: '2rem',
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease',
                ':hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <div style={{ 
                  color: '#FF3366', 
                  fontSize: '1.5rem', 
                  marginBottom: '1rem' 
                }}>🎯</div>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '1rem', 
                  fontSize: '1.2rem', 
                  fontWeight: '600' 
                }}>
                  Platform-Optimized
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: '1.6' 
                }}>
                  Custom-tailored for YouTube, TikTok, and Instagram algorithms.
                </p>
              </div>
              <div style={{
                padding: '2rem',
                background: '#fff',
                borderRadius: '16px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                transition: 'transform 0.2s ease',
                ':hover': {
                  transform: 'translateY(-5px)'
                }
              }}>
                <div style={{ 
                  color: '#FF3366', 
                  fontSize: '1.5rem', 
                  marginBottom: '1rem' 
                }}>🚀</div>
                <h3 style={{ 
                  color: '#333', 
                  marginBottom: '1rem', 
                  fontSize: '1.2rem', 
                  fontWeight: '600' 
                }}>
                  Instant Results
                </h3>
                <p style={{ 
                  color: '#666', 
                  lineHeight: '1.6' 
                }}>
                  Generate engaging scripts in seconds, not hours. Focus on creating.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" style={{
          padding: '4rem 1rem',
          background: '#f8f9ff'
        }}>
          <div style={{
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              textAlign: 'center',
              marginBottom: '3rem',
              color: '#333'
            }}>
              Common Questions
            </h2>
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '1rem'
            }}>
              {[
                {
                  question: 'How quickly can I create viral content?',
                  answer: 'Generate engaging scripts in under 30 seconds. Our AI uses proven formulas that consistently go viral.'
                },
                {
                  question: 'What makes your scripts different?',
                  answer: 'We analyze millions of viral videos to identify exactly what makes content shareable and engaging.'
                },
                {
                  question: 'Which platforms do you support?',
                  answer: 'YouTube, TikTok, Instagram, and more. Each script is optimized for your chosen platform.'
                },
                {
                  question: 'Can this really grow my channel?',
                  answer: 'Our users regularly see 300%+ growth within months by following our viral formulas.'
                }
              ].map((faq, index) => (
                <div 
                  key={index} 
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  style={{
                    background: 'white',
                    borderRadius: '16px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease'
                  }}
                >
                  <div style={{
                    padding: '1.5rem',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    gap: '1rem'
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
                    padding: openFaq === index ? '0 1.5rem 1.5rem' : '0 1.5rem',
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
          </div>
        </section>

        {/* CTA Section */}
        <section style={{
          padding: '4rem 1rem',
          background: 'linear-gradient(135deg, #fff5f7 0%, #ffffff 100%)',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '600px',
            margin: '0 auto'
          }}>
            <h2 style={{
              fontSize: '1.8rem',
              color: '#333',
              marginBottom: '1.5rem'
            }}>
              Ready to Create Viral Content?
            </h2>
            <p style={{
              color: '#666',
              marginBottom: '2rem'
            }}>
              Join thousands of creators who are already using our AI to grow their audience.
            </p>
            <button
              onClick={() => router.push('/register')}
              style={{
                background: '#FF3366',
                color: 'white',
                border: 'none',
                padding: '1rem 2rem',
                borderRadius: '12px',
                fontSize: '1.1rem',
                fontWeight: '600',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                boxShadow: '0 4px 15px rgba(255, 51, 102, 0.2)'
              }}
            >
              Start Creating Now
            </button>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
  