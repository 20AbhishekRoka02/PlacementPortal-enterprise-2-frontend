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

  const isJobApplicationDetail =
    paths.length === 5 &&
    paths[0] === "dashboard" &&
    paths[1] === "job" &&
    paths[3] === "application";

  const breadcrumbs = isJobApplicationDetail
    ? [
        { name: "Jobs", link: "/dashboard/job" },
        { name: `Job ${paths[2]}`, link: `/dashboard/job/${paths[2]}` },
      ]
    : paths.slice(0, -1).map((name, index) => ({
        name,
        link: "/" + paths.slice(0, index + 1).join("/"),
      }));

  const currentPage = isJobApplicationDetail
    ? `Application ${paths[4]}`
    : paths[paths.length - 1];

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