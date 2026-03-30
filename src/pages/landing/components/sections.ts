import type { FC } from 'react';
import { HeroSection } from './hero/HeroSection';
import { FeatureExplorer } from './features/FeatureExplorer';
import { FeatureDragDrop } from './features/FeatureDragDrop';
import { FeatureContextMenu } from './features/FeatureContextMenu';
import { FeaturePreview } from './features/FeaturePreview';
import { FeatureCamera } from './features/FeatureCamera';
import { FooterCTA } from './footer/FooterCTA';

export const LANDING_SECTIONS: FC[] = [
  HeroSection,
  FeatureExplorer,
  FeatureDragDrop,
  FeatureContextMenu,
  FeaturePreview,
  FeatureCamera,
  FooterCTA,
];
