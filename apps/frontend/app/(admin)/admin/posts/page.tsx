"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow
} from "@/components/ui/table";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// User object
interface User {
  id: string;
  name: string;
  email: string;
}

// Post object 
interface Post {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  content: string | null;
  createdAt: string;
  updatedAt: string;
  user: User;
}

// API Response Wrapper
interface PaginatedResponse {
  data: Post[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export default function AdminPostsPage() {
  const { user, isLoading: authLoading } = useAuth(true);
  const queryClient = useQueryClient();

  // Fetch All Posts
  const { data: posts, isLoading } = useQuery({
    queryKey: ["admin-posts"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse>("admin/posts"); 
      return res.data;
    },
    enabled: !!user && user.role === "ADMIN",
  });

  // Mutation to update status
  const updateStatus = useMutation({
    mutationFn: async ({ id, status }: { id: string; status: string }) => {
      return api.patch(`/admin/posts/${id}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-posts"] });
      toast("Status updated successfully");
    },
  });

  if (authLoading || isLoading) return <div>Loading dashboard...</div>;
  if (user?.role !== "ADMIN") return <div>Access Denied</div>;

return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Admin: Manage Posts</h1>
      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Content</TableHead>
              <TableHead>Author</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Current Status</TableHead>
              <TableHead>Action</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {(posts?.data || []).map((post) => (
              <TableRow key={post.id}>
                <TableCell className="font-medium">{post.title}</TableCell>
                <TableCell className="max-w-[250px] whitespace-normal">{post.content || "No content"}</TableCell>
                
                <TableCell>{post.user?.name || "Unknown"}</TableCell>
                <TableCell>{post.user?.email || "Unknown"}</TableCell>
                
                <TableCell>
                  <Badge variant={post.status === "PUBLISHED" ? "default" : "secondary"}>
                    {post.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Select
                    defaultValue={post.status}
                    onValueChange={(val) => updateStatus.mutate({ id: post.id, status: val })}
                    disabled={updateStatus.isPending} 
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DRAFT">Draft</SelectItem>
                      <SelectItem value="PUBLISHED">Published</SelectItem>
                      <SelectItem value="ARCHIVED">Archived</SelectItem>
                    </SelectContent>
                  </Select>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      <div className="mt-4 text-sm text-gray-500">
        Total Posts: {posts?.meta?.total || 0}
      </div>
    </div>
  );
}