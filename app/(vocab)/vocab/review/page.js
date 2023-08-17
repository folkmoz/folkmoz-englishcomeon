import notion from "@/lib/notion";
import {SplitVariable} from "@/hooks/useSplitVariable";
import ReviewSlide from "@/components/review/review-slider";
import ReviewDisplaySetting from "@/components/review/review-display-setting";
import ReviewFuncSetting from "@/components/review/review-func-setting";


const notionApi = async (start) => {
  return await notion.databases.query({
    database_id: process.env.NOTION_DATABASE_ID,
    start_cursor: start || undefined,
    sorts: [
      {
        property: "Front",
        direction: "ascending",
      },
    ],
    filter: {
        property: "Front",
        rich_text: {
            is_not_empty: true,
        }
    }
  });
};

async function fetchData() {
  let allData = [];
  let loop = true;
  let start_cursor = "";
  while (loop) {
    const response = await notionApi(start_cursor);
    if (response.has_more) {
      start_cursor = response.next_cursor ?? "";
    } else {
      loop = false;
    }
    allData = [...allData, ...response.results];
  }
  const normalizedData = allData
    .map((item) => SplitVariable(item))

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
