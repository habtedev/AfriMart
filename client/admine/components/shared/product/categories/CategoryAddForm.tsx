"use client";
import { useState, ChangeEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { 
  Plus, 
  Image as ImageIcon, 
  Upload, 
  Eye,
  RefreshCw,
  Tag
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

// Category options from backend model
const CATEGORY_OPTIONS = [
  "handcraft",
  "home-goods",
  "electronics",
  "best-seller",
  "clothing",
] as const;

const CATEGORY_LABELS: Record<string, string> = {
  "handcraft": "Handcraft",
  "home-goods": "Home Goods",
  "electronics": "Electronics",
  "best-seller": "Best Seller",
  "clothing": "Clothing",
};

const formSchema = z.object({
  title: z.string()
    .min(3, "Title must be at least 3 characters")
    .max(100, "Title must be less than 100 characters"),
  description: z.string()
    .max(500, "Description must be less than 500 characters")
    .optional(),
  slug: z.string()
    .min(3, "Slug must be at least 3 characters")
    .max(50, "Slug must be less than 50 characters")
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase with hyphens")
    .optional(),
  image: z.string().optional(), // No URL validation, just a placeholder for file upload
  category: z.enum(CATEGORY_OPTIONS),
  isActive: z.boolean(),
  metaTitle: z.string().max(60, "Meta title must be less than 60 characters").optional(),
  metaDescription: z.string().max(160, "Meta description must be less than 160 characters").optional(),
});

export type FormValues = z.infer<typeof formSchema>;


interface CategoryAddFormProps {
  onSubmit: (data: FormValues & { imageFile?: File }) => void;
  isLoading?: boolean;
}

export default function CategoryAddForm({ onSubmit, isLoading = false }: CategoryAddFormProps) {
  const [previewImage, setPreviewImage] = useState<string>("");
  const [imageFile, setImageFile] = useState<File | undefined>(undefined);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      description: "",
      slug: "",
      image: "",
      category: "handcraft",
      isActive: true,
      metaTitle: "",
      metaDescription: "",
    },
  });

  const watchedTitle = form.watch("title");
  const watchedImage = form.watch("image");

  // Generate slug from title
  const generateSlug = () => {
    const title = form.getValues("title");
    if (title) {
      const slug = title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/--+/g, "-")
        .trim();
      form.setValue("slug", slug);
    }
  };

  // Update preview when image URL changes
  const handleImageChange = (url: string) => {
    setPreviewImage(url);
  };

  // Handle form submission
  const handleSubmit = (data: FormValues) => {
    // Pass the File object (if any) along with form data
    onSubmit({ ...data, imageFile });
    form.reset();
    setPreviewImage("");
    setImageFile(undefined);
    toast({
      title: "Category added successfully",
      description: `${data.title} has been added to categories.`,
    });
  };

  // Handle image upload from file input
  const handleImageFileChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setImageFile(file);
    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreviewImage(reader.result as string);
    };
    reader.readAsDataURL(file);
    // Set a placeholder in the form for validation, but real upload is via file
    form.setValue("image", "uploaded");
    toast({ title: "Image selected", description: file.name });
  };

  // Keep the old demo upload for fallback
  const handleImageUpload = () => {
    const demoImageUrl = "https://images.unsplash.com/photo-1578500494198-246f612d3b3d?w=400";
    form.setValue("image", demoImageUrl);
    setPreviewImage(demoImageUrl);
  };

  return (
    <Card className="border shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Tag className="h-5 w-5" />
            Add New Category
          </CardTitle>
          <Badge variant="outline" className="font-normal">
            {CATEGORY_OPTIONS.length} types available
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid gap-6 md:grid-cols-2">
              {/* Left Column - Basic Information */}
              <div className="space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Category Title *</span>
                        <span className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/100
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., Handmade Ceramics" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>URL Slug</span>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={generateSlug}
                        >
                          <RefreshCw className="mr-1 h-3 w-3" />
                          Generate
                        </Button>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="e.g., handmade-ceramics" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Used in URLs. Leave empty to auto-generate from title.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Description</span>
                        <span className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/500
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe this category..."
                          className="min-h-25 resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Right Column - Image & Category */}
              <div className="space-y-6">
                <div className="space-y-4">
                  <FormLabel>Category Image <span className="text-red-500">*</span></FormLabel>
                  <div className="grid gap-4">
                    <div className="flex gap-2">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageFileChange}
                        className="hidden"
                        id="category-image-upload"
                        required
                      />
                      <label htmlFor="category-image-upload">
                        <Button
                          asChild
                          type="button"
                          variant="outline"
                          size="icon"
                          title="Upload image from device"
                        >
                          <span><Upload className="h-4 w-4" /></span>
                        </Button>
                      </label>
                      {previewImage && (
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          onClick={() => window.open(previewImage, '_blank')}
                          title="Preview image"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                    <span className="text-xs text-muted-foreground">Upload an image from your device. <span className="text-red-500">Image is required.</span></span>
                  </div>

                    {/* Image Preview */}
                    {previewImage && (
                      <div className="relative aspect-video overflow-hidden rounded-lg border">
                        <img
                          src={previewImage}
                          alt="Preview"
                          className="h-full w-full object-cover"
                          onError={() => setPreviewImage("")}
                        />
                      </div>
                    )}

                    {!previewImage && (
                      <div className="flex aspect-video items-center justify-center rounded-lg border border-dashed bg-muted/30">
                        <div className="flex flex-col items-center gap-2 text-center">
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            No image selected
                          </p>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={handleImageUpload}
                          >
                            Choose an image
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                <FormField
                  control={form.control}
                  name="category"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Category Type *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select category type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {CATEGORY_OPTIONS.map((option) => (
                            <SelectItem key={option} value={option}>
                              <div className="flex items-center gap-2">
                                <span>{CATEGORY_LABELS[option]}</span>
                                <Badge variant="secondary" className="ml-auto text-xs">
                                  {option}
                                </Badge>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="isActive"
                  render={({ field }) => (
                    <FormItem className="flex items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel>Active Status</FormLabel>
                        <FormDescription>
                          Make this category visible on the website
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
          {/* SEO Section */}
          <Separator />
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">SEO Settings (Optional)</h3>
            <div className="grid gap-4 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Meta Title</span>
                        <span className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/60
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="For search engine results" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="flex items-center justify-between">
                        <span>Meta Description</span>
                        <span className="text-xs text-muted-foreground">
                          {field.value?.length || 0}/160
                        </span>
                      </FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Description for search engines"
                          className="min-h-20 resize-none"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Form Actions */}
            <div className="flex gap-3 pt-4">
              <Button
                type="submit"
                className="flex-1"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Adding...
                  </>
                ) : (
                  <>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Category
                  </>
                )}
              </Button>
              
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  setPreviewImage("");
                }}
                disabled={isLoading}
              >
                Clear Form
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}