import { createFileRoute } from "@tanstack/react-router";
import { StarterShell } from "@/components/starter-pack/shell";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: "Privacy Notice | Done For You by Grace" },
      { name: "description", content: "How Done For You by Grace collects and uses information submitted through bygracemarketing.com." },
      { property: "og:title", content: "Privacy Notice | Done For You by Grace" },
      { property: "og:description", content: "How we collect, use and protect the details you share with us." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacy,
});

function Privacy() {
  const h = "mt-10 font-serif text-2xl text-ink";
  const p = "mt-3 leading-relaxed text-charcoal";
  return (
    <StarterShell>
      <article className="mx-auto max-w-2xl px-5 py-16">
        <h1 className="font-serif text-4xl text-ink">Privacy notice</h1>
        <p className={p}>This notice explains how Done For You by Grace handles information submitted through bygracemarketing.com.</p>
        <h2 className={h}>What we collect</h2>
        <p className={p}>When you request a resource, unlock pricing or contact us, we collect the details you enter: your name and email, and optionally your business name, business type, main challenge and message. We also record the page and any campaign (UTM) tags that brought you to the site, and your email preferences.</p>
        <h2 className={h}>How we use it</h2>
        <p className={p}>To send what you asked for, respond to your enquiry and keep a record of requests. We only send marketing emails or product early-access notes if you tick the relevant box. You can download free resources without ticking either box.</p>
        <h2 className={h}>Storage and access</h2>
        <p className={p}>Your details are stored in our secure database and are not publicly readable. Emails are sent through our email provider. We do not sell your information.</p>
        <h2 className={h}>Your choices</h2>
        <p className={p}>Every marketing email includes an unsubscribe link. You can also ask us to access, correct or delete your details by emailing <a className="underline" href="mailto:bookingswithgrace@gmail.com">bookingswithgrace@gmail.com</a>.</p>
      </article>
    </StarterShell>
  );
}
