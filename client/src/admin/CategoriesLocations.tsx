import { trpc } from "@/lib/trpc";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Tags,
  MapPin,
  Plus,
  Pencil,
  Trash2,
  ListOrdered,
  Hash,
} from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";

type CategoryRow = {
  id: number;
  name: string;
  icon: string | null;
};

type LocationRow = {
  id: number;
  name: string;
  sortOrder: number;
};

const ICON_OPTIONS = [
  "Code",
  "Palette",
  "Megaphone",
  "DollarSign",
  "Wrench",
  "HeartPulse",
  "TrendingUp",
  "GraduationCap",
  "Users",
  "Headphones",
  "Briefcase",
  "Star",
];

export default function CategoriesLocations() {
  const utils = trpc.useUtils();

  const categoriesQuery = trpc.admin.management.categories.list.useQuery();
  const locationsQuery = trpc.admin.management.locations.list.useQuery();
  const categories = categoriesQuery.data ?? [];
  const locations = locationsQuery.data ?? [];

  const [tab, setTab] = useState<"categories" | "locations">("categories");

  // Category dialog state
  const [catDialog, setCatDialog] = useState<"create" | "edit" | null>(null);
  const [editingCat, setEditingCat] = useState<CategoryRow | null>(null);
  const [catForm, setCatForm] = useState({ name: "", icon: "Briefcase" });

  // Location dialog state
  const [locDialog, setLocDialog] = useState<"create" | "edit" | null>(null);
  const [editingLoc, setEditingLoc] = useState<LocationRow | null>(null);
  const [locForm, setLocForm] = useState({ name: "", sortOrder: 0 });

  const createCategory = trpc.admin.management.categories.create.useMutation({
    onSuccess: async () => {
      await utils.admin.management.categories.list.invalidate();
      setCatDialog(null);
      setCatForm({ name: "", icon: "Briefcase" });
      toast.success("Category created");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateCategory = trpc.admin.management.categories.update.useMutation({
    onSuccess: async () => {
      await utils.admin.management.categories.list.invalidate();
      setCatDialog(null);
      toast.success("Category updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteCategory = trpc.admin.management.categories.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.management.categories.list.invalidate();
      toast.success("Category deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const createLocation = trpc.admin.management.locations.create.useMutation({
    onSuccess: async () => {
      await utils.admin.management.locations.list.invalidate();
      setLocDialog(null);
      setLocForm({ name: "", sortOrder: 0 });
      toast.success("Location created");
    },
    onError: (err) => toast.error(err.message),
  });

  const updateLocation = trpc.admin.management.locations.update.useMutation({
    onSuccess: async () => {
      await utils.admin.management.locations.list.invalidate();
      setLocDialog(null);
      toast.success("Location updated");
    },
    onError: (err) => toast.error(err.message),
  });

  const deleteLocation = trpc.admin.management.locations.delete.useMutation({
    onSuccess: async () => {
      await utils.admin.management.locations.list.invalidate();
      toast.success("Location deleted");
    },
    onError: (err) => toast.error(err.message),
  });

  const openCreateCategory = () => {
    setEditingCat(null);
    setCatForm({ name: "", icon: "Briefcase" });
    setCatDialog("create");
  };

  const openEditCategory = (cat: CategoryRow) => {
    setEditingCat(cat);
    setCatForm({ name: cat.name, icon: cat.icon ?? "Briefcase" });
    setCatDialog("edit");
  };

  const saveCategory = () => {
    if (!catForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = { name: catForm.name.trim(), icon: catForm.icon };
    if (catDialog === "edit" && editingCat) {
      updateCategory.mutate({ id: editingCat.id, ...payload });
    } else {
      createCategory.mutate(payload);
    }
  };

  const openCreateLocation = () => {
    setEditingLoc(null);
    setLocForm({ name: "", sortOrder: locations.length });
    setLocDialog("create");
  };

  const openEditLocation = (loc: LocationRow) => {
    setEditingLoc(loc);
    setLocForm({ name: loc.name, sortOrder: loc.sortOrder });
    setLocDialog("edit");
  };

  const saveLocation = () => {
    if (!locForm.name.trim()) {
      toast.error("Name is required");
      return;
    }
    const payload = { name: locForm.name.trim(), sortOrder: locForm.sortOrder };
    if (locDialog === "edit" && editingLoc) {
      updateLocation.mutate({ id: editingLoc.id, ...payload });
    } else {
      createLocation.mutate(payload);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          Categories & Locations
        </h1>
        <p className="text-muted-foreground mt-1">
          Manage the job categories and location options used across the
          platform.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-2 border-secondary/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                <Tags className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-none">
                  {categoriesQuery.isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    categories.length
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Categories</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card className="border-2 border-secondary/20 hover:border-primary/40 transition-all duration-300 hover:-translate-y-1">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center text-white shadow-lg shrink-0">
                <MapPin className="w-6 h-6" />
              </div>
              <div>
                <p className="text-3xl font-bold text-foreground leading-none">
                  {locationsQuery.isLoading ? (
                    <Skeleton className="h-8 w-12" />
                  ) : (
                    locations.length
                  )}
                </p>
                <p className="text-sm text-muted-foreground mt-2">Locations</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="border-2 border-secondary/20">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as "categories" | "locations")}
        >
          <CardHeader className="pb-0">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <TabsList>
                <TabsTrigger value="categories">
                  <Tags className="w-4 h-4 mr-2" />
                  Categories
                </TabsTrigger>
                <TabsTrigger value="locations">
                  <MapPin className="w-4 h-4 mr-2" />
                  Locations
                </TabsTrigger>
              </TabsList>
              {tab === "categories" ? (
                <Button
                  onClick={openCreateCategory}
                  className="bg-gradient-to-r from-primary to-accent text-white font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  New Category
                </Button>
              ) : (
                <Button
                  onClick={openCreateLocation}
                  className="bg-gradient-to-r from-primary to-accent text-white font-semibold"
                >
                  <Plus className="w-4 h-4" />
                  New Location
                </Button>
              )}
            </div>
          </CardHeader>

          <TabsContent value="categories" className="mt-0">
            <CardContent>
              {categoriesQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : categories.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No categories yet. Create your first category.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Icon</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {categories.map((cat) => (
                        <TableRow key={cat.id}>
                          <TableCell>
                            <span className="text-sm font-medium text-foreground">
                              {cat.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="bg-primary/10 text-primary border-primary/30"
                            >
                              {cat.icon || "—"}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(cat.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-primary/30 text-primary hover:bg-primary/5"
                                onClick={() => openEditCategory(cat)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                                onClick={() => {
                                  if (confirm(`Delete category "${cat.name}"?`)) {
                                    deleteCategory.mutate({ id: cat.id });
                                  }
                                }}
                                disabled={deleteCategory.isPending}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </TabsContent>

          <TabsContent value="locations" className="mt-0">
            <CardContent>
              {locationsQuery.isLoading ? (
                <div className="space-y-3">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-12 w-full" />
                  ))}
                </div>
              ) : locations.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">
                  No locations yet. Create your first location.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Sort Order</TableHead>
                        <TableHead>Created</TableHead>
                        <TableHead>Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {locations.map((loc) => (
                        <TableRow key={loc.id}>
                          <TableCell>
                            <span className="text-sm font-medium text-foreground">
                              {loc.name}
                            </span>
                          </TableCell>
                          <TableCell>
                            <Badge
                              variant="secondary"
                              className="bg-secondary text-muted-foreground border-secondary"
                            >
                              <Hash className="w-3 h-3 mr-1" />
                              {loc.sortOrder}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <span className="text-sm text-muted-foreground whitespace-nowrap">
                              {new Date(loc.createdAt).toLocaleDateString()}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1.5">
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-primary/30 text-primary hover:bg-primary/5"
                                onClick={() => openEditLocation(loc)}
                              >
                                <Pencil className="w-3.5 h-3.5" />
                                Edit
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                className="border-2 border-destructive/30 text-destructive hover:bg-destructive/5"
                                onClick={() => {
                                  if (confirm(`Delete location "${loc.name}"?`)) {
                                    deleteLocation.mutate({ id: loc.id });
                                  }
                                }}
                                disabled={deleteLocation.isPending}
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Delete
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </TabsContent>
        </Tabs>
      </Card>

      {/* Category dialog */}
      <Dialog
        open={catDialog !== null}
        onOpenChange={(open) => {
          if (!open) setCatDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {catDialog === "edit" ? "Edit Category" : "New Category"}
            </DialogTitle>
            <DialogDescription>
              Categories power the job filter dropdowns on the public site.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="catName">Name</Label>
              <Input
                id="catName"
                value={catForm.name}
                onChange={(e) =>
                  setCatForm({ ...catForm, name: e.target.value })
                }
                placeholder="e.g. Technology"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="catIcon">Icon</Label>
              <div className="flex flex-wrap gap-2">
                {ICON_OPTIONS.map((icon) => (
                  <button
                    key={icon}
                    type="button"
                    onClick={() => setCatForm({ ...catForm, icon })}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border-2 text-sm font-medium transition-all ${
                      catForm.icon === icon
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-secondary/30 text-muted-foreground hover:border-primary/40"
                    }`}
                  >
                    {icon}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setCatDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveCategory}
              disabled={createCategory.isPending || updateCategory.isPending}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              {createCategory.isPending || updateCategory.isPending
                ? "Saving…"
                : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Location dialog */}
      <Dialog
        open={locDialog !== null}
        onOpenChange={(open) => {
          if (!open) setLocDialog(null);
        }}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {locDialog === "edit" ? "Edit Location" : "New Location"}
            </DialogTitle>
            <DialogDescription>
              Locations appear in the location filter dropdown on the public
              site.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="locName">Name</Label>
              <Input
                id="locName"
                value={locForm.name}
                onChange={(e) =>
                  setLocForm({ ...locForm, name: e.target.value })
                }
                placeholder="e.g. Yangon"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="locSort">Sort Order</Label>
              <div className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-primary" />
                <Input
                  id="locSort"
                  type="number"
                  value={locForm.sortOrder}
                  onChange={(e) =>
                    setLocForm({
                      ...locForm,
                      sortOrder: parseInt(e.target.value, 10) || 0,
                    })
                  }
                  className="max-w-[120px]"
                />
              </div>
              <p className="text-xs text-muted-foreground">
                Lower numbers appear first in the dropdown.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setLocDialog(null)}>
              Cancel
            </Button>
            <Button
              onClick={saveLocation}
              disabled={createLocation.isPending || updateLocation.isPending}
              className="bg-gradient-to-r from-primary to-accent text-white"
            >
              {createLocation.isPending || updateLocation.isPending
                ? "Saving…"
                : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
