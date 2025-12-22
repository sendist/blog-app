"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ArrowLeft, Calendar, User, Pencil, Clock } from "lucide-react";

import api from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

interface PostDetail {
  id: string;
  title: string;
  slug: string;
  content: string;
  status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
}

export default function PostDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { user: currentUser } = useAuth();

  // Fetch Post by Slug
  const { data: post, isLoading, isError } = useQuery({
    queryKey: ["post-detail", slug],
    queryFn: async () => {
      const res = await api.get<PostDetail>(`/public/posts/${slug}`);
      return res.data;
    },
    retry: false,
  });

  const getInitials = (name: string) => {
    return name?.substring(0, 2).toUpperCase() || "??";
  };

  // read time calculation
  const calculateReadTime = (text: string) => {
    const wpm = 200;
    const words = text.trim().split(/\s+/).length;
    const time = Math.ceil(words / wpm);
    return `${time} min read`;
  };

  if (isLoading) {
    return (
      <div className="max-w-3xl mx-auto py-12 px-6 space-y-8 animate-pulse">
        <div className="h-4 w-24 bg-muted rounded" />
        <div className="space-y-4">
          <div className="h-10 w-3/4 bg-muted rounded" />
          <div className="flex gap-4">
            <div className="h-10 w-10 rounded-full bg-muted" />
            <div className="space-y-2">
              <div className="h-4 w-32 bg-muted rounded" />
              <div className="h-3 w-24 bg-muted rounded" />
            </div>
          </div>
        </div>
        <div className="space-y-2 pt-8">
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-full bg-muted rounded" />
          <div className="h-4 w-5/6 bg-muted rounded" />
        </div>
      </div>
    );
  }

  if (isError || !post) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-4">
        <h2 className="text-2xl font-bold">Post not found</h2>
        <p className="text-muted-foreground">The article you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link href="/feed">Back to Feed</Link>
        </Button>
      </div>
    );
  }

  const isAuthor = currentUser?.id === post.user.id;

  return (
    <article className="max-w-3xl mx-auto py-10 px-6 space-y-8">
      
      {/* Navigation & Actions */}
      <div className="flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-3 text-muted-foreground hover:text-foreground">
          <Link href="/feed">
            <ArrowLeft className="mr-2 h-4 w-4" /> Back to Feed
          </Link>
        </Button>

        {/* Edit Button (Only visible to Author) */}
        {isAuthor && (
          <Button variant="outline" size="sm" asChild>
            <Link href={`/my-posts/${post.id}/edit`}>
              <Pencil className="mr-2 h-4 w-4" /> Edit Article
            </Link>
          </Button>
        )}
      </div>

      {/* Header Section */}
      <div className="space-y-6">
        <div className="space-y-3">
          {post.status !== 'PUBLISHED' && (
            <Badge variant="secondary" className="mb-2">
              {post.status}
            </Badge>
          )}
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground leading-tight">
            {post.title}
          </h1>
        </div>

        {/* Author & Meta Data */}
        <div className="flex items-center justify-between py-4 border-y">
          <div className="flex items-center gap-3">
            <Avatar className="h-10 w-10 border">
              <AvatarFallback className="bg-primary/10 text-primary font-medium">
                {getInitials(post.user.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col text-sm">
              <span className="font-semibold text-foreground">{post.user.name}</span>
            </div>
          </div>
          
          <div className="flex flex-col items-end text-sm text-muted-foreground gap-1">
            <div className="flex items-center">
              <Calendar className="mr-2 h-3.5 w-3.5" />
              {format(new Date(post.createdAt), "MMMM d, yyyy")}
            </div>
            <div className="flex items-center">
              <Clock className="mr-2 h-3.5 w-3.5" />
              {calculateReadTime(post.content)}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="prose prose-stone dark:prose-invert max-w-none">
        <div className="whitespace-pre-wrap leading-7 text-lg text-foreground/90">
          {post.content}
        </div>
      </div>

      {/* Footer Section */}
      <div className="pt-10">
        <Separator className="mb-8" />
        <div className="bg-muted/30 p-6 rounded-lg flex items-center gap-4">
           <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
             <User className="h-6 w-6 text-primary" />
           </div>
           <div>
             <h3 className="font-medium">Written by {post.user.name}</h3>
             <p className="text-sm text-muted-foreground mt-1">
               Read more articles from this author in the community feed.
             </p>
           </div>
        </div>
      </div>

    </article>
  );
}