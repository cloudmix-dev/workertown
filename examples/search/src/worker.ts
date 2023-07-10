import { search } from "@workertown/search";

export default search({
  prefixes: {
    search: "/custom/search",
  },
  scanRange: 500,
});
