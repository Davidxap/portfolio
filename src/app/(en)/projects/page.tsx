import { placeRoute } from "@/components/places/routes";

const route = placeRoute("projects", "en");
export const generateMetadata = route.generateMetadata;
export default route.Page;
