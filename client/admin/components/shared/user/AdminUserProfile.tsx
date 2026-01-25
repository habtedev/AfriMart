import React from "react";
import { useRouter } from "next/navigation";
import { Shield, Mail, User as UserIcon, Loader2, LogIn } from "lucide-react";
import { useAdminSession } from "@/hooks/useAdminSession";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

export default function AdminUserProfile() {
  const router = useRouter();
  const { user, loading } = useAdminSession();

  if (loading) {
    return (
      <div className="min-h-screen bg-muted/40 px-4 py-10">
        <div className="mx-auto max-w-4xl">
          <Card className="shadow-sm">
            <CardHeader>
              <div className="flex items-center gap-3">
                <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                <div>
                  <CardTitle>Checking your session</CardTitle>
                  <CardDescription>Contacting the admin login endpoint /auth/me</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="h-3 w-1/3 rounded-full bg-muted" />
              <div className="h-3 w-1/2 rounded-full bg-muted" />
              <div className="h-3 w-1/4 rounded-full bg-muted" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-muted/40 px-4 py-10">
        <div className="mx-auto max-w-3xl">
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Admin session required</CardTitle>
              <CardDescription>
                We could not find an active admin login. Use the button below to sign in again.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg border border-dashed p-4 text-muted-foreground">
                <Shield className="h-5 w-5" />
                <p className="text-sm">Session fetch comes from /auth/me with credentials included.</p>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={() => router.push("/admin/login")}> 
                <LogIn className="mr-2 h-4 w-4" />
                Go to login
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/40 px-4 py-10">
      <div className="mx-auto max-w-4xl space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-sm text-muted-foreground">User navigation</p>
            <h1 className="text-2xl font-bold leading-tight">Account overview</h1>
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="flex items-center gap-1 px-3 py-1">
              <Shield className="h-4 w-4" />
              Admin session active
            </Badge>
            <Button variant="outline" size="sm" onClick={() => router.refresh()}>
              Refresh session
            </Button>
          </div>
        </div>

        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                <UserIcon className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-xl">{user.name || "Admin User"}</CardTitle>
                <CardDescription>Details fetched from /auth/me</CardDescription>
              </div>
            </div>
            <Badge variant="outline" className="capitalize">
              {user.role || "admin"}
            </Badge>
          </CardHeader>

          <CardContent className="space-y-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Email</p>
                  <p className="text-sm text-muted-foreground">{user.email}</p>
                </div>
              </div>
              <Badge variant="secondary">ID: {user._id || user.id}</Badge>
            </div>
            <Separator />
            <p className="text-sm text-muted-foreground">
              The Users navigation in the header now points here. Use this page to inspect the current admin session
              returned from the login fetch and expand it later with management actions.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}