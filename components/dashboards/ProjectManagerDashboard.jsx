"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  FolderKanban,
  Users,
  AlertTriangle,
  TrendingUp,
  Clock,
  CheckCircle2,
  DollarSign,
  ArrowRight,
  FileText,
  Check,
  X,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Progress } from "@/components/ui/progress";

export default function ProjectManagerDashboard({ user }) {
  const router = useRouter();
  const [stats, setStats] = useState({
    totalProjects: 0,
    activeProjects: 0,
    totalTasks: 0,
    delayedTasks: 0,
    teamMembers: 0,
    hoursLogged: 0,
    pendingSalesOrders: 0,
  });
  const [projects, setProjects] = useState([]);
  const [pendingSalesOrders, setPendingSalesOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch all data in parallel for better performance
      const [projectsRes, salesOrdersRes, tasksRes, usersRes] = await Promise.all([
        fetch("/api/projects"),
        fetch("/api/sales-orders?status=PENDING_APPROVAL"),
        fetch("/api/tasks"),
        fetch("/api/users"),
      ]);

      // Process projects
      if (projectsRes.ok) {
        const projectsData = await projectsRes.json();
        const active = projectsData.filter((p) => p.status === "IN_PROGRESS").length;
        setStats((prev) => ({
          ...prev,
          totalProjects: projectsData.length,
          activeProjects: active,
        }));
        setProjects(projectsData.slice(0, 6));
      }

      // Process pending sales orders
      if (salesOrdersRes.ok) {
        const salesOrders = await salesOrdersRes.json();
        
        // Show ALL pending sales orders to any PROJECT_MANAGER
        // This allows any project manager to approve requests
        setPendingSalesOrders(salesOrders);
        setStats((prev) => ({
          ...prev,
          pendingSalesOrders: salesOrders.length,
        }));
      }

      // Process tasks
      if (tasksRes.ok) {
        const tasks = await tasksRes.json();
        const delayed = tasks.filter(
          (t) => t.deadline && new Date(t.deadline) < new Date() && t.status !== "DONE"
        ).length;
        setStats((prev) => ({
          ...prev,
          totalTasks: tasks.length,
          delayedTasks: delayed,
        }));
      }

      // Process team members
      if (usersRes.ok) {
        const users = await usersRes.json();
        const teamCount = users.filter((u) => u.role === "TEAM_MEMBER").length;
        setStats((prev) => ({ ...prev, teamMembers: teamCount }));
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "PLANNED":
        return "bg-slate-500/10 text-slate-600 border-slate-500/20";
      case "IN_PROGRESS":
        return "bg-blue-500/10 text-blue-600 border-blue-500/20";
      case "ON_HOLD":
        return "bg-orange-500/10 text-orange-600 border-orange-500/20";
      case "COMPLETED":
        return "bg-green-500/10 text-green-600 border-green-500/20";
      default:
        return "bg-gray-500/10 text-gray-600 border-gray-500/20";
    }
  };

  const handleApproveSalesOrder = async (salesOrderId, action) => {
    try {
      const confirmMsg = action === "approve"
        ? "Are you sure you want to approve this sales order request?"
        : "Are you sure you want to reject this sales order request?";
      
      if (!confirm(confirmMsg)) return;

      const note = action === "reject"
        ? prompt("Please provide a reason for rejection (optional):")
        : null;

      const response = await fetch(`/api/sales-orders/${salesOrderId}/approve`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ action, note }),
      });

      if (response.ok) {
        alert(`Sales order ${action === "approve" ? "approved" : "rejected"} successfully!`);
        // Refresh dashboard data
        fetchDashboardData();
      } else {
        const error = await response.json();
        alert(`Error: ${error.error || "Failed to process request"}`);
      }
    } catch (error) {
      console.error("Error processing sales order:", error);
      alert("Failed to process sales order request");
    }
  };

  const formatCurrency = (amount) => {
    if (!amount) return "₹0";
    return `₹${parseFloat(amount).toLocaleString("en-IN")}`;
  };

  const formatDate = (date) => {
    if (!date) return "Not set";
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Project Manager Dashboard</h1>
          <p className="text-muted-foreground mt-1">
            Manage your projects and team effectively
          </p>
        </div>
        <Button onClick={() => router.push("/dashboard/projects/new")}>
          <FolderKanban className="mr-2 h-4 w-4" />
          New Project
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
            <FolderKanban className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} active
            </p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">Across all projects</p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Delayed Tasks</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats.delayedTasks}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending SO Requests</CardTitle>
            <FileText className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">{stats.pendingSalesOrders}</div>
            <p className="text-xs text-muted-foreground">Awaiting approval</p>
          </CardContent>
        </Card>

        <Card className="border-border/40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Sales Order Requests */}
      <Card className={pendingSalesOrders.length > 0 ? "border-orange-500/30 bg-orange-500/5" : "border-border/40"}>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sales Order Requests</CardTitle>
              <CardDescription>Review and approve sales order requests from sales team</CardDescription>
            </div>
            {pendingSalesOrders.length > 0 && (
              <Badge variant="outline" className="bg-orange-500/10 text-orange-600">
                {pendingSalesOrders.length} pending
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pendingSalesOrders.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <FileText className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-sm font-semibold mb-1">No Pending Requests</h3>
              <p className="text-sm text-muted-foreground">
                Sales order requests will appear here for your approval
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingSalesOrders.map((so) => (
                <Card key={so.id} className="border-border/40">
                  <CardContent className="pt-6">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="font-semibold">{so.number}</h4>
                            <Badge variant="outline" className="bg-orange-500/10 text-orange-600 text-xs">
                              Pending Approval
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Requested by: <span className="font-medium">{so.requestedBy?.name || "Unknown"}</span>
                          </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4 text-sm">
                          <div>
                            <span className="text-muted-foreground">Project:</span>
                            <p className="font-medium">{so.project?.name || "No project"}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Amount:</span>
                            <p className="font-medium text-green-600">{formatCurrency(so.total)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Date:</span>
                            <p className="font-medium">{formatDate(so.date)}</p>
                          </div>
                          <div>
                            <span className="text-muted-foreground">Requested:</span>
                            <p className="font-medium">{formatDate(so.requestedAt || so.createdAt)}</p>
                          </div>
                        </div>

                        {so.note && (
                          <div className="pt-2">
                            <span className="text-sm text-muted-foreground">Note:</span>
                            <p className="text-sm mt-1">{so.note}</p>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-green-500/30 text-green-600 hover:bg-green-500/10"
                          onClick={() => handleApproveSalesOrder(so.id, "approve")}
                        >
                          <Check className="h-4 w-4" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="gap-1 border-red-500/30 text-red-600 hover:bg-red-500/10"
                          onClick={() => handleApproveSalesOrder(so.id, "reject")}
                        >
                          <X className="h-4 w-4" />
                          Reject
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Projects Grid */}
      <Card className="border-border/40">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Your Projects</CardTitle>
              <CardDescription>Projects you&apos;re managing</CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => router.push("/dashboard/projects")}
            >
              View All
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {projects.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <FolderKanban className="h-16 w-16 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold mb-2">No projects yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first project to get started
              </p>
              <Button onClick={() => router.push("/dashboard/projects/new")}>
                <FolderKanban className="mr-2 h-4 w-4" />
                Create Project
              </Button>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {projects.map((project) => (
                <Card
                  key={project.id}
                  className="border-border/40 hover:shadow-md transition-shadow cursor-pointer"
                  onClick={() => router.push(`/dashboard/projects/${project.id}`)}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <CardTitle className="text-base line-clamp-1">
                          {project.name}
                        </CardTitle>
                        {project.code && (
                          <p className="text-xs text-muted-foreground mt-1">
                            {project.code}
                          </p>
                        )}
                      </div>
                      <Badge variant="outline" className={getStatusColor(project.status)}>
                        {project.status.replace("_", " ")}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {project.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {project.description}
                      </p>
                    )}
                    
                    {/* Progress */}
                    {project.stats && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">
                            {project.stats.completionRate}%
                          </span>
                        </div>
                        <Progress value={project.stats.completionRate} className="h-2" />
                      </div>
                    )}

                    {/* Stats */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <CheckCircle2 className="h-3 w-3" />
                        <span>
                          {project.stats?.completedTasks || 0}/{project.stats?.totalTasks || 0} tasks
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        <span>{project.members?.length || 0} members</span>
                      </div>
                    </div>

                    {/* Budget */}
                    {project.budget && (
                      <div className="flex items-center justify-between text-xs pt-2 border-t border-border/40">
                        <span className="text-muted-foreground">Budget</span>
                        <span className="font-medium">₹{project.budget.toLocaleString()}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card className="border-border/40">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common tasks for project management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 md:grid-cols-4">
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push("/dashboard/projects/new")}
            >
              <FolderKanban className="mr-2 h-4 w-4" />
              New Project
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push("/dashboard/tasks")}
            >
              <CheckCircle2 className="mr-2 h-4 w-4" />
              View All Tasks
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push("/dashboard/users")}
            >
              <Users className="mr-2 h-4 w-4" />
              Manage Team
            </Button>
            <Button
              variant="outline"
              className="justify-start"
              onClick={() => router.push("/dashboard/analytics")}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              View Analytics
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
