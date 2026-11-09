import FilterChip from "../../../expert/components/FilterChip.astro";
import { expert } from "../../expert-frame";

export default { component: FilterChip };
export const Applied = {
  args: { label: "Topic: evaluation", removeHref: "#" },
  decorators: [expert("FilterChip")],
};
