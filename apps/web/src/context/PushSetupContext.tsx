import { createContext, useContext, type ReactNode } from "react";
import { usePushSetup, type PushSetupStatus } from "@/hooks/usePushSetup";

interface PushSetupContextValue {
  status: PushSetupStatus;
  enablePush: () => Promise<boolean>;
}

const PushSetupContext = createContext<PushSetupContextValue | null>(null);

export function PushSetupProvider({
  enabled,
  children,
}: {
  enabled: boolean;
  children: ReactNode;
}) {
  const { status, enablePush } = usePushSetup(enabled);
  return (
    <PushSetupContext.Provider value={{ status, enablePush }}>
      {children}
    </PushSetupContext.Provider>
  );
}

export function usePushSetupContext(): PushSetupContextValue | null {
  return useContext(PushSetupContext);
}
