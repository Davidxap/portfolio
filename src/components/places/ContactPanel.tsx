import { Paperclip, Send } from "lucide-react";
import type { Locale } from "@/data/projects";
import { person } from "@/data/site";
import { cvPath, useT } from "@/i18n/ui";
import { useW } from "@/i18n/world";
import { GitHubIcon, LinkedInIcon } from "../BrandIcons";
import { CopyButton } from "../CopyButton";
import { ArtIcon } from "../world/icons";
import { PlaceNav } from "../world/PlaceNav";

/** Contact as a mail client: a folder column with the other ways to reach me, and a new message already addressed to David. "Let's have
 * a coffee" is the subject and the Send button (the one big ember CTA); the CV is the attachment. Every control is a real link. */
export function ContactPanel({ locale, embedded }: { locale: Locale; embedded?: boolean }) {
  const t = useT(locale);
  const w = useW(locale);
  return (
    <article className="panel mail-app" aria-labelledby="contact-title">
      <div className="mail">
        <aside className="mail-side" aria-label={w("contact.channels")}>
          <p className="mail-folder on mono"><ArtIcon name="contact" size={18} />{w("mail.compose")}</p>
          <p className="mail-h mono">{w("contact.channels")}</p>
          <ul>
            <li><a className="mail-link" href={person.github} target="_blank" rel="me noopener noreferrer"><GitHubIcon className="ic" />GitHub</a></li>
            <li><a className="mail-link" href={person.linkedin} target="_blank" rel="me noopener noreferrer"><LinkedInIcon className="ic" />LinkedIn</a></li>
            <li><a className="mail-link" href={cvPath(locale)} download><ArtIcon name="cv" size={20} />{t("cv.download")}</a></li>
          </ul>
        </aside>
        <section className="mail-compose" aria-label={w("mail.compose")}>
          <dl className="mail-fields mono">
            <div><dt>{w("mail.from")}</dt><dd>{w("mail.you")}</dd></div>
            <div><dt>{w("mail.to")}</dt><dd><span className="mail-chip">David Arroyave &lt;{person.email}&gt;</span></dd></div>
            <div><dt>{w("mail.subject")}</dt><dd className="mail-subject">{w("contact.coffee")}</dd></div>
          </dl>
          <div className="mail-body">
            <h1 id="contact-title">{w("head.contact")}</h1>
            <p className="lead">{w("head.contact.lead")}</p>
            <p className="block-note">{w("contact.reply")}</p>
            <p className="mail-chipline"><span className="mail-attach"><Paperclip size={14} aria-hidden="true" /><a href={cvPath(locale)} download>{w("mail.attach")}</a></span></p>
          </div>
          <div className="mail-actions">
            <a className="btn cta big" href={`mailto:${person.email}`}><Send size={20} aria-hidden="true" />{w("mail.send")}</a>
            <CopyButton value={person.email} label={t("save.copy")} done={t("save.copied")} />
            <span className="coffee-mail mono">{person.email}</span>
          </div>
        </section>
      </div>
      {!embedded && <PlaceNav locale={locale} place="contact" />}
    </article>
  );
}
