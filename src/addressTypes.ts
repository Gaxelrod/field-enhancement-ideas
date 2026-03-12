export interface AddressFieldProps {
  label: string;
  placeholder: string;
  helperText: string;
  showLabel: boolean;
  showIcon: boolean;
  size: 'sm' | 'md' | 'lg';
  borderStyle: 'outlined' | 'filled' | 'underline';
  borderRadius: number;
  showSubFields: boolean;
  showCountry: boolean;
}

export const defaultAddressProps: AddressFieldProps = {
  label: 'Address',
  placeholder: 'Start typing an address...',
  helperText: '',
  showLabel: true,
  showIcon: true,
  size: 'md',
  borderStyle: 'outlined',
  borderRadius: 6,
  showSubFields: true,
  showCountry: false,
};

export interface AddressVariation {
  id: string;
  name: string;
  starred: boolean;
  props: AddressFieldProps;
}
