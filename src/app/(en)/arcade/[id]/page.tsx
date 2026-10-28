import { gameRoute } from "@/components/places/routes";

const route = gameRoute("en");
export const dynamicParams = false;
export const generateStaticParams = route.generateStaticParams;
export const generateMetadata = route.generateMetadata;
export default route.Page;
