export interface OpenApiSpec {
  openapi: "3.0.0";
  info: {
    version: string;
    title: string;
    license: {
      name: string;
    };
  };
  servers: {
    url: string;
  }[];
  paths: Record<string, Record<string, object>>;
  components: Record<string, Record<string, object>>;
}

export interface GenerateOpenApiSpecOptions {
  basePath?: string;
  urls?: string[];
  endpoints?: Record<string, string | false>;
}

export function generateOpenApiSpec(
  base: OpenApiSpec,
  options: GenerateOpenApiSpecOptions = {},
) {
  const { basePath = "/", urls = [], endpoints = {} } = options;
  const spec = structuredClone(base);

  spec.servers = urls.map((url) => ({ url }));

  for (const [path, replacement] of Object.entries(endpoints)) {
    if (replacement === false) {
      for (const specPath of Object.keys(spec.paths)) {
        if (specPath.startsWith(path)) {
          delete spec.paths[specPath];
        }
      }
    } else {
      const fullReplacement = `${
        basePath === "/" ? "" : basePath
      }${replacement}`;

      for (const specPath of Object.keys(spec.paths)) {
        if (specPath.startsWith(path)) {
          const newPath = specPath.replace(path, fullReplacement);

          spec.paths[newPath] = spec.paths[specPath] as Record<string, object>;

          delete spec.paths[specPath];
        }
      }
    }
  }

  return spec;
}
