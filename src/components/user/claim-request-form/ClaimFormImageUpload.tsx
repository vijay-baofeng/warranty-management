
import React from 'react';
import { UseFormReturn, Controller, FieldValues, Path } from 'react-hook-form';
import {
  FormItem,
  FormLabel,
  FormControl,
  FormDescription,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const MAX_IMAGES = 4;
const MAX_FILE_SIZE_MB = 5;
const MAX_FILE_SIZE_BYTES = MAX_FILE_SIZE_MB * 1024 * 1024;

interface ClaimFormImageUploadProps<TFieldValues extends FieldValues> {
  form: UseFormReturn<TFieldValues>;
  name: Path<TFieldValues>; // Name for the evidence_images field
  imagePreviews: string[];
  setImagePreviews: React.Dispatch<React.SetStateAction<string[]>>;
  isLoading: boolean;
}

export function ClaimFormImageUpload<TFieldValues extends FieldValues = FieldValues>({
  form,
  name,
  imagePreviews,
  setImagePreviews,
  isLoading,
}: ClaimFormImageUploadProps<TFieldValues>) {
  const { toast } = useToast();

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const currentImageCount = imagePreviews.length;
    const filesToProcess = files.slice(0, MAX_IMAGES - currentImageCount);

    if (files.length + currentImageCount > MAX_IMAGES) {
      toast({
        title: "Too many images",
        description: `You can only select up to ${MAX_IMAGES} images in total.`,
        variant: "destructive",
      });
    }
    
    const newPreviews: string[] = [];
    const newFiles: File[] = [...(form.getValues(name) as File[] || [])];

    filesToProcess.forEach(file => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        toast({
          title: "File too large",
          description: `${file.name} exceeds ${MAX_FILE_SIZE_MB}MB limit.`,
          variant: "destructive",
        });
        return;
      }
      newPreviews.push(URL.createObjectURL(file));
      newFiles.push(file);
    });

    setImagePreviews(prev => [...prev, ...newPreviews]);
    form.setValue(name, newFiles.slice(0, MAX_IMAGES) as any, { shouldValidate: true });
  };

  const removeImage = (index: number) => {
    const updatedPreviews = [...imagePreviews];
    updatedPreviews.splice(index, 1);
    setImagePreviews(updatedPreviews);

    const updatedFiles = [...(form.getValues(name) as File[] || [])];
    updatedFiles.splice(index, 1);
    form.setValue(name, updatedFiles as any, { shouldValidate: true });
  };

  return (
     <Controller
      name={name}
      control={form.control}
      render={({ fieldState }) => ( // We don't use field directly for file input
        <FormItem>
          <FormLabel>Evidence Images (Max {MAX_IMAGES}, up to {MAX_FILE_SIZE_MB}MB each)</FormLabel>
          <FormControl>
            <Input
              type="file"
              multiple
              accept="image/jpeg,image/png,image/gif"
              onChange={handleImageChange}
              disabled={isLoading || imagePreviews.length >= MAX_IMAGES}
              className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20"
            />
          </FormControl>
          <FormDescription>
            {imagePreviews.length > 0 ? `${imagePreviews.length} of ${MAX_IMAGES} images selected.` : "No images selected."}
          </FormDescription>
          <FormMessage>{fieldState.error?.message}</FormMessage>
          {imagePreviews.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
              {imagePreviews.map((previewUrl, index) => (
                <div key={index} className="relative group">
                  <img src={previewUrl} alt={`Preview ${index + 1}`} className="w-full h-32 object-cover rounded-md border" />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-1 right-1 h-6 w-6 opacity-75 group-hover:opacity-100"
                    onClick={() => removeImage(index)}
                    disabled={isLoading}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </FormItem>
      )}
    />
  );
}

