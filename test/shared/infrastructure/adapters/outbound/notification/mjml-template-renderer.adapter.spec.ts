jest.mock('mjml', () => {
  const mjmlMock = jest.fn((mjml: string) => ({
    html: `<html>${mjml}</html>`,
    errors: [],
  }));
  return { default: mjmlMock };
});

import { MjmlTemplateRendererAdapter } from 'src/shared/infrastructure/adapters/outbound/notification/mjml-template-renderer.adapter';

describe('MjmlTemplateRendererAdapter', () => {
  it('renders an existing template to html using mjml', async () => {
    const appCfg = { isDevelopment: true } as any;
    const adapter = new MjmlTemplateRendererAdapter(appCfg);

    const html = await adapter.render('reset-password', {
      resetLink: 'https://example.test/reset',
      expiresAt: new Date().toISOString(),
      name: 'Tester',
    });

    expect(typeof html).toBe('string');
    expect(html).toContain('<html>');
    expect(html).toContain('Reset your password');
  });

  it('throws if template does not exist', async () => {
    const appCfg = { isDevelopment: true } as any;
    const adapter = new MjmlTemplateRendererAdapter(appCfg);

    await expect(
      adapter.render('non-existent-template', {} as any),
    ).rejects.toThrow(/Template not found/i);
  });
});
