'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from "@/utils/supabase/client";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ShieldAlert, CheckCircle, XCircle, Clock, School, Trash2 } from 'lucide-react';
import { Skeleton } from "@/components/ui/skeleton";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";

interface Report {
    id: string;
    target_id: string;
    target_type: 'professor' | 'rating' | 'department' | 'professor_rating' | 'campus_rating';
    reason: string;
    details: string;
    status: 'pending' | 'resolved' | 'dismissed';
    created_at: string;
    reporter_id: string;
    content?: string; // New field for content preview
}

export default function ModeratorDashboard() {
    const [isLoading, setIsLoading] = useState(true);
    const [reports, setReports] = useState<Report[]>([]);
    const [userRole, setUserRole] = useState<string | null>(null);
    const [pendingProfessors, setPendingProfessors] = useState<any[]>([]);
    const [pendingDepartments, setPendingDepartments] = useState<any[]>([]);
    const [pendingCourses, setPendingCourses] = useState<any[]>([]);
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                router.push('/sign-in');
                return;
            }

            const { data: userData } = await supabase
                .from('users')
                .select('role')
                .eq('id', user.id)
                .single();

            if (userData?.role !== 'moderator') {
                router.push('/'); // Unauthorized
                return;
            }

            setUserRole(userData.role);
            await Promise.all([
                loadReports(),
                loadPendingProfessors(),
                loadPendingDepartments(),
                loadPendingCourses()
            ]);
            setIsLoading(false);
        };

        checkAccess();
    }, [router]);

    const loadReports = async () => {
        const { data: reportsData } = await supabase
            .from('reports')
            .select('*')
            .order('created_at', { ascending: false });

        if (!reportsData) return;

        // Fetch content for ratings
        // 'rating' comes from professor page, 'professor_rating' might be future/other, 'campus_rating' from campus
        const profRatingIds = reportsData
            .filter(r => r.target_type === 'professor_rating' || r.target_type === 'rating')
            .map(r => r.target_id);

        const campusRatingIds = reportsData.filter(r => r.target_type === 'campus_rating').map(r => r.target_id);

        let profRatings: any[] = [];
        let campusRatings: any[] = [];

        if (profRatingIds.length > 0) {
            const { data } = await supabase.from('ratings').select('id, review_text').in('id', profRatingIds);
            if (data) profRatings = data;
        }

        if (campusRatingIds.length > 0) {
            const { data } = await supabase.from('campus_ratings').select('id, review_text').in('id', campusRatingIds);
            if (data) campusRatings = data;
        }

        // Map content back to reports
        const enrichedReports = reportsData.map(r => {
            let content = '';
            if (r.target_type === 'professor_rating' || r.target_type === 'rating') {
                content = profRatings.find(pr => pr.id === r.target_id)?.review_text || 'Content not found (deleted?)';
            } else if (r.target_type === 'campus_rating') {
                content = campusRatings.find(cr => cr.id === r.target_id)?.review_text || 'Content not found (deleted?)';
            }
            return { ...r, content };
        });

        setReports(enrichedReports as Report[]);
    };

    const loadPendingProfessors = async () => {
        const { data } = await supabase
            .from('professors')
            .select('*')
            .eq('is_verified', false)
            .order('created_at', { ascending: false });

        if (data) setPendingProfessors(data);
    };

    const loadPendingDepartments = async () => {
        const { data } = await supabase
            .from('departments')
            .select('*')
            .eq('is_verified', false)
            .order('created_at', { ascending: false });
        if (data) setPendingDepartments(data);
    };

    const loadPendingCourses = async () => {
        const { data } = await supabase
            .from('courses')
            .select('*')
            .eq('is_verified', false)
            .order('created_at', { ascending: false });
        if (data) setPendingCourses(data);
    };

    const handleAction = async (reportId: string, action: 'resolve' | 'dismiss') => {
        const status = action === 'resolve' ? 'resolved' : 'dismissed';
        const { data: { user } } = await supabase.auth.getUser();

        const { error } = await supabase
            .from('reports')
            .update({
                status,
                resolved_at: new Date().toISOString(),
                resolved_by: user?.id
            })
            .eq('id', reportId);

        if (!error) {
            loadReports();
        } else {
            console.error("Error updating report:", error);
            alert("Failed to update report");
        }
    };

    const handleDeleteContent = async (reportId: string, targetType: string, targetId: string) => {
        if (!confirm("Are you sure you want to DELETE this content? This cannot be undone.")) return;

        let table = '';
        if (targetType === 'professor_rating' || targetType === 'rating') table = 'ratings';
        else if (targetType === 'campus_rating') table = 'campus_ratings';
        else {
            alert("Cannot delete this type of content automatically yet.");
            return;
        }

        // Delete content
        const { error: deleteError } = await supabase.from(table).delete().eq('id', targetId);
        if (deleteError) {
            console.error("Error deleting content:", deleteError);
            alert("Failed to delete content: " + deleteError.message);
            return;
        }

        // Resolve report
        await handleAction(reportId, 'resolve');
        alert("Content deleted and report resolved.");
    };

    const handleApprovalAction = async (
        table: 'professors' | 'departments' | 'courses',
        id: string,
        action: 'approve' | 'reject'
    ) => {
        if (action === 'approve') {
            const { error } = await supabase
                .from(table)
                .update({ is_verified: true })
                .eq('id', id);

            if (!error) {
                if (table === 'professors') loadPendingProfessors();
                if (table === 'departments') loadPendingDepartments();
                if (table === 'courses') loadPendingCourses();
                alert(`${table.slice(0, -1)} Approved!`);
            } else {
                console.error(error);
                alert("Failed to approve");
            }
        } else {
            if (!confirm(`Are you sure you want to REJECT and DELETE this ${table.slice(0, -1)}?`)) return;
            const { error } = await supabase
                .from(table)
                .delete()
                .eq('id', id);

            if (!error) {
                if (table === 'professors') loadPendingProfessors();
                if (table === 'departments') loadPendingDepartments();
                if (table === 'courses') loadPendingCourses();
                alert(`${table.slice(0, -1)} Rejected`);
            } else {
                console.error(error);
                alert("Failed to reject");
            }
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-slate-50 p-8">
                <div className="max-w-7xl mx-auto space-y-8">
                    <div className="space-y-2">
                        <Skeleton className="h-8 w-64" />
                        <Skeleton className="h-4 w-48" />
                    </div>

                    <div className="grid gap-4 md:grid-cols-4">
                        {[1, 2, 3, 4].map((i) => (
                            <Card key={i}>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <Skeleton className="h-4 w-24" />
                                    <Skeleton className="h-4 w-4 rounded-full" />
                                </CardHeader>
                                <CardContent>
                                    <Skeleton className="h-8 w-12 mb-1" />
                                    <Skeleton className="h-3 w-20" />
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    <div className="space-y-4">
                        <Skeleton className="h-10 w-96 rounded-lg" />
                        <Card>
                            <div className="p-6 space-y-4">
                                <div className="flex justify-between">
                                    <Skeleton className="h-4 w-32" />
                                    <Skeleton className="h-4 w-20" />
                                </div>
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                                <Skeleton className="h-12 w-full" />
                            </div>
                        </Card>
                    </div>
                </div>
            </div>
        );
    }

    const pendingReports = reports.filter(r => r.status === 'pending');
    const historyReports = reports.filter(r => r.status !== 'pending');

    return (
        <div className="min-h-screen bg-slate-50 p-8">
            <div className="max-w-7xl mx-auto space-y-8">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-900 font-playfair">Moderator Dashboard</h1>
                    <p className="text-slate-500">Manage reports and content moderation.</p>
                </div>

                <div className="grid gap-4 md:grid-cols-4">
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Items</CardTitle>
                            <School className="h-4 w-4 text-purple-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingProfessors.length + pendingDepartments.length + pendingCourses.length}</div>
                            <p className="text-xs text-muted-foreground">Professors, Depts, Courses</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Pending Reports</CardTitle>
                            <ShieldAlert className="h-4 w-4 text-orange-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{pendingReports.length}</div>
                            <p className="text-xs text-muted-foreground">Requires attention</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Resolved Today</CardTitle>
                            <CheckCircle className="h-4 w-4 text-green-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">
                                {reports.filter(r =>
                                    r.status === 'resolved' &&
                                    new Date(r.created_at).toDateString() === new Date().toDateString()
                                ).length}
                            </div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <CardTitle className="text-sm font-medium">Total Reports</CardTitle>
                            <Clock className="h-4 w-4 text-blue-500" />
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{reports.length}</div>
                        </CardContent>
                    </Card>
                </div>

                <Tabs defaultValue="pending-profs" className="w-full">
                    <TabsList>
                        <TabsTrigger value="pending-profs">Pending ({pendingProfessors.length + pendingDepartments.length + pendingCourses.length})</TabsTrigger>
                        <TabsTrigger value="pending">Reports ({pendingReports.length})</TabsTrigger>
                        <TabsTrigger value="history">Report History</TabsTrigger>
                    </TabsList>

                    <TabsContent value="pending-profs" className="mt-4">
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Professor Name</TableHead>
                                        <TableHead>Department</TableHead>
                                        <TableHead>Verification Notes</TableHead>
                                        <TableHead>Submitted Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingProfessors.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No new professors to review.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingProfessors.map((prof) => (
                                            <TableRow key={prof.id}>
                                                <TableCell className="font-medium">{prof.name}</TableCell>
                                                <TableCell>{prof.departments?.name || prof.department_id}</TableCell>
                                                <TableCell className="max-w-xs truncate" title={prof.verification_notes}>
                                                    {prof.verification_notes || '-'}
                                                </TableCell>
                                                <TableCell>{new Date(prof.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleApprovalAction('professors', prof.id, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApprovalAction('professors', prof.id, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* Departments Section */}
                        <h3 className="text-lg font-semibold mt-8 mb-4">Pending Departments</h3>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingDepartments.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No new departments.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingDepartments.map((dept) => (
                                            <TableRow key={dept.id}>
                                                <TableCell className="font-medium">{dept.name}</TableCell>
                                                <TableCell>{dept.code}</TableCell>
                                                <TableCell>{new Date(dept.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleApprovalAction('departments', dept.id, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApprovalAction('departments', dept.id, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>

                        {/* Courses Section */}
                        <h3 className="text-lg font-semibold mt-8 mb-4">Pending Courses</h3>
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Code</TableHead>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingCourses.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={4} className="text-center h-24 text-muted-foreground">
                                                No new courses.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingCourses.map((course) => (
                                            <TableRow key={course.id}>
                                                <TableCell className="font-medium">{course.code}</TableCell>
                                                <TableCell>{course.name}</TableCell>
                                                <TableCell>{new Date(course.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        onClick={() => handleApprovalAction('courses', course.id, 'reject')}
                                                    >
                                                        Reject
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleApprovalAction('courses', course.id, 'approve')}
                                                    >
                                                        Approve
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>

                    <TabsContent value="pending" className="mt-4">
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Content Preview</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Date</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingReports.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center h-24 text-muted-foreground">
                                                No pending reports. Great job!
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        pendingReports.map((report) => (
                                            <TableRow key={report.id}>
                                                <TableCell>
                                                    <Badge variant="outline" className="mr-2">{report.target_type}</Badge>
                                                </TableCell>
                                                <TableCell className="max-w-xs truncate font-mono text-xs text-muted-foreground" title={report.content}>
                                                    {report.content || '...'}
                                                </TableCell>
                                                <TableCell>{report.reason}</TableCell>
                                                <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                                                <TableCell className="text-right space-x-2">
                                                    <Button size="sm" variant="outline" onClick={() => handleAction(report.id, 'dismiss')}>
                                                        Dismiss
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="default" // Keep Resolve as primary safe action
                                                        onClick={() => handleAction(report.id, 'resolve')}
                                                    >
                                                        Keep
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="destructive"
                                                        title="Delete Content & Resolve"
                                                        onClick={() => handleDeleteContent(report.id, report.target_type, report.target_id)}
                                                    >
                                                        <span className="sr-only">Delete</span>
                                                        <Trash2 className="w-4 h-4" />
                                                    </Button>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>
                    <TabsContent value="history" className="mt-4">
                        <Card>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Target</TableHead>
                                        <TableHead>Reason</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Date</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {historyReports.map((report) => (
                                        <TableRow key={report.id}>
                                            <TableCell>
                                                <Badge variant="outline" className="mr-2">{report.target_type}</Badge>
                                                <span className="font-mono text-xs">{report.target_id.slice(0, 8)}...</span>
                                            </TableCell>
                                            <TableCell>{report.reason}</TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={report.status === 'resolved' ? 'destructive' : 'secondary'}
                                                >
                                                    {report.status}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{new Date(report.created_at).toLocaleDateString()}</TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </Card>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
