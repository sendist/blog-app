"use client";

import Link from "next/link";
import { format } from "date-fns";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { MoreVertical, Pencil, Trash2, Plus, Calendar } from "lucide-react";

import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

// Post shape
interface Post {
  id: string;
  title: string;
  slug: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  content: string;
  createdAt: string;
  updatedAt: string;
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

export default function MyPostsPage() {
  const queryClient = useQueryClient();

  // 1. Fetch User's Posts
  const { data: posts, isLoading, isError } = useQuery({
    queryKey: ["my-posts"],
    queryFn: async () => {
      const res = await api.get<PaginatedResponse>("/posts");
      return res.data;
    },
  });

  // 2. Delete Post Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      return api.delete(`/posts/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["my-posts"] });
      toast("Post deleted", { description: "The post has been removed successfully." });
    },
    onError: () => {
      toast("Error", { description: "Failed to delete post." });
    },
  });

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this post?")) {
      deleteMutation.mutate(id);
    }
  };

  // Helper for status colors
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PUBLISHED": return <Badge className="bg-green-600 hover:bg-green-700">Published</Badge>;
      case "ARCHIVED": return <Badge variant="destructive">Archived</Badge>;
      default: return <Badge variant="secondary">Draft</Badge>;
    }
  };

  if (isLoading) return <div className="p-8">Loading your posts...</div>;
  if (isError) return <div className="p-8 text-red-500">Failed to load posts.</div>;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">My Posts</h1>
          <p className="text-muted-foreground mt-1">Manage and organize your articles.</p>
        </div>
        <Button asChild>
          <Link href="/my-posts/create">
            <Plus className="mr-2 h-4 w-4" /> Create New
          </Link>
        </Button>
      </div>

      {/* Grid Layout for Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts?.data.length === 0 ? (
          <div className="col-span-full text-center py-12 border rounded-lg bg-gray-50 dark:bg-gray-900 border-dashed">
            <h3 className="text-lg font-medium">No posts yet</h3>
            <p className="text-muted-foreground mb-4">Start writing your first article today.</p>
            <Button asChild variant="outline">
              <Link href="/my-posts/create">Create Post</Link>
            </Button>
          </div>
        ) : (
          posts?.data.map((post) => (
            <Card key={post.id} className="flex flex-col h-full hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">

                <div className="flex justify-between items-start gap-2">
                <div className="space-y-1">
                  <CardTitle className="leading-tight">
                    <Link href={`/post/${post.slug}`} className="hover:underline line-clamp-2">
                      {post.title}
                    </Link>
                  </CardTitle>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Calendar className="mr-1 h-3 w-3" />
                    {format(new Date(post.createdAt), "MMM d, yyyy")}
                  </div>
                </div>
                
                {/* Actions Dropdown */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <span className="sr-only">Open menu</span>
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem asChild>
                      <Link href={`/my-posts/${post.id}/edit`} className="cursor-pointer">
                        <Pencil className="mr-2 h-4 w-4" /> Edit
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => handleDelete(post.id)}
                      className="text-red-600 focus:text-red-600 cursor-pointer"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent className="flex-1 py-4">
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {post.content}
                </p>
              </CardContent>

              <CardFooter className="pt-0 flex justify-between items-center">
                {getStatusBadge(post.status)}
                
                {/* Optional: Add a 'Read more' link if needed, or keep it clean */}
              </CardFooter>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}


