import { type Metadata } from "next";
import { EditorClient } from "./EditorClient";

export const metadata: Metadata = {
  title: "Open Editor",
  description: "Design your own custom theme with backgrounds, effects, and more.",
};

export default function EditorPage() {
  return <EditorClient />;
}
