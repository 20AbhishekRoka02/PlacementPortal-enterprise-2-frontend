"use client";

import { useEffect, useState } from "react";

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";

import { Button } from "@/components/ui/button";

import {
    RadioGroup,
    RadioGroupItem,
} from "@/components/ui/radio-group";

import { Label } from "@/components/ui/label";

import { Input } from "@/components/ui/input";

import { ScrollArea } from "@/components/ui/scroll-area";

import { Card } from "@/components/ui/card";

import { FileText, Upload } from "lucide-react";

import { toast } from "sonner";


interface Resume {
    id: number;
    size: string;
    file_name: string;
    file: string;
}


interface ApplyJobDialogProps {
    jobId: number;
    onSuccessAction: () => void;
}


export default function ApplyJobDialog({
    jobId,
    onSuccessAction,
}: ApplyJobDialogProps) {

    const [open, setOpen] = useState(false);

    const [resumes, setResumes] = useState<Resume[]>([]);
    const [selectedResumeId, setSelectedResumeId] = useState<string>("");

    const [loadingResumes, setLoadingResumes] = useState(false);
    const [uploadingResume, setUploadingResume] = useState(false);
    const [applying, setApplying] = useState(false);


    const fetchResumes = async () => {

        try {
            setLoadingResumes(true);

            const res = await fetch("/api/resumes", {
                credentials: "include",
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(
                    data.message || "Unable to fetch resumes."
                );
            }

            setResumes(data.data);

        } catch (error) {

            console.error(error);

            toast.error(
                "Unable to fetch your resumes."
            );

        } finally {
            setLoadingResumes(false);
        }
    };


    useEffect(() => {

        if (open) {
            fetchResumes();
        }

    }, [open]);


    const uploadResume = async (
        event: React.ChangeEvent<HTMLInputElement>
    ) => {

        const file = event.target.files?.[0];

        if (!file) return;


        try {

            setUploadingResume(true);

            const formData = new FormData();

            formData.append("file", file);

            const res = await fetch("/api/resumes", {
                method: "POST",
                body: formData,
                credentials: "include",
            });

            const data = await res.json();
            console.log("data: ", data.data)

            if (!res.ok) {
                throw new Error(
                    data.data || "Unable to upload resume."
                );
            }

            const uploadedResume: Resume = {
                id: data.id,
                size: data.size,
                file_name: data.file_name,
                file: data.file,
            };


            setResumes((prev) => [
                uploadedResume,
                ...prev,
            ]);


            setSelectedResumeId(
                String(uploadedResume.id)
            );


            toast.success(
                "Resume uploaded successfully."
            );


        } catch (error) {

            console.error(error);

            toast.error(
                error instanceof Error
                    ? error.message
                    : "Unable to upload resume."
            );

        } finally {

            setUploadingResume(false);

            event.target.value = "";

        }
    };


    const applyJob = async () => {

        if (!selectedResumeId) {

            toast.error(
                "Please select or upload a resume."
            );

            return;
        }


        try {

            setApplying(true);
            console.log("jobID, resume_id: ", jobId, selectedResumeId)

            const res = await fetch(
                "/api/application",
                {
                    method: "POST",

                    headers: {
                        "Content-Type": "application/json",
                    },

                    body: JSON.stringify({
                        job: jobId,
                        resume_id: Number(
                            selectedResumeId
                        ),
                    }),

                    credentials: "include",
                }
            );


            const data = await res.json();


            if (!res.ok) {

                toast.error(
                    data.message ||
                    "Unable to apply."
                );

                return;
            }


            toast.success(
                data.data ||
                "Application submitted successfully."
            );


            setOpen(false);

            onSuccessAction();


        } catch (error) {

            console.error(error);

            toast.error(
                "Something went wrong."
            );

        } finally {

            setApplying(false);

        }

    };


    return (

        <Dialog
            open={open}
            onOpenChange={setOpen}
        >

            <DialogTrigger asChild>

                <Button size="lg">
                    Apply Now
                </Button>

            </DialogTrigger>


            <DialogContent className="sm:max-w-2xl">

                <DialogHeader>

                    <DialogTitle>
                        Apply for this Job
                    </DialogTitle>

                    <DialogDescription>
                        Select one of your existing
                        resumes or upload a new one.
                    </DialogDescription>

                </DialogHeader>


                <div className="space-y-5">


                    {/* Upload Resume */}

                    <div className="space-y-2">

                        <Label>
                            Upload Resume
                        </Label>

                        <Input
                            type="file"
                            accept=".pdf"
                            onChange={uploadResume}
                            disabled={uploadingResume}
                        />

                        {
                            uploadingResume && (
                                <p className="text-sm text-muted-foreground">
                                    Uploading resume...
                                </p>
                            )
                        }

                    </div>


                    {/* Existing Resumes */}

                    <div className="space-y-2">

                        <Label>
                            Choose Resume
                        </Label>


                        {
                            loadingResumes ? (

                                <p>
                                    Loading resumes...
                                </p>

                            ) : (

                                <ScrollArea className="max-h-75">

                                    <RadioGroup
                                        value={
                                            selectedResumeId
                                        }
                                        onValueChange={
                                            setSelectedResumeId
                                        }
                                    >

                                        <div className="space-y-3">

                                            {
                                                resumes.length === 0 ? (

                                                    <p className="text-sm text-muted-foreground">
                                                        No resumes found.
                                                        Upload one to continue.
                                                    </p>

                                                ) : (

                                                    resumes.map(
                                                        (resume) => (

                                                            <Card
                                                                key={resume.id}
                                                                className="p-4"
                                                            >

                                                                <div className="flex items-center gap-4">

                                                                    <RadioGroupItem
                                                                        value={String(resume.id)}
                                                                        id={`resume-${resume.id}`}
                                                                    />


                                                                    <div className="flex h-14 w-14 flex-col items-center justify-center rounded-md bg-red-50 border">

                                                                        <FileText
                                                                            className="h-6 w-6 text-red-600"
                                                                        />

                                                                        <span className="text-[10px] font-semibold text-red-600">
                                                                            PDF
                                                                        </span>

                                                                    </div>


                                                                    <Label
                                                                        htmlFor={`resume-${resume.id}`}
                                                                        className="flex-1 cursor-pointer"
                                                                    >

                                                                        <p className="font-semibold">
                                                                            {resume.file_name}
                                                                        </p>

                                                                        <p className="text-sm text-muted-foreground">
                                                                            {resume.size} KB
                                                                        </p>

                                                                    </Label>

                                                                </div>

                                                            </Card>

                                                        )
                                                    )

                                                )
                                            }

                                        </div>

                                    </RadioGroup>

                                </ScrollArea>

                            )
                        }

                    </div>


                    {/* Actions */}

                    <div className="flex justify-end gap-3">

                        <Button
                            variant="outline"
                            onClick={() => setOpen(false)}
                        >
                            Cancel
                        </Button>


                        <Button
                            onClick={applyJob}
                            disabled={
                                applying ||
                                uploadingResume
                            }
                        >

                            {
                                applying
                                    ? "Applying..."
                                    : "Apply"
                            }

                        </Button>

                    </div>


                </div>

            </DialogContent>

        </Dialog>

    );

}