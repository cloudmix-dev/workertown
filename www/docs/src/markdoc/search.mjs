import Markdoc from "@markdoc/markdoc";
import { slugifyWithCounter } from "@sindresorhus/slugify";
import glob from "fast-glob";
import * as fs from "fs";
import * as path from "path";
import { createLoader } from "simple-functional-loader";
import * as url from "url";

const __filename = url.fileURLToPath(import.meta.url);
const slugify = slugifyWithCounter();

function nodeToString(node) {
  let str =
    node.type === "text" && typeof node.attributes?.content === "string"
      ? node.attributes.content
      : "";
  if ("children" in node) {
    for (const child of node.children) {
      str += nodeToString(child);
    }
  }
  return str;
}

function extractSections(node, sections, isRoot = true) {
  if (isRoot) {
    slugify.reset();
  }
  if (node.type === "heading" || node.type === "paragraph") {
    const content = nodeToString(node).trim();
    if (node.type === "heading" && node.attributes.level <= 2) {
      const hash = node.attributes?.id ?? slugify(content);
      sections.push([content, hash, []]);
    } else {
      sections.at(-1)[2].push(content);
    }
  } else if ("children" in node) {
    for (const child of node.children) {
      extractSections(child, sections, false);
    }
  }
}

export default function (nextConfig = {}) {
  const cache = new Map();

  return Object.assign({}, nextConfig, {
    webpack(config, options) {
      config.module.rules.push({
        test: __filename,
        use: [
          createLoader(function () {
            const pagesDir = path.resolve("./src/pages");
            this.addContextDependency(pagesDir);

            const files = glob.sync("**/*.md", { cwd: pagesDir });
            const data = files.map((file) => {
              const url =
                file === "index.md" ? "/" : `/${file.replace(/\.md$/, "")}`;
              const md = fs.readFileSync(path.join(pagesDir, file), "utf8");

              let sections;

              if (cache.get(file)?.[0] === md) {
                sections = cache.get(file)[1];
              } else {
                const ast = Markdoc.parse(md);
                const title =
                  ast.attributes?.frontmatter?.match(
                    /^title:\s*(.*?)\s*$/m,
                  )?.[1];
                sections = [[title, null, []]];
                extractSections(ast, sections);
                cache.set(file, [md, sections]);
              }

              return { url, sections };
            });

            // When this file is imported within the application
            // the following module is loaded:
            return `
              import FlexSearch from 'flexsearch'

              let sectionIndex = new FlexSearch.Document({
                tokenize: 'full',
                document: {
                  id: 'url',
                  index: 'content',
                  store: ['title', 'pageTitle'],
                },
                context: {
                  resolution: 9,
                  depth: 2,
                  bidirectional: true
                }
              })

              let data = ${JSON.stringify(data)}

              for (let { url, sections } of data) {
                for (let [title, hash, content] of sections) {
                  sectionIndex.add({
                    url: url + (hash ? ('#' + hash) : ''),
                    title,
                    content: [title, ...content].join('\\n'),
                    pageTitle: hash ? sections[0][0] : undefined,
                  })
                }
              }

              export function search(query, options = {}) {
                let result = sectionIndex.search(query, {
                  ...options,
                  enrich: true,
                })
                if (result.length === 0) {
                  return []
                }
                return result[0].result.map((item) => ({
                  url: item.id,
                  title: item.doc.title,
                  pageTitle: item.doc.pageTitle,
                }))
              }
            `;
          }),
        ],
      });

      if (typeof nextConfig.webpack === "function") {
        return nextConfig.webpack(config, options);
      }

      return config;
    },
  });
}
