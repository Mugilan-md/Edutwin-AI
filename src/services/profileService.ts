import { supabase } from "../lib/supabase";

export const getProfile = async (userId?: string) => {
  try {
    let targetId = userId;
    if (!targetId) {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error("User not logged in") };
      targetId = user.id;
    }

    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", targetId)
      .single();

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const getProfileByRegisterNo = async (registerNo: string) => {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("register_no", registerNo)
      .single();

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const saveProfile = async (
  full_name: string,
  department: string,
  year: string,
  register_no: string,
  role: string = "student"
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      error: {
        message: "User not logged in",
      },
    };
  }

  // First check if profile exists to preserve role if not specified
  const { data: existing } = await getProfile(user.id);
  let finalRole = role;
  if (existing?.role && (existing.role === "faculty" || existing.role === "admin") && role === "student") {
    finalRole = existing.role;
  }

  const { data, error } = await supabase
    .from("profiles")
    .upsert({
      id: user.id,
      full_name,
      email: user.email,
      department,
      year: parseInt(year) || 3,
      register_no,
      role: finalRole,
    })
    .select();

  return { data, error };
};