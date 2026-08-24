<script setup>
import Accordion from "primevue/accordion";
import AccordionContent from "primevue/accordioncontent";
import AccordionHeader from "primevue/accordionheader";
import AccordionPanel from "primevue/accordionpanel";
import Column from "primevue/column";
import DataTable from "primevue/datatable";
import PageHeader from "../../ui/PageHeader.vue";
import SurfaceCard from "../../ui/SurfaceCard.vue";

const cookieActions = [
  { action: "Login to your game account", canDo: false },
  { action: "Change your game account login information", canDo: false },
  { action: "Change your game account password", canDo: false },
  { action: "Delete your game account", canDo: false },
  { action: "Sell your game account", canDo: false },
  { action: "Login to your HoYoLAB Account", canDo: true },
  { action: "Make posts, comments, replies with your HoYoLAB Account", canDo: true },
  { action: "Obtain your in-game information through Battle Chronicles", canDo: true },
  { action: "Redeem Codes", canDo: true },
];

const faqItems = [
  {
    question: "Does HoYoLAB Cookies expire?",
    answer:
      "Yes. They expire after 1 year after its initial creation, which is when you login to HoYoLAB.",
  },
  {
    question: "Can I manually invalidate my HoYoLAB Cookies?",
    answer:
      "Yes, changing your HoYoverse account password will immediately invalidate all HoYoLAB Cookies.",
  },
  {
    question: "How are you using my HoYoLAB Cookies?",
    answer:
      "We use the public API provided by HoYoLAB to access your information. These public API requires your HoYoLAB Cookies, alongside your HoYoLAB UID, as they require you to be logged in when accessing the data.",
  },
];
</script>

<template>
  <div class="cookies">
    <PageHeader
      as="h3"
      icon="pi pi-shield"
      title="HoYoLAB Cookies"
      subtitle="What Mehrak can access, how credentials are protected, and how to revoke them."
    />

    <SurfaceCard>
      <h4 class="cookies-card-title">Disclaimer</h4>
      <p class="cookies-text">
        Mehrak does not force its users to provide their HoYoLAB Cookies without consent. While many
        features of Mehrak requires the use of HoYoLAB Cookies, it is on the user's choice to
        provide their HoYoLAB Cookies with consent.
      </p>
      <p class="cookies-text">
        Should the user choose to withdraw their consent and wish to remove their information from
        Mehrak's database, please refer to FAQ and Privacy Policy on how this could be done.
      </p>
      <p class="cookies-text">
        By providing your HoYoLAB Cookies, you consent to our
        <RouterLink to="/privacy" class="cookies-link">Privacy Policy</RouterLink>.
      </p>
    </SurfaceCard>

    <SurfaceCard>
      <h4 class="cookies-card-title">What are cookies?</h4>
      <p class="cookies-text">
        Cookies are traces of information left on your browser when you access online services. They
        generally contain information about your login session, your preferences, or other temporary
        information related to you.
      </p>
      <div class="cookies-analogy">
        <p>
          Imagine you have a stamp book. When you visit a store, the storekeeper gave you a stamp.
          This stamp helps the storekeeper remember you and what you like to buy from their store.
          The next time you visit the store, the storekeeper can immediately recognise you.
        </p>
        <p>
          Your browser is the stamp book, and cookies are the stamps. Most websites leave cookies on
          your browser to help them remember that you've been here before.
        </p>
      </div>
      <p class="cookies-text">
        In our case, HoYoLAB Cookies contain your session information. This is what kept you logged
        in to HoYoLAB. Mehrak requires this cookie as it uses services provided by HoYoLAB for its
        services.
      </p>
    </SurfaceCard>

    <SurfaceCard>
      <h4 class="cookies-card-title">What can HoYoLAB Cookies do?</h4>
      <p class="cookies-text">
        The HoYoLAB Cookies Mehrak requires contains your login session. These are the things that
        you can and cannot do with said HoYoLAB Cookies:
      </p>

      <DataTable :value="cookieActions" class="cookies-table">
        <Column field="action" header="Actions"></Column>
        <Column field="canDo" header="" style="width: 4rem">
          <template #body="{ data }">
            <span v-if="data.canDo" class="icon-ok"><i class="pi pi-check-circle"></i></span>
            <span v-else class="icon-no"><i class="pi pi-times-circle"></i></span>
          </template>
        </Column>
      </DataTable>

      <p class="cookies-text">
        In short, the cookies provided can only be used to access services provided by HoYoLAB, and
        cannot be used for other services provided by HoYoverse.
      </p>
    </SurfaceCard>

    <SurfaceCard>
      <h4 class="cookies-card-title">How are my Cookies stored?</h4>
      <p class="cookies-text">
        The official Mehrak bot runs on a Virtual Private Server (VPS) hosted by Hetzner. Several
        best practices has been done to ensure that the VPS instance is kept secure from
        unauthorised access.
      </p>
      <p class="cookies-text">
        All your information are stored in a database hosted on the same VPS. Before being stored in
        the database, your provided passphrase is used to generate a AES-256 key to encrypt your
        cookie, ensuring that all cookies are securely stored with minimal risk of being cracked.
      </p>
      <p class="cookies-text">
        After authenticating your passphrase for command execution, your cookies will be stored in a
        password-protected Redis instance. This allows you to use multiple commands within the same
        5 minutes without requiring to type in your passphrase again.
      </p>
      <p class="cookies-text">
        In the case of a data breach, your encrypted cookies might be obtained, but will be nearly
        uncrackable if you follow the best practices when creating a passphrase.
      </p>
    </SurfaceCard>

    <SurfaceCard>
      <h4 class="cookies-card-title">Our commitment</h4>
      <p class="cookies-text">
        We, as the developer team, is committed to providing users with secure and convenient
        services. Should there be an identified security breach, we will make an announcement to all
        users in our Official Discord Server.
      </p>
      <p class="cookies-text">
        For security purposes, the official Mehrak developer team will not release more convenient
        methods of providing your HoYoLAB Cookies, as these convenient methods often involves
        executing proprietary scripts or logging into HoYoLAB with your real account username and
        password. If any individual approaches you to offer "convenient" ways to provide HoYoLAB
        Cookies to Mehrak, we advise you to block communications with said individual and report
        said incident in our
        <a
          href="https://discord.gg/3GYvRD4u9a"
          target="_blank"
          rel="noopener noreferrer"
          class="cookies-link"
          >Official Discord Server</a
        >.
      </p>
    </SurfaceCard>

    <SurfaceCard>
      <h4 class="cookies-card-title">Other Facts about HoYoLAB Cookies</h4>
      <Accordion value="" multiple expandIcon="pi pi-chevron-down" collapseIcon="pi pi-chevron-up">
        <AccordionPanel v-for="(item, index) in faqItems" :key="index" :value="index">
          <AccordionHeader>{{ item.question }}</AccordionHeader>
          <AccordionContent>
            <p class="cookies-answer">{{ item.answer }}</p>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </SurfaceCard>
  </div>
</template>

<style scoped>
.cookies {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.cookies-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.cookies-text {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 0.75rem 0;
}

.cookies-text:last-child {
  margin-bottom: 0;
}

.cookies-link {
  color: var(--accent);
  text-decoration: none;
}

.cookies-link:hover {
  color: var(--accent-strong);
}

.cookies-analogy {
  padding: 1rem 1.25rem;
  background: var(--bg-surface);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  margin: 0 0 0.75rem 0;
}

.cookies-analogy p {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0 0 0.5rem 0;
}

.cookies-analogy p:last-child {
  margin-bottom: 0;
}

.cookies-table {
  background: var(--card-surface) !important;
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  overflow: hidden;
  margin: 1rem 0;
}

.cookies-table :deep(.p-datatable-thead > tr > th) {
  background: var(--bg-surface);
  color: var(--text-secondary);
  font-weight: 600;
  font-size: 0.75rem;
  border-bottom: 1px solid var(--border-primary);
}

.cookies-table :deep(.p-datatable-tbody > tr) {
  background: transparent;
  transition: background 0.1s ease;
}

.cookies-table :deep(.p-datatable-tbody > tr:hover) {
  background: var(--bg-surface);
}

.cookies-table :deep(.p-datatable-tbody > tr > td) {
  border-bottom: 1px solid var(--border-primary);
  color: var(--text-secondary);
  font-size: 0.8125rem;
}

.cookies-table :deep(.p-datatable-tbody > tr:last-child > td) {
  border-bottom: none;
}

.icon-ok {
  color: var(--accent);
  font-size: 1rem;
}

.icon-no {
  color: var(--danger);
  font-size: 1rem;
}

.cookies-answer {
  font-size: 0.8125rem;
  color: var(--text-secondary);
  line-height: 1.7;
  margin: 0;
}
</style>
