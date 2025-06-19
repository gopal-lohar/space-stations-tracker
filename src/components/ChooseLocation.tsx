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
import type { ObserverLocation } from "@/lib/core/types";
import { useCallback, useState } from "react";
import { Input } from "./ui/input";
import { Label } from "./ui/label";

export function ChooseLocation({
  setLocation,
}: {
  setLocation: (value: ObserverLocation | null) => void;
}) {
  const [error, setError] = useState<string | null>(null);
  const [detecting, setDetecting] = useState<boolean>(false);
  const detectLocation = useCallback(() => {
    setDetecting(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            elevation: 0,
          });
          setError(null);
          setDetecting(false);
        },
        (error) => {
          // switch case is redundant but in case i change my mind
          switch (error.code) {
            case error.PERMISSION_DENIED:
              // setError("User denied the request for geolocation");
              setError(error.message);
              break;
            case error.POSITION_UNAVAILABLE:
              // setError("Location information is unavailable");
              setError(error.message);
              break;
            case error.TIMEOUT:
              // setError("The request to get user location timed out");
              setError(error.message);
              break;
            default:
              // setError(`An unknown error occurred, Error: ${error.message}`);
              setError(error.message);
              break;
          }
          setDetecting(false);
        }
      );
    } else {
      setError("Cannot detect location (no geolocation in navigator)");
      setDetecting(false);
    }
  }, [setLocation]);

  return (
    <div className="flex flex-col items-center gap-2 rounded-md border-2 px-4 py-8">
      <div>
        <Button disabled={detecting} onClick={detectLocation}>
          {detecting ? "Fetching..." : "Detect Location"}
        </Button>
        {error && (
          <div>
            Error: <span className="text-red-500">{error}</span>
          </div>
        )}
      </div>
      <span className="text-sm">OR</span>
      <EnterManuallyDialog setLocation={setLocation} />
    </div>
  );
}

type FormField = {
  value: string;
  error: string | null;
};

function EnterManuallyDialog({
  setLocation,
}: {
  setLocation: (value: ObserverLocation | null) => void;
}) {
  const [latitude, setLatitude] = useState<FormField>({
    value: "",
    error: null,
  });
  const [longitude, setLongitude] = useState<FormField>({
    value: "",
    error: null,
  });
  const [open, setOpen] = useState(false);

  // Generic coordinate validator
  const validateCoordinate = (
    name: "latitude" | "longitude",
    value: string
  ): string | number => {
    const trimmed = value.trim();

    if (!trimmed) return `${name} is required`;

    const num = parseFloat(trimmed);
    if (isNaN(num)) return `Invalid ${name} format`;

    if (name === "latitude" && (num < -90 || num > 90)) {
      return "Latitude must be between -90 and 90";
    }

    if (name === "longitude" && (num < -180 || num > 180)) {
      return "Longitude must be between -180 and 180";
    }

    return num;
  };

  const handleSubmit = () => {
    const parsedLatitude = validateCoordinate("latitude", latitude.value);
    const parsedLongitude = validateCoordinate("longitude", longitude.value);

    if (typeof parsedLatitude === "string") {
      setLatitude((prev) => ({ ...prev, error: parsedLatitude }));
    } else {
      setLatitude((prev) => ({ ...prev, error: null }));
    }

    if (typeof parsedLongitude === "string") {
      setLongitude((prev) => ({ ...prev, error: parsedLongitude }));
    } else {
      setLongitude((prev) => ({ ...prev, error: null }));
    }

    if (
      typeof parsedLongitude === "number" &&
      typeof parsedLatitude === "number"
    ) {
      setLatitude((prev) => ({ ...prev, error: null }));
      setLongitude((prev) => ({ ...prev, error: null }));
      setLocation({
        latitude: parsedLatitude,
        longitude: parsedLongitude,
        elevation: 0,
      });
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(e) => setOpen(e.valueOf())}>
      <form>
        <DialogTrigger asChild>
          <Button variant="outline">Enter Manually</Button>
        </DialogTrigger>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Location</DialogTitle>
            <DialogDescription>Enter Latitude and Longitude </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4">
            <div className="grid gap-3">
              <Label htmlFor="latitude">Latitude</Label>
              <Input
                id="latitude"
                name="latitude"
                value={latitude.value}
                onChange={(e) =>
                  setLatitude((prev) => ({ ...prev, value: e.target.value }))
                }
              />
              {latitude.error && (
                <span className="text-red-500">{latitude.error}</span>
              )}
            </div>
            <div className="grid gap-3">
              <Label htmlFor="longitude">Longitude</Label>
              <Input
                id="longitude"
                name="longitude"
                value={longitude.value}
                onChange={(e) =>
                  setLongitude((prev) => ({ ...prev, value: e.target.value }))
                }
              />
              {longitude.error && (
                <span className="text-red-500">{longitude.error}</span>
              )}
            </div>
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button type="submit" onClick={handleSubmit}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </form>
    </Dialog>
  );
}
