import ReviewSlide from "@/components/review/review-slider";
import ReviewDisplaySetting from "@/components/review/review-display-setting";
import ReviewFuncSetting from "@/components/review/review-func-setting";
import { getAllVocab } from "@/lib/api";

export default async function ReviewPage({}) {
  const data = await getAllVocab();

  return (
    <>
      <section className="container flex pt-6 pb-8 md:pt-10 md:pb-12 lg:pt-16">
        <div className="grid w-full h-full py-8 relative gap-8">
          <>
            <div className="mx-auto w-full min-h-[300px]">
              <ReviewSlide data={data} />
            </div>
            <div className="flex justify-center gap-6 mt-6">
              <ReviewDisplaySetting />
              <ReviewFuncSetting />
            </div>
          </>
        </div>
      </section>
    </>
  );
}

export const dynamic = "force-dynamic";
