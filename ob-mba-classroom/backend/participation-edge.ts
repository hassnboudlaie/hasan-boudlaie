// Read-only participation portfolio backed by the existing classroom records.
import { createClient } from "npm:@supabase/supabase-js@2.57.0";

const origin = "https://hassnboudlaie.github.io";
const db = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
  auth: { persistSession: false, autoRefreshToken: false },
});
const headers = {
  "Content-Type": "application/json; charset=utf-8",
  "Cache-Control": "no-store",
  "Access-Control-Allow-Origin": origin,
  "Access-Control-Allow-Methods": "POST,OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Vary": "Origin",
};
const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status, headers });
const fail = (error: string, status: number) => json({ ok: false, error }, status);
const uuid = /^[\da-f]{8}-(?:[\da-f]{4}-){3}[\da-f]{12}$/i;

async function identity(token: unknown) {
  if (typeof token !== "string" || !/^[a-f0-9]{64}$/i.test(token)) return null;
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(token));
  const hash = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  const { data, error } = await db.from("mba_ob_sessions")
    .select("role,student_id,expires_at,revoked_at").eq("token_hash", hash).maybeSingle();
  if (error) throw error;
  if (!data || data.revoked_at || Date.parse(data.expires_at) <= Date.now()) return null;
  return data;
}

function activeStudents() {
  return db.from("mba_ob_students").select("id,full_name,student_number")
    .eq("approval_status", "approved").is("disabled_at", null);
}

async function rows<T>(query: PromiseLike<{ data: T[] | null; error: unknown }>): Promise<T[]> {
  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function all<T>(page: (start: number, end: number) => PromiseLike<{ data: T[] | null; error: unknown }>) {
  const result: T[] = [];
  const size = 200;
  for (let start = 0; ; start += size) {
    const batch = await rows(page(start, start + size - 1));
    result.push(...batch);
    if (batch.length < size) return result;
  }
}

const topicJoin = "topic:mba_ob_community_topics!inner(id,title)";
const graded = "session_no,status,score,feedback,submitted_at";
async function portfolio(studentId: string, instructor: boolean) {
  const [topics, replies, votes, reviews, invites, attempts, entries, windows, questions, attendance, assignments, cases] =
    await Promise.all([
      all((from, to) => db.from("mba_ob_community_topics").select("id,title,kind,summary,created_at")
        .eq("author_student_id", studentId).is("hidden_at", null).order("created_at", { ascending: false }).order("id").range(from, to)),
      all((from, to) => db.from("mba_ob_community_replies").select("id,body,created_at,parent_reply_id," + topicJoin)
        .eq("author_student_id", studentId).is("hidden_at", null).is("topic.hidden_at", null)
        .order("created_at", { ascending: false }).order("id").range(from, to)),
      all((from, to) => db.from("mba_ob_community_votes").select("updated_at," + topicJoin)
        .eq("student_id", studentId).is("topic.hidden_at", null).order("updated_at", { ascending: false }).order("topic_id").range(from, to)),
      all((from, to) => db.from("mba_ob_community_reviews").select("score,feedback,reviewed_at," + topicJoin)
        .eq("student_id", studentId).is("topic.hidden_at", null).order("reviewed_at", { ascending: false }).order("topic_id").range(from, to)),
      all((from, to) => db.from("mba_ob_community_invites").select("topic_id")
        .eq("inviter_id", studentId).order("topic_id").order("invitee_id").range(from, to)),
      rows(db.from("mba_ob_quiz_attempts").select("session_no,submitted_at,score,correct_count").eq("student_id", studentId)),
      rows(db.from("mba_ob_quiz_entries").select("session_no,started_at").eq("student_id", studentId)),
      rows(db.from("mba_ob_quiz_windows").select("session_no,opens_at,closes_at")),
      rows(db.from("mba_ob_quiz_questions").select("session_no")),
      rows(db.from("mba_ob_attendance").select("session_no,status,checked_at").eq("student_id", studentId)),
      rows(db.from("mba_ob_assignments").select("kind," + graded).eq("student_id", studentId)),
      rows(db.from("mba_ob_case_submissions").select(graded).eq("student_id", studentId)),
    ]);

  const inviteCount = new Map<string, number>();
  for (const invite of invites) inviteCount.set(invite.topic_id, (inviteCount.get(invite.topic_id) ?? 0) + 1);
  const windowBySession = new Map(windows.map(window => [window.session_no, window]));
  const attemptBySession = new Map(attempts.map(attempt => [attempt.session_no, attempt]));
  const questionsBySession = new Map<number, number>();
  for (const question of questions) {
    questionsBySession.set(question.session_no, (questionsBySession.get(question.session_no) ?? 0) + 1);
  }
  const entryBySession = new Map(entries.map(entry => [entry.session_no, entry]));
  const now = Date.now();
  const quizzes = Array.from({ length: 16 }, (_, index) => {
    const session = index + 1;
    const window = windowBySession.get(session);
    const attempt = attemptBySession.get(session);
    const released = instructor || session <= 2 || Boolean(window && now >= Date.parse(window.closes_at));
    if (attempt) return {
      session, status: released ? "graded" : "awaiting_release", submitted_at: attempt.submitted_at,
      score: released ? attempt.score : null, correct_count: released ? attempt.correct_count : null,
    };
    const entry = entryBySession.get(session);
    if (entry) return { session, status: "started_no_submission", started_at: entry.started_at };
    let status = "not_ready";
    if (questionsBySession.get(session) === 10) {
      status = !window ? "unscheduled" : now < Date.parse(window.opens_at) ? "upcoming"
        : now >= Date.parse(window.closes_at) ? "missed" : "open";
    }
    return { session, status };
  });
  return {
    community: { topics: topics.map(topic => ({ ...topic, invites: inviteCount.get(topic.id) ?? 0 })), replies, votes, reviews },
    classroom: { quizzes, attendance, assignments, cases },
  };
}

Deno.serve(async (request: Request) => {
  if (request.headers.get("origin") && request.headers.get("origin") !== origin) return fail("forbidden", 403);
  if (request.method === "OPTIONS") return new Response(null, { status: 204, headers });
  if (request.method !== "POST") return fail("method_not_allowed", 405);
  let input;
  try { input = await request.json(); } catch { return fail("invalid_request", 400); }
  if (!input || typeof input !== "object") return fail("invalid_request", 400);

  try {
    const user = await identity(input.token);
    if (!user) return fail("session_expired", 401);
    const instructor = user.role === "teacher";
    if (input.action === "open" && instructor) {
      const students = await all((from, to) => activeStudents().order("full_name").order("id").range(from, to));
      return json({ ok: true, students });
    }
    if (input.action !== "portfolio" && input.action !== "open") return fail("unknown_action", 400);

    if (instructor && (typeof input.student_id !== "string" || !uuid.test(input.student_id))) return fail("invalid_student", 400);
    if (!instructor && (user.role !== "student" || !user.student_id || input.student_id != null)) return fail("forbidden", 403);
    const studentId = instructor ? input.student_id : user.student_id;
    const { data: student, error } = await activeStudents().eq("id", studentId).maybeSingle();
    if (error) throw error;
    if (!student) return fail(instructor ? "student_not_found" : "forbidden", instructor ? 404 : 403);

    return json({ ok: true, student, ...(await portfolio(student.id, instructor)) });
  } catch (error) {
    const cause = error as { code?: string; message?: string };
    console.error("participation portfolio", cause?.code ?? "", cause?.message ?? "unknown");
    return fail("server_error", 500);
  }
});
