import Router from "next/router";
import { LitButton, LitCard, LitHeaderV1, LitHero, LitIcon } from "@getlit/ui";

export function Index() {
  return (
    <div>
      <div className="flex flex-col center-item">
        <LitHero
          title="Lit Actions"
          description="Transform Your Actions with Event Listener: The Power to Respond Instantly to Any Event."
        />
      </div>

      <div className="max-width-880">
        <div className="flex gap-12 flex-col">
          {/* all apps */}
          <div className="lit-row">ALL(3)</div>

          <div className="flex gap-12">
            {/* --- card --- */}
            <LitCard
              href="/apps/portfolio-rebalancer"
              title="Portfolio Rebalancer"
              description="Automatically rebalance your portfolio with custom strategy"
            >
              <LitIcon icon="lit-logo-text" />
            </LitCard>

            {/* --- card --- */}
            <LitCard
              className="disabled"
              title="Geo-fence"
              description="A geofence is a virtual perimeter for a real-world geographic
              area."
            >
              <LitIcon icon="lit-logo-text" />
            </LitCard>

            {/* --- card --- */}
            <LitCard
              className="disabled"
              title="PKP SSL Certificate"
              description="authenticates a website's identity and enables an encrypted
              connection."
            >
              <LitIcon icon="lit-logo-text" />
            </LitCard>
          </div>

          {/* add custom app */}
          <div className="lit-row">Custom</div>

          {/* --- card --- */}
          <LitCard
            href="/apps/custom"
            title="Create your own"
            description="Create an automated action for anything you can imagine"
          >
            <LitIcon icon="apps" />
          </LitCard>
        </div>
      </div>
    </div>
  );
}
export default Index;
