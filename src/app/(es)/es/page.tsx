import { JsonLd } from "@/components/JsonLd";
import { PlaceView } from "@/components/world/PlaceView";
import { WorldIntro } from "@/components/world/WorldIntro";
import { homePath, useT } from "@/i18n/ui";
import { pageMetadata } from "@/lib/seo";

const t = useT("es");
export const generateMetadata = () => pageMetadata({ locale: "es", path: homePath("es"), title: t("meta.title"), description: t("meta.description") });

export default function Page() {
  return (<><JsonLd locale="es" path={homePath("es")} title={t("meta.title")} description={t("meta.description")} /><PlaceView><WorldIntro locale="es" /></PlaceView></>);
}
