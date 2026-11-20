import { useCallback, useEffect, useMemo, useState } from "react";
import {
  Activity, ArrowLeft, ArrowRight, ArrowUpRight, BookOpen,
  Building2, Check, CheckCircle2, ChevronDown, CircleHelp, ClipboardList,
  Clock3, FilePlus2, Filter, LayoutDashboard, LoaderCircle, LockKeyhole, LogOut,
  Mail, Menu, MessageSquareText,
  Plus, Search, ShieldCheck, Sparkles, Trash2, TrendingUp, Users, X,
} from "lucide-react";

const API = "/api";
const CATEGORIES = ["Facilities", "Academics", "Technology", "Campus Safety", "Transportation", "Student Services"];
const DEPARTMENTS = ["Computer Science", "Business", "Engineering", "Arts & Humanities", "Health Sciences", "Student Affairs", "Other"];
const STATUSES = ["Pending", "In Progress", "Resolved"];
const STATUS_ICON = { Pending: Clock3, "In Progress": Activity, Resolved: CheckCircle2 };
const INITIAL_AUTH = { token: localStorage.getItem("campuscare_token") || "", user: null };

function initials(name = "Campus User") {
  return name.split(/\s+/).slice(0, 2).map((part) => part[0]).join("").toUpperCase();
}

function dateLabel(date, options = { month: "short", day: "numeric", year: "numeric" }) {
  return new Intl.DateTimeFormat("en", options).format(new Date(date));
}

async function request(path, { token, ...options } = {}) {
  const response = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      ...(options.body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const payload = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(payload.message || "Something went wrong. Please try again.");
  return payload;
}

function Brand({ compact = false }) {
  return (
    <div className={`brand ${compact ? "brand-compact" : ""}`}>
      <span className="brand-mark"><Building2 size={20} strokeWidth={2.2} /></span>
      <span className="brand-name">campus<span>care</span><small>SMART CAMPUS</small></span>
    </div>
  );
}

function StatusBadge({ status }) {
  const Icon = STATUS_ICON[status] || Clock3;
  return <span className={`status-badge status-${status.toLowerCase().replace(" ", "-")}`}><Icon size={13} />{status}</span>;
}

function AuthScreen({ onAuth }) {
  const [role, setRole] = useState("student");
  const [mode, setMode] = useState("login");
  const [values, setValues] = useState({ name: "", email: "", password: "", department: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const path = mode === "register" ? "/auth/register" : "/auth/login";
      const body = mode === "register" ? values : { email: values.email, password: values.password, role };
      onAuth(await request(path, { method: "POST", body: JSON.stringify(body) }));
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const switchRole = (nextRole) => {
    setRole(nextRole);
    setMode("login");
    setError("");
  };

  return (
    <main className="auth-page">
      <section className="auth-story">
        <div className="story-grid" />
        <div className="story-top"><Brand /><span className="story-pill"><span /> Your voice, in action</span></div>
        <div className="story-copy">
          <div className="eyebrow"><Sparkles size={14} /> A BETTER CAMPUS STARTS HERE</div>
          <h1>Small changes.<br /><span>Big impact.</span></h1>
          <p>Every great campus listens. Share what matters to you, follow the progress, and help make student life better for everyone.</p>
          <div className="story-proof">
            <div className="proof-avatars"><span>JL</span><span>SK</span><span>AM</span><span>+</span></div>
            <div><strong>One campus, moving forward</strong><small>Good ideas deserve to be heard.</small></div>
          </div>
        </div>
        <div className="story-bottom"><span>Thoughtful feedback. Tangible progress.</span><span>01 — 02</span></div>
      </section>

      <section className="auth-panel">
        <div className="auth-mobile-brand"><Brand /></div>
        <div className="auth-card">
          <div className="module-label"><span className="module-dot" /> CHOOSE YOUR PORTAL</div>
          <div className="role-switch" aria-label="Choose a portal">
            <button type="button" className={role === "student" ? "selected" : ""} onClick={() => switchRole("student")}><Users size={16} /> Student</button>
            <button type="button" className={role === "admin" ? "selected" : ""} onClick={() => switchRole("admin")}><ShieldCheck size={16} /> Admin</button>
          </div>
          <div className="auth-heading">
            <h2>{mode === "register" ? "Create your account" : role === "student" ? "Welcome back" : "Admin sign in"}</h2>
            <p>{mode === "register" ? "Join your campus community and make a difference." : role === "student" ? "Sign in to share feedback and follow up." : "Sign in to manage campus feedback."}</p>
          </div>
          <form onSubmit={submit} className="auth-form">
            {mode === "register" && (
              <>
                <label>Full name<div className="input-wrap"><Users size={17} /><input autoComplete="name" required minLength={2} maxLength={80} placeholder="e.g. Jordan Lee" value={values.name} onChange={(e) => setValues({ ...values, name: e.target.value })} /></div></label>
                <label>Department<div className="input-wrap"><BookOpen size={17} /><select required value={values.department} onChange={(e) => setValues({ ...values, department: e.target.value })}><option value="" disabled>Select your department</option>{DEPARTMENTS.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={16} /></div></label>
              </>
            )}
            <label>Email address<div className="input-wrap"><Mail size={17} /><input autoComplete="email" type="email" required placeholder={role === "admin" ? "admin@campus.edu" : "you@campus.edu"} value={values.email} onChange={(e) => setValues({ ...values, email: e.target.value })} /></div></label>
            <label>Password<div className="input-wrap"><LockKeyhole size={17} /><input autoComplete={mode === "register" ? "new-password" : "current-password"} type="password" required minLength={mode === "register" ? 8 : undefined} placeholder={mode === "register" ? "At least 8 characters" : "Enter your password"} value={values.password} onChange={(e) => setValues({ ...values, password: e.target.value })} /></div></label>
            {error && <div role="alert" className="form-error"><CircleHelp size={15} />{error}</div>}
            <button className="button-primary auth-submit" disabled={loading}>{loading ? <LoaderCircle className="spin" size={18} /> : null}{mode === "register" ? "Create student account" : `Continue as ${role}`}<ArrowRight size={17} /></button>
          </form>
          {role === "student" && <p className="auth-toggle">{mode === "register" ? "Already part of the campus?" : "New to campuscare?"} <button type="button" onClick={() => { setMode(mode === "register" ? "login" : "register"); setError(""); }}>{mode === "register" ? "Sign in" : "Create an account"}</button></p>}
          {role === "admin" && <div className="secure-note"><ShieldCheck size={16} /><span>Secure access for campus administrators only.</span></div>}
        </div>
        <div className="auth-footer"><span>© 2026 CampusCare</span><span><LockKeyhole size={13} /> Secure & private</span></div>
      </section>
    </main>
  );
}

function Sidebar({ role, page, setPage, user, onLogout, open, onClose }) {
  const studentLinks = [
    { id: "overview", label: "My overview", icon: LayoutDashboard },
    { id: "complaints", label: "My complaints", icon: ClipboardList },
    { id: "new", label: "New complaint", icon: FilePlus2 },
  ];
  const adminLinks = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "complaints", label: "All complaints", icon: ClipboardList },
  ];
  const links = role === "admin" ? adminLinks : studentLinks;
  return (
    <>
      {open && <button className="mobile-backdrop" aria-label="Close navigation" onClick={onClose} />}
      <aside className={`sidebar ${open ? "sidebar-open" : ""}`}>
        <div className="sidebar-brand"><Brand compact /><button className="icon-button mobile-close" onClick={onClose} aria-label="Close menu"><X size={19} /></button></div>
        <div className="workspace-label">WORKSPACE</div>
        <div className="workspace-switch"><span className={`workspace-icon ${role}`}><Building2 size={17} /></span><span><strong>{role === "admin" ? "Admin workspace" : "Student portal"}</strong><small>{role === "admin" ? "Campus operations" : "Your campus, your voice"}</small></span><ChevronDown size={15} /></div>
        <nav className="side-nav" aria-label={`${role} navigation`}>
          <div className="nav-section-title">MENU</div>
          {links.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => { setPage(id); onClose(); }} className={`nav-link ${page === id ? "active" : ""}`}><Icon size={18} /><span>{label}</span>{id === "new" && <Plus size={15} className="nav-add" />}</button>
          ))}
          {role === "admin" && <div className="sidebar-note"><div className="note-icon"><Sparkles size={16} /></div><strong>Campus pulse</strong><p>Every response brings us one step closer to a better student experience.</p><span><span className="live-dot" /> All systems operational</span></div>}
        </nav>
        <div className="sidebar-bottom">
          <button className="help-link" onClick={() => window.open("mailto:support@campus.edu", "_blank")}><CircleHelp size={17} />Help & support<ArrowUpRight size={14} /></button>
          <div className="sidebar-user">
            <div className={`avatar ${role}`}>{initials(user.name)}</div>
            <div className="user-copy"><strong>{user.name}</strong><span>{role === "admin" ? "Administrator" : user.department || "Student"}</span></div>
            <button className="icon-button logout-button" title="Sign out" aria-label="Sign out" onClick={onLogout}><LogOut size={17} /></button>
          </div>
        </div>
      </aside>
    </>
  );
}

function Topbar({ title, subtitle, user, role, onMenu, onNew }) {
  return (
    <header className="topbar">
      <button className="icon-button mobile-menu" onClick={onMenu} aria-label="Open navigation"><Menu size={21} /></button>
      <div className="topbar-title"><span>{role === "admin" ? "ADMIN / " : "STUDENT / "}<strong>{title.toUpperCase()}</strong></span><small>{subtitle}</small></div>
      <div className="topbar-actions">
        {role === "student" && <button className="button-primary topbar-new" onClick={onNew}><Plus size={17} />New complaint</button>}
        <span className="topbar-date">{dateLabel(new Date(), { weekday: "short", month: "short", day: "numeric" })}</span>
        <div className={`avatar top-avatar ${role}`}>{initials(user.name)}</div>
      </div>
    </header>
  );
}

function EmptyState({ onNew, admin = false }) {
  return <div className="empty-state"><div className="empty-icon"><MessageSquareText size={23} /></div><h3>{admin ? "No complaints match these filters" : "Your story starts here"}</h3><p>{admin ? "Try adjusting the filters or search for a different complaint." : "If something could make campus life better, this is the place to share it."}</p>{!admin && <button className="button-primary" onClick={onNew}><Plus size={16} />Submit a complaint</button>}</div>;
}

function ComplaintTable({ complaints, onStatus, onDelete, admin = false, onTrack }) {
  if (!complaints.length) return <EmptyState admin={admin} onNew={onTrack} />;
  return (
    <div className="table-scroll"><table className="complaint-table">
      <thead><tr><th>COMPLAINT</th>{admin && <th>STUDENT</th>}<th>CATEGORY</th><th>SUBMITTED</th><th>STATUS</th>{admin && <th aria-label="Actions" />}</tr></thead>
      <tbody>{complaints.map((complaint) => (
        <tr key={complaint._id}>
          <td><button className="complaint-id" onClick={() => onTrack?.(complaint.complaintId)}><span className="table-file"><MessageSquareText size={16} /></span><span><strong>{complaint.complaintId}</strong><small>{complaint.description}</small></span><ArrowUpRight className="row-arrow" size={15} /></button></td>
          {admin && <td><div className="student-cell"><span className="mini-avatar">{initials(complaint.studentName)}</span><span><strong>{complaint.studentName}</strong><small>{complaint.department}</small></span></div></td>}
          <td><span className={`category-tag cat-${complaint.category.toLowerCase().split(" ")[0].replace("&", "")}`}>{complaint.category}</span></td>
          <td className="date-cell">{dateLabel(complaint.createdAt, { month: "short", day: "numeric" })}</td>
          <td>{admin ? <select aria-label={`Update status for ${complaint.complaintId}`} className={`status-select select-${complaint.status.toLowerCase().replace(" ", "-")}`} value={complaint.status} onChange={(e) => onStatus(complaint, e.target.value)}>{STATUSES.map((status) => <option key={status}>{status}</option>)}</select> : <StatusBadge status={complaint.status} />}</td>
          {admin && <td><button className="icon-button delete-button" aria-label={`Delete ${complaint.complaintId}`} title="Delete complaint" onClick={() => onDelete(complaint)}><Trash2 size={16} /></button></td>}
        </tr>
      ))}</tbody>
    </table></div>
  );
}

function StudentDashboard({ user, complaints, loading, setPage }) {
  const [query, setQuery] = useState("");
  const visibleComplaints = useMemo(
    () => query.trim()
      ? complaints.filter((item) => item.complaintId.toLowerCase().includes(query.trim().toLowerCase()))
      : complaints,
    [complaints, query]
  );
  const counts = useMemo(() => ({
    total: complaints.length,
    pending: complaints.filter((item) => item.status === "Pending").length,
    progress: complaints.filter((item) => item.status === "In Progress").length,
    resolved: complaints.filter((item) => item.status === "Resolved").length,
  }), [complaints]);
  const recent = visibleComplaints.slice(0, 5);
  return (
    <div className="page-content student-dashboard">
      <section className="student-hero">
        <div className="hero-text"><div className="hero-kicker"><span className="live-dot" /> YOUR CAMPUS, BETTER</div><h1>Good morning, {user.name.split(" ")[0]}<span className="wave">✳</span></h1><p>Your feedback makes this campus a little better every day.</p><button className="button-primary hero-cta" onClick={() => setPage("new")}><Plus size={17} />Share your feedback<ArrowRight size={16} /></button></div>
        <div className="hero-art" aria-hidden="true"><div className="art-orbit orbit-one" /><div className="art-orbit orbit-two" /><div className="art-sun"><Sparkles size={34} /></div><div className="art-building"><span /><span /><span /><span /><i /></div><div className="art-leaf leaf-one" /><div className="art-leaf leaf-two" /><div className="art-cloud" /></div>
        <div className="hero-index">CAMPUSCARE <span>—</span> COMMUNITY / 01</div>
      </section>

      <div className="student-toolbar">
        <div className="section-intro"><span className="tiny-kicker">YOUR FEEDBACK</span><h2>Feedback in motion <span>↗</span></h2><p>A little progress, one conversation at a time.</p></div>
        <div className="track-search"><Search size={17} /><input aria-label="Track complaint by ID" placeholder="Track a complaint ID..." value={query} onChange={(e) => { setQuery(e.target.value); setSearch(e.target.value); }} /><span className="search-shortcut">ID</span></div>
      </div>

      <section className="student-stat-row">
        <div className="student-stat featured-stat"><span className="student-stat-label">ALL FEEDBACK</span><div><strong>{counts.total.toString().padStart(2, "0")}</strong><span className="stat-decoration"><MessageSquareText size={20} /></span></div><small><span className="stat-arrow">↗</span>Every voice counts</small></div>
        <div className="student-stat"><span className="student-stat-label">AWAITING REVIEW</span><div><strong>{counts.pending.toString().padStart(2, "0")}</strong><Clock3 size={18} /></div><small>We’re on it</small></div>
        <div className="student-stat"><span className="student-stat-label">IN PROGRESS</span><div><strong>{counts.progress.toString().padStart(2, "0")}</strong><Activity size={18} /></div><small>Moving things forward</small></div>
        <div className="student-stat"><span className="student-stat-label">RESOLVED</span><div><strong>{counts.resolved.toString().padStart(2, "0")}</strong><CheckCircle2 size={18} /></div><small>Making a difference</small></div>
      </section>

      <section className="panel recent-panel"><div className="panel-heading"><div><span className="tiny-kicker">YOUR ACTIVITY</span><h2>Recent complaints <span className="count-chip">{complaints.length}</span></h2></div><button className="text-button" onClick={() => setPage("complaints")}>See all <ArrowRight size={15} /></button></div>
        {loading ? <LoadingState /> : query && !recent.length
          ? <div className="search-empty" role="status">No complaint found for <strong>{query}</strong>. Check the ID and try again.</div>
          : <ComplaintTable complaints={recent} onTrack={(id) => { setQuery(id); document.querySelector(".track-search input")?.focus(); }} onNew={() => setPage("new")} />}
      </section>
      <div className="student-bottom-note"><span><ShieldCheck size={16} /></span><p>Your feedback stays connected to your account, and only campus staff can see your personal details.</p><ArrowUpRight size={15} /></div>
    </div>
  );
}

function AdminDashboard({ complaints, stats, loading, setPage, onStatus, onDelete, onSearch }) {
  const [query, setQuery] = useState("");
  const [searchResults, setSearchResults] = useState(null);
  const [searchError, setSearchError] = useState("");
  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      if (!query.trim()) {
        setSearchResults(null);
        setSearchError("");
        return;
      }
      try {
        const { complaints: results } = await onSearch(`search=${encodeURIComponent(query.trim())}`);
        if (active) {
          setSearchResults(results);
          setSearchError("");
        }
      } catch (error) {
        if (active) setSearchError(error.message);
      }
    }, 180);
    return () => { active = false; clearTimeout(timeout); };
  }, [query, onSearch]);
  const resolvedPercentage = stats.total ? Math.round((stats.resolved / stats.total) * 100) : 0;
  const displayedComplaints = searchResults ?? complaints;
  return (
    <div className="page-content admin-dashboard">
      <div className="admin-welcome"><div><span className="tiny-kicker"><span className="live-dot" /> CAMPUS OVERVIEW</span><h1>Good morning, Admin <span>✳</span></h1><p>Here’s what’s happening across your campus today.</p></div><div className="overview-date"><span>TODAY</span><strong>{dateLabel(new Date(), { weekday: "long", month: "long", day: "numeric" })}</strong><span>{dateLabel(new Date(), { year: "numeric" })}</span></div></div>
      <section className="admin-stat-grid">
        <div className="admin-stat-card total-card"><div className="stat-card-head"><span>Total complaints</span><span className="stat-icon"><ClipboardList size={18} /></span></div><div className="admin-stat-number">{stats.total.toString().padStart(2, "0")}</div><div className="stat-card-foot"><span><TrendingUp size={14} /> Campus-wide</span><span className="stat-foot-label">ALL TIME</span></div><div className="total-sparkline"><svg viewBox="0 0 220 50" preserveAspectRatio="none"><path d="M0 39 C20 33 23 37 37 27 S59 35 73 21 S100 35 116 17 S141 24 154 12 S183 26 200 8 S211 15 220 1" /></svg></div></div>
        <div className="admin-stat-card"><div className="stat-card-head"><span>Pending review</span><span className="stat-icon pending-icon"><Clock3 size={18} /></span></div><div className="admin-stat-number">{stats.pending.toString().padStart(2, "0")}</div><div className="stat-card-foot"><span>Needs attention</span><span className="status-dot pending-dot" /></div></div>
        <div className="admin-stat-card"><div className="stat-card-head"><span>In progress</span><span className="stat-icon progress-icon"><Activity size={18} /></span></div><div className="admin-stat-number">{stats.inProgress.toString().padStart(2, "0")}</div><div className="stat-card-foot"><span>Being worked on</span><span className="status-dot progress-dot" /></div></div>
        <div className="admin-stat-card"><div className="stat-card-head"><span>Resolved</span><span className="stat-icon resolved-icon"><CheckCircle2 size={18} /></span></div><div className="admin-stat-number">{stats.resolved.toString().padStart(2, "0")}</div><div className="stat-card-foot"><span>{resolvedPercentage}% resolution rate</span><span className="status-dot resolved-dot" /></div></div>
      </section>
      <section className="panel admin-table-panel"><div className="admin-table-top"><div><span className="tiny-kicker">CAMPUS FEEDBACK</span><h2>All complaints <span className="count-chip">{stats.total}</span></h2></div><button className="filter-button" onClick={() => setPage("complaints")}><Filter size={15} />Filter & manage</button></div>
        <ComplaintFilters query={query} setQuery={setQuery} />
        {searchError && <p className="inline-error" role="alert">{searchError}</p>}
        {loading ? <LoadingState /> : <ComplaintTable complaints={displayedComplaints.slice(0, 6)} admin onStatus={onStatus} onDelete={onDelete} />}
        {displayedComplaints.length > 6 && <button className="table-view-all" onClick={() => setPage("complaints")}>View all {displayedComplaints.length} complaints <ArrowRight size={15} /></button>}
      </section>
      <div className="admin-footer-note"><Sparkles size={16} /><span>Thank you for making space for student voices.</span><span className="footer-note-right">CAMPUSCARE ADMIN</span></div>
    </div>
  );
}

function ComplaintFilters({ query, setQuery, category, setCategory, status, setStatus, full = false }) {
  return (
    <div className="filter-row">
      <div className="filter-search"><Search size={16} /><input aria-label="Search complaint ID" placeholder="Search by complaint ID..." value={query} onChange={(e) => setQuery(e.target.value)} /><span>⌘ K</span></div>
      {full && <><label className="filter-select"><span className="filter-label">CATEGORY</span><select aria-label="Filter by category" value={category} onChange={(e) => setCategory(e.target.value)}><option value="">All categories</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label><label className="filter-select"><span className="filter-label">STATUS</span><select aria-label="Filter by status" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((item) => <option key={item}>{item}</option>)}</select><ChevronDown size={14} /></label></>}
    </div>
  );
}

function ComplaintsPage({ role, complaints, loading, onStatus, onDelete, onSearch }) {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("");
  const [status, setStatus] = useState("");
  const [filtered, setFiltered] = useState(complaints);
  const [searchError, setSearchError] = useState("");
  useEffect(() => {
    let active = true;
    const timeout = setTimeout(async () => {
      const params = new URLSearchParams();
      if (query.trim()) params.set("search", query.trim());
      if (role === "admin" && category) params.set("category", category);
      if (role === "admin" && status) params.set("status", status);
      try {
        const { complaints: results } = await onSearch(params.toString());
        if (active) {
          setFiltered(results);
          setSearchError("");
        }
      } catch (error) {
        if (active) setSearchError(error.message);
      }
    }, 180);
    return () => { active = false; clearTimeout(timeout); };
  }, [query, category, status, role, onSearch]);

  return (
    <div className="page-content complaints-page">
      <div className="page-heading-block"><div><span className="tiny-kicker">{role === "admin" ? "CAMPUS FEEDBACK" : "YOUR FEEDBACK"}</span><h1>{role === "admin" ? "All complaints" : "My complaints"} <span className="count-chip">{filtered.length}</span></h1><p>{role === "admin" ? "Review, filter and follow up on student feedback." : "Every update, all in one place. Your feedback matters."}</p></div>{role === "student" && <button className="button-primary" onClick={() => window.dispatchEvent(new CustomEvent("campuscare:new"))}><Plus size={16} />New complaint</button>}</div>
      {role === "admin" ? <ComplaintFilters query={query} setQuery={setQuery} category={category} setCategory={setCategory} status={status} setStatus={setStatus} full /> :
        <ComplaintFilters query={query} setQuery={setQuery} />}
      {searchError && <p className="inline-error" role="alert">{searchError}</p>}
      <section className="panel full-table-panel">{loading ? <LoadingState /> : <ComplaintTable complaints={filtered} admin={role === "admin"} onStatus={onStatus} onDelete={onDelete} onTrack={() => {}} onNew={() => window.dispatchEvent(new CustomEvent("campuscare:new"))} />}</section>
    </div>
  );
}

function NewComplaint({ user, token, onCreated, onCancel }) {
  const [values, setValues] = useState({ studentName: user.name, department: user.department || "", category: "", description: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  async function submit(event) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const { complaint } = await request("/complaints", { token, method: "POST", body: JSON.stringify(values) });
      onCreated(complaint);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }
  return (
    <div className="page-content new-complaint-page">
      <button className="back-button" onClick={onCancel}><ArrowLeft size={16} />Back to overview</button>
      <div className="form-page-layout"><div className="form-page-intro"><span className="tiny-kicker">YOUR VOICE MATTERS</span><h1>Let’s make campus<br /><span>a little better.</span></h1><p>Tell us what’s on your mind. Your feedback reaches the right campus team and we’ll keep you updated as things progress.</p><div className="form-promise"><ShieldCheck size={19} /><span><strong>Your privacy matters</strong><small>Only campus staff can see your details.</small></span></div><div className="form-steps"><span className="step-active">01 <i /> Share it</span><span>02 <i /> We review</span><span>03 <i /> See progress</span></div></div>
        <form className="panel complaint-form" onSubmit={submit}><div className="form-card-heading"><div className="form-card-icon"><FilePlus2 size={19} /></div><div><h2>New complaint</h2><p>Fields marked <span>*</span> are required.</p></div><span className="form-step-number">01 / 01</span></div>
          <label>Your name <span>*</span><input required minLength={2} maxLength={80} value={values.studentName} onChange={(e) => setValues({ ...values, studentName: e.target.value })} /></label>
          <label>Department <span>*</span><select required value={values.department} onChange={(e) => setValues({ ...values, department: e.target.value })}><option value="" disabled>Select your department</option>{DEPARTMENTS.map((item) => <option key={item}>{item}</option>)}</select></label>
          <label>What is this about? <span>*</span><select required value={values.category} onChange={(e) => setValues({ ...values, category: e.target.value })}><option value="" disabled>Select a category</option>{CATEGORIES.map((item) => <option key={item}>{item}</option>)}</select><small className="field-hint">This helps us get your feedback to the right team.</small></label>
          <label>Tell us a little more <span>*</span><textarea required minLength={10} maxLength={2000} rows={5} placeholder="What happened? Where did it happen? How can we make things better?" value={values.description} onChange={(e) => setValues({ ...values, description: e.target.value })} /><small className="field-hint char-count">{values.description.length} / 2,000 characters</small></label>
          {error && <div role="alert" className="form-error"><CircleHelp size={15} />{error}</div>}
          <div className="form-actions"><span><LockKeyhole size={14} />Your feedback is private</span><button className="button-primary" disabled={loading}>{loading ? <LoaderCircle size={17} className="spin" /> : <ArrowRight size={17} />}{loading ? "Submitting..." : "Submit feedback"}</button></div>
        </form></div>
    </div>
  );
}

function LoadingState() {
  return <div className="loading-state"><LoaderCircle className="spin" size={21} /><span>Loading your campus feedback...</span></div>;
}

function Toast({ toast, onClose }) {
  useEffect(() => {
    if (!toast) return;
    const timeout = setTimeout(onClose, 4500);
    return () => clearTimeout(timeout);
  }, [toast, onClose]);
  if (!toast) return null;
  return <div className={`toast ${toast.type || "success"}`} role="status"><span>{toast.type === "error" ? <CircleHelp size={17} /> : <Check size={17} />}</span>{toast.message}<button className="icon-button" onClick={onClose} aria-label="Dismiss notification"><X size={15} /></button></div>;
}

function DeleteDialog({ complaint, onCancel, onConfirm, loading }) {
  useEffect(() => {
    function onKey(event) { if (event.key === "Escape") onCancel(); }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onCancel]);
  return <div className="dialog-backdrop" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}><div className="confirm-dialog" role="dialog" aria-modal="true" aria-labelledby="delete-title"><div className="delete-icon"><Trash2 size={20} /></div><button className="icon-button dialog-close" onClick={onCancel} aria-label="Close dialog"><X size={17} /></button><h2 id="delete-title">Delete this complaint?</h2><p><strong>{complaint.complaintId}</strong> will be permanently removed. This can’t be undone.</p><div className="dialog-actions"><button className="button-secondary" onClick={onCancel}>Keep complaint</button><button className="button-danger" disabled={loading} onClick={onConfirm}>{loading ? "Deleting..." : "Yes, delete"}</button></div></div></div>;
}

function App() {
  const [auth, setAuth] = useState(INITIAL_AUTH);
  const [page, setPage] = useState("overview");
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, inProgress: 0, resolved: 0 });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);
  const [mobileNav, setMobileNav] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const role = auth.user?.role;

  const showToast = useCallback((message, type = "success") => setToast({ message, type }), []);
  const logout = useCallback(() => {
    localStorage.removeItem("campuscare_token");
    setAuth({ token: "", user: null });
    setComplaints([]);
    setPage("overview");
  }, []);

  useEffect(() => {
    if (!auth.token || auth.user) return;
    let active = true;
    request("/auth/me", { token: auth.token }).then(({ user }) => {
      if (active) setAuth((current) => ({ ...current, user }));
    }).catch(() => {
      if (active) logout();
    });
    return () => { active = false; };
  }, [auth.token, auth.user, logout]);

  const fetchComplaints = useCallback(async (query = "") => {
    const result = await request(`/complaints${query ? `?${query}` : ""}`, { token: auth.token });
    if (!query) setComplaints(result.complaints);
    return result;
  }, [auth.token]);

  const refresh = useCallback(async () => {
    if (!role) return;
    setLoading(true);
    try {
      const jobs = [fetchComplaints()];
      if (role === "admin") jobs.push(request("/complaints/stats", { token: auth.token }).then((result) => setStats(result)));
      await Promise.all(jobs);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setLoading(false);
    }
  }, [role, auth.token, fetchComplaints, showToast]);

  useEffect(() => { refresh(); }, [refresh]);

  useEffect(() => {
    if (!role) return;
    const onNew = () => setPage("new");
    window.addEventListener("campuscare:new", onNew);
    return () => window.removeEventListener("campuscare:new", onNew);
  }, [role]);

  function handleAuth(result) {
    localStorage.setItem("campuscare_token", result.token);
    setAuth(result);
    setPage("overview");
    showToast(`Welcome${result.user.name ? `, ${result.user.name.split(" ")[0]}` : ""}!`);
  }

  async function updateStatus(complaint, status) {
    try {
      const { complaint: updated } = await request(`/complaints/${complaint._id}/status`, { token: auth.token, method: "PATCH", body: JSON.stringify({ status }) });
      setComplaints((items) => items.map((item) => item._id === updated._id ? updated : item));
      const result = await request("/complaints/stats", { token: auth.token });
      setStats(result);
      showToast(`${complaint.complaintId} updated to ${status.toLowerCase()}.`);
    } catch (error) {
      showToast(error.message, "error");
      refresh();
    }
  }

  async function deleteComplaint() {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await request(`/complaints/${deleteTarget._id}`, { token: auth.token, method: "DELETE" });
      setComplaints((items) => items.filter((item) => item._id !== deleteTarget._id));
      setDeleteTarget(null);
      const result = await request("/complaints/stats", { token: auth.token });
      setStats(result);
      showToast(`${deleteTarget.complaintId} has been deleted.`);
    } catch (error) {
      showToast(error.message, "error");
    } finally {
      setDeleting(false);
    }
  }

  function created(complaint) {
    setComplaints((items) => [complaint, ...items]);
    setPage("overview");
    showToast(`Feedback received! Your ID is ${complaint.complaintId}.`);
  }

  if (!auth.user) {
    if (auth.token) return <div className="auth-loading"><LoaderCircle className="spin" size={25} /><span>Getting things ready...</span></div>;
    return <><AuthScreen onAuth={handleAuth} /><Toast toast={toast} onClose={() => setToast(null)} /></>;
  }

  const pageInfo = page === "new"
    ? { title: "New complaint", subtitle: "Let’s make campus a little better." }
    : page === "complaints"
      ? { title: role === "admin" ? "All complaints" : "My complaints", subtitle: role === "admin" ? "Review, filter and follow up on feedback." : "Your feedback, all in one place." }
      : { title: "Overview", subtitle: role === "admin" ? "A pulse on what matters across campus." : "A little progress, one conversation at a time." };

  return (
    <div className={`app-shell ${role}`}>
      <Sidebar role={role} page={page} setPage={setPage} user={auth.user} onLogout={logout} open={mobileNav} onClose={() => setMobileNav(false)} />
      <main className="main-area">
        <Topbar title={pageInfo.title} subtitle={pageInfo.subtitle} user={auth.user} role={role} onMenu={() => setMobileNav(true)} onNew={() => setPage("new")} />
        {page === "new" && role === "student" ? <NewComplaint user={auth.user} token={auth.token} onCreated={created} onCancel={() => setPage("overview")} /> :
          page === "complaints" ? <ComplaintsPage role={role} complaints={complaints} loading={loading} onStatus={updateStatus} onDelete={setDeleteTarget} onSearch={fetchComplaints} /> :
            role === "admin" ? <AdminDashboard complaints={complaints} stats={stats} loading={loading} setPage={setPage} onStatus={updateStatus} onDelete={setDeleteTarget} onSearch={fetchComplaints} /> :
              <StudentDashboard user={auth.user} complaints={complaints} loading={loading} setPage={setPage} />}
      </main>
      <Toast toast={toast} onClose={() => setToast(null)} />
      {deleteTarget && <DeleteDialog complaint={deleteTarget} onCancel={() => setDeleteTarget(null)} onConfirm={deleteComplaint} loading={deleting} />}
    </div>
  );
}

export default App;
