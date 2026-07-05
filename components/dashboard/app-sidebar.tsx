"use client"
import React from 'react'
import { useState } from 'react'
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';

import {
  Avatar,
  AvatarImage,
  AvatarFallback
} from '@radix-ui/react-avatar';

import Cookies from "js-cookie"

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



export default function AppSidebar() {
  const [active, setActive] = useState<string | null>(null);

  interface User {
    name: string,
    avatar: string,
    email: string,
    role: string
  }

  const [user, setUser] = useState<User>({
    name: "",
    avatar: "https://github.com/shadcn.png",
    email: "",
    role: "student"
  });

  useEffect(() => {
    const fetchProfile = async () => {

      try {
        const res = await fetch("/api/profile", {
          method: "GET",
          credentials: "include",
          headers: {
            "Content-Type": "application/json",
          },
          // body: JSON.stringify(values),
        });
  
        if (!res.ok) throw new Error("Profile fetch failed");
  
        const result = await res.json();
        setUser((preUser) => ({...preUser, name: result.full_name, email: result.email, role: result.role}));
      } catch (err) {
        console.error("Login error:", err);
      }
    }

    fetchProfile();

  }, []);


  const sidebarMenuItems = [
    {
      key: "job",
      name: "Jobs",
      url: "/dashboard/job"
    },
    {
      key: "application",
      name: "Applications",
      url: "/dashboard/application"
    }
  ]

  const handleClick = (key: string, url: string) => {
    setActive(key);
    router.push(url);
  }

  const router = useRouter();
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

        const result = await res.json();

      } catch (err) {
        console.error("Login error:", err);
      }

    router.refresh();
  }

  

  type MenuItem = {
    key: string
    name: string
    url: string
  }

  return (


    <Sidebar className=''>
      <SidebarHeader>
        <div className=''>
          <h1 className='text-center text-wrap text-3xl font-bold py-6'>Admin Panel</h1>
          {/* h-8 w-8 */}
          <div className=' '>
            <Avatar className=" size-36 flex mx-16 lg:mx-12">
              <AvatarImage className='rounded-full grayscale  ' src={user.avatar} alt={user.name} />
              {/* <Image 
                    src="/avatar.svg"
                    alt={user.name}
                    width={24}
                    height={24}
                    className='h-6 w-6 object-cover object-center rounded-full'
                  /> */}
              <AvatarFallback className="flex items-center justify-center rounded-lg ">CN</AvatarFallback>
            </Avatar>
          </div>
          <p className='text-center'>{user.name}</p>
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
                    className='justify-center'

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
