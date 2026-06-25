<script setup>
import Button from "primevue/button";
import Image from "primevue/image";
import Message from "primevue/message";
import Step from "primevue/step";
import StepItem from "primevue/stepitem";
import StepPanel from "primevue/steppanel";
import Stepper from "primevue/stepper";
import { useRouter } from "vue-router";

const router = useRouter();
</script>

<template>
  <div class="gs">
    <div class="gs-hero">
      <div class="gs-hero-icon">
        <i class="pi pi-book"></i>
      </div>
      <div>
        <h1 class="gs-title">Getting Started</h1>
        <p class="gs-sub">
          Learn how to install and use Mehrak in your Discord server or user profile.
        </p>
      </div>
    </div>

    <!-- Server Install -->
    <section class="gs-card">
      <div class="gs-card-head">
        <div class="gs-step-num">1</div>
        <div>
          <h2 class="gs-card-title">Inviting to Discord Server</h2>
          <p class="gs-card-sub">Add Mehrak to any Discord server you manage.</p>
        </div>
      </div>

      <Message severity="info" :closable="false" class="gs-msg">
        You are required to have
        <code class="gs-code-inline">Manage Server</code> or
        <code class="gs-code-inline">Administrator</code> permissions in a server to invite bots.
      </Message>

      <Stepper value="1">
        <StepItem value="1">
          <Step value="1">Install Page</Step>
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="gs-step">
              <p>
                Click this link to open the
                <a
                  href="https://discord.com/oauth2/authorize?client_id=1365154828430610532"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="gs-link"
                  >Mehrak install page</a
                >
                and select <strong>Add to Server</strong>.
              </p>
              <Button size="small" label="Next" @click="activateCallback('2')" />
            </div>
          </StepPanel>
        </StepItem>
        <StepItem value="2">
          <Step value="2">Select Server</Step>
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="gs-step">
              <p>Select the server where you want Mehrak to be installed.</p>
              <div class="gs-step-btns">
                <Button
                  size="small"
                  label="Back"
                  severity="secondary"
                  @click="activateCallback('1')"
                />
                <Button size="small" label="Next" @click="activateCallback('3')" />
              </div>
            </div>
          </StepPanel>
        </StepItem>
        <StepItem value="3">
          <Step value="3">Done</Step>
          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="gs-step">
              <p>You have successfully installed Mehrak to that server.</p>
              <Button
                size="small"
                label="Back"
                severity="secondary"
                @click="activateCallback('2')"
              />
            </div>
          </StepPanel>
        </StepItem>
      </Stepper>
    </section>

    <!-- User Profile Install -->
    <section class="gs-card">
      <div class="gs-card-head">
        <div class="gs-step-num">2</div>
        <div>
          <h2 class="gs-card-title">Installing to User Profile</h2>
          <p class="gs-card-sub">Use Mehrak in any server or DMs as a User Application.</p>
        </div>
      </div>

      <Stepper value="1">
        <StepItem value="1">
          <Step value="1">Install Page</Step>
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="gs-step">
              <p>
                Click this link to open the
                <a
                  href="https://discord.com/oauth2/authorize?client_id=1365154828430610532"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="gs-link"
                  >Mehrak install page</a
                >
                and select <strong>Install to account</strong>.
              </p>
              <Button size="small" label="Next" @click="activateCallback('2')" />
            </div>
          </StepPanel>
        </StepItem>
        <StepItem value="2">
          <Step value="2">Done</Step>
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="gs-step">
              <p>
                You have successfully installed Mehrak to your user account. You can now use Mehrak
                in any Discord server with External Applications enabled, or in DMs.
              </p>
              <Button
                size="small"
                label="Back"
                severity="secondary"
                @click="activateCallback('1')"
              />
            </div>
          </StepPanel>
        </StepItem>
      </Stepper>
    </section>

    <!-- Using Commands -->
    <section class="gs-card">
      <div class="gs-card-head">
        <div class="gs-step-num">
          <i class="pi pi-hashtag"></i>
        </div>
        <div>
          <h2 class="gs-card-title">Using Commands</h2>
          <p class="gs-card-sub">Mehrak uses Discord slash commands.</p>
        </div>
      </div>
      <p class="gs-text">
        After successful installation, you can access the command list by typing
        <code class="gs-code-inline">/</code> in supported text channels.
      </p>
    </section>

    <!-- Adding a Profile -->
    <section id="adding-a-profile" class="gs-card">
      <div class="gs-card-head">
        <div class="gs-step-num">
          <i class="pi pi-user"></i>
        </div>
        <div>
          <h2 class="gs-card-title">Adding a Profile</h2>
          <p class="gs-card-sub">Connect your HoYoLAB account to use game-related commands.</p>
        </div>
      </div>

      <p class="gs-text">
        To use game-related commands, you must first add a profile to Mehrak. Run the following
        command:
      </p>

      <pre class="gs-code-block"><code>/profile add</code></pre>

      <p class="gs-text">
        After running Profile Add, you will be prompted with an authentication modal with the
        following inputs:
      </p>

      <ul class="gs-list">
        <li>HoYoLAB UID</li>
        <li>HoYoLAB Cookies</li>
        <li>Passphrase</li>
      </ul>

      <Message severity="info" :closable="false" class="gs-msg">
        You are advised to use a computer to complete authentication, as these steps are easier to
        perform on desktop.
      </Message>

      <div class="gs-divider"></div>

      <!-- HoYoLAB UID -->
      <h3 class="gs-section-title">HoYoLAB UID</h3>

      <Stepper value="1">
        <StepItem value="1">
          <Step value="1">Login</Step>
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="gs-step">
              <p>
                Go to
                <a
                  href="https://www.hoyolab.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="gs-link"
                  >HoYoLAB</a
                >
                and sign in with your HoYoverse account.
              </p>
              <Button size="small" label="Next" @click="activateCallback('2')" />
            </div>
          </StepPanel>
        </StepItem>
        <StepItem value="2">
          <Step value="2">Profile Page</Step>
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="gs-step">
              <p>
                Click your profile picture in the top-right corner and select
                <strong>Personal Homepage</strong>.
              </p>
              <div class="gs-step-btns">
                <Button
                  size="small"
                  label="Back"
                  severity="secondary"
                  @click="activateCallback('1')"
                />
                <Button size="small" label="Next" @click="activateCallback('3')" />
              </div>
            </div>
          </StepPanel>
        </StepItem>
        <StepItem value="3">
          <Step value="3">Copy UID</Step>
          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="gs-step">
              <p>
                Your UID is the numeric value after <code class="gs-code-inline">id=</code> in the
                URL.
              </p>
              <figure class="gs-figure">
                <Image
                  src="/docs/getting-started/hoyolab-uid-url-example.webp"
                  alt="HoYoLAB UID in browser URL"
                  preview
                  class="gs-image"
                  imageClass="w-full h-auto block"
                >
                  <template #previewicon><i class="pi pi-search"></i></template>
                </Image>
                <figcaption class="gs-figcap">HoYoLAB UID in browser URL bar.</figcaption>
              </figure>
              <p>
                Copy this number and paste it into the UID input in the authentication modal. In
                this example, the HoYoLAB UID is <strong>36639475</strong>.
              </p>
              <Button
                size="small"
                label="Back"
                severity="secondary"
                @click="activateCallback('2')"
              />
            </div>
          </StepPanel>
        </StepItem>
      </Stepper>

      <div class="gs-divider"></div>

      <!-- HoYoLAB Cookies -->
      <h3 class="gs-section-title">HoYoLAB Cookies</h3>

      <p class="gs-text">
        Mehrak requires your HoYoLAB cookies to retrieve in-game information for other commands. You
        are strongly advised to read the
        <a
          href="#"
          @click.prevent="router.push('/docs?tab=appendix&section=cookies')"
          class="gs-link"
          >About HoYoLAB Cookies</a
        >
        page before providing this data.
      </p>

      <Stepper value="1">
        <StepItem value="1">
          <Step value="1">Login</Step>
          <StepPanel v-slot="{ activateCallback }" value="1">
            <div class="gs-step">
              <p>Sign in to HoYoLAB with the same account used to retrieve your HoYoLAB UID.</p>
              <Button size="small" label="Next" @click="activateCallback('2')" />
            </div>
          </StepPanel>
        </StepItem>
        <StepItem value="2">
          <Step value="2">Open DevTools</Step>
          <StepPanel v-slot="{ activateCallback }" value="2">
            <div class="gs-step">
              <p>
                Press <code class="gs-code-inline">Ctrl</code> +
                <code class="gs-code-inline">Shift</code> + <code class="gs-code-inline">I</code>.
              </p>
              <div class="gs-step-btns">
                <Button
                  size="small"
                  label="Back"
                  severity="secondary"
                  @click="activateCallback('1')"
                />
                <Button size="small" label="Next" @click="activateCallback('3')" />
              </div>
            </div>
          </StepPanel>
        </StepItem>
        <StepItem value="3">
          <Step value="3">Copy Cookies</Step>
          <StepPanel v-slot="{ activateCallback }" value="3">
            <div class="gs-step">
              <p>
                Browser menus may differ, but use these general steps and copy the value for
                <code class="gs-code-inline">ltoken_v2</code>.
              </p>

              <div class="gs-browser-block">
                <p class="gs-browser-label">Chromium-based browsers (Chrome, Edge, Opera, Brave)</p>
                <p>
                  Open <strong>Application</strong> tab, select
                  <strong>Storage &gt; Cookies</strong>, choose the site, then copy
                  <code class="gs-code-inline">ltoken_v2</code>.
                </p>
              </div>

              <figure class="gs-figure">
                <Image
                  src="/docs/getting-started/cookies-chromium-devtools.webp"
                  alt="Chromium developer tools cookies panel"
                  preview
                  class="gs-image"
                  imageClass="w-full h-auto block"
                >
                  <template #previewicon><i class="pi pi-search"></i></template>
                </Image>
                <figcaption class="gs-figcap">
                  Developer console for Chromium-based browser.
                </figcaption>
              </figure>

              <div class="gs-browser-block">
                <p class="gs-browser-label">Firefox-based browsers (Firefox, LibreWolf)</p>
                <p>
                  Open <strong>Storage</strong> tab, select <strong>Cookies</strong>, choose the
                  site, then copy <code class="gs-code-inline">ltoken_v2</code>.
                </p>
              </div>

              <figure class="gs-figure">
                <Image
                  src="/docs/getting-started/cookies-firefox-devtools.webp"
                  alt="Firefox developer tools cookies panel"
                  preview
                  class="gs-image"
                  imageClass="w-full h-auto block"
                >
                  <template #previewicon><i class="pi pi-search"></i></template>
                </Image>
                <figcaption class="gs-figcap">
                  Developer console for Firefox-based browser.
                </figcaption>
              </figure>

              <div class="gs-step-btns">
                <Button
                  size="small"
                  label="Back"
                  severity="secondary"
                  @click="activateCallback('2')"
                />
                <Button size="small" label="Next" @click="activateCallback('4')" />
              </div>
            </div>
          </StepPanel>
        </StepItem>
        <StepItem value="4">
          <Step value="4">Provide Cookie</Step>
          <StepPanel v-slot="{ activateCallback }" value="4">
            <div class="gs-step">
              <p>
                Paste the copied value into the cookie input. Your cookie should begin with
                <code class="gs-code-inline">v2_C...</code>.
              </p>
              <Button
                size="small"
                label="Back"
                severity="secondary"
                @click="activateCallback('3')"
              />
            </div>
          </StepPanel>
        </StepItem>
      </Stepper>

      <div class="gs-divider"></div>

      <!-- Passphrase -->
      <h3 class="gs-section-title">Passphrase</h3>

      <p class="gs-text">
        To protect stored cookies, Mehrak requires a passphrase that is used to encrypt your cookie
        in the database. A passphrase should be easy for humans to remember, but difficult for
        machines to crack.
      </p>

      <div class="gs-tip">
        <p class="gs-tip-title">Recommended passphrase practices:</p>
        <ul class="gs-list">
          <li>
            Choose a sentence you can remember, such as a quote from a movie, book, or game
            character.
          </li>
          <li>Use a long sentence, ideally at least 20 characters.</li>
          <li>Do not reuse passphrases from other services or profiles.</li>
        </ul>
      </div>

      <p class="gs-text">
        The passphrase is used verbatim for encryption, including leading or trailing spaces, line
        breaks, and paragraph breaks.
      </p>
      <p class="gs-text">
        Mehrak does not store passphrases in the database. Your passphrase is required for commands
        that use HoYoLAB cookies. For convenience, after authentication, decrypted cookies are
        cached for 5 minutes before active eviction, allowing additional commands without
        re-entering the passphrase.
      </p>
    </section>
  </div>
</template>

<style scoped>
.gs {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.gs-hero {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--border-primary);
}

.gs-hero-icon {
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

.gs-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: var(--text-primary);
  margin: 0 0 0.25rem 0;
  letter-spacing: -0.025em;
}

.gs-sub {
  font-size: 0.875rem;
  color: var(--text-secondary);
  margin: 0;
  line-height: 1.5;
}

.gs-card {
  background: var(--card-surface);
  border: 1px solid var(--border-primary);
  border-radius: 0.75rem;
  padding: 1.5rem;
}

.gs-card-head {
  display: flex;
  align-items: flex-start;
  gap: 0.875rem;
  margin-bottom: 1.25rem;
}

.gs-step-num {
  width: 2rem;
  height: 2rem;
  display: grid;
  place-items: center;
  border-radius: 0.5rem;
  background: rgba(34, 197, 94, 0.1);
  color: var(--accent);
  font-size: 0.8125rem;
  font-weight: 700;
  flex-shrink: 0;
}

.gs-card-title {
  font-size: 1.125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.125rem 0;
}

.gs-card-sub {
  font-size: 0.8125rem;
  color: var(--text-muted);
  margin: 0;
}

.gs-text {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.7;
  margin: 0 0 0.75rem 0;
}

.gs-text:last-child {
  margin-bottom: 0;
}

.gs-msg {
  margin: 0 0 1rem 0;
}

.gs-link {
  color: var(--accent);
  text-decoration: none;
  transition: color 0.1s ease;
}

.gs-link:hover {
  color: var(--accent-strong);
}

.gs-code-inline {
  background: var(--code-bg);
  padding: 0.0625rem 0.3125rem;
  border-radius: 0.1875rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.8125em;
  color: var(--text-primary);
}

.gs-code-block {
  padding: 0.875rem 1rem;
  background: var(--code-bg);
  border: 1px solid var(--border-primary);
  border-radius: 0.5rem;
  font-family: ui-monospace, SFMono-Regular, "SF Mono", Menlo, Consolas, monospace;
  font-size: 0.8125rem;
  color: var(--accent);
  overflow-x: auto;
  margin: 0 0 0.75rem 0;
}

.gs-list {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  margin: 0 0 0.75rem 0;
  padding-left: 1.25rem;
  line-height: 1.7;
}

.gs-list li {
  margin-bottom: 0.25rem;
}

.gs-list li:last-child {
  margin-bottom: 0;
}

.gs-divider {
  height: 1px;
  background: var(--border-primary);
  margin: 1.25rem 0;
}

.gs-section-title {
  font-size: 0.9375rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 1rem 0;
}

.gs-step {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 0.25rem 0;
}

.gs-step p {
  color: var(--text-secondary);
  font-size: 0.8125rem;
  line-height: 1.65;
  margin: 0;
}

.gs-step-btns {
  display: flex;
  gap: 0.5rem;
  margin-top: 0.25rem;
}

.gs-step-btns :deep(.p-button) {
  flex: 1;
}

.gs-figure {
  margin: 0;
}

.gs-image {
  border-radius: 0.5rem;
  border: 1px solid var(--border-primary);
  overflow: hidden;
  background: var(--bg-surface);
}

.gs-figcap {
  font-size: 0.75rem;
  color: var(--text-muted);
  margin-top: 0.375rem;
}

.gs-browser-block {
  padding: 0.875rem 1rem;
  background: var(--bg-surface);
  border-radius: 0.5rem;
  border: 1px solid var(--border-primary);
}

.gs-browser-label {
  font-size: 0.75rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.375rem 0;
}

.gs-browser-block p:last-child {
  margin-bottom: 0;
}

.gs-tip {
  padding: 1rem 1.25rem;
  background: rgba(34, 197, 94, 0.05);
  border: 1px solid rgba(34, 197, 94, 0.15);
  border-radius: 0.5rem;
  margin: 0 0 0.75rem 0;
}

.gs-tip-title {
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--text-primary);
  margin: 0 0 0.5rem 0;
}

:deep(.p-steppanel) {
  padding-left: 0.5rem;
}

:deep(.p-stepitem) {
  padding-bottom: 0.5rem;
}
</style>
