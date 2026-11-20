import base from "@hackersandwizards/scaffolding/eslint/astro";

export default [...base, { ignores: ["tokens/**", "logos/**", "generated/**"] }];
