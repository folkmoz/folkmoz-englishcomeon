export default async function VocabInsideLayout({ children }) {
  return (
    <div className="flex-1 flex justify-center items-center">
      <div className="w-full max-w-lg h-full flex flex-col">
        <div className="flex-1 md:pt-28">{children}</div>
      </div>
    </div>
  );
}
