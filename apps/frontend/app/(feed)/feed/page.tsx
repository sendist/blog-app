"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { formatDistanceToNow } from "date-fns";
import { Search, Loader2, ChevronLeft, ChevronRight, User } from "lucide-react";

import api from "@/lib/api";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";

// Public Post shape
interface PublicPost {
  id: string;
  title: string;
  slug: string;
  content: string;
  createdAt: string;
  updatedAt: string;
  user: {
    id: string;
    name: string;
  };
}

interface PublicResponse {
  data: PublicPost[];
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}

export default function FeedPage() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const limit = 9;

  // Fetch Query with Search & Pagination
  const { data: response, isLoading, isPlaceholderData } = useQuery({
    queryKey: ["public-posts", page, search],
    queryFn: async () => {
      // Construct query params
      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
      });
      if (search) params.append("q", search);

      const res = await api.get<PublicResponse>(`/public/posts?${params.toString()}`);
      return res.data;
    },
    placeholderData: (previousData) => previousData, // Keep showing old data while fetching new page
  });

  // Helper for Avatar Initials
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="space-y-8 pb-10">
      
      {/* Header & Search Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Community Feed</h1>
          <p className="text-muted-foreground mt-1">Discover stories from other writers.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search articles..."
            className="pl-9"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1); // Reset to page 1 on search
            }}
          />
        </div>
      </div>

      {/* Loading State */}
      {isLoading && !response ? (
        <div className="flex h-64 w-full items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Empty State */}
          {response?.data.length === 0 ? (
            <div className="text-center py-20 border rounded-lg bg-muted/10 border-dashed">
              <h3 className="text-lg font-medium">No posts found</h3>
              <p className="text-muted-foreground">Try adjusting your search terms.</p>
            </div>
          ) : (
            
            /* Grid Layout */
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {response?.data.map((post) => (
                <Card key={post.id} className="flex flex-col h-full hover:shadow-lg transition-all duration-200 group">
                  <CardHeader className="pb-3">
                    {/* Author Info */}
                    <div className="flex items-center gap-2 mb-3">
                      <Avatar className="h-8 w-8 border">
                        <AvatarFallback className="text-xs bg-primary/5 text-primary">
                          {getInitials(post.user.name)}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex flex-col text-xs">
                        <span className="font-medium text-foreground">{post.user.name}</span>
                        <span className="text-muted-foreground">
                            {formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    
                    <CardTitle className="leading-tight text-xl group-hover:text-primary transition-colors">
                      <Link href={`/posts/${post.slug}`} className="line-clamp-2">
                        {post.title}
                      </Link>
                    </CardTitle>
                  </CardHeader>
                  
                  <CardContent className="flex-1 pb-3">
                    <p className="text-sm text-muted-foreground line-clamp-3 leading-relaxed">
                        {post.content.length > 150 
                            ? post.content.substring(0, 150) + "..." 
                            : post.content}
                    </p>
                  </CardContent>

                  <CardFooter className="pt-0">
                    <Button variant="secondary" size="sm" className="w-full" asChild>
                      <Link href={`/posts/${post.slug}`}>
                        Read Article
                      </Link>
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}

          {/* Pagination Controls */}
          <div className="flex items-center justify-between pt-4 border-t">
            <div className="text-sm text-muted-foreground">
              Page {response?.meta.page} of {Math.ceil((response?.meta.total || 0) / limit)}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((old) => Math.max(old - 1, 1))}
                disabled={page === 1 || isLoading}
              >
                <ChevronLeft className="h-4 w-4 mr-2" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (!isPlaceholderData && response?.meta.total && page * limit < response.meta.total) {
                    setPage((old) => old + 1);
                  }
                }}
                disabled={isPlaceholderData || (response?.meta.total ? page * limit >= response.meta.total : true)}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}