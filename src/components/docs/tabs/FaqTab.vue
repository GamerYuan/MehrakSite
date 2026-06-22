<script setup>
import { useRouter } from "vue-router";
import { RouterLink } from "vue-router";
import Accordion from "primevue/accordion";
import AccordionPanel from "primevue/accordionpanel";
import AccordionHeader from "primevue/accordionheader";
import AccordionContent from "primevue/accordioncontent";

const router = useRouter();

const faqItems = [
  {
    question: "How do I use Mehrak?",
    answer: "You can use Mehrak with any of the specified commands in the ",
    link: { text: "Commands", route: "/docs?tab=commands" },
    answerEnd: " section.",
  },
  {
    question: "How do I add a profile on Mehrak?",
    answer: "You can refer to the ",
    link: { text: "Adding a Profile", route: "/docs?tab=getting-started#adding-a-profile" },
    answerEnd: " section on how to manage your profiles with Mehrak.",
  },
  {
    question: "How can I remove my user data on Mehrak?",
    answer:
      "When you remove your last available profile, Mehrak will automatically remove all stored user data you have with Mehrak, including your Discord ID, HoYoLAB UID and Cookies, except for the collected usage metrics. The usage metrics only contains the commands that you have executed when you use Mehrak.",
  },
  {
    question: "How do I use Mehrak outside of my Discord server?",
    answer:
      "By installing Mehrak to your user profile as a User Application, you can use Mehrak in any servers with External Applications enabled, or in DMs. You may refer to ",
    link: { text: "Getting Started", route: "/docs?tab=getting-started" },
  },
  {
    question: "Is Mehrak safe?",
    answer:
      "Mehrak is committed to provide maximum security for our users. You can read more about this under the ",
    link: { text: "About HoYoLAB Cookies", route: "/docs?tab=appendix&section=cookies" },
    answerEnd: " page.",
  },
  {
    question: "Some commands are not working!",
    answer: "Please try again. If it's still not working, contact a developer in our ",
    link: { text: "Official Discord Server", href: "https://discord.gg/3GYvRD4u9a" },
  },
];
</script>

<template>
  <div class="faq">
    <div class="faq-hero">
      <div class="faq-hero-icon">
        <i class="pi pi-question-circle"></i>
      </div>
      <div>
        <h1 class="faq-title">FAQ</h1>
        <p class="faq-sub">Frequently asked questions about Mehrak.</p>
      </div>
    </div>

    <div class="faq-card">
      <Accordion value="" multiple expandIcon="pi pi-chevron-down" collapseIcon="pi pi-chevron-up">
        <AccordionPanel v-for="(item, index) in faqItems" :key="index" :value="index">
          <AccordionHeader>{{ item.question }}</AccordionHeader>
          <AccordionContent>
            <p class="faq-answer">
              {{ item.answer
              }}<RouterLink v-if="item.link?.route" :to="item.link.route" class="faq-link">{{
                item.link.text
              }}</RouterLink
              ><a
                v-else-if="item.link?.href"
                :href="item.link.href"
                target="_blank"
                rel="noopener noreferrer"
                class="faq-link"
                >{{ item.link.text }}</a
              >{{ item.answerEnd || "" }}
            </p>
          </AccordionContent>
        </AccordionPanel>
      </Accordion>
    </div>
  </div>
</template>

<style scoped>
.faq {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.faq-hero {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.faq-hero-icon {
  width: 3rem;
  height: 3rem;
  display: grid;
  place-items: center;
  border-radius: 0.75rem;
  background: linear-gradient(135deg, var(--accent) 0%, var(--accent-strong) 100%);
  color: #fff;
  font-size: 1rem;
  flex-shrink: 0;
}

.faq-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.faq-sub {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
}

.faq-card {
  background: var(--card-surface);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 0.25rem;
}

.faq-answer {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.7;
  margin: 0;
}

.faq-link {
  color: var(--accent);
  text-decoration: none;
  transition: color 0.1s ease;
}

.faq-link:hover {
  color: var(--accent-strong);
}
</style>
