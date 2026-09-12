import DashboardSidebarProvider from "./DashboardSidebarProvider"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <>
        <DashboardSidebarProvider>
            <section>{children}</section>
        </DashboardSidebarProvider>
        
        </>
    )
}