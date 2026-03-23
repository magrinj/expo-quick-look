import clsx from "clsx";
import Link from "@docusaurus/Link";
import useDocusaurusContext from "@docusaurus/useDocusaurusContext";
import Layout from "@theme/Layout";
import styles from "./index.module.css";

const features = [
  {
    title: "QuickLook on iOS",
    description:
      "In-app modal preview with QLPreviewController. Supports markup, editing, and multi-file swipe navigation.",
  },
  {
    title: "Intent Chooser on Android",
    description:
      "Launches the system file viewer via ACTION_VIEW Intent. Works with any app that handles the file type.",
  },
  {
    title: "Remote Files + Auth",
    description:
      "Download and preview remote files with custom headers. Supports Bearer tokens and API endpoints.",
  },
];

function Hero() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <header className={clsx("heroBanner", styles.hero)}>
      <div className="container">
        <h1 className="hero__title">{siteConfig.title}</h1>
        <p className="hero__subtitle">{siteConfig.tagline}</p>
        <div className={styles.installCommand}>
          <code>npx expo install @magrinj/expo-quick-look</code>
        </div>
        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/getting-started"
          >
            Get Started
          </Link>
          <Link className="button button--secondary button--lg" to="/docs/api">
            API Reference
          </Link>
        </div>
      </div>
    </header>
  );
}

function Features() {
  return (
    <section className={styles.features}>
      <div className="container">
        <div className="row">
          {features.map((feature, idx) => (
            <div key={idx} className={clsx("col col--4")}>
              <div className="text--center padding-horiz--md padding-vert--lg">
                <h3>{feature.title}</h3>
                <p>{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DemoVideos() {
  return (
    <section className={styles.demos}>
      <div className="container">
        <h2 className="text--center margin-bottom--lg">See it in action</h2>
        <div className={styles.videoGrid}>
          <div className={styles.videoItem}>
            <h4>iOS</h4>
            <video
              src="https://github.com/user-attachments/assets/dea18630-4d38-425c-8839-73c46b2cbdfe"
              width={300}
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
          <div className={styles.videoItem}>
            <h4>Android</h4>
            <video
              src="https://github.com/user-attachments/assets/25238d03-597d-4609-aff7-a691e2a2714c"
              width={300}
              autoPlay
              loop
              muted
              playsInline
            />
          </div>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const { siteConfig } = useDocusaurusContext();
  return (
    <Layout title={siteConfig.title} description={siteConfig.tagline}>
      <Hero />
      <main>
        <Features />
        <DemoVideos />
      </main>
    </Layout>
  );
}
