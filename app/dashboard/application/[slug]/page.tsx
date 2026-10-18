"use client";

import { useParams } from "next/navigation";
import ApplicationDetailView from "@/components/dashboard/application/ApplicationDetailView";

export default function ApplicationDetailPage() {
  const { slug } = useParams<{ slug: string }>();

  return (
    <ApplicationDetailView
      applicationId={slug}
      presentation="student"
    />
  );
}