import { useMutation, useQuery } from "@tanstack/react-query";
import { Upload } from "@match/api-client";

export function useUploadFile() {
  return useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append("file", file);
      const { data } = await Upload.uploadControllerUpload({
        body: formData,
      } as Parameters<typeof Upload.uploadControllerUpload>[0] & { body: FormData });
      return data;
    },
  });
}

export function useFileDetail(id: string) {
  return useQuery({
    queryKey: ["files", "detail", id] as const,
    queryFn: async () => {
      const { data } = await Upload.uploadControllerFindOne({ path: { id } });
      return data;
    },
    enabled: !!id,
  });
}
