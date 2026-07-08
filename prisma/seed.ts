import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";
import { AgencyModule, AgencyRole, PrismaClient } from "../src/generated/prisma/client";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const db = new PrismaClient({ adapter });

const ALL_MODULES = Object.values(AgencyModule);

async function main() {
  const passwordHash = await bcrypt.hash("Demo123!", 12);

  // --- Plattformbetreiber (Owner) ---
  await db.user.upsert({
    where: { email: "owner@agentur-os.local" },
    update: {},
    create: {
      email: "owner@agentur-os.local",
      name: "Plattform Owner",
      passwordHash,
      isPlatformOwner: true,
    },
  });

  // --- Demo-Agentur ---
  const agency = await db.agency.upsert({
    where: { slug: "musteragentur" },
    update: {},
    create: {
      name: "Musteragentur GmbH",
      slug: "musteragentur",
      domain: "demo.musteragentur.de",
      primaryColor: "#4F46E5",
      secondaryColor: "#111827",
      emailSenderName: "Musteragentur GmbH",
      emailSenderAddress: "hallo@musteragentur.de",
      status: "ACTIVE",
    },
  });

  // --- Kunden der Demo-Agentur ---
  const bakery = await db.customer.upsert({
    where: { id: "demo-customer-baeckerei" },
    update: {},
    create: {
      id: "demo-customer-baeckerei",
      agencyId: agency.id,
      name: "Bäckerei Sonnenblick",
      industry: "Lebensmittelhandwerk",
      location: "München",
      contactPerson: "Anna Sonnenblick",
      email: "info@sonnenblick-baeckerei.de",
      pipelineStage: "ACTIVE",
    },
  });

  const gym = await db.customer.upsert({
    where: { id: "demo-customer-fitnessloft" },
    update: {},
    create: {
      id: "demo-customer-fitnessloft",
      agencyId: agency.id,
      name: "Fitness Loft Berlin",
      industry: "Sport & Fitness",
      location: "Berlin",
      contactPerson: "Jonas Krüger",
      email: "kontakt@fitnessloft-berlin.de",
      pipelineStage: "LEAD",
    },
  });

  // --- Agentur-Team ---
  const admin = await db.user.upsert({
    where: { email: "admin@musteragentur.de" },
    update: {},
    create: {
      email: "admin@musteragentur.de",
      name: "Agentur Admin",
      passwordHash,
    },
  });

  const pm = await db.user.upsert({
    where: { email: "pm@musteragentur.de" },
    update: {},
    create: {
      email: "pm@musteragentur.de",
      name: "Projektleiterin Petra",
      passwordHash,
    },
  });

  const staff = await db.user.upsert({
    where: { email: "designer@musteragentur.de" },
    update: {},
    create: {
      email: "designer@musteragentur.de",
      name: "Designer Dennis",
      passwordHash,
    },
  });

  const clientUser = await db.user.upsert({
    where: { email: "kunde@sonnenblick-baeckerei.de" },
    update: {},
    create: {
      email: "kunde@sonnenblick-baeckerei.de",
      name: "Anna Sonnenblick",
      passwordHash,
    },
  });

  const adminMembership = await db.agencyMembership.upsert({
    where: { userId_agencyId: { userId: admin.id, agencyId: agency.id } },
    update: {},
    create: { userId: admin.id, agencyId: agency.id, role: AgencyRole.AGENCY_ADMIN },
  });

  await db.agencyMembership.upsert({
    where: { userId_agencyId: { userId: pm.id, agencyId: agency.id } },
    update: {},
    create: { userId: pm.id, agencyId: agency.id, role: AgencyRole.PROJECT_MANAGER },
  });

  await db.agencyMembership.upsert({
    where: { userId_agencyId: { userId: staff.id, agencyId: agency.id } },
    update: {},
    create: { userId: staff.id, agencyId: agency.id, role: AgencyRole.STAFF },
  });

  await db.agencyMembership.upsert({
    where: { userId_agencyId: { userId: clientUser.id, agencyId: agency.id } },
    update: {},
    create: {
      userId: clientUser.id,
      agencyId: agency.id,
      role: AgencyRole.CLIENT,
      customerId: bakery.id,
    },
  });

  // Agentur-Admin bekommt volle Rechte auf allen Modulen
  await db.modulePermission.createMany({
    data: ALL_MODULES.map((module) => ({
      membershipId: adminMembership.id,
      module,
      canView: true,
      canEdit: true,
      canManage: true,
    })),
    skipDuplicates: true,
  });

  await db.rolePreset.upsert({
    where: { agencyId_name: { agencyId: agency.id, name: "Freelancer (nur Projekte)" } },
    update: {},
    create: {
      agencyId: agency.id,
      name: "Freelancer (nur Projekte)",
      description: "Sieht und bearbeitet nur zugewiesene Projekte, keine Finanzen.",
      permissions: {
        PROJECTS: { canView: true, canEdit: true, canManage: false },
        WEBSITES: { canView: true, canEdit: true, canManage: false },
      },
    },
  });

  await db.auditLog.create({
    data: {
      agencyId: agency.id,
      userId: admin.id,
      action: "seed.demo_data_created",
      entityType: "Agency",
      entityId: agency.id,
      changes: { note: "Initiale Demo-Daten für Phase 0" },
    },
  });

  console.log("Seed abgeschlossen:");
  console.log(`  Owner:        owner@agentur-os.local / Demo123!`);
  console.log(`  Agentur-Admin: admin@musteragentur.de / Demo123!`);
  console.log(`  Projektleiter: pm@musteragentur.de / Demo123!`);
  console.log(`  Mitarbeiter:   designer@musteragentur.de / Demo123!`);
  console.log(`  Kunde:         kunde@sonnenblick-baeckerei.de / Demo123!`);
  console.log(`  Agentur: ${agency.name} (${agency.slug})`);
  console.log(`  Kunden: ${bakery.name}, ${gym.name}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
