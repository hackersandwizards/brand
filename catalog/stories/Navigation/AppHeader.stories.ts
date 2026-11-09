import AppHeader from "../../../expert/components/AppHeader.astro";
import { expert } from "../../expert-frame";

export default { component: AppHeader };
export const Frame = { args: { product: "Trainer Hub" }, decorators: [expert("AppHeader")] };
