import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { zodResolver } from "@hookform/resolvers/zod";
import axios from "axios";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import type { Doctor } from "./doctor.interface";
import { userDoctorStore } from "./data/doctor.store";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  user: Doctor | null;
}

export default function DoctorFormModal({ isOpen, onClose, user }: Props) {
  const doctorSchema = z.object({
    fullname: z.string().min(2, "Nombre requerido"),
    email: z.string().email("Correo Requerido"),
    password: user
      ? z.string().optional() // en edición no valida contraseña
      : z.string().min(6, "Contraseña requerida"), // en creación sí
    address: z.string().optional(),
  });
  type DoctorFormValues = z.infer<typeof doctorSchema>; //

  const { create, update } = userDoctorStore();
  const form = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
    defaultValues: {
      fullname: "",
      email: "",
      address: "",
    },
  });

  useEffect(() => {
    if (user) {
      const { user: base } = user;
      form.reset({
        fullname: base.fullname,
        email: base.email,
        address: base.address || "",
      });
    } else {
      form.reset({
        fullname: "",
        email: "",
        address: "",
      });
    }
  }, [user, form, isOpen]);

  const onSubmit = async (data: DoctorFormValues) => {
    try {
      if (user) {
        await update(user.user.id, {
          fullname: data.fullname,
          address: data.address,
          email: data.email,
        });
      } else {
        await create(data);
      }
      onClose();
    } catch (error) {
      if (!axios.isAxiosError(error)) {
        toast.error("Ha ocurrido un error");
        return;
      }
      if (error.response?.status === 400) {
        toast.error("Correo repetido");
        form.setError("email", { type: "server" }, { shouldFocus: true });
        return;
      }
      toast.error(error.response?.data.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{user ? "Editar Doctor" : "Crear Doctor"}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="fullname"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre completo</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Correo electronico</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {!user && (
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem className="md:col-span-2">
                    <FormLabel>Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="address"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Dirreción</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {user ? "Editar" : "Crear"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
