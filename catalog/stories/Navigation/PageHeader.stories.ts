import PageHeaderDemo from "../../PageHeaderDemo.astro";
import { expert } from "../../expert-frame";

export default { component: PageHeaderDemo };
const decorators = [expert("PageHeader")];
export const TitleOnly = { args: { title: "Search" }, decorators };
export const SubtitleText = {
  args: { title: "Knowledge base", subtitleText: "6 hubs · 41 pages" },
  decorators,
};
export const SubtitleSlot = { args: { title: "Units", subtitleSlot: true }, decorators };
export const WithAction = {
  args: { title: "Knowledge base", subtitleText: "6 hubs · 41 pages", action: true },
  decorators,
};
