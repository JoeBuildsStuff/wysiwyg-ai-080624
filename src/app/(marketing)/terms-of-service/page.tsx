import { TipTapEditor } from "@/components/TipTapEditor/TipTapEditor";

const content = `
<h1 id="terms-of-service-for-wysiwyg-ai">Terms of Service for WYSIWYG-AI</h1>
<p>Effective Date: August 1, 2024</p>
<h2 id="1-acceptance-of-terms">1. Acceptance of Terms</h2>
<p>By accessing or using the WYSIWYG-AI application (&quot;the Service&quot;), you agree to be bound by these Terms of Service (&quot;Terms&quot;). If you disagree with any part of the terms, you may not access the Service.</p>
<h2 id="2-description-of-service">2. Description of Service</h2>
<p>WYSIWYG-AI is a rich text editor application that allows users to create, edit, and format text content.</p>
<h2 id="3-user-accounts">3. User Accounts</h2>
<p>3.1. You may be required to create an account to use certain features of the Service. You are responsible for maintaining the confidentiality of your account and password.</p>
<p>3.2. You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate, current, and complete.</p>
<h2 id="4-user-content">4. User Content</h2>
<p>4.1. You retain all rights to any content you submit, post, or display on or through the Service (&quot;User Content&quot;).</p>
<p>4.2. By posting User Content, you grant us a worldwide, non-exclusive, royalty-free license to use, reproduce, modify, adapt, publish, translate, and distribute your User Content in any existing or future media.</p>
<p>4.3. You represent and warrant that you own or have the necessary rights to post the User Content and that it does not violate any third party&#39;s intellectual property or other rights.</p>
<h2 id="5-acceptable-use">5. Acceptable Use</h2>
<p>You agree not to use the Service to:</p>
<p>5.1. Violate any applicable laws or regulations.</p>
<p>5.2. Infringe upon the rights of others.</p>
<p>5.3. Transmit any material that is unlawful, harmful, threatening, abusive, harassing, defamatory, vulgar, obscene, or otherwise objectionable.</p>
<p>5.4. Attempt to gain unauthorized access to any portion of the Service or any other systems or networks connected to the Service.</p>
<h2 id="6-intellectual-property">6. Intellectual Property</h2>
<p>6.1. The Service and its original content (excluding User Content), features, and functionality are and will remain the exclusive property of [Your Company Name] and its licensors.</p>
<p>6.2. Our trademarks and trade dress may not be used in connection with any product or service without the prior written consent of [Your Company Name].</p>
<h2 id="7-termination">7. Termination</h2>
<p>We may terminate or suspend your account and bar access to the Service immediately, without prior notice or liability, under our sole discretion, for any reason whatsoever, including but not limited to a breach of the Terms.</p>
<h2 id="8-limitation-of-liability">8. Limitation of Liability</h2>
<p>In no event shall [Your Company Name], nor its directors, employees, partners, agents, suppliers, or affiliates, be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses, resulting from your access to or use of or inability to access or use the Service.</p>
<h2 id="9-disclaimer">9. Disclaimer</h2>
<p>Your use of the Service is at your sole risk. The Service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis. The Service is provided without warranties of any kind, whether express or implied.</p>
<h2 id="10-governing-law">10. Governing Law</h2>
<p>These Terms shall be governed and construed in accordance with the laws of [Your Country/State], without regard to its conflict of law provisions.</p>
<h2 id="11-changes-to-terms">11. Changes to Terms</h2>
<p>We reserve the right to modify or replace these Terms at any time. It is your responsibility to review these Terms periodically for changes. Your continued use of the Service following the posting of any changes to these Terms constitutes acceptance of those changes.</p>
<h2 id="12-contact-us">12. Contact Us</h2>
<p>If you have any questions about these Terms, please contact us.</p>

`;

export default function TermsOfService() {
  return <TipTapEditor initialDocumentContent={content} />;
}
