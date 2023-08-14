import notion from "@/lib/notion";
import { SplitVariable } from "@/hooks/useSplitVariable";
import ReviewSlide from "@/components/review/review-slider";
import ReviewDisplaySetting from "@/components/review/review-display-setting";
import ReviewFuncSetting from "@/components/review/review-func-setting";


const notionApi = async (start) => {
  const resp = await notion.databases.query({
    database_id: "8d6ff4d3c0864d738c7b24ec93233842",
    start_cursor: start,
    sorts: [
      {
        property: "Front",
        direction: "ascending",
      },
    ],
    page_size: 100,
  });
  return resp;
};

async function fetchData() {
  let allData = [];
  let loop = true;
  let start_cursor = "";
  while (loop) {
    const data = await notionApi(start_cursor);
    if (data.has_more) {
      start_cursor = data.next_cursor ?? "";
    } else {
      loop = false;
    }
    allData = [...allData, ...data.results];
  }
  const normalizedData = allData.map((item) => SplitVariable(item));

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
