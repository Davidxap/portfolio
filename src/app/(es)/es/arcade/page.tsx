import { placeRoute } from "@/components/places/routes";

const route = placeRoute("arcade", "es");
export const generateMetadata = route.generateMetadata;
export default route.Page;
