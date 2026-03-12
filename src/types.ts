export interface EmailVariation {
  id: string;
  name: string;
  starred: boolean;
  props: EmailFieldProps;
}

export interface EmailFieldProps {
  label: string;
  placeholder: string;
  helperText: string;
  showLabel: boolean;
  floatingLabel: boolean;
  showIcon: boolean;
  iconPosition: 'left' | 'right';
  validation: 'none' | 'on-blur' | 'real-time';
  showSuccessState: boolean;
  confirmField: boolean;
  domainSuggest: boolean;
  autoComplete: boolean;
  size: 'sm' | 'md' | 'lg';
  borderStyle: 'outlined' | 'filled' | 'underline';
  borderRadius: number;
  required: boolean;
  requiredIndicator: 'asterisk' | 'text' | 'none';
  errorStyle: 'inline' | 'tooltip';
}

export const defaultEmailProps: EmailFieldProps = {
  label: 'Email',
  placeholder: 'you@example.com',
  helperText: '',
  showLabel: true,
  floatingLabel: false,
  showIcon: false,
  iconPosition: 'left',
  validation: 'none',
  showSuccessState: false,
  confirmField: false,
  domainSuggest: false,
  autoComplete: true,
  size: 'md',
  borderStyle: 'outlined',
  borderRadius: 6,
  required: false,
  requiredIndicator: 'asterisk',
  errorStyle: 'inline',
};
