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
import { useDashboard } from "../DashboardSidebarProvider";
import { Profile, StaffProfile, StudentProfile } from "@/app/types/profile";


function StudentProfileForm({
    profile,
    setProfile,
    updating,
    onSubmit,
}: {
    profile: StudentProfile;
    setProfile: React.Dispatch<React.SetStateAction<Profile | null>>;
    updating: boolean;
    onSubmit: (e: React.FormEvent<HTMLFormElement>) => void;
}) {
    return (
        <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
                <Label>First Name</Label>

                <Input
                    value={profile.first_name}
                    onChange={(e) =>
                        setProfile({
                            ...profile,
                            first_name: e.target.value,
                        })
                    }
                />
            </div>

            <div className="space-y-2">
                <Label>Last Name</Label>

                <Input
                    value={profile.last_name}
                    onChange={(e) =>
                        setProfile({
                            ...profile,
                            last_name: e.target.value,
                        })
                    }
                />
            </div>

            <div className="space-y-2">
                <Label>Email Address</Label>

                <Input
                    value={profile.email}
                    disabled
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
    );
}

function StaffProfileForm({
    profile,
}: {
    profile: StaffProfile;
}) {
    return (
        <div className="space-y-5">
            <div className="space-y-2">
                <Label>Email Address</Label>

                <Input
                    value={profile.email}
                    disabled
                />
            </div>

            <div className="space-y-2">
                <Label>Role</Label>

                <Input
                    value={profile.role}
                    disabled
                />
            </div>
        </div>
    );
}


export default function ProfilePage() {
    const { profile, profileLoading } = useDashboard();
    const [dashboardProfile, setDashboardProfile] = useState<Profile | null>(null);
    const [updating, setUpdating] = useState(false);


    useEffect(() => { if (profile) { setDashboardProfile(profile); } }, [profile]);

    if (profileLoading) {
        return <div>Loading profile...</div>;
    }

    if (!dashboardProfile) {
        return <div>Unable to load profile.</div>;
    }



    // const [loading, setLoading] = useState(true);

    // const fetchProfile = async () => {
    //     try {
    //         const response = await fetch(
    //             "/api/profile",
    //             {
    //                 credentials: "include",
    //             }
    //         );

    //         const data = await response.json();
    //         console.log("data: ", data);

    //         if (!response.ok) {
    //             throw new Error(
    //                 data?.message ||
    //                     "Unable to fetch profile."
    //             );
    //         }

    //         setProfile(data.data);
    //         console.log("profile data: ", profile);
    //     } catch (error: any) {
    //         toast.error(
    //             error?.message ||
    //                 "Unable to fetch profile."
    //         );
    //     } finally {
    //         setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     fetchProfile();
    // }, []);

    // const handleChange = (
    //     field: keyof StudentProfile,
    //     value: string
    // ) => {
    //     if (!profile) return;

    //     setProfile({
    //         ...profile,
    //         [field]: value,
    //     });
    // };

    const handleSubmit = async (
        e: React.FormEvent
    ) => {
        e.preventDefault();

        if (!dashboardProfile || dashboardProfile.role !== "student") return;

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
                            dashboardProfile.first_name,
                        last_name:
                            dashboardProfile.last_name,
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

    // if (loading) {
    //     return (
    //         <p className="text-muted-foreground mx-auto py-10 text-center">
    //             Loading profile...
    //         </p>
    //     );
    // }

    // if (!profile) {
    //     return (
    //         <p className="text-red-500">
    //             Unable to load profile.
    //         </p>
    //     );
    // }

    return (
        <Card className="max-w-3xl mx-auto my-10">
            <CardHeader>
                <CardTitle>
                    My Profile
                </CardTitle>
            </CardHeader>

            <CardContent>
                {dashboardProfile.role === "student" ? (
                    <StudentProfileForm
                        profile={dashboardProfile}
                        setProfile={setDashboardProfile}
                        updating={updating}
                        onSubmit={handleSubmit}
                    />
                ) : (
                    <StaffProfileForm
                        profile={dashboardProfile}
                    />
                )}
            </CardContent>
        </Card>
        
    );
}


