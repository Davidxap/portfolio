import { placeRoute } from "@/components/places/routes";

const route = placeRoute("arcade", "en");
export const generateMetadata = route.generateMetadata;
export default route.Page;
