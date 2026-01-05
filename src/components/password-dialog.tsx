
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

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <div onClick={() => setIsOpen(true)}>{trigger}</div>
      <DialogContent className="w-[90%] rounded-md sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="password"className="text-right">
              Kata Sandi
            </Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="col-span-3"
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
