import { getSiteSettings } from "@/lib/siteSettings";
import { AnnouncementBarClient } from "@/components/AnnouncementBarClient";

export async function AnnouncementBar() {
  const settings = await getSiteSettings();
  if (!settings.announcementActive || settings.announcements.length === 0) return null;
  return <AnnouncementBarClient announcements={settings.announcements} />;
}
