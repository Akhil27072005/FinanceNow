/**
 * Enrich portfolio activities with running invested totals (chronological).
 */
export const enrichActivitiesWithRunningTotal = (activities = []) => {
  const sorted = [...activities].sort((a, b) => {
    const dateA = new Date(a.date).getTime();
    const dateB = new Date(b.date).getTime();
    if (dateA !== dateB) return dateA - dateB;
    return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
  });

  let running = 0;
  const enriched = sorted.map((activity) => {
    const amount = Number(activity.amount) || 0;
    if (activity.type === 'set_position') {
      running = amount;
    } else if (activity.type === 'add_contribution') {
      running += amount;
    }
    return { ...activity, runningTotal: running };
  });

  const byId = Object.fromEntries(enriched.map((a) => [a.id, a]));
  return activities.map((a) => byId[a.id] || a);
};

export const summarizeHoldingActivities = (activities = [], totalInvested = 0) => {
  const contributions = activities.filter((a) => a.type === 'add_contribution');
  const sets = activities.filter((a) => a.type === 'set_position');
  const contributionTotal = contributions.reduce(
    (sum, a) => sum + (Number(a.amount) || 0),
    0
  );

  const latest = activities.length
    ? [...activities].sort(
        (a, b) =>
          new Date(b.date).getTime() - new Date(a.date).getTime() ||
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0]
    : null;

  return {
    contributionCount: contributions.length,
    contributionTotal,
    setCount: sets.length,
    activityCount: activities.length,
    totalInvested: Number(totalInvested) || 0,
    latestDate: latest?.date || null,
    latestType: latest?.type || null
  };
};

export const activityTypeLabel = (type) => {
  if (type === 'add_contribution') return 'Amount added';
  if (type === 'set_position') return 'Total set';
  return type;
};
