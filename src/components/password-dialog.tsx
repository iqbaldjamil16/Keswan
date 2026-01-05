
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
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

interface PasswordDialogProps {
  trigger: ReactNode;
  onSuccess: () => void;
  title: string;
  description: string;
}

const CORRECT_PASSWORD = "pkh24";

export function PasswordDialog({ trigger, onSuccess, title, description }: PasswordDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [password, setPassword] = useState("");
  const { toast } = useToast();

  const handleVerify = () => {
    if (password === CORRECT_PASSWORD) {
      onSuccess();
      setIsOpen(false);
      setPassword("");
    } else {
      toast({
        variant: "destructive",
        title: "Gagal",
        description: "Kata sandi yang Anda masukkan salah.",
      });
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      setPassword("");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="w-[90%] rounded-md sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="password">
              Kata Sandi
            </Label>
            <Input
              id="password"
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
