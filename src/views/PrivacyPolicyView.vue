<script setup>
import LegalLayout from "../components/ui/LegalLayout.vue";

const sections = [
  ["introduction", "1. Introduction"],
  ["information", "2. Information We Collect"],
  ["use", "3. How We Use Information"],
  ["storage", "4. Storage and Security"],
  ["sharing", "5. Data Sharing"],
  ["third-parties", "6. Third-Party Services"],
  ["rights", "7. Your Rights"],
  ["permissions", "8. Bot Permissions"],
  ["changes", "9. Policy Changes"],
  ["contact", "10. Contact"],
  ["compliance", "11. Compliance"],
  ["children", "12. Children's Privacy"],
].map(([id, label]) => ({ id, label }));
</script>

<template>
  <LegalLayout
    eyebrow="Legal · Privacy / 01"
    title="Privacy Policy"
    summary="How Mehrak collects, uses, stores, and protects information."
    filed="Effective April 22, 2026"
    updated="April 22, 2026"
    :sections="sections"
  >
    <h2 id="introduction">1. Introduction</h2>
    <p>
      This Privacy Policy describes how Mehrak ("the Bot", "we", "us", or "our") collects, uses, and
      protects your information when you use our Discord bot services. Mehrak is an all-in-one
      toolbox for HoYoverse games, developed and operated by GamerYuan.
    </p>
    <p>
      By using Mehrak, you agree to the collection and use of information in accordance with this
      Privacy Policy.
    </p>

    <h2 id="information">2. Information We Collect</h2>

    <h3>2.1 Automatically Collected Information</h3>
    <p>When you interact with Mehrak, we automatically collect the following information:</p>
    <ul class="list-disc">
      <li>
        <strong>Discord User ID:</strong> Your unique Discord identifier for profile identification
      </li>
      <li>
        <strong>Usage Statistics:</strong> Data about how you interact with the bot for metrics and
        analysis
      </li>
      <li>
        <strong>HoYoverse Game UIDs:</strong> Your game profile identifiers for HoYoverse games
      </li>
      <li>
        <strong>HoYoverse Cookies:</strong> Authentication tokens to access HoYoverse public APIs on
        your behalf. Your cookies are encrypted with the passphrase you provide and are never stored
        in plaintext. Your cookies are decrypted only when necessary to retrieve your in-game
        information and are never share with any other third parties or services. Your cookies might
        be stored transiently in memory during active sessions for the purpose of querying HoYoverse
        APIs, but they are never written to disk in an unencrypted form.
      </li>
      <li>
        <strong>Passphrase:</strong> A user-provided passphrase used for encrypting your HoYoverse
        cookies. This passphrase is never stored and is used solely to generate encryption keys for
        securing your cookies. This passphrase will be used to decrypt your cookies when you
        interact with the bot, but it is not stored in our systems, ensuring that only you have
        access to your authentication data.
      </li>
    </ul>

    <h3>2.2 How We Collect Information</h3>
    <p>
      All information is collected automatically when you interact with the bot through Discord
      commands and features.
    </p>

    <h2 id="use">3. How We Use Your Information</h2>
    <p>We use the collected information for the following purposes:</p>
    <ul class="list-disc">
      <li>
        <strong>Discord User ID:</strong> To identify and associate your Discord profile with your
        bot data
      </li>
      <li>
        <strong>Usage Statistics:</strong> To analyze bot performance, improve features, and
        understand user behavior
      </li>
      <li>
        <strong>HoYoverse Game UIDs:</strong> To identify and retrieve information from your
        HoYoverse game profiles
      </li>
      <li>
        <strong>HoYoverse Cookies:</strong> To authenticate and access HoYoverse public APIs to
        query your in-game details
      </li>
      <li>
        <strong>Passphrase:</strong> To generate encryption keys for securing your HoYoverse cookies
      </li>
    </ul>

    <h2 id="storage">4. Data Storage and Security</h2>

    <h3>4.1 Storage Location</h3>
    <p>Your data is stored securely on our Hetzner VPS infrastructure located in Germany.</p>

    <h3>4.2 Data Retention</h3>
    <p>
      We retain your data for as long as you maintain a profile with the bot. You can delete your
      profile and all associated data at any time using the bot's delete profile functionality.
    </p>

    <h3>4.3 Security Measures</h3>
    <p>We implement robust security measures to protect your data:</p>
    <ul class="list-disc">
      <li>
        <strong>Zero-Knowledge Encryption:</strong> Your HoYoverse cookies are encrypted using
        AES-256 encryption
      </li>
      <li>
        <strong>User-Controlled Encryption:</strong> Your provided passphrase generates the
        encryption key, ensuring we cannot access your cookies without your passphrase
      </li>
      <li>
        <strong>Secure Storage:</strong> All data is stored on secure servers with appropriate
        access controls
      </li>
    </ul>

    <h2 id="sharing">5. Data Sharing</h2>
    <p>
      We do not sell or trade your personal information. To provide bot functionality,
      authentication cookies and related request data may be transmitted to HoYoverse APIs on your
      behalf.
    </p>

    <h2 id="third-parties">6. Third-Party Services</h2>
    <p>
      Mehrak accesses HoYoverse public APIs using your provided cookies to retrieve your in-game
      information. This interaction is necessary for the bot's functionality and is performed
      securely using your encrypted authentication data.
    </p>

    <h2 id="rights">7. Your Rights and Choices</h2>

    <h3>7.1 Data Deletion</h3>
    <p>
      You have the right to delete your profile and all associated data at any time using the bot's
      built-in delete profile feature. Once deleted, all your data will be permanently removed from
      our systems.
    </p>

    <h3>7.2 Data Access</h3>
    <p>
      You can view what data we have stored about you through the bot's profile management commands.
    </p>

    <h3>7.3 Data Portability</h3>
    <p>You can request a copy of your data by contacting us through the methods listed below.</p>

    <h2 id="permissions">8. Bot Permissions</h2>
    <p>
      Mehrak operates with minimal Discord permissions and does not require any special
      administrative permissions. The bot only accesses information necessary for its functionality.
    </p>

    <h2 id="changes">9. Changes to This Privacy Policy</h2>
    <p>
      We may update this Privacy Policy from time to time. We will notify users of any material
      changes by updating the "Last Updated" date at the top of this Privacy Policy. Continued use
      of the bot after such changes constitutes acceptance of the updated Privacy Policy.
    </p>

    <h2 id="contact">10. Contact Information</h2>
    <p>
      If you have any questions, concerns, or requests regarding this Privacy Policy or your data,
      please contact us:
    </p>
    <ul class="list-disc">
      <li><strong>Discord:</strong> Contact GamerYuan directly on Discord</li>
      <li>
        <strong>Email: </strong>
        <a href="mailto:f2pplayer0801@gmail.com">f2pplayer0801@gmail.com</a>
      </li>
    </ul>

    <h2 id="compliance">11. Compliance</h2>
    <p>
      This Privacy Policy is designed to comply with applicable data protection laws, including but
      not limited to the General Data Protection Regulation (GDPR) and other relevant privacy
      regulations.
    </p>

    <h2 id="children">12. Children's Privacy</h2>
    <p>
      Mehrak is not intended for users under the age of 13. We do not knowingly collect personal
      information from children under 13. If you become aware that a child has provided us with
      personal information, please contact us immediately.
    </p>
  </LegalLayout>
</template>
