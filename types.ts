import { ReactElement } from 'react';

export interface FormData {
  fullName: string;
  jobTitle: string;
  company: string;
  email: string;
  phone: string;
  website: string;
  address: string;
  linkedin: string;
  twitter: string;
  instagram: string;
  facebook: string;
  tagline: string;
  calendarUrl: string;
  calendarText: string;
}

export interface BrandColors {
  primary: string;
  secondary: string;
  text: string;
  background: string;
}

export enum TemplateId {
  Modern = 'modern',
  Minimalist = 'minimalist',
  Classic = 'classic',
  Vertical = 'vertical',
  Compact = 'compact',
  SocialFocus = 'social-focus',
}

export interface Template {
  id: TemplateId;
  name: string;
  component: React.FC<{ colors: BrandColors }>;
}

export interface Signature {
  id: string;
  name: string;
  html: string;
}