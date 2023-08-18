import ReviewSlide from "@/components/review/review-slider";
import ReviewDisplaySetting from "@/components/review/review-display-setting";
import ReviewFuncSetting from "@/components/review/review-func-setting";
import {headers} from "next/headers";
import Stacks from "@/components/review/mobile/stacks";
import {getAllVocab} from "@/lib/api";

/*const notionApi = async (start) => {
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
      },
    },
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
  const normalizedData = allData.map((item) => SplitVariable(item));

  return normalizedData;
}*/

export default async function ReviewPage({}) {
  const data = await getAllVocab();
  const headersList = headers();
  const userAgent = headersList.get("user-agent");

  const isMobile = Boolean(
    userAgent.match(
      /Android|BlackBerry|iPhone|iPad|iPod|Opera Mini|IEMobile|WPDesktop/i,
    ),
  );

  return (
    <>
      <section className="container flex pt-6 pb-8 md:pt-10 md:pb-12 lg:pt-16">
        <div className="grid w-full h-full py-8 relative gap-8">
          {isMobile ? (
            <Stacks data={data} />
          ) : (
            <>
              <div className="mx-auto w-full min-h-[300px]">
                <ReviewSlide data={data} />
              </div>
              <div className="flex justify-center gap-6 mt-6">
                <ReviewDisplaySetting />
                <ReviewFuncSetting />
              </div>
            </>
          )}
        </div>
      </section>
    </>
  );
}

export const dynamic = "force-dynamic";
