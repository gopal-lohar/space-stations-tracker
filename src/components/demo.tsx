import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";
import { useState } from "react";

export default function Demo() {
  const { setTheme } = useTheme();
  const [dark, setDark] = useState(false);
  return (
    <div className="bg-background text-foreground flex h-svh w-full items-center justify-center gap-4 pb-4 text-4xl">
      Look at that - It's a Space Station{" "}
      <Button
        onClick={() => {
          if (dark) {
            setTheme("light");
          } else {
            setTheme("dark");
          }
          setDark((dark) => !dark);
        }}
      >
        Click Here
      </Button>
    </div>
  );
}
