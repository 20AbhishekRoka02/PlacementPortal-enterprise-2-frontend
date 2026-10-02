"use client"

import { useState } from 'react'
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';

import {
  Avatar,
  AvatarFallback
} from '@radix-ui/react-avatar';

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarHeader,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar"
import { Profile } from '@/app/types/profile';

interface AppSidebarProps {
  profile: Profile | null;
  profileLoading: boolean;
}

type MenuItem = {
  key: string;
  name: string;
  url: string;
};

export default function AppSidebar({
  profile,
  profileLoading
}: AppSidebarProps) {
  const router = useRouter();
  const [active, setActive] = useState<string | null>(null);

 const sidebarMenuItems: MenuItem[] = profile?.is_staff
  ? [
      {
        key: "job",
        name: "Jobs",
        url: "/dashboard/job",
      },
    ]
  : [
      {
        key: "job",
        name: "Jobs",
        url: "/dashboard/job",
      },
      {
        key: "application",
        name: "Applications",
        url: "/dashboard/application",
      },
    ];

  interface User {
    name: string,
    avatar: string,
    email: string,
    role: string,
    is_staff: boolean,
  }

  const handleClick = (key: string, url: string) => {
    setActive(key);
    router.push(url);
  }

  const logout = async () => {
    try {
      const res = await fetch("/api/auth/logout", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) throw new Error("Logout failed");
      router.refresh();

    } catch (err) {
      console.error("Login error:", err);
    }

  }

  return (
    <Sidebar>
      <SidebarHeader>
        <div>
          <h1 className='text-center text-wrap text-3xl font-bold py-6'>Admin Panel</h1>
          {/* h-8 w-8 */}
          <div>
            <a href="/dashboard/profile">
              <div className="mx-auto size-16 border-2 rounded-full flex items-center justify-center">
                <p className="text-2xl font-semibold text-center">{profile?.email?.charAt(0).toUpperCase() ?? "U"}</p>
              </div>
            </a>
          </div>
          <div className="mt-2 text-center">
            {profileLoading ? (
              <p>Loading...</p>
            ) : (
              <>
                <p>{profile?.email}</p>

                <p className="text-sm text-muted-foreground">
                  {profile?.role}
                </p>
              </>
            )}
          </div>
        </div>
      </ SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {sidebarMenuItems.map((menu: MenuItem) => (
                <SidebarMenuItem key={menu.key} >
                  <SidebarMenuButton
                    isActive={active === menu.key}
                    onClick={() => handleClick(menu.key, menu.url)}
                    variant={"outline"}
                    className='justify-center mb-3'
                  >
                    {menu.name}
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter >
        <Button
          variant={"destructive"} onClick={logout}>Logout</Button>
      </SidebarFooter>
    </Sidebar>

  )
}
