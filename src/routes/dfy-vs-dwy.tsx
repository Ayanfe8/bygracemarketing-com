import { createFileRoute, Link } from "@tanstack/react-router";

export const Route = createFileRoute("/dfy-vs-dwy")({
  head: () => ({
    meta: [
      { title: "Done For You vs. Done With You Marketing: Which Is Right for You?" },
      {
        name: "description",
        content:
          "Confused between Done For You and Done With You marketing? Compare both models — cost, time, control and results — and find out which one fits your small business.",
      },
      {
        property: "og:title",
        content: "Done For You vs. Done With You Marketing: Which Is Right for You?",
      },
      {
        property: "og:description",
        content:
          "A clear, no-fluff comparison of Done For You vs Done With You marketing — what each means, who it's for, and how to choose.",
      },
      { property: "og:type", content: "article" },
      {
        property: "og:url",
        content:
          "https://project--267ab46a-509d-47be-99fe-58a2723e83bd.lovable.app/dfy-vs-dwy",
      },
    ],
    links: [
      {
        rel: "canonical",
        href: "https://project--267ab46a-509d-47be-99fe-58a2723e83bd.lovable.app/dfy-vs-dwy",
      },
    ],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Article",
          headline:
            "Done For You vs. Done With You Marketing: Which Is Right for You?",
          description:
            "A side-by-side comparison of Done For You and Done With You marketing models to help small business owners decide which approach fits them best.",
          author: { "@type": "Organization", name: "Done For You by Grace" },
          publisher: { "@type": "Organization", name: "Done For You by Grace" },
        }),
      },
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "FAQPage",
          mainEntity: [
            {
              "@type": "Question",
              name: "What does Done For You marketing mean?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Done For You (DFY) marketing means an expert or agency executes your marketing on your behalf — strategy, content, campaigns and reporting — so you can focus on running your business.",
              },
            },
            {
              "@type": "Question",
              name: "What does Done With You marketing mean?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Done With You (DWY) marketing is a coaching and consulting model. You get the strategy, templates and feedback, but your team handles the day-to-day execution.",
              },
            },
            {
              "@type": "Question",
              name: "Which is better: Done For You or Done With You?",
              acceptedAnswer: {
                "@type": "Answer",
                text: "Neither is universally better. DFY suits busy owners who want results without doing the work. DWY suits owners with time and an in-house team who want to build long-term marketing skill.",
              },
            },
          ],
        }),
      },
    ],
  }),
  component: ComparisonGuide,
});

function ComparisonGuide() {
  return (
    <main className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-5">
          <Link to="/" className="text-sm font-semibold tracking-tight">
            Done For You by Grace
          </Link>
          <Link
            to="/"
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            ← Back home
          </Link>
        </div>
      </header>

      <article className="mx-auto max-w-3xl px-6 py-16">
        <p className="text-sm font-medium uppercase tracking-widest text-muted-foreground">
          Guide
        </p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight sm:text-5xl">
          Done For You vs. Done With You Marketing: Which Is Right for You?
        </h1>
        <p className="mt-6 text-lg text-muted-foreground">
          If you've been researching how to grow your business, you've probably
          hit two phrases over and over: <strong>Done For You (DFY)</strong>{" "}
          and <strong>Done With You (DWY)</strong>. They sound similar, but
          they lead to very different outcomes — in cost, in time, and in how
          fast you see results. Here's a plain-English breakdown.
        </p>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            What "Done For You" actually means
          </h2>
          <p className="text-muted-foreground">
            Done For You marketing means a specialist takes the work off your
            plate entirely. You hand over the brief — they handle the
            strategy, the content, the campaigns, the design, the reporting.
            You stay in the loop through approvals and updates, but the day-to-day
            execution isn't yours. It's the right fit when your time is more
            valuable spent on clients, operations or product than on figuring
            out LinkedIn algorithms or email automations.
          </p>
        </section>

        <section className="mt-10 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            What "Done With You" actually means
          </h2>
          <p className="text-muted-foreground">
            Done With You marketing is part coaching, part consulting. You get
            the strategy, the templates, the playbooks — and someone reviewing
            your work — but you or your team still post the content, send the
            emails, and run the campaigns. It's slower out of the gate, but
            you build internal capability that compounds.
          </p>
        </section>

        <section className="mt-12">
          <h2 className="text-2xl font-semibold tracking-tight">
            Side-by-side comparison
          </h2>
          <div className="mt-6 overflow-hidden rounded-lg border border-border">
            <table className="w-full text-left text-sm">
              <thead className="bg-muted/50">
                <tr>
                  <th className="px-4 py-3 font-semibold">Factor</th>
                  <th className="px-4 py-3 font-semibold">Done For You</th>
                  <th className="px-4 py-3 font-semibold">Done With You</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {[
                  ["Your time investment", "Low — approvals only", "High — you execute"],
                  ["Speed to results", "Fast", "Gradual"],
                  ["Upfront cost", "Higher", "Lower"],
                  ["Long-term skill built", "Minimal", "Significant"],
                  ["Control over voice", "Shared with expert", "Fully yours"],
                  ["Best for", "Busy owners, lean teams", "Teams with time to learn"],
                ].map(([factor, dfy, dwy]) => (
                  <tr key={factor}>
                    <td className="px-4 py-3 font-medium">{factor}</td>
                    <td className="px-4 py-3 text-muted-foreground">{dfy}</td>
                    <td className="px-4 py-3 text-muted-foreground">{dwy}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            How to choose between them
          </h2>
          <p className="text-muted-foreground">
            Ask yourself three honest questions:
          </p>
          <ol className="list-decimal space-y-3 pl-5 text-muted-foreground">
            <li>
              <strong className="text-foreground">Do I have time?</strong> If
              marketing keeps slipping to the bottom of your to-do list,
              Done With You will keep slipping too. DFY removes that risk.
            </li>
            <li>
              <strong className="text-foreground">Do I have a team?</strong>{" "}
              DWY only works if someone on your side can do the execution
              week after week. If it's just you, DFY is usually the safer bet.
            </li>
            <li>
              <strong className="text-foreground">How fast do I need results?</strong>{" "}
              DFY produces output from week one. DWY takes a quarter or two
              before the rhythm clicks.
            </li>
          </ol>
        </section>

        <section className="mt-12 space-y-4">
          <h2 className="text-2xl font-semibold tracking-tight">
            The honest answer for most small businesses
          </h2>
          <p className="text-muted-foreground">
            If you're a founder, solopreneur or small team without a dedicated
            marketer, Done For You almost always wins on ROI. The hours you'd
            spend learning, drafting and posting are worth more inside your
            business. DWY shines once you have someone in-house whose job is
            to execute — at that point, coaching scales them faster than
            another agency retainer.
          </p>
        </section>

        <section className="mt-16 rounded-2xl border border-border bg-card p-8">
          <h2 className="text-2xl font-semibold tracking-tight">
            Want marketing handled for you?
          </h2>
          <p className="mt-3 text-muted-foreground">
            Done For You by Grace runs the strategy, content, LinkedIn, email
            and lead generation so you don't have to. Book a free intro call
            and we'll map out what a DFY engagement would look like for your
            business.
          </p>
          <div className="mt-6">
            <Link
              to="/"
              className="inline-flex items-center justify-center rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
            >
              See packages & pricing
            </Link>
          </div>
        </section>
      </article>
    </main>
  );
}
