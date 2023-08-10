import { nodes as defaultNodes } from "@markdoc/markdoc";

import { Fence } from "../components/prose/fence";
import { Table } from "../components/prose/table";

const nodes = {
  document: {
    render: undefined,
  },
  table: {
    ...defaultNodes.table,
    render: Table,
  },
  th: {
    ...defaultNodes.th,
    attributes: {
      ...defaultNodes.th.attributes,
      scope: {
        type: String,
        default: "col",
      },
    },
  },
  td: {
    ...defaultNodes.td,
    attributes: {
      ...defaultNodes.td.attributes,
      class: {
        type: String,
        default: "whitespace-nowrap",
      },
    },
  },
  fence: {
    render: Fence,
    attributes: {
      language: {
        type: String,
      },
    },
  },
};

export default nodes;
