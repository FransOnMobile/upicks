import Navbar from "@/components/navbar";
import { OrganizationSchema, WebsiteSchema } from "@/components/seo/json-ld";

export default function MainLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <>
            <OrganizationSchema />
            <WebsiteSchema />
            <Navbar />
            {children}
        </>
    );
}
