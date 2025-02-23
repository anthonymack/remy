'use client';

import { motion } from 'framer-motion';

export default function StyleGuide() {
  const colors = [
    { name: 'background', value: 'bg-background' },
    { name: 'text', value: 'text-text' },
    { name: 'text-secondary', value: 'text-text-secondary' },
    { name: 'surface', value: 'bg-surface' },
    { name: 'border', value: 'bg-border' },
    { name: 'accent', value: 'bg-accent' },
  ];

  const dummyMessages = [
    { source: 'user', message: 'How much pepper do I need?' },
    { source: 'ai', message: 'For this recipe, you\'ll need 2 tablespoons of black pepper. Make sure it\'s freshly ground for the best flavor!' },
    { source: 'user', message: 'Okay, got it.' },
    { source: 'ai', message: 'Great! Let me know if you have any other questions about the ingredients or process.' },
  ];

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-container"
    >
      <div className="max-w-3xl mx-auto py-16">
        <h1 className="heading-xxl mb-16">Style Guide</h1>

        <section className="mb-16">
          <h2 className="heading-xl mb-8">Typography</h2>
          
          <div className="space-y-8">
            <div>
              <p className="body-base mb-2 text-text-secondary">heading-logo</p>
              <h1 className="heading-logo">The quick brown fox</h1>
            </div>

            <div>
              <p className="body-base mb-2 text-text-secondary">heading-xl</p>
              <h1 className="heading-xl">The quick brown fox</h1>
            </div>

            <div>
              <p className="body-base mb-2 text-text-secondary">heading-lg</p>
              <h2 className="heading-lg">The quick brown fox</h2>
            </div>

            <div>
              <p className="body-base mb-2 text-text-secondary">body-lg</p>
              <p className="body-lg">The quick brown fox jumps over the lazy dog</p>
            </div>

            <div>
              <p className="body-base mb-2 text-text-secondary">body-base</p>
              <p className="body-base">The quick brown fox jumps over the lazy dog</p>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="heading-xl mb-8">Colors</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {colors.map(color => (
              <div key={color.name} className="rounded-lg overflow-hidden border border-border">
                <div className={`h-24 ${color.value}`} />
                <div className="p-4">
                  <p className="body-base">{color.name}</p>
                  <code className="text-sm text-text-secondary">{color.value}</code>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="mb-16">
          <h2 className="heading-xl mb-8">Buttons</h2>
          
          <div className="space-y-4">
            <div>
              <p className="body-base mb-2 text-text-secondary">button-primary</p>
              <button className="button button-primary">Primary Button</button>
            </div>

            <div>
              <p className="body-base mb-2 text-text-secondary">button-secondary</p>
              <button className="button button-secondary">Secondary Button</button>
            </div>

            <div>
              <p className="body-base mb-2 text-text-secondary">action-button primary</p>
              <button className="action-button primary">Action Primary</button>
            </div>

            <div>
              <p className="body-base mb-2 text-text-secondary">action-button secondary</p>
              <button className="action-button secondary">Action Secondary</button>
            </div>
          </div>
        </section>

        <section className="mb-16">
          <h2 className="heading-xl mb-8">Components</h2>
          
          <div className="space-y-12">
            <div>
              <p className="body-base mb-4 text-text-secondary">Chat Messages</p>
              <div className="relative h-[400px] border border-surface rounded-xl overflow-hidden">
                <div className="step-header">
                  <div className="progress-bar-container">
                    <div className="progress-bar-fill" style={{ width: '60%' }} />
                  </div>
                  <div className="mb-12">
                    <p className="body-base mb-2">Step 2</p>
                    <h2 className="heading-lg">Add the spices to the bowl and mix well.</h2>
                  </div>
                </div>

                <div className="chat-container">
                  {dummyMessages.map((msg, index) => (
                    <div key={index} className={`message-wrapper message-wrapper--${msg.source}`}>
                      <div className={`chat-message chat-message-${msg.source}`}>
                        {msg.message}
                      </div>
                    </div>
                  ))}
                </div>

                <div className="action-bar">
                  <button className="nav-button nav-button--back">
                    <svg className="back-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                      <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
                    </svg>
                  </button>
                  <button className="nav-button nav-button--speak">
                    <svg className="speak-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                      <path d="M192 0C139 0 96 43 96 96l0 160c0 53 43 96 96 96s96-43 96-96l0-160c0-53-43-96-96-96zM64 216c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 89.1 66.2 162.7 152 174.4l0 33.6-48 0c-13.3 0-24 10.7-24 24s10.7 24 24 24l72 0 72 0c13.3 0 24-10.7 24-24s-10.7-24-24-24l-48 0 0-33.6c85.8-11.7 152-85.3 152-174.4l0-40c0-13.3-10.7-24-24-24s-24 10.7-24 24l0 40c0 70.7-57.3 128-128 128s-128-57.3-128-128l0-40z"/>
                    </svg>
                  </button>
                  <button className="nav-button nav-button--next">
                    <svg className="next-icon" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512">
                      <path d="M73 39c-14.8-9.1-33.4-9.4-48.5-.9S0 62.6 0 80L0 432c0 17.4 9.4 33.4 24.5 41.9s33.7 8.1 48.5-.9L361 297c14.3-8.7 23-24.2 23-41s-8.7-32.2-23-41L73 39z"/>
                    </svg>
                  </button>
                </div>
              </div>
            </div>

            <div>
              <p className="body-base mb-2 text-text-secondary">step-indicator</p>
              <div className="flex gap-2">
                <div className="step-indicator step-indicator-active" />
                <div className="step-indicator step-indicator-inactive" />
                <div className="step-indicator step-indicator-inactive" />
              </div>
            </div>

            <div>
              <p className="body-base mb-2 text-text-secondary">ingredient-item</p>
              <div className="ingredient-item">
                <span className="ingredient-amount">2 tbsp</span>
                <span className="ingredient-name">Olive Oil</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </motion.div>
  );
} 