
"use client";

import { useState, type ReactNode } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface ActivationDialogProps {
  children: ReactNode;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

const CORRECT_PASSWORD = "pkh2816";

export function ActivationDialog({ children, open, onOpenChange, onSuccess }: ActivationDialogProps) {
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleVerify = () => {
    if (password === CORRECT_PASSWORD) {
      onSuccess();
      onOpenChange(false);
      setPassword("");
    } else {
      toast({
        variant: "destructive",
        title: "Verifikasi Gagal",
        description: "Kata sandi yang Anda masukkan salah.",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setPassword("");
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      {children}
      <DialogContent className="w-[90%] max-w-[425px] rounded-md">
        <DialogHeader>
          <DialogTitle>Verifikasi Akses</DialogTitle>
          <DialogDescription>Masukkan kata sandi untuk melanjutkan.</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password-activation">
              Kata Sandi
            </Label>
            <Input
              id="password-activation"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  handleVerify();
                }
              }}
            />
          </div>
        </div>
        <DialogFooter>
          <DialogClose asChild>
            <Button variant="outline">Batal</Button>
          </DialogClose>
          <Button onClick={handleVerify}>Verifikasi</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
