
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useStaffActivityLogger } from "@/hooks/useStaffActivityLogger";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Edit, Trash2 } from "lucide-react";
import { ForumCategory } from "@/types/forum";

interface CategoryManagementProps {
  userRole: string;
}

const CategoryManagement = ({ userRole }: CategoryManagementProps) => {
  const [categories, setCategories] = useState<ForumCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const { logActivity } = useStaffActivityLogger();

  // Form state
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [displayOrder, setDisplayOrder] = useState(0);
  const [showForm, setShowForm] = useState(false);

  // Delete dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<ForumCategory | null>(null);

  const canModifyCategories = userRole === 'admin' || userRole === 'super_admin' || userRole === 'moderator';

  // Fetch categories on load
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("forum_categories")
        .select("*")
        .order("display_order", { ascending: true });

      if (error) throw error;
      
      setCategories(data || []);
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: `Failed to load forum categories: ${err.message}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canModifyCategories) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to create categories",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');

      const { data, error } = await supabase
        .from("forum_categories")
        .insert({
          name,
          description: description || null,
          display_order: displayOrder,
          slug,
        })
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await logActivity(
        "create_forum_category",
        `Created forum category: ${name}`,
        "forum_category",
        data.id,
        { name, description, displayOrder }
      );

      toast({
        title: "Success",
        description: `Category "${name}" has been created`,
      });
      
      // Reset form and fetch updated list
      resetForm();
      await fetchCategories();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to create category: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const handleUpdateCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!canModifyCategories || !editingCategoryId) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to update categories",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Generate slug from name
      const slug = name
        .toLowerCase()
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, '-');

      const { data, error } = await supabase
        .from("forum_categories")
        .update({
          name,
          description: description || null,
          display_order: displayOrder,
          slug,
        })
        .eq("id", editingCategoryId)
        .select()
        .single();

      if (error) throw error;

      // Log activity
      await logActivity(
        "update_forum_category",
        `Updated forum category: ${name}`,
        "forum_category",
        editingCategoryId,
        { name, description, displayOrder }
      );

      toast({
        title: "Success",
        description: `Category "${name}" has been updated`,
      });
      
      // Reset form and fetch updated list
      resetForm();
      await fetchCategories();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to update category: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const handleDeleteCategory = async () => {
    if (!canModifyCategories || !categoryToDelete) {
      toast({
        title: "Permission Denied",
        description: "You don't have permission to delete categories",
        variant: "destructive",
      });
      return;
    }
    
    try {
      const { error } = await supabase
        .from("forum_categories")
        .delete()
        .eq("id", categoryToDelete.id);

      if (error) throw error;

      // Log activity
      await logActivity(
        "delete_forum_category",
        `Deleted forum category: ${categoryToDelete.name}`,
        "forum_category",
        categoryToDelete.id
      );

      toast({
        title: "Success",
        description: `Category "${categoryToDelete.name}" has been deleted`,
      });
      
      // Close dialog and fetch updated list
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
      await fetchCategories();
    } catch (err: any) {
      toast({
        title: "Error",
        description: `Failed to delete category: ${err.message}`,
        variant: "destructive",
      });
    }
  };

  const handleEdit = (category: ForumCategory) => {
    setFormMode('edit');
    setEditingCategoryId(category.id);
    setName(category.name);
    setDescription(category.description || "");
    setDisplayOrder(category.display_order);
    setShowForm(true);
  };

  const resetForm = () => {
    setFormMode('create');
    setEditingCategoryId(null);
    setName("");
    setDescription("");
    setDisplayOrder(0);
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl">Forum Categories</CardTitle>
          {canModifyCategories && (
            <Button 
              onClick={() => {
                resetForm();
                setFormMode('create');
                setShowForm(true);
              }} 
              size="sm"
              className="flex items-center gap-2"
            >
              <Plus size={16} />
              Add Category
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {showForm && (
            <form 
              onSubmit={formMode === 'create' ? handleCreateCategory : handleUpdateCategory} 
              className="mb-6 p-4 border rounded-lg bg-muted/50"
            >
              <h3 className="text-lg font-medium mb-4">
                {formMode === 'create' ? 'Create New Category' : 'Edit Category'}
              </h3>
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="name">
                      Category Name *
                    </label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Category name"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="displayOrder">
                      Display Order
                    </label>
                    <Input
                      id="displayOrder"
                      type="number"
                      value={displayOrder}
                      onChange={(e) => setDisplayOrder(Number(e.target.value))}
                      placeholder="Display order (0, 1, 2...)"
                    />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="description">
                    Description
                  </label>
                  <Input
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Category description"
                  />
                </div>
                <div className="flex gap-2 justify-end">
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetForm}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {formMode === 'create' ? 'Create Category' : 'Update Category'}
                  </Button>
                </div>
              </div>
            </form>
          )}

          {loading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="p-4 border border-destructive/50 rounded-md bg-destructive/10 text-destructive">
              {error}
            </div>
          ) : categories.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <p>No forum categories found.</p>
              <p className="text-sm mt-1">Create your first category to get started.</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12 text-center">Order</TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead className="hidden md:table-cell">Description</TableHead>
                  <TableHead className="w-24">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {categories.map((category) => (
                  <TableRow key={category.id}>
                    <TableCell className="text-center">{category.display_order}</TableCell>
                    <TableCell className="font-medium">{category.name}</TableCell>
                    <TableCell className="hidden md:table-cell">
                      {category.description || <span className="text-muted-foreground italic">No description</span>}
                    </TableCell>
                    <TableCell>
                      {canModifyCategories && (
                        <div className="flex gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleEdit(category)}
                            title="Edit category"
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => {
                              setCategoryToDelete(category);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete category"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the category "{categoryToDelete?.name}".
              All topics and posts within this category will also be deleted.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteCategory}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CategoryManagement;
