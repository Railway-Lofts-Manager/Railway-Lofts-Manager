import productStore from "./ProductStore.js";
import { getAdaptivePlannerSummaries } from "./AdaptivePlannerStore.js";
import { getDailyWorkload } from "./DailyWorkloadStore.js";
import { generateAdaptiveWeek } from "./AdaptiveFeedPlannerEngine.js";

const feedLine = (item) =>
  `${item.cups} full egg cup${item.cups === 1 ? "" : "s"} ${item.name}`;

export function getFeedPlannerCalendarTasks() {
  const products = productStore.getProducts();
  return Object.values(getAdaptivePlannerSummaries()).flatMap((settings) => {
    const usable = products.filter(
      (product) =>
        !product.archived &&
        product.inStock !== false &&
        [
          "Corn / Feed Mix",
          "Straight Grain",
          "Mineral / Grit",
          "Supplement",
          "Drink Additive",
        ].includes(product.category),
    );
    const excluded = new Set(settings.excludedProductIds || []),
      productIds = usable
        .filter((product) => !excluded.has(product.id))
        .map((product) => product.id),
      planId = `adaptive-${settings.teamId}`;
    const provisional = generateAdaptiveWeek(
        { ...settings, productIds },
        products,
        [],
      ),
      activities = provisional.days
        .map((day) => getDailyWorkload(planId, day.date))
        .filter(Boolean),
      plan = generateAdaptiveWeek(
        { ...settings, productIds },
        products,
        activities,
      );
    return plan.days.map((day) => ({
      id: `feed-${settings.teamId}-${day.date}`,
      date: day.date,
      source: "Feed Planner",
      category: "Feed & Drink",
      title: `Feed & Drink — ${settings.team}`,
      detail: `${plan.totalFeedCups} full egg cups • ${day.phase}`,
      session: "All day",
      status: "Pending",
      feedPlan: {
        teamId: settings.teamId,
        phase: day.phase,
        conditionNote: day.conditionNote,
        totalFeedCups: plan.totalFeedCups,
        feed: day.feed.map(feedLine),
        feedSupplements: day.feedSupplements,
        minerals: day.minerals,
        water: day.water,
      },
    }));
  });
}
