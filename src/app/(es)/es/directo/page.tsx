import { directRoute } from "@/components/places/routes";

const route = directRoute("es");
export const generateMetadata = route.generateMetadata;
export default route.Page;
