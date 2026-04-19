import { RecordClient } from "@/components/commonplace/record-client";
import { getAllVocab } from "@/lib/api";

export default async function RecordPage() {
  const data = await getAllVocab();
  return <RecordClient data={data} />;
}

export const revalidate = 60;
