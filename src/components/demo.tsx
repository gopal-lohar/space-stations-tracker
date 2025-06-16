import { Button } from "@/components/ui/button";
import { useTheme } from "@/hooks/useTheme";

export default function Demo() {
  const { setTheme } = useTheme();
  return (
    <div className="bg-background text-foreground flex h-svh w-full items-center justify-center gap-4 pb-4 text-4xl">
      Look at that - It's a Space Station{" "}
      <Button
        onClick={() => {
          setTheme("system");
        }}
      >
        Cdlick Here
      </Button>
    </div>
  );
}
