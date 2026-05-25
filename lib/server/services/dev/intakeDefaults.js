/** Default Dev tab intake (team / product / technical / NFR / features). */
function defaultIntake() {
  return {
    /** Primary free-text: what the team wants to build next (drives the doc). */
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

/** Coerce legacy string or messy JSON into a clean string[]. */
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

function deepMergeIntake(base, patch) {
  const out = JSON.parse(JSON.stringify(base));
  if (!patch || typeof patch !== "object") {
    return out;
  }
  for (const key of ["team", "product", "technical", "nfr"]) {
    if (patch[key] && typeof patch[key] === "object" && !Array.isArray(patch[key])) {
      out[key] = { ...out[key], ...patch[key] };
    }
  }
  if (typeof patch.featuresToBuild === "string") {
    out.featuresToBuild = patch.featuresToBuild;
  }
  if (typeof patch.buildBrief === "string") {
    out.buildBrief = patch.buildBrief;
  }
  if (out.product && typeof out.product === "object") {
    out.product = {
      ...out.product,
      coreFeatures: normalizeCoreFeatures(out.product.coreFeatures),
    };
  }
  return out;
}

function normalizeIntake(raw) {
  const merged = deepMergeIntake(defaultIntake(), raw && typeof raw === "object" ? raw : {});
  return merged;
}

export {
  defaultIntake,
  deepMergeIntake,
  normalizeIntake,
  normalizeCoreFeatures,
};
