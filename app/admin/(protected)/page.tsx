import { AdminList } from "@/components/admin/admin-list";
import { getAllVocabFresh } from "@/lib/api";
import { logoutAction } from "../login/actions";

export default async function AdminPage() {
  const data = await getAllVocabFresh();
  return <AdminList data={data} logoutAction={logoutAction} />;
}

export const dynamic = "force-dynamic";
