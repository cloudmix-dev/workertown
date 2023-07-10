import { featureFlags } from "@workertown/feature-flags";
import { search } from "@workertown/search";
import { combine, serve } from "@workertown/utils";

const api = combine(
  featureFlags({ basePath: "/flags" }),
  search({ basePath: "/search" })
);

serve(api, { port: 3000 });

console.log("Server running at http://localhost:3000/");
