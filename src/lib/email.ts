import "server-only";
import { SendEmailCommand, SESClient } from "@aws-sdk/client-ses";
import { env } from "@/lib/env";

const ses = new SESClient({
  region: env.AWS_REGION,
  credentials: env.AWS_ACCESS_KEY_ID && env.AWS_SECRET_ACCESS_KEY ? {
    accessKeyId: env.AWS_ACCESS_KEY_ID,
    secretAccessKey: env.AWS_SECRET_ACCESS_KEY,
  } : undefined,
});

export async function sendPurchaseEmail(input: {
  to: string;
  buyerName: string;
  beatTitle: string;
  orderId: string;
}) {
  if (!env.PAYMENTS_ENABLED || !env.AWS_SES_FROM_EMAIL) return;
  await ses.send(new SendEmailCommand({
    Source: env.AWS_SES_FROM_EMAIL,
    Destination: { ToAddresses: [input.to] },
    Message: {
      Subject: { Data: `Your Soundfuel licence for ${input.beatTitle}` },
      Body: {
        Text: {
          Data: `Hi ${input.buyerName},\n\nYour payment is confirmed. Your files and immutable agreement are available at ${env.APP_URL}/library.\n\nOrder: ${input.orderId}\n\nSoundfuel`,
        },
      },
    },
  }));
}
