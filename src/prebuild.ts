import * as path from "node:path";
import * as fs from "node:fs";
import { generateCssText } from "@webstudio-is/react-sdk";
import { findTreeInstanceIds } from "@webstudio-is/project-build";
import * as baseComponentMetas from "@webstudio-is/sdk-components-react/metas";
import * as remixComponentMetas from "@webstudio-is/sdk-components-react-remix/metas";

import type { Data } from "@webstudio-is/react-sdk";
import type { Instance, Build, Page, Prop } from "@webstudio-is/project-build";
import type { Params } from "@webstudio-is/react-sdk";
import type { Asset } from "@webstudio-is/asset-uploader";
import { BUILD_DIR } from "./lib";

const baseDir = path.join(process.cwd(), `./${BUILD_DIR}/`);
const jsonDir = path.join(process.cwd(), `./${BUILD_DIR}/app`);

const siteDataString = fs.readFileSync(
    path.join(baseDir, "sitedata.json"),
    "utf-8"
);

const siteData: Data & { user?: { email: string | null } } =
    JSON.parse(siteDataString);

const { assets } = siteData;
const fontAssets: Data["assets"] = [];

for (const asset of assets) {
    if (asset.type === "font") {
        fontAssets.push(asset);
    }
}

type ComponentsByPage = {
    [path: string]: Set<string>;
};
type SiteDataByPage = {
    [path: string]: {
        page: Page;
        build: Pick<Build, "props" | "instances">;
        assets: Array<Asset>;
        params?: Params;
        pages: Array<Page>;
    };
};
type RemixRoutes = {
    routes: Array<{
        path: string;
        file: string;
    }>;
};
const remixRoutes: RemixRoutes = {
    routes: [],
};

const componentsByPage: ComponentsByPage = {};
const siteDataByPage: SiteDataByPage = {};

for (const page of Object.values(siteData.pages)) {
    const originPath = page.path;
    const path = originPath === "" ? "index" : originPath.replace("/", "");

    if (path !== "index") {
        remixRoutes.routes.push({
            path: originPath === "" ? "/" : originPath,
            file: `routes/${path}.tsx`,
        });
    }

    const instanceMap = new Map(siteData.build.instances);
    const pageInstanceSet = findTreeInstanceIds(instanceMap, page.rootInstanceId);
    const instances: [Instance["id"], Instance][] =
        siteData.build.instances.filter(([id]) => pageInstanceSet.has(id));

    const props: [Prop["id"], Prop][] = [];
    for (const [_propId, prop] of siteData.build.props) {
        if (pageInstanceSet.has(prop.instanceId)) {
            props.push([prop.id, prop]);
        }
    }
    siteDataByPage[path] = {
        build: {
            props,
            instances,
        },
        pages: siteData.pages,
        page,
        assets: siteData.assets,
    };

    componentsByPage[path] = new Set();
    for (const [_instanceId, instance] of instances) {
        if (instance.component) {
            componentsByPage[path].add(instance.component);
        }
    }
}
let cssText = generateCssText(
    {
        assets: siteData.assets,
        breakpoints: siteData.build?.breakpoints,
        styles: siteData.build?.styles,
        styleSourceSelections: siteData.build?.styleSourceSelections,
        componentMetas: new Map(
            Object.entries({ ...baseComponentMetas, ...remixComponentMetas })
        ),
    },
    {
        assetBaseUrl: "/cgi/asset/",
    }
);

cssText = `/* This file was generated by pnpm prebuild from /apps/edge-worker */\n${cssText}`;

const generatedDir = path.join(jsonDir, "__generated__");

fs.rmdirSync(generatedDir, { recursive: true });
fs.mkdirSync(generatedDir, { recursive: true });

const routesDir = path.join(jsonDir, "routes");

const templateContent = fs.readFileSync(
    path.join(baseDir, `template.tsx`),
    "utf8"
);

fs.rmdirSync(routesDir, { recursive: true });
fs.mkdirSync(routesDir, { recursive: true });

if (process.env.CI === undefined) {
    fs.writeFileSync(
        path.join(baseDir, `template.tsx`),
        templateContent,
        "utf8"
    );
}

for (const [pathName, pageComponents] of Object.entries(componentsByPage)) {
    let relativePath = "../__generated__";
    const statements = Array.from(pageComponents).join(", ");
    const pageExports = `// This file was generated by pnpm prebuild from /apps/edge-worker
  import type { PageData } from "~/routes/template";
  import type { Components } from "@webstudio-is/react-sdk";
  import { ${statements} } from "@webstudio-is/sdk-components-react";
  import * as remixComponents from "@webstudio-is/sdk-components-react-remix";
  export const components = new Map(Object.entries(Object.assign({ ${statements} }, remixComponents ))) as Components;
  export const fontAssets = ${JSON.stringify(fontAssets)};
  export const pageData: PageData = ${JSON.stringify(siteDataByPage[pathName])};
  export const user: { email: string | null } | undefined = ${JSON.stringify(
        siteData.user
    )};
  export const projectId = "${siteData.build.projectId}";
  `;

    /* Changing the pathName to index for the index page, so that remix will use the index.tsx file as index:true in the manifest file.
  
    It is generated by @remix-run/cloudflare somewhere here (https://github.com/remix-run/remix/blob/8851599c47f5d372fb537026a9ee0931a8753262/packages/remix-react/routes.tsx#L50). If there was no index.ts file, the manifest file containing all the routing was incorrect and nothing responded to root (/) requests. That is why the main file is renamed to index so Remix will use it as /.
  
    */
    pathName === "main" ? "index" : pathName;

    const fileLocationGeneratedDir = path.join(generatedDir, pathName);
    const fileLocationRoutesDir = path.join(routesDir, pathName);

    if (pathName !== "index") {
        // If the pathName is not index, we need to create the directory structure for the generated files, set the relative path to the generated directory
        if (!pathName.includes("/")) {
            fs.mkdirSync(fileLocationGeneratedDir, { recursive: true });
            fs.mkdirSync(fileLocationRoutesDir, { recursive: true });
            relativePath = path.relative(fileLocationRoutesDir, generatedDir);
        } else {
            const dirnameRoutesDir = path.dirname(fileLocationRoutesDir);
            relativePath = path.relative(dirnameRoutesDir, generatedDir);
        }
    }
    if (!pathName.includes("/") && pathName !== "index") {
        // As there could be pages with /blog and with /blog/post1, we need to create the index.tsx file for the /blog directory, and not blog.tsx in the parent directory
        fs.writeFileSync(
            path.join(fileLocationGeneratedDir, `index.ts`),
            pageExports,
            "utf8"
        );

        let routeIndexFile = templateContent;

        routeIndexFile = routeIndexFile.replace(
            "../__generated__/index",
            `${relativePath}/${pathName}/index`
        );
        routeIndexFile = routeIndexFile.replace(
            "../__generated__/index.css",
            `${relativePath}/index.css`
        );

        fs.writeFileSync(
            path.join(fileLocationRoutesDir, `index.tsx`),
            routeIndexFile,
            "utf8"
        );
    } else {
        fs.writeFileSync(
            path.join(generatedDir, `${pathName}.ts`),
            pageExports,
            "utf8"
        );

        let routeFile = templateContent;

        routeFile = routeFile.replace(
            "../__generated__/index",
            `${relativePath}/${pathName}`
        );
        routeFile = routeFile.replace(
            "../__generated__/index.css",
            `${relativePath}/index.css`
        );

        fs.writeFileSync(
            path.join(routesDir, `_${pathName}.tsx`),
            routeFile,
            "utf8"
        );
    }
}

// Remove template file in Github Actions (CI)
if (process.env.CI) {
    fs.rmSync(path.join(routesDir, `template.tsx`), { force: true });
}

fs.writeFileSync(path.join(generatedDir, "index.css"), cssText, "utf8");