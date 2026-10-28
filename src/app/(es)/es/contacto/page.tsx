import { placeRoute } from "@/components/places/routes";

const route = placeRoute("contact", "es");
export const generateMetadata = route.generateMetadata;
export default route.Page;
