"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";

// --- Helpers ---
const PROVINCES = [
  "AB",
  "BC",
  "MB",
  "NB",
  "NL",
  "NS",
  "NT",
  "NU",
  "ON",
  "PE",
  "QC",
  "SK",
  "YT",
];
const LANGS = [
  { id: "en-CA", label: "English" },
  { id: "fr-CA", label: "Français" },
];

const LS_KEY = "previsit.forms.v1";

type Demographics = {
  firstName: string;
  lastName: string;
  dob: string;
  sex: string;
  gender: string;
  language: string;
};

type Contact = {
  email: string;
  phone: string;
  address: string;
  city: string;
  province: string;
  postal: string;
  emergencyName: string;
  emergencyPhone: string;
  emergencyRelation: string;
};

type Coverage = {
  healthCardNumber: string;
  province: string;
  privateInsurer?: string;
  policy?: string;
};

type Consents = {
  consentTreatment: boolean;
  consentPrivacy: boolean;
  consentECommunication: boolean;
};

type Symptoms = {
  chiefComplaint: string;
  onsetDate: string;
  duration: string;
  severity: string;
  notes: string;
};

type History = {
  conditions: string;
  surgeries: string;
  familyHistory: string;
  socialHistory: string;
};

type MedAllergy = {
  medications: string;
  allergies: string;
  vaccinations: string;
};

type PHQ9 = number[]; // 9 items 0–3

type GAD7 = number[]; // 7 items 0–3

function clamp(n: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, n));
}

function postalMask(v: string) {
  return v
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/(.{3})(.)/, "$1 $2")
    .slice(0, 7);
}

function scorePHQ9(items: PHQ9) {
  return items.reduce((a, b) => a + (b || 0), 0);
}
function scoreGAD7(items: GAD7) {
  return items.reduce((a, b) => a + (b || 0), 0);
}

function phqSeverity(score: number) {
  if (score <= 4) return "Minimal";
  if (score <= 9) return "Mild";
  if (score <= 14) return "Moderate";
  if (score <= 19) return "Moderately severe";
  return "Severe";
}
function gadSeverity(score: number) {
  if (score <= 4) return "Minimal";
  if (score <= 9) return "Mild";
  if (score <= 14) return "Moderate";
  return "Severe";
}

// --- Page ---
export default function FormsPage() {
  // Demographics
  const [demo, setDemo] = useState<Demographics>({
    firstName: "",
    lastName: "",
    dob: "",
    sex: "",
    gender: "",
    language: LANGS[0].id,
  });
  const [contact, setContact] = useState<Contact>({
    email: "",
    phone: "",
    address: "",
    city: "",
    province: "",
    postal: "",
    emergencyName: "",
    emergencyPhone: "",
    emergencyRelation: "",
  });
  const [coverage, setCoverage] = useState<Coverage>({
    healthCardNumber: "",
    province: "",
  });
  const [consent, setConsent] = useState<Consents>({
    consentTreatment: false,
    consentPrivacy: false,
    consentECommunication: false,
  });
  const [sym, setSym] = useState<Symptoms>({
    chiefComplaint: "",
    onsetDate: "",
    duration: "",
    severity: "",
    notes: "",
  });
  const [hist, setHist] = useState<History>({
    conditions: "",
    surgeries: "",
    familyHistory: "",
    socialHistory: "",
  });
  const [med, setMed] = useState<MedAllergy>({
    medications: "",
    allergies: "",
    vaccinations: "",
  });
  const [phq, setPhq] = useState<PHQ9>(Array(9).fill(0));
  const [gad, setGad] = useState<GAD7>(Array(7).fill(0));

  const phqScore = useMemo(() => scorePHQ9(phq), [phq]);
  const gadScore = useMemo(() => scoreGAD7(gad), [gad]);

  // Load/save draft
  useEffect(() => {
    try {
      const raw = localStorage.getItem(LS_KEY);
      if (raw) {
        const data = JSON.parse(raw);
        setDemo(data.demo ?? demo);
        setContact(data.contact ?? contact);
        setCoverage(data.coverage ?? coverage);
        setConsent(data.consent ?? consent);
        setSym(data.sym ?? sym);
        setHist(data.hist ?? hist);
        setMed(data.med ?? med);
        setPhq(data.phq ?? phq);
        setGad(data.gad ?? gad);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveDraft() {
    const data = { demo, contact, coverage, consent, sym, hist, med, phq, gad };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
      alert("Draft saved locally.");
    } catch {
      alert("Failed to save draft.");
    }
  }

  async function submitAll() {
    // Basic required checks
    if (
      !demo.firstName ||
      !demo.lastName ||
      !contact.email ||
      !contact.phone ||
      !coverage.healthCardNumber ||
      !coverage.province
    ) {
      alert(
        "Please complete required fields in Demographics, Contact, and Health Card sections."
      );
      return;
    }
    if (!consent.consentTreatment || !consent.consentPrivacy) {
      alert("Please provide consent to proceed.");
      return;
    }
    // Placeholder submit — here you would POST to your API/AppSync mutation.
    console.log("Submitting forms:", {
      demo,
      contact,
      coverage,
      consent,
      sym,
      hist,
      med,
      phq,
      gad,
      phqScore,
      gadScore,
    });
    alert(
      "Submitted. Thank you! You can return to the Chat to continue your interview."
    );
  }

  return (
    <div className="forms-page">
      <header className="hdr">
        <div>
          <h1>Required Forms</h1>
          <p className="muted">
            Complete these before your Canadian clinic visit. You can save a
            draft and finish later.
          </p>
        </div>
        <div className="row gap">
          <button className="btn ghost" onClick={saveDraft}>
            Save draft
          </button>
          <button className="btn primary" onClick={submitAll}>
            Submit all
          </button>
        </div>
      </header>

      {/* Demographics */}
      <section className="card">
        <h2>Demographics</h2>
        <div className="grid two">
          <div>
            <label className="label">First name *</label>
            <input
              className="input"
              value={demo.firstName}
              onChange={(e) => setDemo({ ...demo, firstName: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Last name *</label>
            <input
              className="input"
              value={demo.lastName}
              onChange={(e) => setDemo({ ...demo, lastName: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Date of birth *</label>
            <input
              type="date"
              className="input"
              value={demo.dob}
              onChange={(e) => setDemo({ ...demo, dob: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Sex (as on ID)</label>
            <select
              className="input"
              value={demo.sex}
              onChange={(e) => setDemo({ ...demo, sex: e.target.value })}
            >
              <option value="">Select</option>
              <option value="F">Female</option>
              <option value="M">Male</option>
              <option value="X">X / Unspecified</option>
            </select>
          </div>
          <div>
            <label className="label">Gender (optional)</label>
            <input
              className="input"
              value={demo.gender}
              onChange={(e) => setDemo({ ...demo, gender: e.target.value })}
              placeholder="e.g., Woman / Man / Non-binary"
            />
          </div>
          <div>
            <label className="label">Preferred language</label>
            <select
              className="input"
              value={demo.language}
              onChange={(e) => setDemo({ ...demo, language: e.target.value })}
            >
              {LANGS.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section className="card">
        <h2>Contact</h2>
        <div className="grid two">
          <div>
            <label className="label">Email *</label>
            <input
              type="email"
              className="input"
              value={contact.email}
              onChange={(e) =>
                setContact({ ...contact, email: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Phone (mobile) *</label>
            <input
              className="input"
              value={contact.phone}
              onChange={(e) =>
                setContact({ ...contact, phone: e.target.value })
              }
              placeholder="+1XXXXXXXXXX"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Address</label>
            <input
              className="input"
              value={contact.address}
              onChange={(e) =>
                setContact({ ...contact, address: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">City</label>
            <input
              className="input"
              value={contact.city}
              onChange={(e) => setContact({ ...contact, city: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Province/Territory</label>
            <select
              className="input"
              value={contact.province}
              onChange={(e) =>
                setContact({ ...contact, province: e.target.value })
              }
            >
              <option value="">Select</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Postal code</label>
            <input
              className="input"
              value={contact.postal}
              onChange={(e) =>
                setContact({ ...contact, postal: postalMask(e.target.value) })
              }
              placeholder="A1A 1A1"
            />
          </div>
          <div>
            <label className="label">Emergency contact name</label>
            <input
              className="input"
              value={contact.emergencyName}
              onChange={(e) =>
                setContact({ ...contact, emergencyName: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Emergency contact phone</label>
            <input
              className="input"
              value={contact.emergencyPhone}
              onChange={(e) =>
                setContact({ ...contact, emergencyPhone: e.target.value })
              }
              placeholder="+1XXXXXXXXXX"
            />
          </div>
          <div>
            <label className="label">Emergency relationship</label>
            <input
              className="input"
              value={contact.emergencyRelation}
              onChange={(e) =>
                setContact({ ...contact, emergencyRelation: e.target.value })
              }
              placeholder="e.g., spouse, parent"
            />
          </div>
        </div>
      </section>

      {/* Coverage */}
      <section className="card">
        <h2>Health Coverage (Canada)</h2>
        <div className="grid two">
          <div>
            <label className="label">
              Provincial/Territorial Health Card Number *
            </label>
            <input
              className="input"
              value={coverage.healthCardNumber}
              onChange={(e) =>
                setCoverage({
                  ...coverage,
                  healthCardNumber: e.target.value.replace(/\s/g, ""),
                })
              }
              placeholder="No spaces"
            />
          </div>
          <div>
            <label className="label">Issuing province/territory *</label>
            <select
              className="input"
              value={coverage.province}
              onChange={(e) =>
                setCoverage({ ...coverage, province: e.target.value })
              }
            >
              <option value="">Select</option>
              {PROVINCES.map((p) => (
                <option key={p} value={p}>
                  {p}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="label">Private insurer (optional)</label>
            <input
              className="input"
              value={coverage.privateInsurer || ""}
              onChange={(e) =>
                setCoverage({ ...coverage, privateInsurer: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Policy / Group # (optional)</label>
            <input
              className="input"
              value={coverage.policy || ""}
              onChange={(e) =>
                setCoverage({ ...coverage, policy: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      {/* Consents */}
      <section className="card">
        <h2>Consents</h2>
        <div className="check">
          <input
            id="c1"
            type="checkbox"
            checked={consent.consentTreatment}
            onChange={(e) =>
              setConsent({ ...consent, consentTreatment: e.target.checked })
            }
          />
          <label htmlFor="c1">
            I consent to receive care and treatment from the clinic.
          </label>
        </div>
        <div className="check">
          <input
            id="c2"
            type="checkbox"
            checked={consent.consentPrivacy}
            onChange={(e) =>
              setConsent({ ...consent, consentPrivacy: e.target.checked })
            }
          />
          <label htmlFor="c2">
            I acknowledge the clinic’s privacy notice and authorize use of my
            information for my care.
          </label>
        </div>
        <div className="check">
          <input
            id="c3"
            type="checkbox"
            checked={consent.consentECommunication}
            onChange={(e) =>
              setConsent({
                ...consent,
                consentECommunication: e.target.checked,
              })
            }
          />
          <label htmlFor="c3">
            I consent to secure electronic communications (email/SMS) about my
            care.
          </label>
        </div>
        <p className="hint">
          This is not legal advice. Clinics should supply their own consent
          wording/policy links.
        </p>
      </section>

      {/* Symptoms */}
      <section className="card">
        <h2>Symptoms</h2>
        <div className="grid two">
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Chief complaint</label>
            <input
              className="input"
              value={sym.chiefComplaint}
              onChange={(e) =>
                setSym({ ...sym, chiefComplaint: e.target.value })
              }
              placeholder="In your own words"
            />
          </div>
          <div>
            <label className="label">Onset date</label>
            <input
              type="date"
              className="input"
              value={sym.onsetDate}
              onChange={(e) => setSym({ ...sym, onsetDate: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Duration</label>
            <input
              className="input"
              value={sym.duration}
              onChange={(e) => setSym({ ...sym, duration: e.target.value })}
              placeholder="e.g., 3 days, 2 weeks"
            />
          </div>
          <div>
            <label className="label">Severity</label>
            <select
              className="input"
              value={sym.severity}
              onChange={(e) => setSym({ ...sym, severity: e.target.value })}
            >
              <option value="">Select</option>
              <option>Mild</option>
              <option>Moderate</option>
              <option>Severe</option>
            </select>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Notes</label>
            <textarea
              className="input"
              rows={3}
              value={sym.notes}
              onChange={(e) => setSym({ ...sym, notes: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* History */}
      <section className="card">
        <h2>Medical History</h2>
        <div className="grid two">
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Current or past conditions</label>
            <textarea
              className="input"
              rows={3}
              value={hist.conditions}
              onChange={(e) => setHist({ ...hist, conditions: e.target.value })}
              placeholder="e.g., hypertension, diabetes"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Surgeries / hospitalizations</label>
            <textarea
              className="input"
              rows={3}
              value={hist.surgeries}
              onChange={(e) => setHist({ ...hist, surgeries: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Family history</label>
            <textarea
              className="input"
              rows={3}
              value={hist.familyHistory}
              onChange={(e) =>
                setHist({ ...hist, familyHistory: e.target.value })
              }
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Social history</label>
            <textarea
              className="input"
              rows={3}
              value={hist.socialHistory}
              onChange={(e) =>
                setHist({ ...hist, socialHistory: e.target.value })
              }
              placeholder="tobacco/alcohol, exercise, housing/food security"
            />
          </div>
        </div>
      </section>

      {/* Medications & Allergies */}
      <section className="card">
        <h2>Medications & Allergies</h2>
        <div className="grid two">
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">
              Current medications (name, dose, frequency)
            </label>
            <textarea
              className="input"
              rows={3}
              value={med.medications}
              onChange={(e) => setMed({ ...med, medications: e.target.value })}
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Drug or other allergies (reaction)</label>
            <textarea
              className="input"
              rows={3}
              value={med.allergies}
              onChange={(e) => setMed({ ...med, allergies: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Vaccinations (notable)</label>
            <input
              className="input"
              value={med.vaccinations}
              onChange={(e) => setMed({ ...med, vaccinations: e.target.value })}
              placeholder="e.g., COVID-19 booster date"
            />
          </div>
        </div>
      </section>

      {/* PHQ-9 */}
      <section className="card">
        <h2>PHQ-9 (Depression Screening)</h2>
        <p className="hint">
          Over the last 2 weeks, how often have you been bothered by any of the
          following problems?
        </p>
        <table className="scale">
          <thead>
            <tr>
              <th>Question</th>
              <th>Not at all (0)</th>
              <th>Several days (1)</th>
              <th>More than half the days (2)</th>
              <th>Nearly every day (3)</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Little interest or pleasure in doing things",
              "Feeling down, depressed, or hopeless",
              "Trouble falling or staying asleep, or sleeping too much",
              "Feeling tired or having little energy",
              "Poor appetite or overeating",
              "Feeling bad about yourself — or that you are a failure or have let yourself or your family down",
              "Trouble concentrating on things, such as reading or watching television",
              "Moving or speaking so slowly that other people could have noticed. Or the opposite — being so fidgety or restless that you have been moving around a lot more than usual",
              "Thoughts that you would be better off dead or of hurting yourself in some way",
            ].map((q, i) => (
              <tr key={i}>
                <td>{q}</td>
                {[0, 1, 2, 3].map((v) => (
                  <td key={v}>
                    <input
                      type="radio"
                      name={`phq${i}`}
                      checked={phq[i] === v}
                      onChange={() =>
                        setPhq((p) => {
                          const c = [...p];
                          c[i] = v;
                          return c;
                        })
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="score">
          Score: <b>{phqScore}</b> — {phqSeverity(phqScore)}
        </div>
        <p className="hint">
          If you are in crisis or thinking about harming yourself, call 911 or
          your local emergency number right away.
        </p>
      </section>

      {/* GAD-7 */}
      <section className="card">
        <h2>GAD-7 (Anxiety Screening)</h2>
        <p className="hint">
          Over the last 2 weeks, how often have you been bothered by the
          following problems?
        </p>
        <table className="scale">
          <thead>
            <tr>
              <th>Question</th>
              <th>Not at all (0)</th>
              <th>Several days (1)</th>
              <th>More than half the days (2)</th>
              <th>Nearly every day (3)</th>
            </tr>
          </thead>
          <tbody>
            {[
              "Feeling nervous, anxious, or on edge",
              "Not being able to stop or control worrying",
              "Worrying too much about different things",
              "Trouble relaxing",
              "Being so restless that it is hard to sit still",
              "Becoming easily annoyed or irritable",
              "Feeling afraid as if something awful might happen",
            ].map((q, i) => (
              <tr key={i}>
                <td>{q}</td>
                {[0, 1, 2, 3].map((v) => (
                  <td key={v}>
                    <input
                      type="radio"
                      name={`gad${i}`}
                      checked={gad[i] === v}
                      onChange={() =>
                        setGad((g) => {
                          const c = [...g];
                          c[i] = v;
                          return c;
                        })
                      }
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        <div className="score">
          Score: <b>{gadScore}</b> — {gadSeverity(gadScore)}
        </div>
      </section>

      <section className="card subtle">
        <p className="hint">
          These forms help your care team prepare. They are not a diagnosis. If
          you have severe chest pain, difficulty breathing, or another
          emergency, call 911.
        </p>
      </section>

      <style>{`
        .forms-page { display:grid; gap: 32px; padding: 160px 32px 60px; margin-top: 3rem; background-color: #f9fafb; }
        .hdr { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
        h1 { margin:0; font-size:28px; font-weight:700; color:#1e293b; }
        h2 { margin:0 0 16px; font-size:22px; font-weight:700; color:#1f2937; }
        .muted { color:#64748b; }
        .row { display:flex; align-items:center; }
        .row.gap { gap:10px; }
        .card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:28px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); }
        .card.subtle { background:#f8fafc; }
        .grid.two { display:grid; grid-template-columns: 1fr 1fr; gap:14px; }
        @media (max-width: 760px) { .grid.two { grid-template-columns: 1fr; } }
        .label { display:block; font-weight:500; margin-bottom:8px; color:#374151; }
        .input { width:100%; padding:10px; border:1px solid #d1d5db; border-radius:6px; background:#fff; font-size:14px; }
        .input:focus { border-color:#2563eb; outline:none; box-shadow:0 0 0 1px #2563eb; }
        textarea.input { resize: vertical; }
        .hint { color:#6b7280; font-size:13px; line-height:1.4; }
        .btn { padding:10px 16px; border-radius:8px; font-weight:600; font-size:14px; cursor:pointer; transition: all 0.2s ease; }
        .btn.primary { background:#2563eb; color:#fff; border:1px solid #2563eb; }
        .btn.primary:hover { background:#1d4ed8; transform: translateY(-1px); }
        .btn.ghost { background:#fff; color:#1e293b; border:1px solid #d1d5db; }
        .btn.ghost:hover { background:#f3f4f6; transform: translateY(-1px); }
        table.scale { width:100%; border-collapse: collapse; }
        table.scale th, table.scale td { border:1px solid #e5e7eb; padding:8px; text-align:center; }
        table.scale th { background:#f3f4f6; font-weight:600; }
        table.scale th:first-child, table.scale td:first-child { text-align:left; }
        .score { margin-top:8px; }
        section.card { margin-bottom: 24px; }
        .check { display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; }
        .check input { margin-top:4px; }
      `}</style>
    </div>
  );
}
