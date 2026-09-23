"use client"
import React, {
    createContext,
    useContext,
    useEffect,
    useState,
} from 'react';
import AppSidebar from '@/components/dashboard/app-sidebar'
import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import Breadcrumbs from '@/components/dashboard/breadcrumbs'
import { Profile } from '../types/profile';

interface DashboardContextType {
    profile: Profile | null;
    profileLoading: boolean;
}

const DashboardContext =
    createContext<DashboardContextType | null>(null);

export function useDashboard() {
    const context = useContext(DashboardContext);

    if (!context) {
        throw new Error(
            "useDashboard must be used inside DashboardSidebarProvider"
        );
    }

    return context;
}

function DashboardSidebarProvider({ children }: { children: React.ReactNode }) {
    const [profile, setProfile] = useState<Profile | null>(null);
    const [profileLoading, setProfileLoading] = useState(true);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await fetch("/api/profile", {
                    method: "GET",
                    credentials: "include",
                    headers: {
                        "Content-Type": "application/json",
                    },
                });

                if (!res.ok) {
                    throw new Error("Failed to fetch profile");
                }

                const result = await res.json();
                console.log("result: ", result);

                setProfile(result);
            } catch (error) {
                console.error("Failed to fetch profile:", error);
            } finally {
                setProfileLoading(false);
            }
        };

        fetchProfile();
    }, []);

    return (
        <DashboardContext.Provider value={{ profile, profileLoading, }}>
            <SidebarProvider>
                <AppSidebar profile={profile} profileLoading={profileLoading} />
                <SidebarInset>
                    <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                        <Breadcrumbs />
                    </header>
                    {children}
                </SidebarInset>
            </SidebarProvider>
        </DashboardContext.Provider>
    )
}

export default DashboardSidebarProvider