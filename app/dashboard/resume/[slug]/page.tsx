"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { FileText } from "lucide-react";
import { toast } from "sonner";

interface Resume {
  id: number;
  size: string;
  file_name: string;
  file: string;
  detail: string;
  created_at: string;
  updated_at: string;
  student: number;
}

export default function ResumeDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  const [resume, setResume] = useState<Resume | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchResume() {
      try {
        const res = await fetch(`/api/resumes/${slug}/`, {
          credentials: "include",
        });
        console.log("status: ", res.status);

        const result = await res.json();

        if (res.status === 404) {
          setNotFound(true);
          toast.error(result.message);
          return;
        }

        if (!res.ok) {
          toast.error(result.message);
          return;
        }

        setResume(result.data);
      } catch (error) {
        console.error(error);
        toast.error("Something went wrong.");
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchResume();
    }
  }, [slug]);

  if (loading) {
    return (
      <div className="container mx-auto py-10 text-center">
        Loading...
      </div>
    );
  }

  if (notFound || !resume) {
    return (
      <div className="container mx-auto flex h-[60vh] items-center justify-center">
        <div className="text-center">
          <h1 className="text-3xl font-bold">
            Resume Not Found
          </h1>

          <p className="mt-2 text-muted-foreground">
            This resume doesn't exist.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl py-8 space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">
          {resume.file_name}
        </h1>

        <p className="text-muted-foreground text-lg">
          Resume Details
        </p>

        <div className="flex flex-wrap gap-4 pt-2">
          <Badge>Resume</Badge>

          <span className="text-sm text-muted-foreground">
            Uploaded on{" "}
            {new Date(resume.created_at).toLocaleString(
              "en-IN"
            )}
          </span>
        </div>
      </div>

      {/* Resume Information */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Information</CardTitle>
        </CardHeader>

        <CardContent className="grid gap-6 md:grid-cols-2">
          <div>
            <p className="text-sm text-muted-foreground">
              File Name
            </p>

            <p>{resume.file_name}</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              File Size
            </p>

            <p>{resume.size} KB</p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Created At
            </p>

            <p>
              {new Date(
                resume.created_at
              ).toLocaleString("en-IN")}
            </p>
          </div>

          <div>
            <p className="text-sm text-muted-foreground">
              Last Updated
            </p>

            <p>
              {new Date(
                resume.updated_at
              ).toLocaleString("en-IN")}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Resume File */}
      <Card>
        <CardHeader>
          <CardTitle>Resume File</CardTitle>
        </CardHeader>

        <CardContent>
          <a
            href={resume.file}
            target="_blank"
            rel="noopener noreferrer"
          >
            <div className="flex items-center gap-4 rounded-lg border p-4 hover:bg-muted/40 transition-colors cursor-pointer">
              <div className="flex h-14 w-14 items-center justify-center rounded-md bg-red-100 text-red-600">
                <FileText size={24} />
              </div>

              <div className="min-w-0">
                <p className="truncate font-semibold">
                  {resume.file_name}
                </p>

                <p className="text-sm text-muted-foreground">
                  Click to view or download
                </p>
              </div>
            </div>
          </a>
        </CardContent>
      </Card>

      {/* Parsed Resume Details */}
      <Card>
        <CardHeader>
          <CardTitle>Resume Description</CardTitle>
        </CardHeader>

        <CardContent>
          {resume.detail ? (
            <div
              className="prose dark:prose-invert max-w-none"
              dangerouslySetInnerHTML={{
                __html: resume.detail,
              }}
            />
          ) : (
            <p className="text-muted-foreground">
              No resume details are available yet.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}