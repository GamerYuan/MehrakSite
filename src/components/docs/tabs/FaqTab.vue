<script setup>
import { RouterLink } from "vue-router";
import Accordion from "primevue/accordion";
import AccordionContent from "primevue/accordioncontent";
import AccordionHeader from "primevue/accordionheader";
import AccordionPanel from "primevue/accordionpanel";
import PageHeader from "../../ui/PageHeader.vue";
import SurfaceCard from "../../ui/SurfaceCard.vue";

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
    <PageHeader
      icon="pi pi-question-circle"
      title="FAQ"
      subtitle="Direct answers to common setup, privacy, and command questions."
    />

    <SurfaceCard as="div" compact>
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
    </SurfaceCard>
  </div>
</template>

<style scoped>
.faq {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
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
