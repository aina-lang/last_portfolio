import PortfolioClient from "./PortfolioClient";
import { CONTENT } from "../lib/content";

export default function Page() {
  return <PortfolioClient data={CONTENT} />;
}
