"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  PlusCircle,
  List
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { toast } from "sonner";

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Logout Mutation
  const logoutMutation = useMutation({
    mutationFn: async () => api.post("/auth/logout"),
    onSuccess: () => {
      // Clear all cache to remove user data
      queryClient.clear(); 
      toast("Logged out");
      router.push("/login");
    },
  });

  // Navigation Links
  const links = [
    {
      title: "Overview",
      href: "/dashboard",
      icon: LayoutDashboard,
      roles: ["USER", "ADMIN"],
    },
    {
      title: "My Posts",
      href: "/my-posts",
      icon: List,
      roles: ["USER"],
    },
    {
      title: "Create Post",
      href: "/my-posts/create",
      icon: PlusCircle,
      roles: ["USER"],
    },
    {
      title: "Manage Users",
      href: "/admin/users",
      icon: Users,
      roles: ["ADMIN"],
    },
    {
      title: "Manage All Posts",
      href: "/admin/posts",
      icon: FileText,
      roles: ["ADMIN"],
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      roles: ["USER", "ADMIN"],
    },
  ];

  return (
    <div className="flex h-screen w-64 flex-col justify-between border-r bg-gray-50/40 p-4 dark:bg-gray-900/40">
      <div className="space-y-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            Blog App
          </h2>
          <p className="px-4 text-xs text-muted-foreground">
            Welcome, {user?.name}
          </p>
        </div>
        
        <nav className="space-y-1">
          {links.map((link) => {
            // Hide link if user role doesn't match
            if (user && !link.roles.includes(user.role)) return null;

            const Icon = link.icon;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={cn(
                  "flex items-center rounded-md px-3 py-2 text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors",
                  pathname === link.href ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                )}
              >
                <Icon className="mr-2 h-4 w-4" />
                {link.title}
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="px-3 py-2">
        <Button 
          variant="outline" 
          className="w-full justify-start text-red-600 hover:text-red-700 hover:bg-red-50"
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
        >
          <LogOut className="mr-2 h-4 w-4" />
          {logoutMutation.isPending ? "Logging out..." : "Logout"}
        </Button>
      </div>
    </div>
  );
}