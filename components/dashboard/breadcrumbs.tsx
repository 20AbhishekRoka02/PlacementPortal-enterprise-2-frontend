"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { SlashIcon } from "lucide-react";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

function Breadcrumbs() {
  const pathname = usePathname();

  const paths = pathname.split("/").filter(Boolean);

  const breadcrumbs = paths.slice(0, -1).map((name, index) => ({
    name,
    link: "/" + paths.slice(0, index + 1).join("/"),
  }));

  const currentPage = paths[paths.length - 1];

  return (
    <Breadcrumb>
      <BreadcrumbList>
        {breadcrumbs.map((breadcrumb) => (
          <React.Fragment key={breadcrumb.link}>
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink href={breadcrumb.link}>
                {breadcrumb.name}
              </BreadcrumbLink>
            </BreadcrumbItem>

            <BreadcrumbSeparator className="hidden md:block">
              <SlashIcon />
            </BreadcrumbSeparator>
          </React.Fragment>
        ))}

        <BreadcrumbItem>
          <BreadcrumbPage>{currentPage}</BreadcrumbPage>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}

export default Breadcrumbs;