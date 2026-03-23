import { createContext, useContext, useCallback, useState } from "react";
import type { ReactNode } from "react";

type EventContextType = {
  events: string[];
  log: (msg: string) => void;
  clear: () => void;
};

const EventContext = createContext<EventContextType>({
  events: [],
  log: () => {},
  clear: () => {},
});

export function EventProvider({ children }: { children: ReactNode }) {
  const [events, setEvents] = useState<string[]>([]);

  const log = useCallback((msg: string) => {
    setEvents((prev) => [
      `[${new Date().toLocaleTimeString()}] ${msg}`,
      ...prev,
    ]);
  }, []);

  const clear = useCallback(() => {
    setEvents([]);
  }, []);

  return <EventContext value={{ events, log, clear }}>{children}</EventContext>;
}

export function useEvents() {
  return useContext(EventContext);
}
