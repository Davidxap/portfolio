import { JsonLd } from "@/components/JsonLd";
import { PlaceView } from "@/components/world/PlaceView";
import { WorldIntro } from "@/components/world/WorldIntro";
import { homePath, useT } from "@/i18n/ui";
import { pageMetadata } from "@/lib/seo";

const t = useT("en");
export const generateMetadata = () => pageMetadata({ locale: "en", path: homePath("en"), title: t("meta.title"), description: t("meta.description") });

export default function Page() {
  return (<><JsonLd locale="en" path={homePath("en")} title={t("meta.title")} description={t("meta.description")} /><PlaceView><WorldIntro locale="en" /></PlaceView></>);
}
