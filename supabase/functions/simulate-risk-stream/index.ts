import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const riskTemplates = [
  { event_key: "r1", name: "Eastlands Flood Event", region: "Nairobi - Eastlands", sector: "Flood", baseProbability: 78, baseSeverity: 92, exposure: 840000, cascade_potential: 85, status: "critical", drivers: ["Rainfall anomaly +32%", "Drainage capacity declining"], failure_pathway: "Flooding risk rising due to rainfall and blocked drainage.", interventions: ["Inspect drainage nodes", "Activate flood cache"], impact_window: "12-36 hours" },
  { event_key: "r2", name: "Grid Cascade Failure", region: "Central Grid Zone", sector: "Energy", baseProbability: 63, baseSeverity: 78, exposure: 1200000, cascade_potential: 72, status: "high", drivers: ["Transformer load at 94%", "Reserve margin below 6%"], failure_pathway: "Grid overload from sustained demand.", interventions: ["Activate load shedding", "Deploy mobile generators"], impact_window: "6-18 hours" },
  { event_key: "r3", name: "Vaccine Cold Chain Break", region: "Kibera - Lang'ata", sector: "Health", baseProbability: 41, baseSeverity: 65, exposure: 320000, cascade_potential: 58, status: "medium", drivers: ["Refrigeration units aging", "Power instability"], failure_pathway: "Cold chain failure risk from aging equipment.", interventions: ["Deploy backup solar refrigeration"], impact_window: "3-7 days" },
  { event_key: "r5", name: "Road Network Collapse", region: "Mombasa Highway", sector: "Logistics", baseProbability: 52, baseSeverity: 70, exposure: 950000, cascade_potential: 78, status: "high", drivers: ["Surface degradation 0.82", "Bridge stress critical"], failure_pathway: "Road integrity deteriorating with rainfall.", interventions: ["Restrict heavy vehicles", "Deploy repair crews"], impact_window: "1-5 days" },
];

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Pick a random risk template and add noise
    const template = riskTemplates[Math.floor(Math.random() * riskTemplates.length)];
    const jitter = (base: number, range: number) =>
      Math.max(0, Math.min(100, base + (Math.random() - 0.5) * range));

    const event = {
      event_key: template.event_key,
      name: template.name,
      region: template.region,
      sector: template.sector,
      probability: jitter(template.baseProbability, 15),
      severity: jitter(template.baseSeverity, 10),
      exposure: template.exposure,
      velocity: Math.random() > 0.6 ? "rising" : Math.random() > 0.3 ? "stable" : "falling",
      confidence: Math.random() > 0.5 ? "high" : "medium",
      cascade_potential: jitter(template.cascade_potential, 12),
      status: template.status,
      drivers: template.drivers,
      failure_pathway: template.failure_pathway,
      interventions: template.interventions,
      impact_window: template.impact_window,
    };

    const { data, error } = await supabase
      .from("live_risk_events")
      .insert(event)
      .select()
      .single();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, event: data }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
