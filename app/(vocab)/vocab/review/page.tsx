import { ReviewClient } from "@/components/commonplace/review-client";
import { getAllVocab } from "@/lib/api";

export default async function ReviewPage() {
  const data = await getAllVocab();
  return <ReviewClient data={data} />;
}

export const revalidate = 60;
