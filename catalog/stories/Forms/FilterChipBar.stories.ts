import FilterChipBarDemo from "../../FilterChipBarDemo.astro";
import { expert } from "../../expert-frame";

export default { component: FilterChipBarDemo };
const decorators = [expert("FilterChipBar")];
export const TwoFilters = { args: { show: true }, decorators };
export const NoFilter = { args: { show: false }, decorators };
