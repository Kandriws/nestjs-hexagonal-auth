export const EmailTemplateRendererPort = Symbol('EmailTemplateRendererPort');

export interface EmailTemplateRendererPort {
  /**
   * Render an email template to HTML.
   * @param templateName file name without extension under email-templates folder (e.g., 'reset-password')
   * @param context key-value pairs used by the template engine
   */
  render<TContext extends Record<string, any>>(
    templateName: string,
    context: TContext,
  ): Promise<string>;
}
