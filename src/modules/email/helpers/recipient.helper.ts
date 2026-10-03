const EMAIL_PATTERN = /[^\s<>"',;]+@[^\s<>"',;]+/g;
export const MAX_RECIPIENTS = 50;

export interface IRecipients {
  to: string[];
  cc?: string[];
  bcc?: string[];
}

/** Helper puro para to/cc/bcc: dedupe, tope de destinatarios y enmascarado para logs/ledger. */
export class RecipientHelper {
  /** Quita duplicados sin distinguir mayúsculas, conservando el orden de primera aparición. */
  static dedupe(recipients: readonly string[]): string[] {
    const seen = new Set<string>();
    return recipients.filter((recipient) => {
      const key = recipient.trim().toLowerCase();
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  /**
   * Normaliza to/cc/bcc: dedupe por lista y una dirección no se repite entre listas
   * (to gana sobre cc, cc sobre bcc) para no enviar el mismo correo dos veces.
   */
  static normalize(recipients: IRecipients): IRecipients {
    const to = RecipientHelper.dedupe(recipients.to);
    const taken = new Set(to.map((r) => r.toLowerCase()));
    const take = (list?: readonly string[]): string[] | undefined => {
      if (!list) return undefined;
      const result = RecipientHelper.dedupe(list).filter(
        (r) => !taken.has(r.toLowerCase()),
      );
      result.forEach((r) => taken.add(r.toLowerCase()));
      return result.length > 0 ? result : undefined;
    };
    const cc = take(recipients.cc);
    const bcc = take(recipients.bcc);
    return { to, ...(cc ? { cc } : {}), ...(bcc ? { bcc } : {}) };
  }

  static exceedsMax(recipients: IRecipients): boolean {
    return (
      recipients.to.length +
        (recipients.cc?.length ?? 0) +
        (recipients.bcc?.length ?? 0) >
      MAX_RECIPIENTS
    );
  }

  static maskEmail(email: string): string {
    const at = email.lastIndexOf('@');
    if (at < 0) return '***';
    return at === 0 ? `***${email}` : `${email[0]}***${email.slice(at)}`;
  }

  /** Enmascara todos los destinatarios en una sola cadena (para la columna `recipient` del ledger). */
  static maskAll(recipients: IRecipients): string {
    return [
      ...recipients.to,
      ...(recipients.cc ?? []),
      ...(recipients.bcc ?? []),
    ]
      .map((email) => RecipientHelper.maskEmail(email))
      .join(', ');
  }

  static maskEmailsInText(text: string): string {
    return text.replace(EMAIL_PATTERN, (match) =>
      RecipientHelper.maskEmail(match),
    );
  }
}
