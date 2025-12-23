"use client";

import { useState, useEffect, useRef } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Camera, Loader2, User, Shield, Pencil, Mail, BookOpen } from "lucide-react";
import { toast } from "sonner";

import { useAuth } from "@/hooks/use-auth";
import api from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea"; // Import Textarea
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

// Validation Schema
const profileSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  bio: z.string().max(160, "Bio must be less than 160 characters").optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export default function DashboardPage() {
  const { user } = useAuth(); 
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Setup Form
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: "",
      bio: "",
    },
  });

  // Reset form with user data when available
  useEffect(() => {
    if (user) {
      form.reset({
        name: user.name || "",
        bio: user.bio || "",
      });
    }
  }, [user, form]);

  // Update Profile Mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (values: ProfileFormValues) => {
      // Sends only name and bio to the backend
      const res = await api.patch("/me", values); 
      return res.data;
    },
    onSuccess: () => {
      toast("Profile updated", { description: "Your details have been saved." });
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
    onError: () => {
      toast("Error", { description: "Failed to update profile." });
    },
  });

  const onSubmit = (values: ProfileFormValues) => {
    updateProfileMutation.mutate(values);
  };

  // Helper to get initials
  const getInitials = (name: string) => {
    return name
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2);
  };

  // 1. Avatar Upload Mutation
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);

      // Important: Don't set Content-Type header manually, axios/fetch handles it for FormData
      const res = await api.post("/avatar", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return res.data;
    },
    onSuccess: () => {
      toast("Avatar updated", { description: "Looking good!" });
      queryClient.invalidateQueries({ queryKey: ["auth-user"] });
    },
    onError: () => {
      toast("Error", { description: "Failed to upload image. Max 2MB." });
    },
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      uploadAvatarMutation.mutate(file);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-3">
        
        {/* Profile Card */}
        <Card className="lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle>My Profile</CardTitle>
            <CardDescription>Manage your personal information</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            
            {/* User Info Header */}
            <div className="flex flex-col items-center text-center space-y-3">
              
              {/* Interactive Avatar Container */}
              <div className="relative group">
                <Avatar className="h-24 w-24 cursor-pointer ring-2 ring-transparent group-hover:ring-primary/20 transition-all">
                  <AvatarImage src={user?.imageUrl} className="object-cover" />
                  <AvatarFallback className="text-2xl font-bold bg-primary/10 text-primary">
                    {getInitials(user?.name || "U")}
                  </AvatarFallback>
                </Avatar>

                {/* Loading Spinner Overlay */}
                {uploadAvatarMutation.isPending && (
                  <div className="absolute inset-0 flex items-center justify-center bg-background/80 rounded-full">
                    <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  </div>
                )}

                {/* Camera Icon Overlay (Visible on Hover) */}
                {!uploadAvatarMutation.isPending && (
                  <div 
                    className="absolute inset-0 flex items-center justify-center bg-black/40 text-white opacity-0 group-hover:opacity-100 rounded-full transition-opacity cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Camera className="h-6 w-6" />
                  </div>
                )}

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/png, image/jpeg, image/jpg"
                  onChange={handleFileChange}
                />
              </div>
              
              <div className="space-y-1">
                <h3 className="font-semibold text-xl">{user?.name}</h3>
                <div className="flex items-center justify-center text-sm text-muted-foreground">
                  <Mail className="mr-2 h-3 w-3" />
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Bio Section */}
            <div className="bg-muted/50 p-3 rounded-md text-sm text-center italic text-muted-foreground">
              {user?.bio ? (
                `"${user.bio}"`
              ) : (
                <span className="opacity-50">No bio added yet.</span>
              )}
            </div>

            <div className="space-y-4 pt-4 border-t">
              <div className="flex items-center text-sm text-muted-foreground">
                <Shield className="mr-2 h-4 w-4" /> 
                <span className="font-medium text-foreground mr-2">Role:</span>
                <span className="capitalize">{user?.role?.toLowerCase()}</span>
              </div>
            </div>

            {/* Edit Profile Dialog */}
            <Dialog open={open} onOpenChange={setOpen}>
              <DialogTrigger asChild>
                <Button className="w-full" variant="outline">
                  <Pencil className="mr-2 h-4 w-4" /> Edit Profile
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Edit Profile</DialogTitle>
                  <DialogDescription>
                    Update your name and bio. Email cannot be changed here.
                  </DialogDescription>
                </DialogHeader>

                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    
                    {/* Name Field */}
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Your name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Bio Field */}
                    <FormField
                      control={form.control}
                      name="bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell us a little about yourself" 
                              className="resize-none" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <DialogFooter>
                      <Button type="submit" disabled={updateProfileMutation.isPending}>
                        {updateProfileMutation.isPending && (
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Save changes
                      </Button>
                    </DialogFooter>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>

          </CardContent>
        </Card>

        {/* Status */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">User Role</CardTitle>
                <Shield className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{user?.role}</div>
                <p className="text-xs text-muted-foreground">
                  { user?.role === "ADMIN" ? "Administrator with full permissions" : "User with standard access" }
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                <User className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">Active</div>
                <p className="text-xs text-muted-foreground">
                  Your account is in good standing
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

      </div>
    </div>
  );
}