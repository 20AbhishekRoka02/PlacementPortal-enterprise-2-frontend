"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import type { Row } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/data-table";
import { generateColumns } from "@/components/dashboard/dynamic-columns";
import { Button } from "@/components/ui/button";
import { PlusIcon } from "lucide-react";
import { useDashboard } from "../DashboardSidebarProvider";


type Company = {
  id: number | string;
  name: string;
};

function getCompanies(payload: unknown): Company[] {
  const response = payload as Record<string, unknown> | null;
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.results)
        ? response.results
        : [];

  return source.flatMap((company) => {
    if (!company || typeof company !== "object") {
      return [];
    }

    const item = company as Record<string, unknown>;
    const id = item.id ?? item.pk;
    const name = item.name;

    return (typeof id === "number" || typeof id === "string") &&
      typeof name === "string"
      ? [{ id, name }]
      : [];
  });
}

export default function JobsPage() {
  const router = useRouter();
  interface Job {
    id: number;
    company: number | string;
    title: string;
    location: string;
    salary: string;
    deadline: string;
    batch: number;
  }

  const [jobs, setJobs] = useState<Job[]>([]);
  const [companies, setCompanies] = useState<Company[]>([]);
  


  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const [res, companiesResponse] = await Promise.all([
          fetch("/api/jobs", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/companies", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (!res.ok) {
          throw new Error("Failed to fetch jobs.");
        }

        const result = await res.json();

        setJobs(result.data);
        console.log("job list: ", result.data)

        if (companiesResponse.ok) {
          const companiesPayload: unknown = await companiesResponse.json();
          setCompanies(getCompanies(companiesPayload));
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchJobs();
  }, []);

  const companyNames = new Map(
    companies.map((company) => [String(company.id), company.name])
  );
  const columns = generateColumns(jobs).map((column) => {
    if (!("accessorKey" in column) || column.accessorKey !== "company") {
      return column;
    }

    return {
      ...column,
      cell: ({ row }: { row: Row<Job> }) =>
        companyNames.get(String(row.original.company)) ??
        String(row.original.company ?? "-"),
    };
  });
  const { profile } = useDashboard();
 
  return (
    <div>
    {profile?.is_staff && (

      <Button
      className="my-3 ml-4 py-5 px-4"
      onClick={()=> router.push('/dashboard/job/create')}
      ><PlusIcon/>Add Jobs</Button>
    )}
   
      
      <DataTable
        columns={columns}
        data={jobs}
        onRowClick={(row) => router.push(`/dashboard/job/${row.id}`)}
      />
    </div>
  );
}
