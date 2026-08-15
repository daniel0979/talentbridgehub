import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Slider } from "@/components/ui/slider";
import { createCroppedProfilePhoto, type CropArea } from "@/lib/profilePhotoCrop";
import Cropper, { type Area, type Point } from "react-easy-crop";
import { Loader2, ZoomIn } from "lucide-react";
import { useEffect, useState } from "react";

type ProfilePhotoCropDialogProps = {
  imageSource: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (dataUrl: string) => Promise<void> | void;
};

export default function ProfilePhotoCropDialog({ imageSource, open, onOpenChange, onConfirm }: ProfilePhotoCropDialogProps) {
  const [crop, setCrop] = useState<Point>({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [cropArea, setCropArea] = useState<CropArea | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;
    setCrop({ x: 0, y: 0 });
    setZoom(1);
    setCropArea(null);
    setError("");
  }, [open, imageSource]);

  const handleCropComplete = (_croppedArea: Area, croppedAreaPixels: Area) => {
    setCropArea(croppedAreaPixels);
  };

  const handleConfirm = async () => {
    if (!imageSource || !cropArea) return;
    setIsProcessing(true);
    setError("");
    try {
      const croppedPhoto = await createCroppedProfilePhoto(imageSource, cropArea);
      await onConfirm(croppedPhoto);
      onOpenChange(false);
    } catch (cropError) {
      setError(cropError instanceof Error ? cropError.message : "Could not crop this image. Please choose another photo.");
    } finally {
      setIsProcessing(false);
    }
  };

  return <Dialog open={open} onOpenChange={isProcessing ? undefined : onOpenChange}>
    <DialogContent className="max-w-xl p-0 overflow-hidden" showCloseButton={!isProcessing}>
      <DialogHeader className="px-6 pt-6"><DialogTitle>Crop your profile photo</DialogTitle><DialogDescription>Drag the photo to position it. Use zoom to fill the square profile frame.</DialogDescription></DialogHeader>
      <div className="px-6"><div className="relative h-80 overflow-hidden rounded-xl bg-slate-950">{imageSource && <Cropper image={imageSource} crop={crop} zoom={zoom} aspect={1} cropShape="rect" showGrid={false} onCropChange={setCrop} onZoomChange={setZoom} onCropComplete={handleCropComplete} />}</div>
        <div className="mt-5 flex items-center gap-3"><ZoomIn className="h-4 w-4 text-muted-foreground" aria-hidden="true" /><Slider value={[zoom]} min={1} max={3} step={0.1} aria-label="Photo zoom" onValueChange={([nextZoom]) => setZoom(nextZoom)} /><span className="w-10 text-right text-xs text-muted-foreground">{Math.round(zoom * 100)}%</span></div>
        {error && <p role="alert" className="mt-4 text-sm text-destructive">{error}</p>}
      </div>
      <DialogFooter className="px-6 pb-6"><Button type="button" variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>Cancel</Button><Button type="button" onClick={handleConfirm} disabled={isProcessing || !cropArea} className="bg-gradient-to-r from-primary to-accent text-white">{isProcessing ? <><Loader2 className="mr-2 h-4 w-4 animate-spin" />Preparing photo…</> : "Use cropped photo"}</Button></DialogFooter>
    </DialogContent>
  </Dialog>;
}
