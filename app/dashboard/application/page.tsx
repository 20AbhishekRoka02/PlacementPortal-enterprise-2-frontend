"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { useState } from "react";
import type { Row } from "@tanstack/react-table";
import { DataTable } from "@/components/dashboard/data-table";
import { generateColumns } from "@/components/dashboard/dynamic-columns";

type ApplicationStatus = {
  id: number | string;
  name: string;
};

type Company = {
  id: number | string;
  name: string;
};

function getApplicationStatuses(payload: unknown): ApplicationStatus[] {
  const response = payload as Record<string, unknown> | null;
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.results)
        ? response.results
        : [];

  return source.flatMap((status) => {
    if (!status || typeof status !== "object") {
      return [];
    }

    const item = status as Record<string, unknown>;
    const id = item.id ?? item.pk;
    const name = item.name ?? item.status ?? item.label ?? item.title;

    return (typeof id === "number" || typeof id === "string") &&
      typeof name === "string"
      ? [{ id, name }]
      : [];
  });
}

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
    title: string;
    company: number | string;
    applied_at: string;
    status: number | string;
  }

  const [jobs, setJobs] = useState<Job[]>([]);
  const [applicationStatuses, setApplicationStatuses] = useState<
    ApplicationStatus[]
  >([]);
  const [companies, setCompanies] = useState<Company[]>([]);


  useEffect(() => {
    const fetchApplications = async () => {
      try {
        const [res, statusesResponse, companiesResponse] = await Promise.all([
          fetch("/api/application", {
            method: "GET",
            credentials: "include",
            headers: {
              "Content-Type": "application/json",
            },
          }),
          fetch("/api/application-statuses", {
            credentials: "include",
            cache: "no-store",
          }),
          fetch("/api/companies", {
            credentials: "include",
            cache: "no-store",
          }),
        ]);

        if (!res.ok) {
          throw new Error("Failed to fetch applications.");
        }

        const result = await res.json();

        setJobs(result.data);
        console.log("application list: ", result.data)

        if (statusesResponse.ok) {
          const statusesPayload: unknown = await statusesResponse.json();
          setApplicationStatuses(getApplicationStatuses(statusesPayload));
        }

        if (companiesResponse.ok) {
          const companiesPayload: unknown = await companiesResponse.json();
          setCompanies(getCompanies(companiesPayload));
        }
      } catch (err) {
        console.error("Error fetching jobs:", err);
      }
    };

    fetchApplications();
  }, []);

  const statusNames = new Map(
    applicationStatuses.map((status) => [String(status.id), status.name])
  );
  const companyNames = new Map(
    companies.map((company) => [String(company.id), company.name])
  );
  const columns = generateColumns(jobs).map((column) => {
    if (!("accessorKey" in column)) {
      return column;
    }

    if (column.accessorKey === "status") {
      return {
        ...column,
        cell: ({ row }: { row: Row<Job> }) =>
          statusNames.get(String(row.original.status)) ??
          String(row.original.status ?? "-"),
      };
    }

    if (column.accessorKey === "company") {
      return {
        ...column,
        cell: ({ row }: { row: Row<Job> }) =>
          companyNames.get(String(row.original.company)) ??
          String(row.original.company ?? "-"),
      };
    }

    return column;
  });

  return (
    <DataTable
      columns={columns}
      data={jobs}
      onRowClick={(row) => router.push(`/dashboard/application/${row.id}`)}
    />
  );
}
