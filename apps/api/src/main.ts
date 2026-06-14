import { join } from "node:path";
import { RequestMethod, ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.setGlobalPrefix("api", {
    exclude: [{ path: "sse/(.*)", method: RequestMethod.ALL }],
  });
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  // Production: serve built PWA from the same origin (plan §2).
  if (process.env.NODE_ENV === "production") {
    const publicDir = join(__dirname, "..", "public");
    app.useStaticAssets(publicDir);

    app.use((req, res, next) => {
      const url = req.originalUrl;
      if (
        req.method !== "GET" ||
        url.startsWith("/api") ||
        url.startsWith("/sse") ||
        url.includes(".")
      ) {
        next();
        return;
      }
      res.sendFile(join(publicDir, "index.html"));
    });
  }

  const port = process.env.API_PORT ?? 3000;
  await app.listen(port, "0.0.0.0");
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`);
}
bootstrap();
