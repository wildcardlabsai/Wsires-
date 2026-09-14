'use client';

import * as React from 'react';

/** Shared draft state + update helper passed down to every step. */
export interface OnboardingDraft {
  // Step 1
  businessName: string;
  contactName: string;
  email: string;
  phone: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  postcode: string;
  existingWebsite: string;
  description: string;
  // Step 2
  industry: string;
  industryOther: string;
  // Step 3
  services: { title: string; description?: string; price_from?: string }[];
  // Step 4
  serviceAreas: string[];
  // Step 5
  logoUrl: string;
  colourScheme: string;
  primaryColour: string;
  secondaryColour: string;
  photoUrls: string[];
  // Step 6
  templateSlug: string;
  // Step 7
  pages: string[];
  // Step 8
  languageMode: 'en' | 'cy' | 'bilingual';
  // Step 9
  aboutText: string;
  teamMembers: { name: string; role?: string; bio?: string }[];
  testimonials: { quote: string; author: string; location?: string; rating?: number }[];
  faqs: { question: string; answer: string }[];
  openingHours: { day: string; opens: string | null; closes: string | null; closed: boolean }[];
  whatsappNumber: string;
  socialLinks: { facebook?: string; instagram?: string; x?: string; linkedin?: string };
}

export const emptyDraft: OnboardingDraft = {
  businessName: '',
  contactName: '',
  email: '',
  phone: '',
  addressLine1: '',
  addressLine2: '',
  city: '',
  postcode: '',
  existingWebsite: '',
  description: '',
  industry: '',
  industryOther: '',
  services: [],
  serviceAreas: [],
  logoUrl: '',
  colourScheme: 'cymru-red',
  primaryColour: '',
  secondaryColour: '',
  photoUrls: [],
  templateSlug: '',
  pages: ['home', 'services', 'about', 'areas', 'contact'],
  languageMode: 'en',
  aboutText: '',
  teamMembers: [],
  testimonials: [],
  faqs: [],
  openingHours: [
    { day: 'Monday', opens: '08:00', closes: '17:00', closed: false },
    { day: 'Tuesday', opens: '08:00', closes: '17:00', closed: false },
    { day: 'Wednesday', opens: '08:00', closes: '17:00', closed: false },
    { day: 'Thursday', opens: '08:00', closes: '17:00', closed: false },
    { day: 'Friday', opens: '08:00', closes: '17:00', closed: false },
    { day: 'Saturday', opens: null, closes: null, closed: true },
    { day: 'Sunday', opens: null, closes: null, closed: true },
  ],
  whatsappNumber: '',
  socialLinks: {},
};

export interface StepProps {
  draft: OnboardingDraft;
  update: (patch: Partial<OnboardingDraft>) => void;
  errors: Record<string, string>;
}
