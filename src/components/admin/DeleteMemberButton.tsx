"use client";

import { useState, useTransition } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Loader2 } from "lucide-react";
import { deleteMember } from "@/lib/actions/members";

interface Props {
  memberId: string;
  memberName: string;
  locale: string;
}

export default function DeleteMemberButton({ memberId, memberName, locale }: Props) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState("");
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const result = await deleteMember(memberId, locale);
      if (result?.error) {
        setError(result.error);
      }
    });
  };

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
        <Trash2 className="w-4 h-4 mr-2" />
        Üyeyi Sil
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Üyeyi Kalıcı Olarak Sil</AlertDialogTitle>
          <AlertDialogDescription>
            <strong>{memberName}</strong> adlı üye ve tüm üyelik kayıtları kalıcı olarak silinecek.
            Bu işlem geri alınamaz.
          </AlertDialogDescription>
        </AlertDialogHeader>

        <div className="my-2">
          <p className="text-sm text-gray-600 mb-2">
            Onaylamak için <strong>SİL</strong> yazın:
          </p>
          <Input
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            placeholder="SİL"
            className="font-mono"
          />
          {error && (
            <p className="text-red-600 text-sm mt-2">{error}</p>
          )}
        </div>

        <AlertDialogFooter>
          <AlertDialogCancel onClick={() => { setConfirm(""); setError(null); }}>
            İptal
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={confirm !== "SİL" || isPending}
            className="bg-red-600 hover:bg-red-700 focus:ring-red-600"
          >
            {isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Siliniyor...
              </>
            ) : (
              "Kalıcı Olarak Sil"
            )}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
