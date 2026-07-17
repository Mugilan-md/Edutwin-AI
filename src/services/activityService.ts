import { supabase } from "../lib/supabase";

export interface ActivityMetadata {
  text: string;
  organization?: string;
  date?: string;
  credits?: number | null;
  feedback?: string | null;
  aiConfidence?: number;
  aiSuggestedCredits?: number;
  sentimentScore?: number;
}

export const parseDescription = (description: string): ActivityMetadata => {
  try {
    const parsed = JSON.parse(description);
    if (parsed && typeof parsed === "object" && "text" in parsed) {
      return parsed as ActivityMetadata;
    }
  } catch (e) {
    // Return standard text description if not JSON
  }
  return {
    text: description || "",
    organization: "",
    date: "",
    credits: null,
    feedback: null,
    aiConfidence: 0,
    aiSuggestedCredits: 0,
    sentimentScore: 0,
  };
};

export const serializeDescription = (metadata: ActivityMetadata): string => {
  return JSON.stringify(metadata);
};

export const saveActivity = async (
  title: string,
  category: string,
  descriptionText: string,
  certificateUrl: string,
  organization: string = "",
  date: string = "",
  aiConfidence: number = 0,
  aiSuggestedCredits: number = 0
) => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: { message: "User not logged in" } };
  }

  const metadata: ActivityMetadata = {
    text: descriptionText,
    organization,
    date,
    credits: null,
    feedback: null,
    aiConfidence,
    aiSuggestedCredits,
    sentimentScore: Math.floor(Math.random() * 20) + 80,
  };

  try {
    const { data, error } = await supabase
      .from("activities")
      .insert([
        {
          student_id: user.id,
          title,
          category,
          description: serializeDescription(metadata),
          certificate_url: certificateUrl,
          status: "pending",
        },
      ])
      .select();

    return { data, error };
  } catch (err: any) {
    return { error: { message: err.message || "Unexpected Error" } };
  }
};

export const fetchStudentActivities = async (studentId?: string) => {
  try {
    let targetId = studentId;
    if (!targetId) {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return { data: null, error: new Error("User not logged in") };
      targetId = user.id;
    }

    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("student_id", targetId)
      .order("created_at", { ascending: false });

    return { data, error };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

// Fetch all pending activities + enrich with profile data via separate query
export const fetchAllPendingActivities = async () => {
  try {
    // Step 1: Get all pending activities
    const { data: acts, error: actsError } = await supabase
      .from("activities")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false });

    if (actsError || !acts) return { data: null, error: actsError };

    if (acts.length === 0) return { data: [], error: null };

    // Step 2: Get unique student IDs
    const studentIds = [...new Set(acts.map((a) => a.student_id))];

    // Step 3: Fetch profiles for those students
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, full_name, register_no, department, year")
      .in("id", studentIds);

    if (profilesError) {
      // If profiles fetch fails (RLS), return activities without profile info
      return {
        data: acts.map((a) => ({ ...a, profiles: null })),
        error: null,
      };
    }

    // Step 4: Join manually in memory
    const profileMap: { [key: string]: any } = {};
    (profiles || []).forEach((p) => {
      profileMap[p.id] = p;
    });

    const enriched = acts.map((a) => ({
      ...a,
      profiles: profileMap[a.student_id] || null,
    }));

    return { data: enriched, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

export const updateActivityStatus = async (
  activityId: string,
  status: "approved" | "rejected",
  credits: number | null,
  feedback: string | null
) => {
  try {
    // 1. Fetch current activity
    const { data: current, error: fetchError } = await supabase
      .from("activities")
      .select("*")
      .eq("id", activityId)
      .single();

    if (fetchError || !current) {
      return { error: fetchError || new Error("Activity not found") };
    }

    // 2. Parse current description and update metadata
    const metadata = parseDescription(current.description);
    metadata.credits = credits;
    metadata.feedback = feedback;

    // 3. Update in database
    const { data, error } = await supabase
      .from("activities")
      .update({
        status,
        description: serializeDescription(metadata),
      })
      .eq("id", activityId)
      .select();

    return { data, error };
  } catch (err: any) {
    return { error: err };
  }
};

// Fetch all activities for admin analytics - also uses manual join
export const fetchAllActivitiesForAdmin = async () => {
  try {
    // Step 1: All activities
    const { data: acts, error: actsError } = await supabase
      .from("activities")
      .select("*");

    if (actsError || !acts) return { data: null, error: actsError };
    if (acts.length === 0) return { data: [], error: null };

    // Step 2: All unique student IDs
    const studentIds = [...new Set(acts.map((a) => a.student_id))];

    // Step 3: Get all profiles
    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, register_no, department, year, role")
      .in("id", studentIds);

    // Step 4: Join manually
    const profileMap: { [key: string]: any } = {};
    (profiles || []).forEach((p) => {
      profileMap[p.id] = p;
    });

    const enriched = acts.map((a) => ({
      ...a,
      profiles: profileMap[a.student_id] || null,
    }));

    return { data: enriched, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
};

// ── Fetch only FACULTY-submitted activities for admin approval ──
export const fetchFacultyActivitiesForAdmin = async () => {
  try {
    const { data: acts, error: actsError } = await supabase
      .from("activities")
      .select("*")
      .order("created_at", { ascending: false });

    if (actsError || !acts) return { data: null, error: actsError };
    if (acts.length === 0) return { data: [], error: null };

    const userIds = [...new Set(acts.map((a) => a.student_id))];

    const { data: profiles } = await supabase
      .from("profiles")
      .select("id, full_name, register_no, department, role, email")
      .in("id", userIds);

    const profileMap: { [key: string]: any } = {};
    (profiles || []).forEach((p) => { profileMap[p.id] = p; });

    // Only keep activities whose submitter has role === 'faculty'
    const facultyActs = acts
      .filter((a) => profileMap[a.student_id]?.role === "faculty")
      .map((a) => ({ ...a, profiles: profileMap[a.student_id] || null }));

    return { data: facultyActs, error: null };
  } catch (err: any) {
    return { data: null, error: err };
  }
};


// Approve or reject a faculty-submitted activity
export const approveFacultyActivity = async (
  activityId: string,
  status: "approved" | "rejected",
  credits: number,
  feedback: string
) => {
  return updateActivityStatus(activityId, status, credits, feedback);
};