import { Hero } from "../src/components/sections/Hero";
import { MissionVision } from "../src/components/sections/MissionVision";
import { Services } from "../src/components/sections/Services";
import { Differentiators } from "../src/components/sections/Differentiators";
import { History } from "../src/components/sections/History";
import { Leaders } from "../src/components/sections/Leaders";
import { Clients } from "../src/components/sections/Clients";
import { QualityTeaser } from "../src/components/sections/QualityTeaser";
import { Contact } from "../src/components/sections/Contact";
import { OrganizationJsonLd } from "../src/components/OrganizationJsonLd";
import { WhatsAppButton } from "../src/components/WhatsAppButton";

export default function Home() {
  return (
    <>
      <OrganizationJsonLd />
      <Hero />
      <MissionVision />
      <Services />
      <Differentiators />
      <History />
      <Leaders />
      <Clients />
      <QualityTeaser />
      <Contact />
      <WhatsAppButton />
    </>
  );
}
