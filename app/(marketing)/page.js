import notion from "@/lib/notion";
import VocabItem from "@/components/vocab-component/vocab-item";
import PageWrapper from "@/components/marketing/page-wrapper";

async function fetchData() {
    const data = await notion.databases.query({
        database_id: process.env.NOTION_DATABASE_ID,
        filter: {
            and: [
                {
                    timestamp: "created_time",
                    created_time: {
                        past_month: {}
                    }
                }
                ,
                {
                    property: "Front",
                    rich_text: {
                        is_not_empty: true,
                    }
                }
            ]
        }
    });
    return data;
}

export default async function IndexPage() {
    const data = await fetchData();

    return (
        <>
            <section className="container flex pt-6 pb-8 md:pt-10 md:pb-12 lg:pt-16 lg:pb-24">
                <PageWrapper>
                    {data.results.length
                        ? data.results.map((item, index) => (
                            <VocabItem key={index} item={item}/>
                        ))
                        : null}
                </PageWrapper>
            </section>
        </>
    );
}

export const revalidate = 60;
