import { placeRoute } from "@/components/places/routes";

const route = placeRoute("about", "en");
export const generateMetadata = route.generateMetadata;
export default route.Page;
