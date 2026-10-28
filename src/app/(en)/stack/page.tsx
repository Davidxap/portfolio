import { placeRoute } from "@/components/places/routes";

const route = placeRoute("stack", "en");
export const generateMetadata = route.generateMetadata;
export default route.Page;
