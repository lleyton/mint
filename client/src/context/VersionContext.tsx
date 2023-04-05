import { createContext, ReactNode, useState } from 'react';

export type VersionInterface = {
  selectedVersion: string;
  setSelectedVersion: (version: string) => void;
};

export const VersionContext = createContext({
  selectedVersion: '',
  setSelectedVersion: () => {
    return;
  },
} as VersionInterface);

export function VersionContextController({
  versionOptions,
  children,
}: {
  versionOptions?: string[];
  children: ReactNode;
}) {
  const defaultVersion =
    Array.isArray(versionOptions) && versionOptions.length > 0 ? versionOptions[0] : '';
  const [selectedVersion, setSelectedVersion] = useState<string>(defaultVersion);

  return (
    <VersionContext.Provider value={{ setSelectedVersion, selectedVersion }}>
      {children}
    </VersionContext.Provider>
  );
}
