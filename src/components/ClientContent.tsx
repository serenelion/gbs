'use client';

import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import OpportunityForm from './opportunity/OpportunityForm';
import OpportunityFeed from './opportunity/OpportunityFeed';

export default function ClientContent() {
  useEffect(() => {
    const formContainer = document.getElementById('opportunity-form');
    const feedContainer = document.getElementById('opportunity-feed');

    if (formContainer && !formContainer.hasChildNodes()) {
      const formRoot = createRoot(formContainer);
      formRoot.render(<OpportunityForm />);
    }

    if (feedContainer && !feedContainer.hasChildNodes()) {
      const feedRoot = createRoot(feedContainer);
      feedRoot.render(<OpportunityFeed />);
    }
  }, []);

  return null;
} 