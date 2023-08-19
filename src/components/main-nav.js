import Link from "next/link";

export default function MainNav({ items }) {
  return (
    <div className="flex w-full justify-between items-center">
      <Link href={"/"} className="items-center space-x-2">
        <span className="font-bold">Record</span>
      </Link>
      {items?.length ? (
        <nav className="hidden md:flex">
          {items.map((item, index) => (
            <Link
              prefetch
              key={index}
              href={item.href}
              className="items-center space-x-2"
            >
              {item.title}
            </Link>
          ))}
        </nav>
      ) : null}
    </div>
  );
}
