import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";

const content = `<h1 id="privacy-policy-for-wysiwyg-ai">Privacy Policy for WYSIWYG-AI</h1>
<p>Effective Date: August 1, 2024</p>
<h2 id="1-introduction">1. Introduction</h2>
<p>Welcome to WYSIWYG-AI. We are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our WYSIWYG-AI application.</p>
<h2 id="2-information-we-collect">2. Information We Collect</h2>
<p>We collect the following types of information:</p>
<ul>
<li><strong>Content</strong>: The text and formatting you input into the editor.</li>
<li><strong>Usage Data</strong>: Information on how you use the application, including features used and time spent.</li>
<li><strong>Device Information</strong>: Information about the device you use to access the application.</li>
</ul>
<h2 id="3-how-we-use-your-information">3. How We Use Your Information</h2>
<p>We use your information to:</p>
<ul>
<li>Provide and maintain the WYSIWYG-AI service.</li>
<li>Improve and optimize our application.</li>
<li>Respond to your requests or inquiries.</li>
<li>Analyze usage patterns to enhance user experience.</li>
</ul>
<h2 id="4-data-storage-and-security">4. Data Storage and Security</h2>
<p>Your data is stored securely on our servers. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.</p>
<h2 id="5-data-sharing-and-disclosure">5. Data Sharing and Disclosure</h2>
<p>We do not sell your personal information. We may share your information in the following situations:</p>
<ul>
<li>With your consent.</li>
<li>To comply with legal obligations.</li>
<li>To protect our rights, privacy, safety, or property.</li>
</ul>
<h2 id="6-your-rights">6. Your Rights</h2>
<p>Depending on your location, you may have the right to:</p>
<ul>
<li>Access the personal information we have about you.</li>
<li>Correct inaccurate information.</li>
<li>Request deletion of your information.</li>
<li>Object to our use of your information.</li>
</ul>
<h2 id="7-third-party-links-and-services">7. Third-Party Links and Services</h2>
<p>Our application may contain links to third-party websites or services. We are not responsible for the privacy practices of these third parties.</p>
<h2 id="8-changes-to-this-privacy-policy">8. Changes to This Privacy Policy</h2>
<p>We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page.</p>
<h2 id="9-contact-us">9. Contact Us</h2>
<p>If you have any questions about this Privacy Policy, please contact us.</p>
`;

export default function PrivacyPolicy() {
  return <TipTapEditor initialContent={content} />;
}
