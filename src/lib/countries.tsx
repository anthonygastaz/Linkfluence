import React from 'react';
import countries from 'i18n-iso-countries';
import en from 'i18n-iso-countries/langs/en.json';

countries.registerLocale(en);

export interface CountryOption {
  code: string;
  name: string;
}

/** All ISO countries (English), sorted alphabetically by name. */
export const COUNTRY_OPTIONS: CountryOption[] = Object.entries(
  countries.getNames('en', { select: 'official' })
)
  .map(([code, name]) => ({ code, name }))
  .sort((a, b) => a.name.localeCompare(b.name, 'en'));

/** Default signup country — matches i18n-iso-countries English label for US. */
export const DEFAULT_COUNTRY =
  countries.getName('US', 'en', { select: 'official' }) || 'United States of America';

export function getCountrySelectOptions(currentValue?: string): CountryOption[] {
  if (!currentValue || COUNTRY_OPTIONS.some((c) => c.name === currentValue)) {
    return COUNTRY_OPTIONS;
  }
  return [{ code: 'legacy', name: currentValue }, ...COUNTRY_OPTIONS];
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}

export function CountrySelect({ value, onChange, className, id }: CountrySelectProps) {
  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {getCountrySelectOptions(value).map((c) => (
        <option key={`${c.code}-${c.name}`} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
