"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import ApplyJobDialog from "@/components/dashboard/application/ApplyJobDialogBox";
import { DataTable } from "@/components/dashboard/data-table";
import { ColumnDef } from "@tanstack/react-table";
import { useDashboard } from "../../DashboardSidebarProvider";
interface CompanyUser {
  id: number;
  email: string;
  full_name: string;
  role: string;
}

interface Company {
  id: number;
  user: CompanyUser;
  name: string;
  website: string;
  hr_phone_number: string;
  hr_email: string;
}

interface JobAttribute {
  pk: number;
  name: string;
  data_type: "text" | "integer" | "decimal" | "boolean" | "enum" | "date";
  required: boolean;
  order: number;
  value: string | number | boolean | null;
}

interface ApplicationStudent {
  pk: number;
  first_name: string;
  last_name: string;
  email: string;
  batch: string;
}

interface Application {
  id: number;
  student: ApplicationStudent;
  status: string;
  applied_at: string;
}

type JobBatch = number | string | Batch | null;

interface Job {
  id: number;
  company: Company;
  title: string;
  location: string;
  salary: string;
  deadline: string;
  batch?: JobBatch;
  batches?: JobBatch[];
  description: string;
  status: string;
  attributes: JobAttribute[] | null;
}

interface Batch {
  id: number | string;
  course_name?: string;
  course?:
    | string
    | {
        name?: string;
        course_name?: string;
        title?: string;
      };
  name?: string;
}

interface ApplicationExport {
  id: number;
  job?: {
    id: number;
    title: string;
  };
  status: "pending" | "processing" | "completed" | "failed";
  current_step: string;
  progress_percentage: number;
  error_message: string;
}

const APPLICATION_EXPORT_STATUSES = [
  "pending",
  "processing",
  "completed",
  "failed",
] as const;

const APPLICATION_EXPORT_STEPS: Record<string, string> = {
  queued: "Queued",
  building_spreadsheet: "Building spreadsheet",
  adding_resumes: "Adding resumes",
  finalizing: "Finalizing export",
  completed: "Completed",
  failed: "Failed",
};

function isApplicationExport(value: unknown): value is ApplicationExport {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate.id === "number" &&
    typeof candidate.status === "string" &&
    APPLICATION_EXPORT_STATUSES.includes(
      candidate.status as (typeof APPLICATION_EXPORT_STATUSES)[number]
    ) &&
    typeof candidate.current_step === "string" &&
    typeof candidate.progress_percentage === "number" &&
    typeof candidate.error_message === "string"
  );
}

function getApiErrorMessage(payload: unknown, fallback: string) {
  if (payload && typeof payload === "object") {
    const errorData = payload as Record<string, unknown>;
    for (const key of ["message", "detail", "error_message"]) {
      if (typeof errorData[key] === "string" && errorData[key]) {
        return errorData[key];
      }
    }
  }

  return fallback;
}

function getApplicationStatusNames(payload: unknown): string[] {
  const response = payload as Record<string, unknown> | null;
  const source = Array.isArray(payload)
    ? payload
    : Array.isArray(response?.data)
      ? response.data
      : Array.isArray(response?.results)
        ? response.results
        : [];

  return Array.from(
    new Set(
      source
        .map((status) => {
          if (typeof status === "string") {
            return status.trim();
          }

          if (!status || typeof status !== "object") {
            return "";
          }

          const item = status as Record<string, unknown>;
          const name = item.name ?? item.status ?? item.label ?? item.title;
          return typeof name === "string" ? name.trim() : "";
        })
        .filter(Boolean)
    )
  );
}

function getBatchList(payload: unknown): Batch[] {
  if (Array.isArray(payload)) {
    return payload as Batch[];
  }

  if (payload && typeof payload === "object") {
    const response = payload as Record<string, unknown>;
    if (Array.isArray(response.data)) {
      return response.data as Batch[];
    }
    if (Array.isArray(response.results)) {
      return response.results as Batch[];
    }
  }

  return [];
}

function getBatchId(batch: JobBatch): string | null {
  if (typeof batch === "number") {
    return String(batch);
  }

  if (typeof batch === "string") {
    return /^\d+$/.test(batch) ? batch : null;
  }

  return batch ? String(batch.id) : null;
}

function getBatchLabel(batch: JobBatch, batches: Batch[]): string {
  const batchId = getBatchId(batch);
  const matchedBatch = batchId
    ? batches.find((item) => String(item.id) === batchId)
    : undefined;
  const batchDetails = matchedBatch ?? (typeof batch === "object" ? batch : null);

  if (batchDetails) {
    const courseName =
      batchDetails.course_name ||
      (typeof batchDetails.course === "string"
        ? batchDetails.course
        : batchDetails.course?.course_name ||
          batchDetails.course?.name ||
          batchDetails.course?.title) ||
      batchDetails.name;

    if (courseName) {
      return courseName;
    }
  }

  return typeof batch === "string" && batch ? batch : "-";
}

function getJobBatches(job: Job | null): JobBatch[] {
  if (!job) {
    return [];
  }

  if (Array.isArray(job.batches)) {
    return job.batches;
  }

  return job.batch === undefined ? [] : [job.batch];
}

function getDownloadFilename(contentDisposition: string | null, fallback: string) {
  if (!contentDisposition) {
    return fallback;
  }

  const encodedFilename = /filename\*=UTF-8''([^;]+)/i.exec(contentDisposition)?.[1];
  const standardFilename = /filename="?([^";]+)"?/i.exec(contentDisposition)?.[1];
  const filename = (encodedFilename ?? standardFilename)?.trim();

  if (!filename) {
    return fallback;
  }

  try {
    return decodeURIComponent(filename);
  } catch {
    return filename;
  }
}

async function downloadApplicationExport(
  exportId: number,
  fallbackFilename: string,
  signal: AbortSignal
) {
  const response = await fetch(`/api/application-exports/${exportId}/download`, {
    credentials: "include",
    cache: "no-store",
    signal,
  });

  if (!response.ok) {
    const errorPayload: unknown = await response.json().catch(() => null);
    throw new Error(
      getApiErrorMessage(
        errorPayload,
        `Unable to download export (HTTP ${response.status}).`
      )
    );
  }

  const blob = await response.blob();
  const filename = getDownloadFilename(
    response.headers.get("content-disposition"),
    fallbackFilename
  );
  const objectUrl = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = objectUrl;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
}

export default function JobDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const router = useRouter();
  const { profile, profileLoading } = useDashboard();

  const [job, setJob] = useState<Job | null>(null);
  const [batches, setBatches] = useState<Batch[]>([]);
  const [applications, setApplications] = useState<Application[]>([]);
  const [applicationsLoading, setApplicationsLoading] = useState(true);
  const [applicationStatuses, setApplicationStatuses] = useState<string[]>([]);
  const [newApplicationStatus, setNewApplicationStatus] = useState("");
  const [isCreatingApplicationStatus, setIsCreatingApplicationStatus] =
    useState(false);
  const [updatingApplicationId, setUpdatingApplicationId] = useState<
    number | null
  >(null);
  const [jobLoading, setJobLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [applicationExport, setApplicationExport] =
    useState<ApplicationExport | null>(null);
  const [exportError, setExportError] = useState<string | null>(null);
  const [downloadError, setDownloadError] = useState<string | null>(null);
  const [isStartingExport, setIsStartingExport] = useState(false);
  const [isDownloadingExport, setIsDownloadingExport] = useState(false);
  const [downloadAttempt, setDownloadAttempt] = useState(0);
  const autoDownloadedExportId = useRef<number | null>(null);

  useEffect(() => {
    if (profileLoading) {
      return;
    }

    if (!profile?.is_staff) {
      return;
    }

    const fetchApplications = async () => {
      setApplicationsLoading(true);
      try {
        const res = await fetch(`/api/application/?job_id=${slug}`, {
          method: "GET",
          credentials: "include",
        });

        if (!res.ok) {
          throw new Error("Failed to fetch applications.");
        }

        const result = await res.json();
        console.log("job applications response:", result);
        setApplications(Array.isArray(result.data) ? result.data : []);
      } catch (error) {
        console.error("Error fetching applications:", error);
      } finally {
        setApplicationsLoading(false);
      }
    };

    if (slug) {
      fetchApplications();
    }
  }, [profile?.is_staff, profileLoading, slug]);

  useEffect(() => {
    if (profileLoading || !profile?.is_staff) {
      return;
    }

    const fetchApplicationStatuses = async () => {
      try {
        const response = await fetch("/api/application-statuses", {
          credentials: "include",
          cache: "no-store",
        });
        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            getApiErrorMessage(payload, "Unable to load application statuses.")
          );
        }

        setApplicationStatuses(getApplicationStatusNames(payload));
      } catch (error) {
        toast.error(
          error instanceof Error
            ? error.message
            : "Unable to load application statuses."
        );
      }
    };

    void fetchApplicationStatuses();
  }, [profile?.is_staff, profileLoading]);

  const handleApplicationStatusChange = async (
    applicationId: number,
    status: string
  ) => {
    const application = applications.find((item) => item.id === applicationId);
    if (!application || application.status === status) {
      return;
    }

    setUpdatingApplicationId(applicationId);
    try {
      const response = await fetch(`/api/application/${applicationId}`, {
        method: "PUT",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: applicationId,
          name: status,
          status,
        }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(payload, "Unable to update application status.")
        );
      }

      setApplications((current) =>
        current.map((item) =>
          item.id === applicationId ? { ...item, status } : item
        )
      );
      toast.success("Application status updated.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to update application status."
      );
    } finally {
      setUpdatingApplicationId(null);
    }
  };

  const handleCreateApplicationStatus = async () => {
    const name = newApplicationStatus.trim();
    if (!name) {
      toast.error("Enter an application status name.");
      return;
    }

    setIsCreatingApplicationStatus(true);
    try {
      const response = await fetch("/api/application-statuses", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name }),
      });
      const payload: unknown = await response.json().catch(() => null);

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(payload, "Unable to create application status.")
        );
      }

      const returnedStatuses = getApplicationStatusNames({
        data: [
          payload && typeof payload === "object" && "data" in payload
            ? (payload as Record<string, unknown>).data
            : payload,
        ],
      });
      const createdStatus = returnedStatuses[0] ?? name;

      setApplicationStatuses((current) =>
        Array.from(new Set([...current, createdStatus]))
      );
      setNewApplicationStatus("");
      toast.success("Application status created.");
    } catch (error) {
      toast.error(
        error instanceof Error
          ? error.message
          : "Unable to create application status."
      );
    } finally {
      setIsCreatingApplicationStatus(false);
    }
  };

  const activeExportId =
    applicationExport?.status === "pending" ||
    applicationExport?.status === "processing"
      ? applicationExport.id
      : null;

  useEffect(() => {
    if (activeExportId === null) {
      return;
    }

    let isActive = true;
    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let controller: AbortController | undefined;

    const pollExportStatus = async () => {
      controller = new AbortController();

      try {
        const response = await fetch(
          `/api/application-exports/${activeExportId}`,
          {
            credentials: "include",
            cache: "no-store",
            signal: controller.signal,
          }
        );
        const payload: unknown = await response.json().catch(() => null);

        if (!response.ok) {
          throw new Error(
            getApiErrorMessage(
              payload,
              `Unable to check export status (HTTP ${response.status}).`
            )
          );
        }

        if (!isApplicationExport(payload) || payload.id !== activeExportId) {
          throw new Error("Received an invalid export status response.");
        }

        if (!isActive) {
          return;
        }

        setApplicationExport(payload);
        setExportError(
          payload.status === "failed"
            ? payload.error_message || "Application export failed."
            : null
        );

        if (payload.status === "pending" || payload.status === "processing") {
          timeoutId = setTimeout(pollExportStatus, 2500);
        }
      } catch (error) {
        if (!isActive) {
          return;
        }

        setExportError(
          error instanceof Error
            ? `${error.message} Retrying status check...`
            : "Unable to check export status. Retrying..."
        );
        timeoutId = setTimeout(pollExportStatus, 5000);
      }
    };

    void pollExportStatus();

    return () => {
      isActive = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      controller?.abort();
    };
  }, [activeExportId]);

  const completedExportId =
    applicationExport?.status === "completed" ? applicationExport.id : null;

  useEffect(() => {
    if (completedExportId === null) {
      return;
    }

    if (downloadAttempt === 0) {
      if (autoDownloadedExportId.current === completedExportId) {
        return;
      }
    }

    let isActive = true;
    const controller = new AbortController();
    const jobId = applicationExport?.job?.id ?? slug;

    setIsDownloadingExport(true);
    setDownloadError(null);

    void downloadApplicationExport(
      completedExportId,
      `application-export-job-${jobId}.zip`,
      controller.signal
    )
      .then(() => {
        if (isActive) {
          autoDownloadedExportId.current = completedExportId;
        }
      })
      .catch((error: unknown) => {
        if (isActive) {
          setDownloadError(
            error instanceof Error
              ? error.message
              : "Unable to download application export."
          );
        }
      })
      .finally(() => {
        if (isActive) {
          setIsDownloadingExport(false);
        }
      });

    return () => {
      isActive = false;
      controller.abort();
    };
  }, [completedExportId, downloadAttempt, applicationExport?.job?.id, slug]);

  const handleStartExport = async () => {
    if (!job || !applications.length || isStartingExport || activeExportId !== null) {
      return;
    }

    setIsStartingExport(true);
    setApplicationExport(null);
    setExportError(null);
    setDownloadError(null);
    setDownloadAttempt(0);

    try {
      const response = await fetch("/api/application-exports", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ job_id: job.id }),
      });
      const payload: unknown = await response.json().catch(() => null);
      const exportData =
        payload && typeof payload === "object" && "data" in payload
          ? payload.data
          : null;

      if (!response.ok) {
        throw new Error(
          getApiErrorMessage(
            payload,
            `Unable to start application export (HTTP ${response.status}).`
          )
        );
      }

      if (!isApplicationExport(exportData)) {
        throw new Error("Received an invalid application export response.");
      }

      setApplicationExport(exportData);
    } catch (error) {
      setExportError(
        error instanceof Error
          ? error.message
          : "Unable to start application export."
      );
    } finally {
      setIsStartingExport(false);
    }
  };

  const isExportActive = isStartingExport || activeExportId !== null;
  const exportProgress = Math.min(
    100,
    Math.max(0, Math.round(applicationExport?.progress_percentage ?? 0))
  );

  useEffect(() => {
    const fetchJob = async () => {
      try {
        const res = await fetch(`/api/jobs/${slug}/`, {
          credentials: "include",
        });

        if (res.status === 404) {
          setNotFound(true);
          return;
        }

        if (!res.ok) {
          throw new Error("Failed to fetch job.");
        }

        const result = await res.json();
        console.log("job detail: ", result.data);
        setJob(result.data);
      } catch (error) {
        console.error(error);
      } finally {
        setJobLoading(false);
      }
    };

    if (slug) {
      fetchJob();
    }
  }, [slug]);

  const jobBatches = getJobBatches(job);
  const batchIds = jobBatches
    .map(getBatchId)
    .filter((id): id is string => id !== null)
    .join(",");

  useEffect(() => {
    if (!batchIds) {
      return;
    }

    let isActive = true;

    const fetchBatches = async () => {
      try {
        const response = await fetch("/api/batches", {
          credentials: "include",
          cache: "no-store",
        });

        if (!response.ok) {
          throw new Error("Unable to load batches.");
        }

        const payload: unknown = await response.json();
        if (isActive) {
          setBatches(getBatchList(payload));
        }
      } catch (error) {
        console.error("Unable to load batches:", error);
      }
    };

    void fetchBatches();

    return () => {
      isActive = false;
    };
  }, [batchIds]);

  const applicationColumns: ColumnDef<Application>[] = [
    {
      accessorKey: "student.first_name",
      header: "First Name",
    },
    {
      accessorKey: "student.last_name",
      header: "Last Name",
    },
    {
      accessorKey: "student.email",
      header: "Email",
    },
    {
      accessorKey: "student.batch",
      header: "Batch",
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => {
        const application = row.original;
        const statuses = Array.from(
          new Set([...applicationStatuses, application.status].filter(Boolean))
        );

        return (
          <div
            onClick={(event) => event.stopPropagation()}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <Select
              value={application.status}
              onValueChange={(status) =>
                void handleApplicationStatusChange(application.id, status)
              }
              disabled={
                updatingApplicationId === application.id ||
                applicationStatuses.length === 0
              }
            >
              <SelectTrigger className="w-40" aria-label="Application status">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statuses.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        );
      },
    },
    {
      accessorKey: "applied_at",
      header: "Applied At",
      cell: ({ row }) =>
        new Date(row.original.applied_at).toLocaleString("en-IN"),
    },
  ];

  if (jobLoading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Loading...
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Job Not Found</h1>
          <p className="mt-2 text-muted-foreground">
            The job you&apos;re looking for doesn&apos;t exist or may have been removed.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{job!.title}</h1>

        <p className="mt-2 text-muted-foreground">
          {job!.company.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <p className="text-sm text-muted-foreground">Location</p>
          <p>{job!.location}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Salary</p>
          <p>₹{Number(job!.salary).toLocaleString("en-IN")}</p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Deadline</p>
          <p>
            {new Date(job!.deadline).toLocaleDateString("en-IN")}
          </p>
        </div>

        <div>
          <p className="text-sm text-muted-foreground">Batch</p>
          <p>
            {jobBatches
              .map((batch) => getBatchLabel(batch, batches))
              .filter((label) => label !== "-")
              .join(", ") || "-"}
          </p>
        </div>
      </div>
      <div className="pt-2">
        {job?.status === "Not Applied" ? (
          <ApplyJobDialog
            jobId={job.id}
            attributes={job.attributes ?? []}
            onSuccessAction={() => {
              setJob((prev) =>
                prev
                  ? {
                    ...prev,
                    status: "Applied",
                  }
                  : prev
              );
            }}
          />
        ) : (
          <Button
            size="lg"
            variant="ghost"
            className="w-full md:w-auto"
            disabled
          >
            Applied
          </Button>
        )}

      </div>

      <div>
        <h2 className="mb-3 text-xl font-semibold">
          Job Description
        </h2>

        <div
          className="prose max-w-none"
          dangerouslySetInnerHTML={{
            __html: job!.description,
          }}
        />
      </div>

      {profile?.is_staff && (
        <div>
          <h2 className="mb-3 text-xl font-semibold">Applications</h2>
          <div className="mb-3 flex items-center justify-start">
            <Button
              type="button"
              onClick={() => void handleStartExport()}
              className="bg-green-600 text-white hover:bg-green-700"
              disabled={!applications.length || isExportActive}
            >
              {isStartingExport
                ? "Starting export..."
                : isExportActive
                  ? "Exporting..."
                  : "Export"}
            </Button>
          </div>
          <div className="mb-4 flex flex-wrap items-center gap-2">
            <label htmlFor="new-application-status" className="sr-only">
              New application status
            </label>
            <Input
              id="new-application-status"
              className="max-w-xs"
              placeholder="New application status"
              value={newApplicationStatus}
              onChange={(event) => setNewApplicationStatus(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  void handleCreateApplicationStatus();
                }
              }}
              disabled={isCreatingApplicationStatus}
            />
            <Button
              type="button"
              variant="outline"
              onClick={() => void handleCreateApplicationStatus()}
              disabled={isCreatingApplicationStatus || !newApplicationStatus.trim()}
            >
              {isCreatingApplicationStatus ? "Creating..." : "Add status"}
            </Button>
          </div>
          {applicationExport && (
            <div className="mb-4 space-y-2" role="status" aria-live="polite">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <p className="font-medium">
                  {APPLICATION_EXPORT_STEPS[applicationExport.current_step] ??
                    applicationExport.current_step.replaceAll("_", " ")}
                </p>
                <p className="text-sm text-muted-foreground">
                  {applicationExport.status[0].toUpperCase() +
                    applicationExport.status.slice(1)}
                  {applicationExport.status !== "failed" &&
                    ` · ${exportProgress}%`}
                </p>
              </div>

              <progress
                className="h-2 w-full accent-green-600"
                value={exportProgress}
                max={100}
                aria-label="Application export progress"
              />

              {applicationExport.status === "failed" && (
                <p className="text-sm text-destructive" role="alert">
                  {applicationExport.error_message ||
                    exportError ||
                    "Application export failed."}
                </p>
              )}

              {applicationExport.status === "completed" && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setDownloadError(null);
                    setDownloadAttempt((attempt) => attempt + 1);
                  }}
                  disabled={isDownloadingExport}
                >
                  {isDownloadingExport
                    ? "Preparing download..."
                    : downloadError
                      ? "Retry download"
                      : "Download ZIP"}
                </Button>
              )}
            </div>
          )}
          {exportError && applicationExport?.status !== "failed" && (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {exportError}
            </p>
          )}
          {downloadError && (
            <p className="mb-3 text-sm text-destructive" role="alert">
              {downloadError}
            </p>
          )}
          {applicationsLoading ? (
            <p className="text-muted-foreground">Loading applications...</p>
          ) : applications.length ? (
            <DataTable
              columns={applicationColumns}
              data={applications}
              onRowClick={(application) =>
                router.push(
                  `/dashboard/job/${slug}/application/${application.id}`
                )
              }
            />
          ) : (
            <p className="text-muted-foreground">No applications found.</p>
          )}
        </div>
      )}
    </div>
  );
}
