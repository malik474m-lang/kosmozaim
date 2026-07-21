import Link from "next/link";
import JsonLd from "./JsonLd";

interface BreadcrumbItem {
  name: string;
  url: string;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <>
      <JsonLd type="breadcrumb" items={items} />
      <nav className="mb-6 text-sm text-gray-500" aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center">
          {items.map((item, index) => (
            <li key={item.url} className="flex items-center">
              {index > 0 && <span className="mx-2 text-gray-400">→</span>}
              {index === items.length - 1 ? (
                <span className="text-gray-700" aria-current="page">
                  {item.name}
                </span>
              ) : (
                <Link href={item.url} className="hover:text-primary transition-colors">
                  {item.name}
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    </>
  );
}
