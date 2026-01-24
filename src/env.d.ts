/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

declare module "*.yaml" {
  const content: Record<string, any>;
  export default content;
}
