"use client";

import { useParams } from "next/navigation";
import ApplicationDetailView from "@/components/dashboard/application/ApplicationDetailView";

export default function StaffApplicationDetailPage() {
  const { applicationSlug } = useParams<{
    slug: string;
    applicationSlug: string;
  }>();

  return (
    <ApplicationDetailView
      applicationId={applicationSlug}
      presentation="staff"
    />
  );
}