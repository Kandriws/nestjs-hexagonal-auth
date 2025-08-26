import { Injectable, Logger, Inject } from '@nestjs/common';
import { EmailTemplateRendererPort } from 'src/shared/domain/ports/outbound/notification/email-template-renderer.port';
import appConfig from 'src/shared/infrastructure/config/app.config';
import * as fs from 'fs';
import * as path from 'path';
import * as Handlebars from 'handlebars';

@Injectable()
export class MjmlTemplateRendererAdapter implements EmailTemplateRendererPort {
  private templatesDir: string;
  private partialsDir: string;
  private readonly logger = new Logger(MjmlTemplateRendererAdapter.name);

  // simple in-memory cache for compiled templates
  private compiledTemplates = new Map<string, HandlebarsTemplate>();
  // mjml render function cache (resolved dynamically to avoid interop issues)
  private mjmlRenderFn?: (
    mjml: string,
    opts?: Record<string, any>,
  ) => { html: string; errors?: any[] };
  private partialsRegistered = false;

  constructor(
    @Inject(appConfig.KEY)
    private readonly appCfg: ReturnType<typeof appConfig>,
  ) {
    this.templatesDir = this.resolveTemplatesDir();
    this.partialsDir = path.join(this.templatesDir, 'partials');
    this.registerPartials();
  }

  private registerPartials() {
    if (this.partialsRegistered) return;

    try {
      // register root-level layout partials like base.mjml
      const basePath = path.join(this.templatesDir, 'base.mjml');
      if (fs.existsSync(basePath)) {
        const baseContent = fs.readFileSync(basePath, 'utf8');
        Handlebars.registerPartial('base', baseContent);
      }

      if (!fs.existsSync(this.partialsDir)) {
        this.partialsRegistered = true;
        return;
      }

      const files = fs.readdirSync(this.partialsDir);
      for (const file of files) {
        const full = path.join(this.partialsDir, file);
        const stat = fs.statSync(full);
        if (!stat.isFile()) continue;

        const ext = path.extname(full);
        const name = path.basename(full, ext);
        const content = fs.readFileSync(full, 'utf8');

        // register as partial. partial files may contain mjml markup
        Handlebars.registerPartial(name, content);
      }

      this.partialsRegistered = true;
    } catch (err) {
      this.logger.warn(`Failed registering partials: ${String(err)}`);
    }
  }

  /**
   * Resolve templates directory in both dev (src) and built (dist) environments.
   */
  private resolveTemplatesDir(): string {
    // Prefer deterministic choice based on app config environment flag.
    try {
      if (this.appCfg && this.appCfg.isDevelopment) {
        const devPath = path.resolve(
          process.cwd(),
          'src/shared/infrastructure/email-templates',
        );
        if (fs.existsSync(devPath)) return devPath;
      } else {
        const prodPath = path.resolve(
          process.cwd(),
          'dist/shared/infrastructure/email-templates',
        );
        if (fs.existsSync(prodPath)) return prodPath;
      }
    } catch {
      // ignore
    }

    // Fallback to a relative path based on __dirname if the preferred paths do not exist.
    const fallback = path.resolve(__dirname, '../../email-templates');
    return fallback;
  }

  async render<TContext extends Record<string, any>>(
    templateName: string,
    context: TContext,
  ): Promise<string> {
    // lazy-load mjml renderer to avoid build-time interop issues
    if (!this.mjmlRenderFn) {
      const mjmlModule = (await import('mjml')) as any;
      this.mjmlRenderFn = mjmlModule.default ?? mjmlModule;
    }
    // load and compile template (mjml + handlebars)
    const tpl = await this.getCompiledTemplate(templateName);

    const mjmlResult = tpl(context);

    // convert mjml to html
    try {
      const { html, errors } = this.mjmlRenderFn!(mjmlResult, {
        validationLevel: 'strict',
      });
      if (errors && errors.length) {
        // log mjml warnings/errors but still return html when available
        this.logger.warn(
          `MJML render errors for template ${templateName}: ${JSON.stringify(
            errors,
          )}`,
        );
      }
      return html;
    } catch (err) {
      this.logger.error(
        `Failed to render MJML for template ${templateName}: ${String(err)}`,
      );
      throw err;
    }
  }

  private async getCompiledTemplate(templateName: string) {
    if (this.compiledTemplates.has(templateName)) {
      return this.compiledTemplates.get(templateName) as HandlebarsTemplate;
    }

    const filePath = path.join(this.templatesDir, `${templateName}.mjml`);
    if (!fs.existsSync(filePath)) {
      throw new Error(`Template not found: ${templateName} (${filePath})`);
    }

    const raw = fs.readFileSync(filePath, 'utf8');

    // compile with Handlebars
    const compiled = Handlebars.compile(raw, { noEscape: true });
    this.compiledTemplates.set(templateName, compiled as HandlebarsTemplate);
    return compiled as HandlebarsTemplate;
  }
}

// Minimal type alias because @types/handlebars may not export TemplateDelegate nicely
type HandlebarsTemplate = (context?: any) => string;
