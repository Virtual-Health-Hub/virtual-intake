"use client";

import React, { useEffect, useState } from "react";

// --- Constants ---
const PROVINCES = ["SK"]; // Saskatchewan only
const LANGS = [{ id: "en-CA", label: "English" }];
const ROS_OPTIONS = [
  "Fever",
  "Chills",
  "Fatigue",
  "Sore throat",
  "Ear pain",
  "Cough",
  "Shortness of breath",
  "Chest pain",
  "Palpitations",
  "Abdominal pain",
  "Nausea/Vomiting",
  "Diarrhea",
  "Constipation",
  "Urinary symptoms",
  "Back pain",
  "Joint pain",
  "Rash/Skin changes",
  "Headache",
  "Dizziness",
  "Eye redness/irritation",
];
const CHRONIC_OPTIONS = [
  "Hypertension",
  "Diabetes",
  "Asthma",
  "COPD",
  "Coronary artery disease",
  "Chronic kidney disease",
  "Cancer",
  "Thyroid disorder",
  "Depression/Anxiety",
];
const LS_KEY = "previsit.forms.primary.v1";

// --- Types ---
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
  severity: string; // Mild / Moderate / Severe
  painScore: number; // 0-10
  painLocation: string;
  notes: string;
};

type History = {
  conditions: string;
  surgeries: string;
  familyHistory: string;
  socialHistory: string;
  chronicSelected: string[];
  chronicOther: string;
};

type MedAllergy = {
  medications: string;
  allergies: string;
  vaccinations: string;
};

type Vitals = {
  heightCm?: string;
  weightKg?: string;
  tempC?: string;
  bpSys?: string;
  bpDia?: string;
  pulse?: string;
};

type Exposure = {
  recentTravel: boolean;
  travelWhere: string;
  covidSymptoms: boolean;
  covidExposure: boolean;
};

type Injury = {
  workInjury: boolean;
  wcbNumber: string;
  mva: boolean;
  insurer: string;
  claimNumber: string;
};

type Pharmacy = {
  name: string;
  phone: string;
  address: string;
};

type Preferences = {
  preferredContact: "phone" | "email" | "sms" | "none";
  interpreterNeeded: boolean;
  accessibilityNotes: string;
};

// --- Helpers ---
function postalMask(v: string) {
  return v
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .replace(/(.{3})(.)/, "$1 $2")
    .slice(0, 7);
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
    painScore: 0,
    painLocation: "",
    notes: "",
  });
  const [hist, setHist] = useState<History>({
    conditions: "",
    surgeries: "",
    familyHistory: "",
    socialHistory: "",
    chronicSelected: [],
    chronicOther: "",
  });
  const [med, setMed] = useState<MedAllergy>({
    medications: "",
    allergies: "",
    vaccinations: "",
  });
  const [vitals, setVitals] = useState<Vitals>({});
  const [exposure, setExposure] = useState<Exposure>({
    recentTravel: false,
    travelWhere: "",
    covidSymptoms: false,
    covidExposure: false,
  });
  const [injury, setInjury] = useState<Injury>({
    workInjury: false,
    wcbNumber: "",
    mva: false,
    insurer: "",
    claimNumber: "",
  });
  const [pharmacy, setPharmacy] = useState<Pharmacy>({
    name: "",
    phone: "",
    address: "",
  });
  const [prefs, setPrefs] = useState<Preferences>({
    preferredContact: "phone",
    interpreterNeeded: false,
    accessibilityNotes: "",
  });
  const [rosSelected, setRosSelected] = useState<string[]>([]);

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
        setVitals(data.vitals ?? vitals);
        setExposure(data.exposure ?? exposure);
        setInjury(data.injury ?? injury);
        setPharmacy(data.pharmacy ?? pharmacy);
        setPrefs(data.prefs ?? prefs);
        setRosSelected(data.rosSelected ?? rosSelected);
      }
    } catch {}
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function saveDraft() {
    const data = {
      demo,
      contact,
      coverage,
      consent,
      sym,
      hist,
      med,
      vitals,
      exposure,
      injury,
      pharmacy,
      prefs,
      rosSelected,
    };
    try {
      localStorage.setItem(LS_KEY, JSON.stringify(data));
      alert("Draft saved locally.");
    } catch {
      alert("Failed to save draft.");
    }
  }

  function submitAll() {
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

    console.log("Submitting forms:", {
      demo,
      contact,
      coverage,
      consent,
      sym,
      hist,
      med,
      vitals,
      exposure,
      injury,
      pharmacy,
      prefs,
      rosSelected,
    });
    alert(
      "Submitted. Thank you! You can return to Chat to continue your interview."
    );
  }

  // --- UI ---
  return (
    <div className="forms-page">
      <header className="hdr">
        <div>
          <h1>Pre‑Visit Forms (Primary Care)</h1>
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

      {/* Presenting Problem & Triage */}
      <section className="card">
        <h2>Presenting Problem</h2>
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
          <div>
            <label className="label">Pain score (0–10)</label>
            <input
              type="number"
              min={0}
              max={10}
              className="input"
              value={sym.painScore}
              onChange={(e) =>
                setSym({
                  ...sym,
                  painScore: Math.max(
                    0,
                    Math.min(10, Number(e.target.value || 0))
                  ),
                })
              }
            />
          </div>
          <div>
            <label className="label">Pain location</label>
            <input
              className="input"
              value={sym.painLocation}
              onChange={(e) => setSym({ ...sym, painLocation: e.target.value })}
              placeholder="e.g., left ear, lower back"
            />
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

      {/* Review of Systems */}
      <section className="card">
        <h2>Review of Systems</h2>
        <p className="hint">Select any symptoms you are experiencing now.</p>
        <div className="chips">
          {ROS_OPTIONS.map((opt) => (
            <label
              key={opt}
              className={`chip ${rosSelected.includes(opt) ? "active" : ""}`}
            >
              <input
                type="checkbox"
                checked={rosSelected.includes(opt)}
                onChange={(e) => {
                  setRosSelected((prev) =>
                    e.target.checked
                      ? [...prev, opt]
                      : prev.filter((x) => x !== opt)
                  );
                }}
              />
              {opt}
            </label>
          ))}
        </div>
      </section>

      {/* Vitals (self-reported) */}
      <section className="card">
        <h2>Vitals (optional, self‑reported)</h2>
        <div className="grid two">
          <div>
            <label className="label">Height (cm)</label>
            <input
              className="input"
              value={vitals.heightCm || ""}
              onChange={(e) =>
                setVitals({ ...vitals, heightCm: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Weight (kg)</label>
            <input
              className="input"
              value={vitals.weightKg || ""}
              onChange={(e) =>
                setVitals({ ...vitals, weightKg: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Temperature (°C)</label>
            <input
              className="input"
              value={vitals.tempC || ""}
              onChange={(e) => setVitals({ ...vitals, tempC: e.target.value })}
            />
          </div>
          <div>
            <label className="label">Blood pressure (mmHg)</label>
            <div className="row gap">
              <input
                className="input"
                placeholder="Systolic"
                value={vitals.bpSys || ""}
                onChange={(e) =>
                  setVitals({ ...vitals, bpSys: e.target.value })
                }
              />
              <input
                className="input"
                placeholder="Diastolic"
                value={vitals.bpDia || ""}
                onChange={(e) =>
                  setVitals({ ...vitals, bpDia: e.target.value })
                }
              />
            </div>
          </div>
          <div>
            <label className="label">Pulse (bpm)</label>
            <input
              className="input"
              value={vitals.pulse || ""}
              onChange={(e) => setVitals({ ...vitals, pulse: e.target.value })}
            />
          </div>
        </div>
      </section>

      {/* Exposure / Infectious */}
      <section className="card">
        <h2>Recent Travel & Illness Exposure</h2>
        <div className="grid two">
          <div className="check">
            <input
              id="t1"
              type="checkbox"
              checked={exposure.recentTravel}
              onChange={(e) =>
                setExposure({ ...exposure, recentTravel: e.target.checked })
              }
            />
            <label htmlFor="t1">
              I have travelled outside my province/territory in the last 30 days
            </label>
          </div>
          <div>
            <label className="label">If yes, where?</label>
            <input
              className="input"
              value={exposure.travelWhere}
              onChange={(e) =>
                setExposure({ ...exposure, travelWhere: e.target.value })
              }
            />
          </div>
          <div className="check">
            <input
              id="t2"
              type="checkbox"
              checked={exposure.covidSymptoms}
              onChange={(e) =>
                setExposure({ ...exposure, covidSymptoms: e.target.checked })
              }
            />
            <label htmlFor="t2">I have cold/flu/COVID‑like symptoms</label>
          </div>
          <div className="check">
            <input
              id="t3"
              type="checkbox"
              checked={exposure.covidExposure}
              onChange={(e) =>
                setExposure({ ...exposure, covidExposure: e.target.checked })
              }
            />
            <label htmlFor="t3">
              I’ve been exposed to someone who is ill (known COVID/flu)
            </label>
          </div>
        </div>
      </section>

      {/* Injury / WCB / MVA */}
      <section className="card">
        <h2>Injury / Work or Motor Vehicle</h2>
        <div className="grid two">
          <div className="check">
            <input
              id="w1"
              type="checkbox"
              checked={injury.workInjury}
              onChange={(e) =>
                setInjury({ ...injury, workInjury: e.target.checked })
              }
            />
            <label htmlFor="w1">This is a work‑related injury</label>
          </div>
          <div>
            <label className="label">WCB claim # (if applicable)</label>
            <input
              className="input"
              value={injury.wcbNumber}
              onChange={(e) =>
                setInjury({ ...injury, wcbNumber: e.target.value })
              }
            />
          </div>
          <div className="check">
            <input
              id="m1"
              type="checkbox"
              checked={injury.mva}
              onChange={(e) => setInjury({ ...injury, mva: e.target.checked })}
            />
            <label htmlFor="m1">
              This is related to a motor vehicle accident
            </label>
          </div>
          <div>
            <label className="label">Insurer / Claim # (if applicable)</label>
            <input
              className="input"
              value={injury.insurer}
              onChange={(e) =>
                setInjury({ ...injury, insurer: e.target.value })
              }
              placeholder="Insurer name"
            />
            <input
              className="input"
              style={{ marginTop: 8 }}
              value={injury.claimNumber}
              onChange={(e) =>
                setInjury({ ...injury, claimNumber: e.target.value })
              }
              placeholder="Claim number"
            />
          </div>
        </div>
      </section>

      {/* Medical History */}
      <section className="card">
        <h2>Medical History</h2>
        <div className="grid two">
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Chronic conditions (select any)</label>
            <div className="chips">
              {CHRONIC_OPTIONS.map((opt) => (
                <label
                  key={opt}
                  className={`chip ${
                    hist.chronicSelected.includes(opt) ? "active" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={hist.chronicSelected.includes(opt)}
                    onChange={(e) =>
                      setHist((prev) => ({
                        ...prev,
                        chronicSelected: e.target.checked
                          ? [...prev.chronicSelected, opt]
                          : prev.chronicSelected.filter((x) => x !== opt),
                      }))
                    }
                  />
                  {opt}
                </label>
              ))}
            </div>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Other chronic conditions</label>
            <input
              className="input"
              value={hist.chronicOther}
              onChange={(e) =>
                setHist({ ...hist, chronicOther: e.target.value })
              }
            />
          </div>
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
              placeholder="e.g., COVID‑19 booster date"
            />
          </div>
        </div>
      </section>

      {/* Pharmacy */}
      <section className="card">
        <h2>Preferred Pharmacy</h2>
        <div className="grid two">
          <div>
            <label className="label">Pharmacy name</label>
            <input
              className="input"
              value={pharmacy.name}
              onChange={(e) =>
                setPharmacy({ ...pharmacy, name: e.target.value })
              }
            />
          </div>
          <div>
            <label className="label">Pharmacy phone</label>
            <input
              className="input"
              value={pharmacy.phone}
              onChange={(e) =>
                setPharmacy({ ...pharmacy, phone: e.target.value })
              }
              placeholder="+1XXXXXXXXXX"
            />
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">Pharmacy address</label>
            <input
              className="input"
              value={pharmacy.address}
              onChange={(e) =>
                setPharmacy({ ...pharmacy, address: e.target.value })
              }
            />
          </div>
        </div>
      </section>

      {/* Preferences & Accessibility */}
      <section className="card">
        <h2>Preferences & Accessibility</h2>
        <div className="grid two">
          <div>
            <label className="label">Preferred contact</label>
            <select
              className="input"
              value={prefs.preferredContact}
              onChange={(e) =>
                setPrefs({
                  ...prefs,
                  preferredContact: e.target
                    .value as Preferences["preferredContact"],
                })
              }
            >
              <option value="phone">Phone</option>
              <option value="email">Email</option>
              <option value="sms">Text (SMS)</option>
              <option value="none">No preference</option>
            </select>
          </div>
          <div className="check">
            <input
              id="i1"
              type="checkbox"
              checked={prefs.interpreterNeeded}
              onChange={(e) =>
                setPrefs({ ...prefs, interpreterNeeded: e.target.checked })
              }
            />
            <label htmlFor="i1">Interpreter needed</label>
          </div>
          <div style={{ gridColumn: "1 / -1" }}>
            <label className="label">
              Accessibility needs (mobility, hearing, vision, other)
            </label>
            <textarea
              className="input"
              rows={3}
              value={prefs.accessibilityNotes}
              onChange={(e) =>
                setPrefs({ ...prefs, accessibilityNotes: e.target.value })
              }
            />
          </div>
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
        .forms-page { display:grid; gap: 32px; padding:32px; background-color: #f9fafb; }
        .hdr { display:flex; flex-wrap:wrap; align-items:center; justify-content:space-between; gap:16px; padding-bottom: 8px; border-bottom: 1px solid #e5e7eb; }
        h1 { margin:0; font-size:28px; font-weight:700; color:#1e293b; }
        h2 { margin:0 0 16px; font-size:22px; font-weight:700; color:#1f2937; }
        .muted { color:#64748b; }
        .row { display:flex; align-items:center; }
        .row.gap { gap:10px; }
        .card { background:#fff; border:1px solid #e5e7eb; border-radius:12px; padding:28px; box-shadow: 0 4px 12px rgba(0,0,0,0.06); overflow: visible; }
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
        .check { display:flex; align-items:flex-start; gap:8px; margin-bottom:8px; }
        .check input { margin-top:4px; }
        .chips { display:flex; flex-wrap:wrap; gap:8px; }
        .chip { display:inline-flex; align-items:center; gap:6px; padding:8px 10px; border:1px solid #e5e7eb; border-radius:999px; background:#fff; color:#1e293b; cursor:pointer; user-select:none; }
        .chip input { display:none; }
        .chip.active { background:#2563eb; color:#fff; border-color:#2563eb; }
      `}</style>
    </div>
  );
}
