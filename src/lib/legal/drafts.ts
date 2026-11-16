import type { BilingualText } from '@/lib/schemas/common';

/*
 * DRAFT legal texts (Phase 1.2, owner decision 2026-11-16). They describe what this website
 * really does today. They are NOT legal advice: the owner must review them (ideally with a
 * lawyer), fill in every [TODO], and add the Swahili versions before launch.
 *
 * Used when `settings/legal` has not been saved yet, and by `pnpm seed`. After the owner saves
 * in Admin → Legal pages, the stored text is shown instead.
 */

export const LEGAL_DRAFT_DATE = '2026-11-16';

const draftNotice =
  '> **DRAFT – review before launch.** This text has not yet been checked by a lawyer.';

const privacyEn = `${draftNotice}

This Privacy Policy explains what personal data Wizzy Inc ("we", "us") collects through this website, why, and what your rights are under the Tanzania **Personal Data Protection Act, 2022**.

## Who we are
Wizzy Inc is run by Panta-wizzy in Dodoma, Tanzania, and offers graphic design and web development services. You can reach us using the details on our [Contact page](/en/contact). [TODO: registered business name and address, if any.]

## What we collect
**When you request a quote:** your name, phone number, email address (optional), how you prefer to be contacted, the service or package you are interested in, your project description, budget range, deadline, up to 3 files you choose to upload (PDF, Word or images), and the language you used.

**When you send a message:** your name, phone number, email address (optional), how you prefer to be contacted and your message.

**When you subscribe to updates ("Stay updated"):** your email address, the language you used, where on the site you signed up and the date. We send you a welcome email and occasional news. Every email has an unsubscribe link; unsubscribing deletes your address from our list.

**Automatically, to protect the forms:** a one-way, salted code made from your IP address (we never store the IP address itself), used only to limit how many forms can be sent per hour. It is deleted automatically after about one hour. A security check from Google (reCAPTCHA through Firebase App Check) also runs on the forms to stop spam.

We do **not** use advertising or tracking cookies, and we do not sell your data.

## Why we use it
- To reply to your enquiry and prepare a quote (steps you asked for before a possible contract).
- To keep a record of our conversations and the work we agreed on.
- To send you updates, only if you subscribed (your consent, which you can withdraw at any time).
- To keep the website safe from spam and abuse (our legitimate interest).

## Who else handles your data
- **Google Firebase** (database, file storage and hosting) stores your enquiry and files. [TODO: confirm the data location chosen in Firebase, e.g. europe-west1 (Belgium).]
- **Resend** sends us an email notification when you submit a form (it contains your enquiry details), and sends the welcome email to subscribers.
- **OpenStreetMap**: the office map is loaded from openstreetmap.org, which receives your IP address like any website you visit. It does not set tracking cookies.
- **WhatsApp** (Meta): only if you choose to contact us there.

Some of these services store data outside Tanzania. We use providers that protect data with recognised safeguards, as the Act requires for transfers abroad.

## How long we keep it
Enquiries that do not become a project are deleted after [TODO: e.g. 12 months]. Records of projects we carried out are kept for [TODO: e.g. 5 years] for accounting and legal reasons.

## Your rights
You can ask us to: see the data we hold about you, correct it, delete it, or stop using it. Contact us using the details on the Contact page; we will reply within [TODO: e.g. 30 days]. If you are not satisfied, you can complain to the **Personal Data Protection Commission (PDPC)** of Tanzania.

## Children
This website is meant for businesses and adults. Please do not send us personal data about children.

## Changes
We may update this policy. The date at the top shows the latest version.
`;

const termsEn = `${draftNotice}

These Terms & Conditions apply to the use of this website and to the design and web development services of Wizzy Inc ("we", "us"). By using the website or accepting a quote, you agree to them.

## Quotes
- A quote request through this website is not a contract. Prices on the website are starting prices.
- A project starts only after we have agreed on scope, price and timeline in writing (for example by email or WhatsApp) and [TODO: deposit rule, e.g. "the deposit has been paid"].
- Quotes are valid for [TODO: e.g. 30 days].

## Payment
[TODO: payment terms, e.g. "50% deposit before work starts, 50% before final files or launch". Accepted methods: e.g. M-Pesa, Tigo Pesa, bank transfer.] Prices are in Tanzanian shillings (TZS) unless agreed otherwise.

## Revisions and timelines
- The number of revision rounds is stated in the package or quote. Extra changes may be charged.
- Timelines start when we have received the deposit and everything we need from you (text, photos, logins). Delays in feedback move the delivery date.

## Your content
You confirm that you have the right to use any text, images, logos or other material you send us, and that it does not break anyone else's rights or the law.

## Ownership of the work
- After full payment, you own the final designs and website content we made for you. [TODO: confirm, and whether source files (e.g. .ai, .psd, Figma) are included.]
- Fonts, stock images, plugins and other third-party items stay under their own licences.
- We may show the finished work in our portfolio, unless you ask us not to in writing.

## Websites, hosting and domains
Hosting, domain names and paid services are in your name unless agreed otherwise. [TODO: maintenance/support terms after launch.]

## Cancellation
[TODO: what happens to the deposit and finished work if the project is cancelled.]

## Liability
We do our work with care, but we are not responsible for indirect losses (such as lost profit), or for problems caused by third-party services (hosting, payment, email providers). Our total liability for a project is limited to the amount you paid for that project, as far as the law allows.

## Using this website
Do not misuse the website, for example by sending spam, harmful files or false information.

## Law
These terms are governed by the laws of the United Republic of Tanzania. [TODO: confirm with a lawyer.]

## Changes
We may update these terms. The date at the top shows the latest version.
`;

const cookiesEn = `${draftNotice}

This Cookie Policy explains the small files ("cookies") and similar storage this website uses.

## Cookies we use
- **\`NEXT_LOCALE\`** (essential, kept 1 year): remembers your language, English or Swahili.
- **\`wz_cookie_consent\`** (essential, kept 1 year): remembers your cookie choice.
- **Google reCAPTCHA** (essential for security, on the quote and contact forms only; set by Google): protects the forms from spam and abuse.

We do **not** use advertising or tracking cookies at the moment. If we ever add optional cookies (for example visitor statistics), they will only be used after you click **Accept all**.

## Your choice
When you first visit, a banner lets you choose **Accept all** or **Essential only**. You can change your choice at any time with the **Cookie settings** link at the bottom of every page. Essential cookies are needed for the site to work and cannot be switched off here, but you can delete or block cookies in your browser settings.

## More information
See our [Privacy Policy](/en/privacy) for how we handle personal data.
`;

/** Drafts: English only. Swahili is empty, so Swahili visitors see English until it is added. */
export const LEGAL_DRAFTS: Record<'privacy' | 'terms' | 'cookies', BilingualText> = {
  privacy: { en: privacyEn, sw: '' },
  terms: { en: termsEn, sw: '' },
  cookies: { en: cookiesEn, sw: '' },
};
