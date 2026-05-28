import { type Metadata } from "next";
import MyAccountClient from "./MyAccountClient";

export const metadata: Metadata = {
  title: "My account",
};

export default function MyAccountPage() {
  return <MyAccountClient />;
}
