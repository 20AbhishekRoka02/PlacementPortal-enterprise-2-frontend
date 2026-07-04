import DashboardSidebarProvider from "./DashboardSidebarProvider"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {

    return (
        <>
        <DashboardSidebarProvider>
            {/* <p className="text-center">This is layout text. </p> */}
            <section>{children}</section>
        </DashboardSidebarProvider>
        
        </>
    )
}