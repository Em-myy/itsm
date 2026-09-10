import { fetchFromGo } from "@/lib/api-server";
import { UserType } from "@/lib/types";
import UserClientPage from "./UserClientPage";

const UserPage = async () => {
  const users = (await fetchFromGo("/users")) as UserType[] | [];

  return <UserClientPage initialUsers={users} />;
};

export default UserPage;
