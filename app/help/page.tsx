import { type Metadata } from "next";
import HelpClient from "./HelpClient";

export const metadata: Metadata = {
  title: "Help",
  description: "Guides and support for your Linkhub workspace.",
};

export default function HelpPage() {
  return <HelpClient />;
}
