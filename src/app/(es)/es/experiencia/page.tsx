import { placeRoute } from "@/components/places/routes";

const route = placeRoute("experience", "es");
export const generateMetadata = route.generateMetadata;
export default route.Page;
