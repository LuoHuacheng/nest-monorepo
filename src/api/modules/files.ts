import { useMutation } from "@tanstack/react-query";
import { Upload } from "@/api/generated";

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await Upload.uploadControllerUpload({ body: formData } as any);
      return data;
    },
  });
}
