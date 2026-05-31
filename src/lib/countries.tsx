import React, { useEffect, useState } from 'react';

export interface CountryOption {
  code: string;
  name: string;
}

/** Default signup country (matches i18n-iso-countries US official name). */
export const DEFAULT_COUNTRY = 'United States of America';

let cachedOptions: CountryOption[] | null = null;
let loadPromise: Promise<CountryOption[]> | null = null;

async function loadCountryOptions(): Promise<CountryOption[]> {
  if (cachedOptions) return cachedOptions;
  if (!loadPromise) {
    loadPromise = Promise.all([
      import('i18n-iso-countries'),
      import('i18n-iso-countries/langs/en.json'),
    ]).then(([countriesMod, enMod]) => {
      const countries = countriesMod.default;
      countries.registerLocale(enMod.default);
      cachedOptions = Object.entries(countries.getNames('en', { select: 'official' }))
        .map(([code, name]) => ({ code, name }))
        .sort((a, b) => a.name.localeCompare(b.name, 'en'));
      return cachedOptions;
    });
  }
  return loadPromise;
}

export function getCountrySelectOptions(
  all: CountryOption[],
  currentValue?: string
): CountryOption[] {
  if (!currentValue || all.some((c) => c.name === currentValue)) {
    return all;
  }
  return [{ code: 'legacy', name: currentValue }, ...all];
}

interface CountrySelectProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  id?: string;
}

export function CountrySelect({ value, onChange, className, id }: CountrySelectProps) {
  const [options, setOptions] = useState<CountryOption[]>(() =>
    value ? [{ code: 'legacy', name: value }] : [{ code: 'US', name: DEFAULT_COUNTRY }]
  );

  useEffect(() => {
    let cancelled = false;
    void loadCountryOptions().then((all) => {
      if (!cancelled) setOptions(getCountrySelectOptions(all, value));
    });
    return () => {
      cancelled = true;
    };
  }, [value]);

  return (
    <select
      id={id}
      className={className}
      value={value}
      onChange={(e) => onChange(e.target.value)}
    >
      {options.map((c) => (
        <option key={`${c.code}-${c.name}`} value={c.name}>
          {c.name}
        </option>
      ))}
    </select>
  );
}
