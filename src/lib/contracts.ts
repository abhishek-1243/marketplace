import { createHash } from "crypto";
import { LicensePlan } from "@prisma/client";

export function licenseSnapshot(plan: LicensePlan) {
  return {
    type: plan.type,
    price: plan.price,
    currency: plan.currency,
    files: {
      mp3: plan.includesMp3,
      wav: plan.includesWav,
      stems: plan.includesStems,
    },
    rights: {
      termMonths: plan.termMonths,
      territory: plan.territory,
      masterRecordingLimit: plan.masterRecordingLimit,
      streamingLimit: plan.streamingLimit,
      videoLimit: plan.videoLimit,
      commercialUse: plan.commercialUse,
      livePerformance: plan.livePerformance,
      youtubeMonetization: plan.youtubeMonetization,
      contentIdAllowed: plan.contentIdAllowed,
      producerPublishingPct: plan.producerPublishingPct,
      exclusive: plan.isExclusive,
    },
    templateVersion: plan.templateVersion,
  };
}

export function renderAgreement(input: {
  beatTitle: string;
  artistName: string;
  producerName: string;
  snapshot: ReturnType<typeof licenseSnapshot>;
}) {
  const { snapshot } = input;
  const content = [
    `SOUNDFUEL ${snapshot.type} BEAT LICENSE`,
    `Template: ${snapshot.templateVersion}`,
    "",
    `Licensor: ${input.producerName}`,
    `Licensee: ${input.artistName}`,
    `Beat: ${input.beatTitle}`,
    `Price: INR ${snapshot.price}`,
    `Files: ${[snapshot.files.mp3 && "MP3", snapshot.files.wav && "WAV", snapshot.files.stems && "stems"].filter(Boolean).join(", ")}`,
    "",
    "RIGHTS SUMMARY",
    `Territory: ${snapshot.rights.territory}`,
    `Term: ${snapshot.rights.termMonths ? `${snapshot.rights.termMonths} months` : "Perpetual"}`,
    `Master recordings: ${snapshot.rights.masterRecordingLimit}`,
    `Audio streams: ${snapshot.rights.streamingLimit ?? "Unlimited"}`,
    `Music videos: ${snapshot.rights.videoLimit ?? "Unlimited"}`,
    `Commercial use: ${snapshot.rights.commercialUse ? "Yes" : "No"}`,
    `YouTube monetization: ${snapshot.rights.youtubeMonetization ? "Yes" : "No"}`,
    `Content ID: ${snapshot.rights.contentIdAllowed ? "Permitted" : "Not permitted"}`,
    `Producer publishing share: ${snapshot.rights.producerPublishingPct}%`,
    `Exclusive: ${snapshot.rights.exclusive ? "Yes; existing valid non-exclusive licences survive" : "No"}`,
    "",
    "1. LICENCE GRANT",
    `After cleared payment, the Licensor grants the Licensee a ${snapshot.rights.exclusive ? "exclusive" : "non-exclusive"}, non-transferable licence to incorporate the Beat into the number of new master recording(s) stated above and commercially exploit those masters within the stated territory, term and usage limits. No ownership is transferred except where an express written assignment says otherwise.`,
    "",
    "2. OWNERSHIP AND PUBLISHING",
    `The Licensor retains ownership of the Beat and its underlying composition. The Licensor's publishing share in each new composition is ${snapshot.rights.producerPublishingPct}%. The parties must accurately register these shares with relevant collection societies and platforms.`,
    "",
    "3. PERMITTED USE",
    `Commercial release, live performance and YouTube monetization are ${snapshot.rights.commercialUse && snapshot.rights.livePerformance && snapshot.rights.youtubeMonetization ? "permitted" : "limited as stated in the rights summary"}. The Licensee may edit, arrange, mix and master the Beat only as part of an authorized new master.`,
    "",
    "4. RESTRICTIONS",
    "The Licensee may not resell, sublicense or distribute the Beat by itself; claim authorship of the Beat; make it available as stock audio or a sample pack; use it unlawfully; or exceed a stated usage limit. Content ID registration is permitted only when the rights summary expressly says so.",
    "",
    "5. EXCLUSIVE LICENCES",
    snapshot.rights.exclusive
      ? "The Licensor must stop issuing new licences after this sale. Valid non-exclusive licences issued earlier continue according to their terms."
      : "The Licensor may continue licensing the Beat to other artists and may later sell an exclusive licence; this licence remains valid for its term.",
    "",
    "6. WARRANTIES",
    "The Licensor warrants that they control the rights needed to grant this licence and that all samples have been disclosed and lawfully licensed or cleared. The Licensee warrants that their new master and use of the Beat will not add unlawful or infringing material.",
    "",
    "7. CREDIT",
    `Where credits are customarily shown, the Licensee must credit the producer as “Produced by ${input.producerName}” unless the parties agree otherwise in writing.`,
    "",
    "8. BREACH AND TERMINATION",
    "A material breach that is not cured within 14 days after written notice may terminate this licence. On termination, the Licensee must stop new distribution and monetization; accrued payment and accounting obligations survive.",
    "",
    "9. DELIVERY, PAYMENTS AND PLATFORM TERMS",
    "File delivery begins after payment capture. The Soundfuel Terms of Service and Refund Policy accepted at checkout are incorporated into this agreement. Platform records, the content hash and payment-provider records may evidence electronic acceptance and delivery.",
    "",
    "10. ENTIRE AGREEMENT",
    "This document and the incorporated platform policies are the complete agreement for this transaction. Any amendment must be recorded in writing and accepted by both parties. If a provision is unenforceable, the remaining provisions continue to apply.",
  ].join("\n");

  return {
    content,
    hash: createHash("sha256").update(content).digest("hex"),
  };
}
