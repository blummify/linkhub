import { type Metadata } from "next";
import UserAdminClient from "./UserAdminClient";

export const metadata: Metadata = {
  title: "User Admin",
};

export default function UserAdminPage() {
  return <UserAdminClient />;
}
