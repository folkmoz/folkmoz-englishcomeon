import MainNav from "@/components/main-nav";
import { marketingConfig } from "@/config/marketing";

export default async function MarketingLayout({ children }) {
  return (
    <>
      <div className="flex min-h-screen flex-col">
        <header className="w-full bg-white border-b border-b-slate-200 px-6">
          <div className="max-w-screen-2xl mx-auto  flex h-16 items-center justify-between py-4">
            <MainNav items={marketingConfig.mainNav} />
          </div>
        </header>
        <main className="flex-1">{children}</main>
      </div>
    </>
  );
}
