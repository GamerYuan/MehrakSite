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
    title="Privacy Policy"
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

    <h3>2.1 Information We Collect</h3>
    <p>
      When you interact with Mehrak, we collect the following information. Some of it is submitted
      by you when you use profile or authentication features.
    </p>
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
        <strong>HoYoLAB Token:</strong> An authentication token used to access HoYoLAB APIs on your
        behalf. The service receives this token during profile registration and updates, validates
        it against HoYoLAB, and stores an encrypted form. When you authenticate, the service may
        decrypt the token and hold it temporarily while requesting your game data from HoYoLAB.
      </li>
      <li>
        <strong>Passphrase:</strong> A user-provided passphrase used to derive the key that encrypts
        and decrypts your HoYoLAB token. The service receives the passphrase during profile
        registration, profile updates, and profile authentication. This is not a zero-knowledge
        design: the service must receive the passphrase to perform those operations.
      </li>
    </ul>

    <h3>2.2 How We Collect Information</h3>
    <p>
      We collect information when you use the bot or dashboard features, including when you submit
      profile credentials. Credential values are sent to the service in request bodies for the
      relevant workflow; they are not collected solely from browser cookies.
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
        <strong>HoYoLAB Token:</strong> To authenticate requests to HoYoLAB APIs and retrieve your
        in-game details
      </li>
      <li>
        <strong>Passphrase:</strong> To derive the key used to encrypt or decrypt your HoYoLAB token
      </li>
    </ul>

    <h2 id="storage">4. Data Storage and Security</h2>

    <h3>4.1 Storage Location</h3>
    <p>
      The official service stores profile data on its hosted infrastructure in Germany. The storage
      location does not change the credential boundary described below: the service receives the
      token and passphrase during the workflows that need them.
    </p>

    <h3>4.2 Data Retention</h3>
    <p>
      We retain your data for as long as you maintain a profile with the bot. You can delete your
      profile and all associated data at any time using the bot's delete profile functionality.
    </p>

    <h3>4.3 Security Measures</h3>
    <p>We use multiple security layers to protect your data, with different limits:</p>
    <ul class="list-disc">
      <li>
        <strong>Encryption at rest:</strong> The backend encrypts the stored HoYoLAB token using an
        AES-256-GCM key derived from your passphrase. This protects the stored value; it does not
        prevent the service from decrypting the token during an authenticated request.
      </li>
      <li>
        <strong>Request-time access:</strong> During registration or an update, the service receives
        the token and passphrase and validates the token with HoYoLAB. During authentication, it
        receives the passphrase, decrypts the stored token, and uses that token to request data from
        HoYoLAB. Decrypted credentials may be held temporarily in a server-side cache for commands.
      </li>
      <li>
        <strong>Transport protection:</strong> Transport protection, such as HTTPS, protects data in
        transit between your browser and the service. It is separate from encryption at rest, so
        neither layer should be described as zero-knowledge or as preventing request-time access.
      </li>
    </ul>

    <h2 id="sharing">5. Data Sharing</h2>
    <p>
      We do not sell or trade your personal information. To provide bot functionality, the service
      uses your token and related request data to call HoYoLAB APIs on your behalf. This means the
      service can access the credential while it performs those requests; encryption at rest does
      not remove that operational access.
    </p>

    <h2 id="third-parties">6. Third-Party Services</h2>
    <p>
      Mehrak accesses HoYoLAB APIs using your provided token and UID to retrieve your in-game
      information. The token is encrypted when stored, then decrypted when the service needs to make
      an authenticated request. This interaction is necessary for the bot's functionality, so the
      service is not a zero-knowledge intermediary.
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
