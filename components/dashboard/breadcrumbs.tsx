"use client"
import React from 'react'
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator

} from '@/components/ui/breadcrumb'
import { usePathname } from 'next/navigation'
import { SlashIcon } from 'lucide-react'
// import { useEffect } from 'react'
type breadcrumbObj = {
    name: string,
    link: string
}
function Breadcrumbs() {

    const p = usePathname();
    // console.log("path: ", path);

    let len = p.split("/").length;
    let paths = p.split("/").slice(1, len - 1);
    let pathObjs: breadcrumbObj[] = [];

    for (let index = 0; index < paths.length- 1; index++) {
        let link = "/" + paths.slice(0, index + 1).join("/");
        let name = paths[index];
        let pathObj: breadcrumbObj = {
            name: name,
            link: link
        };

        pathObjs.push(pathObj);
    }

    return (

        <>
            <Breadcrumb>
                <BreadcrumbList>
                    {
                        (pathObjs.length > 0) ?
                            pathObjs.map((pathObj, index) => (

                                <>

                                    <BreadcrumbItem className="hidden md:block" key={index}>
                                        <BreadcrumbLink href={pathObj.link}>
                                            {pathObj.name}
                                        </BreadcrumbLink>
                                    </BreadcrumbItem>
                                    <BreadcrumbSeparator className="hidden md:block">
                                        <SlashIcon/>
                                    </ BreadcrumbSeparator>
                                </>


                            ))
                            : ""

                    }
                    {/* <BreadcrumbItem className="hidden md:block">
                    </BreadcrumbItem> */}
                    <BreadcrumbItem>
                        <BreadcrumbPage>{paths[paths.length - 1]}</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

        </>
    )
}

export default Breadcrumbs