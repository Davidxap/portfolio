import { directRoute } from "@/components/places/routes";

const route = directRoute("en");
export const generateMetadata = route.generateMetadata;
export default route.Page;
