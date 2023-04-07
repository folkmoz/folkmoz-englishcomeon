import notion from "@/lib/notion";
import { SplitVariable } from "@/hooks/useSplitVariable";
import ReviewSlide from "@/components/review/review-slider";
import ReviewDisplaySetting from "@/components/review/review-display-setting";
import ReviewFuncSetting from "@/components/review/review-func-setting";

async function fetchData() {
  const data = await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    sorts: [
      {
        property: "Front",
        direction: "ascending",
      },
    ],
  });

  const normalizedData = data.results.map((item) => SplitVariable(item));

  return normalizedData;
}
export default async function ReviewPage({}) {
  const data = await fetchData();
  return (
    <>
      <section className="container flex pt-6 pb-8 md:pt-10 md:pb-12 lg:pt-16 lg:pb-24">
        <div className="grid w-full h-full py-8">
          <div className="max-w-lg mx-auto w-full relative min-h-[300px]">
            <ReviewSlide data={data} />
          </div>
          <div className="flex justify-center gap-6 mt-6">
            <ReviewDisplaySetting />
            <ReviewFuncSetting />
          </div>
        </div>
      </section>
    </>
  );
}

export const revalidate = 60;
