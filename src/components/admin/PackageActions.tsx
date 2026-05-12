"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Edit, Power, Loader2 } from "lucide-react";
import { updatePackage, togglePackageStatus } from "@/lib/actions/packages";
import { toast } from "sonner";

interface Package {
  id: string;
  name: string;
  duration_days: number;
  price: number;
  package_type: string;
  is_active: boolean;
}

export default function PackageActions({ pkg, locale }: { pkg: Package; locale: string }) {
  const [editOpen, setEditOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleEdit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);
    startTransition(async () => {
      const result = await updatePackage(pkg.id, formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Paket güncellendi!");
        setEditOpen(false);
      }
    });
  }

  function handleToggle() {
    startTransition(async () => {
      const result = await togglePackageStatus(pkg.id, pkg.is_active, locale);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success(pkg.is_active ? "Paket pasif yapıldı" : "Paket aktifleştirildi");
      }
    });
  }

  return (
    <div className="flex gap-2">
      {/* Edit Dialog */}
      <Dialog open={editOpen} onOpenChange={setEditOpen}>
        <DialogTrigger render={<Button variant="outline" size="sm" className="flex-1" />}>
          <Edit className="w-3.5 h-3.5 mr-1" />
          Düzenle
        </DialogTrigger>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Paketi Düzenle</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEdit} className="space-y-4 mt-2">
            <input type="hidden" name="package_type" value={pkg.package_type} />
            <div>
              <Label>Paket Adı</Label>
              <Input name="name" defaultValue={pkg.name} required className="mt-1" />
            </div>
            <div>
              <Label>Süre (Gün)</Label>
              <Input name="duration_days" type="number" min="1" defaultValue={pkg.duration_days} required className="mt-1" />
            </div>
            <div>
              <Label>Fiyat (₺)</Label>
              <Input name="price" type="number" min="0" step="0.01" defaultValue={pkg.price} required className="mt-1" />
            </div>
            <div className="flex gap-2 justify-end">
              <Button type="button" variant="outline" onClick={() => setEditOpen(false)}>İptal</Button>
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isPending}>
                {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Kaydet"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Toggle Status */}
      <Button
        variant="outline"
        size="sm"
        onClick={handleToggle}
        disabled={isPending}
        className={pkg.is_active ? "text-red-500 hover:text-red-600 hover:border-red-300" : "text-green-600 hover:text-green-700 hover:border-green-300"}
      >
        {isPending ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <Power className="w-3.5 h-3.5" />
        )}
      </Button>
    </div>
  );
}
