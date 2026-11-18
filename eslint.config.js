import base from "@hackersandwizards/scaffolding/eslint";

export default [...base, { ignores: ["tokens/**", "logos/**", "generated/**"] }];
