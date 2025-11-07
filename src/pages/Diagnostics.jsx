import React, { useEffect, useMemo, useState, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Progress } from "@/components/ui/progress";
import ContentCard from "@/components/ContentCard";
import { CheckCircle2, XCircle, Loader2, AlertTriangle, RefreshCcw, ShieldCheck, Cloud, Camera, Mic, FileText, Sparkles, Database, CreditCard } from "lucide-react";

import { User } from "@/entities/User";
import { HealthLog } from "@/entities/HealthLog";
import { MoodLog } from "@/entities/MoodLog";
import { SleepLog } from "@/entities/SleepLog";
import { SavedItem } from "@/entities/SavedItem";

import { InvokeLLM, UploadPrivateFile, CreateFileSignedUrl } from "@/integrations/Core";
import { exportNutritionReport } from "@/functions/exportNutritionReport";

const initialChecks = [
  { key: "auth", label: "Authentication", icon: ShieldCheck },
  { key: "entities", label: "Entities Connectivity", icon: Database },
  { key: "integrations", label: "Storage Integrations", icon: Cloud },
  { key: "llm", label: "AI Engine (LLM)", icon: Sparkles },
  { key: "pdf", label: "PDF Generation", icon: FileText },
  { key: "camera", label: "Camera Support", icon: Camera },
  { key: "speech", label: "Speech Support", icon: Mic },
  { key: "razorpay", label: "Payments Script", icon: CreditCard },
];

export default function Diagnostics() {
  const [results, setResults] = useState(() =>
    initialChecks.reduce((acc, c) => {
      acc[c.key] = { status: "idle", detail: "" };
      return acc;
    }, {})
  );
  const [running, setRunning] = useState(false);
  const [progress, setProgress] = useState(0);

  const setStatus = useCallback((key, status, detail = "") => {
    setResults((prev) => ({ ...prev, [key]: { status, detail } }));
  }, []);

  const runAuth = useCallback(async () => {
    setStatus("auth", "running", "Checking user session...");
    try {
      const me = await User.me();
      setStatus("auth", "ok", `Authenticated as ${me.full_name || me.email}`);
    } catch {
      setStatus("auth", "error", "Not authenticated. Please log in.");
    }
  }, [setStatus]);

  const runEntities = useCallback(async () => {
    setStatus("entities", "running", "Querying entities...");
    try {
      await HealthLog.list("-updated_date", 1);
      await MoodLog.list("-updated_date", 1);
      await SleepLog.list("-updated_date", 1);
      await SavedItem.list("-updated_date", 1);
      setStatus("entities", "ok", "Entities reachable and queryable");
    } catch (e) {
      setStatus("entities", "error", "Failed to query entities");
    }
  }, [setStatus]);

  const runIntegrations = useCallback(async () => {
    setStatus("integrations", "running", "Uploading tiny private file...");
    try {
      const blob = new Blob([`healsy-diagnostics-${Date.now()}`], { type: "text/plain" });
      const file = new File([blob], "diagnostics.txt", { type: "text/plain" });
      const { file_uri } = await UploadPrivateFile({ file });
      if (!file_uri) throw new Error("No file_uri returned");
      const { signed_url } = await CreateFileSignedUrl({ file_uri, expires_in: 60 });
      if (!signed_url) throw new Error("No signed_url returned");
      setStatus("integrations", "ok", "Private upload + signed URL okay");
    } catch (e) {
      setStatus("integrations", "error", "Private storage test failed");
    }
  }, [setStatus]);

  const runLLM = useCallback(async () => {
    setStatus("llm", "running", "Pinging AI engine...");
    try {
      const res = await InvokeLLM({
        prompt: "Return a JSON object exactly as {\"ok\": true}",
        response_json_schema: {
          type: "object",
          required: ["ok"],
          properties: { ok: { type: "boolean" } },
        },
      });
      if (res && res.ok === true) {
        setStatus("llm", "ok", "LLM responded correctly");
      } else {
        throw new Error("Invalid response");
      }
    } catch (e) {
      setStatus("llm", "error", "LLM test failed");
    }
  }, [setStatus]);

  const runPDF = useCallback(async () => {
    setStatus("pdf", "running", "Generating sample PDF...");
    try {
      const sample = {
        total_calories: 450,
        health_score: 85,
        macronutrients: { protein: 25, carbs: 45, fat: 30 },
        micronutrients: {},
        ingredients_analysis: [],
        health_benefits: ["Sample"],
        dietary_recommendations: ["Sample"],
        meal_timing_advice: "Sample",
        portion_assessment: "Sample",
        allergen_warnings: [],
        nutritionist_notes: "Diagnostics test",
      };
      const { data } = await exportNutritionReport({ analysis: sample });
      if (data && data.byteLength > 1000) {
        setStatus("pdf", "ok", "PDF generation works");
      } else {
        throw new Error("PDF too small or empty");
      }
    } catch (e) {
      setStatus("pdf", "error", "PDF generation failed");
    }
  }, [setStatus]);

  const runCamera = useCallback(async () => {
    setStatus("camera", "running", "Checking camera API...");
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error("getUserMedia not available");
      }
      setStatus("camera", "ok", "Camera API available");
    } catch (e) {
      setStatus("camera", "warn", "Camera API not supported or denied");
    }
  }, [setStatus]);

  const runSpeech = useCallback(async () => {
    setStatus("speech", "running", "Checking speech API...");
    try {
      if (!navigator.mediaDevices || !window.MediaRecorder) {
        throw new Error("MediaRecorder not available");
      }
      setStatus("speech", "ok", "Speech recording API available");
    } catch (e) {
      setStatus("speech", "warn", "Speech API not supported");
    }
  }, [setStatus]);

  const runRazorpay = useCallback(async () => {
    setStatus("razorpay", "running", "Checking Razorpay script...");
    try {
      if (typeof window.Razorpay === "function") {
        setStatus("razorpay", "ok", "Razorpay SDK loaded");
      } else {
        throw new Error("Razorpay not loaded");
      }
    } catch (e) {
      setStatus("razorpay", "warn", "Razorpay SDK not loaded (safe if not using payments yet)");
    }
  }, [setStatus]);

  const tests = useMemo(() => ({
    auth: runAuth,
    entities: runEntities,
    integrations: runIntegrations,
    llm: runLLM,
    pdf: runPDF,
    camera: runCamera,
    speech: runSpeech,
    razorpay: runRazorpay,
  }), [runAuth, runEntities, runIntegrations, runLLM, runPDF, runCamera, runSpeech, runRazorpay]);

  const runAll = async () => {
    setRunning(true);
    setProgress(0);
    const step = 100 / initialChecks.length;
    for (let i = 0; i < initialChecks.length; i++) {
      const check = initialChecks[i];
      await tests[check.key]();
      setProgress((i + 1) * step);
    }
    setRunning(false);
  };

  useEffect(() => {
    runAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const okCount = Object.values(results).filter((r) => r.status === "ok").length;
  const warnCount = Object.values(results).filter((r) => r.status === "warn").length;
  const errorCount = Object.values(results).filter((r) => r.status === "error").length;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent mb-2">
          🔧 System Diagnostics
        </h1>
        <p className="text-slate-600 dark:text-slate-400">
          Comprehensive health check for all Healsy AI features
        </p>
      </div>

      {running && (
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <p className="text-sm text-slate-500 text-center">Running diagnostics... {Math.round(progress)}%</p>
        </div>
      )}

      {!running && (
        <Alert>
          <AlertDescription className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-green-500" />
                <span className="font-semibold text-green-700 dark:text-green-400">{okCount} OK</span>
              </div>
              {warnCount > 0 && (
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                  <span className="font-semibold text-amber-700 dark:text-amber-400">{warnCount} Warning</span>
                </div>
              )}
              {errorCount > 0 && (
                <div className="flex items-center gap-2">
                  <XCircle className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-700 dark:text-red-400">{errorCount} Error</span>
                </div>
              )}
            </div>
            <Button onClick={runAll} variant="outline" size="sm">
              <RefreshCcw className="w-4 h-4 mr-2" />
              Re-run All
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-4">
        {initialChecks.map((check) => {
          const res = results[check.key];
          const Icon = check.icon;
          return (
            <ContentCard key={check.key} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    res.status === "ok" ? "bg-green-100 dark:bg-green-900/30" :
                    res.status === "warn" ? "bg-amber-100 dark:bg-amber-900/30" :
                    res.status === "error" ? "bg-red-100 dark:bg-red-900/30" :
                    "bg-slate-100 dark:bg-slate-800"
                  }`}>
                    <Icon className={`w-5 h-5 ${
                      res.status === "ok" ? "text-green-600 dark:text-green-400" :
                      res.status === "warn" ? "text-amber-600 dark:text-amber-400" :
                      res.status === "error" ? "text-red-600 dark:text-red-400" :
                      "text-slate-400"
                    }`} />
                  </div>
                  <div>
                    <h3 className="font-semibold text-slate-800 dark:text-white">{check.label}</h3>
                    <p className="text-sm text-slate-500 dark:text-slate-400">{res.detail || "Waiting..."}</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {res.status === "running" && <Loader2 className="w-5 h-5 text-violet-500 animate-spin" />}
                  {res.status === "ok" && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                  {res.status === "warn" && <AlertTriangle className="w-5 h-5 text-amber-500" />}
                  {res.status === "error" && <XCircle className="w-5 h-5 text-red-500" />}
                  <Button variant="ghost" size="sm" onClick={() => tests[check.key]()} disabled={res.status === "running"}>
                    <RefreshCcw className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </ContentCard>
          );
        })}
      </div>
    </div>
  );
}