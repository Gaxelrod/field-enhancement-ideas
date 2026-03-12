import type { EmailFieldProps } from './types';
import { defaultEmailProps } from './types';

export interface Preset {
  name: string;
  props: Partial<EmailFieldProps>;
}

export const EMAIL_PRESETS: Preset[] = [
  {
    name: 'Minimal',
    props: {
      label: 'Email',
      placeholder: 'you@example.com',
      showLabel: true,
      validation: 'none',
    },
  },
  {
    name: 'With Validation',
    props: {
      label: 'Email address',
      placeholder: 'you@example.com',
      showLabel: true,
      validation: 'real-time',
      showSuccessState: true,
    },
  },
  {
    name: 'Domain Suggest',
    props: {
      label: 'Your email',
      placeholder: 'you@example.com',
      showLabel: true,
      domainSuggest: true,
      validation: 'on-blur',
    },
  },
  {
    name: 'Floating Label',
    props: {
      label: 'Email address',
      placeholder: 'you@example.com',
      showLabel: true,
      floatingLabel: true,
      borderStyle: 'filled',
      validation: 'on-blur',
      showSuccessState: true,
    },
  },
  {
    name: 'With Confirmation',
    props: {
      label: 'Email',
      placeholder: 'you@example.com',
      showLabel: true,
      confirmField: true,
      validation: 'on-blur',
    },
  },
  {
    name: 'Icon + Underline',
    props: {
      label: 'Email',
      placeholder: 'Enter your email',
      showLabel: true,
      showIcon: true,
      iconPosition: 'left',
      borderStyle: 'underline',
      validation: 'real-time',
      showSuccessState: true,
    },
  },
  {
    name: 'Icon + Underline + Suggest',
    props: {
      label: 'Email',
      placeholder: 'Enter your email',
      showLabel: true,
      showIcon: true,
      iconPosition: 'left',
      borderStyle: 'underline',
      validation: 'real-time',
      showSuccessState: true,
      domainSuggest: true,
    },
  },
];

export function applyPreset(preset: Preset): EmailFieldProps {
  return { ...defaultEmailProps, ...preset.props };
}
