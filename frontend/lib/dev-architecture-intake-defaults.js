/** Mirrors backend `intakeDefaults` — initial Dev tab form shape. */
export function defaultDevIntake() {
  return {
    buildBrief: "",
    team: {
      teamSize: "",
      teamStructure: "",
      engineeringExperienceLevel: "",
      frontendExpertise: "",
      backendExpertise: "",
      devopsExpertise: "",
      aiMlExpertise: "",
      hiringCapacity: "",
      deliverySpeedExpectations: "",
    },
    product: {
      productType: "",
      coreFeatures: [],
      userScaleExpectations: "",
      realtimeRequirements: "",
      aiFeatures: "",
      integrations: "",
      securityNeeds: "",
      complianceRequirements: "",
    },
    technical: {
      preferredTechStack: "",
      existingInfrastructure: "",
      databasePreferences: "",
      hostingPreferences: "",
      apiRequirements: "",
      platforms: "",
    },
    nfr: {
      scalability: "",
      performance: "",
      reliability: "",
      security: "",
      maintainability: "",
      availability: "",
      observability: "",
      extensibility: "",
    },
    featuresToBuild: "",
  };
}

function normalizeCoreFeatures(value) {
  if (Array.isArray(value)) {
    return value.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof value === "string" && value.trim()) {
    return value
      .split(/\n+/)
      .map((s) => s.trim())
      .filter(Boolean);
  }
  return [];
}

export function mergeIntakeFromServer(raw) {
  const base = defaultDevIntake();
  if (!raw || typeof raw !== "object") {
    return base;
  }
  const out = JSON.parse(JSON.stringify(base));
  for (const key of ["team", "product", "technical", "nfr"]) {
    if (raw[key] && typeof raw[key] === "object" && !Array.isArray(raw[key])) {
      out[key] = { ...out[key], ...raw[key] };
    }
  }
  if (out.product && typeof out.product === "object") {
    out.product = {
      ...out.product,
      coreFeatures: normalizeCoreFeatures(out.product.coreFeatures),
    };
  }
  if (typeof raw.featuresToBuild === "string") {
    out.featuresToBuild = raw.featuresToBuild;
  }
  if (typeof raw.buildBrief === "string") {
    out.buildBrief = raw.buildBrief;
  }
  return out;
}
