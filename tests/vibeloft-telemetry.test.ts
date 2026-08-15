import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

test("the global layout loads the official VibeLoft telemetry script once", () => {
  const layout = readFileSync(
    new URL("../app/layout.tsx", import.meta.url),
    "utf8",
  );

  assert.equal(
    layout.match(/https:\/\/vibeloft\.ai\/telemetry\/v1\.js/g)?.length,
    1,
  );
  assert.equal(
    layout.match(/data-vl-product-id="82e25098-2d86-4381-9aff-839f8abad370"/g)
      ?.length,
    1,
  );
  assert.equal(
    layout.match(/data-vl-auth-key="vl_web\.[^"]+"/g)?.length,
    1,
  );
});
