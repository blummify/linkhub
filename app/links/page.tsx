import LinksClient from "./LinksClient";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Links - Creator Hub",
  description: "Manage and organize your digital presence with custom links.",
};

export default function LinksPage() {
  return <LinksClient />;
}
