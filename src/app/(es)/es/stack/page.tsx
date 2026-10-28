import { placeRoute } from "@/components/places/routes";

const route = placeRoute("stack", "es");
export const generateMetadata = route.generateMetadata;
export default route.Page;
