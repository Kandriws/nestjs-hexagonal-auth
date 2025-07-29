import { EmailVo } from './email.vo';

export class MailerEmailVo {
  private constructor(
    private readonly email: EmailVo,
    private readonly name?: string,
  ) {}

  static of(email: string, name?: string): MailerEmailVo {
    return new MailerEmailVo(EmailVo.of(email), name?.trim());
  }

  getValue(): string {
    return this.name
      ? `"${this.escape(this.name)}" <${this.email.getValue()}>`
      : this.email.getValue();
  }

  private escape(str: string): string {
    return str.replace(/"/g, '\\"');
  }
}
