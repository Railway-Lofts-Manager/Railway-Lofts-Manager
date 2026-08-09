const STORAGE_KEY = "loftCommanderHealthcare";

const emptyState = { campaigns: [] };

function loadState() {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    const state = saved ? JSON.parse(saved) : emptyState;
    return { campaigns: Array.isArray(state.campaigns) ? state.campaigns : [] };
  } catch {
    return { ...emptyState };
  }
}

function saveState(state) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function createId() {
  return globalThis.crypto?.randomUUID?.() ||
    `healthcare-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

const healthcareStore = {
  getState() { return loadState(); },

  saveCampaign(campaign) {
    const state = loadState();
    const saved = { ...campaign, id: createId(), createdAt: new Date().toISOString() };
    state.campaigns.push(saved);
    saveState(state);
    return saved;
  },

  getBirdRecords(bird) {
    return loadState().campaigns.flatMap((campaign) => {
      const treated = campaign.treatedBirds.find((record) => record.birdId === bird?.birdId);
      const excluded = campaign.excludedBirds.find((record) => record.birdId === bird?.birdId);
      if (!treated && !excluded) return [];
      return [{
        id: `${campaign.id}-${bird.birdId}`,
        campaignId: campaign.id,
        date: campaign.date,
        category: campaign.category,
        medication: campaign.medication,
        administrationMethod: campaign.administrationMethod,
        dose: [campaign.doseAmount, campaign.doseUnit].filter(Boolean).join(" "),
        mixedWithAmount: campaign.mixedWithAmount,
        mixedWithUnit: campaign.mixedWithUnit,
        observation: treated ? campaign.notes : `Missed or excluded: ${excluded.reason}`,
        followUpDate: campaign.followUpDate,
        completionStatus: treated ? "Treated" : excluded.status || "Outstanding",
        catchUpDate: excluded.catchUpDate || "",
      }];
    });
  },

  getOutstanding() {
    return loadState().campaigns.flatMap((campaign) =>
      campaign.excludedBirds
        .filter((bird) => (bird.status || "Outstanding") === "Outstanding")
        .map((bird) => ({ ...bird, campaignId: campaign.id, campaignDate: campaign.date, medication: campaign.medication, targetName: campaign.targetName })),
    );
  },

  getPlannerTasks() {
    return loadState().campaigns.flatMap((campaign) =>
      (campaign.administrations || [{ id: `${campaign.id}-single`, date: campaign.date, status: "Pending" }]).map((administration) => ({
        ...administration,
        campaignId: campaign.id,
        source: "Healthcare",
        category: campaign.category,
        title: `${campaign.medication} — ${campaign.targetName}`,
        detail: `${campaign.administrationMethod}${campaign.doseAmount ? ` • ${campaign.doseAmount} ${campaign.doseUnit}` : ""}`,
        session: campaign.session || "Any time",
      })),
    );
  },

  updateAdministration(campaignId, administrationId, updates) {
    const state = loadState();
    const campaign = state.campaigns.find((record) => record.id === campaignId);
    const administration = campaign?.administrations?.find((record) => record.id === administrationId);
    if (!administration) return false;
    Object.assign(administration, updates);
    saveState(state);
    return true;
  },

  completeCatchUp(campaignId, birdId, date) {
    const state = loadState();
    const campaign = state.campaigns.find((record) => record.id === campaignId);
    const bird = campaign?.excludedBirds.find((record) => record.birdId === birdId);
    if (!bird) return false;
    bird.status = "Completed";
    bird.catchUpDate = date;
    saveState(state);
    return true;
  },

  exemptBird(campaignId, birdId) {
    const state = loadState();
    const campaign = state.campaigns.find((record) => record.id === campaignId);
    const bird = campaign?.excludedBirds.find((record) => record.birdId === birdId);
    if (!bird) return false;
    bird.status = "Exempt";
    saveState(state);
    return true;
  },

  getMedicationList() {
    return Array.from(new Set(loadState().campaigns.map((record) => record.medication).filter(Boolean))).sort((a, b) => a.localeCompare(b));
  },

  clear() { localStorage.removeItem(STORAGE_KEY); },
};

export default healthcareStore;
