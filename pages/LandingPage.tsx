import React from 'react';
import { landingConfig } from '../landing/config';
import { Hero, Stats, FeatureGrid, Governance, Footer } from '../landing';

export default function LandingPage() {
  return (
    <div className="landing-page-container">
      {landingConfig.hero && <Hero />}
      {landingConfig.stats && <Stats />}
      {landingConfig.features && <FeatureGrid />}
      {landingConfig.governance && <Governance />}
      {landingConfig.footer && <Footer />}
    </div>
  );
}