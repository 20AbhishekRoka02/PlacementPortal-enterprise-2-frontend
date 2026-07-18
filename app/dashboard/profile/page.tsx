"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";

import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type StudentProfile = {
    id: number;
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    whatsapp_number: string;
    batch: string;
};

export default function StudentProfilePage() {
    const [profile, setProfile] =
        useState<StudentProfile | null>(null);

    const [loading, setLoading] = useState(true);
    const [updating, setUpdating] = useState(false);

    const fetchProfile = async () => {
        try {
            const response = await fetch(
                "/api/profile",
                {
                    credentials: "include",
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Unable to fetch profile."
                );
            }

            setProfile(data.data);
        } catch (error: any) {
            toast.error(
                error?.message ||
                    "Unable to fetch profile."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchProfile();
    }, []);

    const handleChange = (
        field: keyof StudentProfile,
        value: string
    ) => {
        if (!profile) return;

        setProfile({
            ...profile,
            [field]: value,
        });
    };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!profile) return;

        setUpdating(true);

        try {
            const response = await fetch(
                "/api/profile",
                {
                    method: "PUT",
                    credentials: "include",
                    headers: {
                        "Content-Type":
                            "application/json",
                    },
                    body: JSON.stringify({
                        first_name:
                            profile.first_name,
                        last_name:
                            profile.last_name,
                        phone_number:
                            profile.phone_number,
                        whatsapp_number:
                            profile.whatsapp_number,
                    }),
                }
            );

            const data = await response.json();

            if (!response.ok) {
                throw new Error(
                    data?.message ||
                        "Unable to update profile."
                );
            }

            toast.success(data.message);
        } catch (error: any) {
            toast.error(
                error?.message ||
                    "Unable to update profile."
            );
        } finally {
            setUpdating(false);
        }
    };

    if (loading) {
        return (
            <p className="text-muted-foreground mx-auto py-10 text-center">
                Loading profile...
            </p>
        );
    }

    if (!profile) {
        return (
            <p className="text-red-500">
                Unable to load profile.
            </p>
        );
    }

    return (
        <Card className="max-w-3xl mx-auto my-10">
            <CardHeader>
                <CardTitle>
                    My Profile
                </CardTitle>
            </CardHeader>

            <CardContent>
                <form
                    onSubmit={handleSubmit}
                    className="space-y-5"
                >
                    <div className="space-y-2">
                        <Label>
                            First Name
                        </Label>
                        <Input
                            value={
                                profile.first_name
                            }
                            onChange={(e) =>
                                handleChange(
                                    "first_name",
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Last Name
                        </Label>
                        <Input
                            value={
                                profile.last_name
                            }
                            onChange={(e) =>
                                handleChange(
                                    "last_name",
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Email Address
                        </Label>
                        <Input
                            value={profile.email}
                            disabled
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            Phone Number
                        </Label>
                        <Input
                            value={
                                profile.phone_number
                            }
                            onChange={(e) =>
                                handleChange(
                                    "phone_number",
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>
                            WhatsApp Number
                        </Label>
                        <Input
                            value={
                                profile.whatsapp_number
                            }
                            onChange={(e) =>
                                handleChange(
                                    "whatsapp_number",
                                    e.target.value
                                )
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Batch</Label>
                        <Input
                            value={profile.batch}
                            disabled
                        />
                    </div>

                    <Button
                        type="submit"
                        disabled={updating}
                        className="w-full"
                    >
                        {updating
                            ? "Updating..."
                            : "Update Profile"}
                    </Button>
                </form>
            </CardContent>
        </Card>
        
    );
}