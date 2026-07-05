import { supabase } from "../lib/supabase";

export const uploadCertificate = async (file: File) => {
  const fileName = `${Date.now()}-${file.name}`;

  const { error } = await supabase.storage
    .from("certificates")
    .upload(fileName, file);

  if (error) {
    return { error };
  }

  const { data: publicUrl } = supabase.storage
    .from("certificates")
    .getPublicUrl(fileName);

  return {
    url: publicUrl.publicUrl,
    error: null,
  };
};