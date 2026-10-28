import { gameRoute } from "@/components/places/routes";

const route = gameRoute("es");
export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
