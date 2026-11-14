/** @jsxImportSource react */

import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';

interface CmdFocusContextValue {
  cmdFocused: boolean;
  setCmdFocused: (v: boolean) => void;
}

const CmdFocusContext = createContext<CmdFocusContextValue>({
  cmdFocused: false,
  setCmdFocused: () => {},
});

export function CmdFocusProvider({ children }: { children: ReactNode }) {
  const [cmdFocused, setCmdFocused] = useState(false);
  return (
    <CmdFocusContext.Provider value={{ cmdFocused, setCmdFocused }}>
      {children}
    </CmdFocusContext.Provider>
  );
}

export function useCmdFocus() {
  return useContext(CmdFocusContext);
}
