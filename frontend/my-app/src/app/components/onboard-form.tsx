"use client";
import { FormEvent } from "react";
import { useState } from "react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

const OnboardForm = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [gender, setGender] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const supabase = createClient();
  const router = useRouter();

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setIsLoading(true);
    console.log("Submitting form with values:", { gender, height, weight });

    try {
      if (!gender || !height || !weight) {
        console.error("Please fill in all fields");
        setIsLoading(false);
        return;
      }

      const user = await supabase.auth.getUser();
      if (!user.data.user) {
        router.push("/auth/login");
        return;
      }
      console.log("User ID:", user.data.user.id);
      const { data, error } = await supabase.from("UserInfo").insert({
        id: user.data.user.id,
        gender: gender,
        height: parseFloat(height),
        weight: parseFloat(weight),
      });
      if (error) {
        console.error("Error inserting data:", error);
        alert(`Error: ${error.message}`);
      } else {
        console.log("Data inserted successfully:", data);
        router.push("/dashboard");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={true}>
      <DialogContent className="md:max-w-md">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Onboarding FitStyle</DialogTitle>
          </DialogHeader>
          <div>
            <Select value={gender} onValueChange={setGender}>
              <SelectTrigger id="gender" className="w-full max-w-48">
                <SelectValue placeholder="Select your gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="Male">Male</SelectItem>
                  <SelectItem value="Female">Female</SelectItem>
                  {/*Will give clothing recommendations across genders then */}
                  <SelectItem value="Prefer Not To Say">
                    Prefer Not To Say
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Field>
              <FieldLabel htmlFor="input-height">Height</FieldLabel>
              <Input
                id="input-height"
                type="number"
                placeholder="Height (cm)"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
              />
            </Field>
            <Field>
              <FieldLabel htmlFor="input-weight">Weight(kg)</FieldLabel>
              <Input
                id="input-weight"
                type="number"
                placeholder="Weight (kg)"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
              />
            </Field>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={isLoading}>
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save changes"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default OnboardForm;
