import { Slot } from "expo-router";
import { StatusBar } from "expo-status-bar";
import { EventProvider } from "../lib/events";

export default function RootLayout() {
  return (
    <EventProvider>
      <StatusBar style="dark" />
      <Slot />
    </EventProvider>
  );
}
