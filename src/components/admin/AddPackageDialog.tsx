"use client";

import { useState, useTransition } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Plus, Loader2 } from "lucide-react";
import { createPackage } from "@/lib/actions/packages";
import { toast } from "sonner";

export default function AddPackageDialog({ locale }: { locale: string }) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    formData.set("locale", locale);
    startTransition(async () => {
      const result = await createPackage(formData);
      if (result?.error) {
        toast.error(result.error);
      } else {
        toast.success("Paket eklendi!");
        setOpen(false);
      }
    });
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger render={<Button className="bg-orange-500 hover:bg-orange-600" />}>
        <Plus className="w-4 h-4 mr-2" />
        Yeni Paket Ekle
      </DialogTrigger>
      <DialogContent className="sm:max-w-sm">
        <DialogHeader>
          <DialogTitle>Yeni Paket Ekle</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 mt-2">
          <div>
            <Label>Paket Adı *</Label>
            <Input name="name" required placeholder="1 Aylık Öğrenci" className="mt-1" />
          </div>
          <div>
            <Label>Paket Türü *</Label>
            <select name="package_type" required className="w-full mt-1 px-3 py-2 border rounded-md text-sm">
              <option value="student">Öğrenci</option>
              <option value="normal">Normal</option>
            </select>
          </div>
          <div>
            <Label>Süre (Gün) *</Label>
            <Input name="duration_days" type="number" min="1" required placeholder="30" className="mt-1" />
          </div>
          <div>
            <Label>Fiyat (₺) *</Label>
            <Input name="price" type="number" min="0" step="0.01" required placeholder="4000" className="mt-1" />
          </div>
          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>İptal</Button>
            <Button type="submit" className="bg-orange-500 hover:bg-orange-600" disabled={isPending}>
              {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Ekle"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
