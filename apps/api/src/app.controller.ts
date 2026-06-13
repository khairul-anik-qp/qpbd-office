import { Controller, Get } from "@nestjs/common";
import { type Health, SHARED_VERSION } from "@office/shared";

@Controller()
export class AppController {
  // Proves the @office/shared workspace import resolves at runtime.
  @Get("health")
  health(): Health & { shared: string } {
    return { ok: true, service: "api", shared: SHARED_VERSION };
  }
}
