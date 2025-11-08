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
  });
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch projects
      const projectsRes = await fetch("/api/projects");
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

      // Fetch tasks
      const tasksRes = await fetch("/api/tasks");
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

      // Fetch team members
      const usersRes = await fetch("/api/users");
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
            <CardTitle className="text-sm font-medium">Team Members</CardTitle>
            <Users className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.teamMembers}</div>
            <p className="text-xs text-muted-foreground">Active members</p>
          </CardContent>
        </Card>
      </div>

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
