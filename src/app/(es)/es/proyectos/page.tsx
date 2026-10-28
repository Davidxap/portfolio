import { placeRoute } from "@/components/places/routes";

const route = placeRoute("projects", "es");
export const generateMetadata = route.generateMetadata;
export default route.Page;
