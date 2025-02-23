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

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="page-container"
    >
      <div className="max-w-4xl mx-auto">
        <h1 className="heading-logo mb-12">Style Guide</h1>

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
          
          <div className="space-y-8">
            <div>
              <p className="body-base mb-2 text-text-secondary">chat-message assistant</p>
              <div className="chat-message chat-message-assistant">
                This is an assistant message
              </div>
            </div>

            <div>
              <p className="body-base mb-2 text-text-secondary">chat-message user</p>
              <div className="chat-message chat-message-user">
                This is a user message
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