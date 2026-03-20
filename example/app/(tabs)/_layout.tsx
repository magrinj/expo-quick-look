import { NativeTabs } from "expo-router/unstable-native-tabs";

export default function TabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Icon sf="doc.viewfinder" md="preview" />
        <NativeTabs.Trigger.Label>Preview</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="thumbnails">
        <NativeTabs.Trigger.Icon sf="photo.on.rectangle" md="image" />
        <NativeTabs.Trigger.Label>Thumbnails</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="events">
        <NativeTabs.Trigger.Icon sf="list.bullet.rectangle" md="event_note" />
        <NativeTabs.Trigger.Label>Events</NativeTabs.Trigger.Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
