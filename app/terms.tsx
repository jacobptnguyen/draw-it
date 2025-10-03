import React, { useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Platform,
  useColorScheme,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { ChevronLeft } from 'lucide-react-native';
import { StatusBar } from 'expo-status-bar';

export default function TermsOfServiceScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === 'dark';
  const styles = createStyles(isDark);
  const isWeb = Platform.OS === 'web';

  useEffect(() => {
    if (isWeb && typeof document !== 'undefined') {
      document.body.style.backgroundColor = isDark ? '#121212' : '#F9FAFB';
    }
  }, [isDark, isWeb]);

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <StatusBar style={isDark ? 'light' : 'dark'} />
      
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <ChevronLeft size={24} color={isDark ? '#E5E7EB' : '#111827'} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Terms of Service</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.effectiveDate}>
          Effective Date: October 3, 2025
        </Text>

        <Text style={styles.paragraph}>
          Welcome to Draw It! These Terms of Service ("Terms") govern your use of the Draw It! application ("App," "Service," "we," "our," or "us"). By accessing or using our App, you agree to be bound by these Terms.
        </Text>

        <Text style={styles.sectionTitle}>1. Acceptance of Terms</Text>
        <Text style={styles.paragraph}>
          By creating an account, using guest access, or otherwise accessing Draw It!, you acknowledge that you have read, understood, and agree to be bound by these Terms and our Privacy Policy. If you do not agree, please do not use our Service.
        </Text>

        <Text style={styles.sectionTitle}>2. Age Requirements and Parental Consent</Text>
        
        <Text style={styles.subsectionTitle}>2.1 Minimum Age</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>You must be at least 13 years old to use Draw It!</Text> By using this Service, you represent and warrant that you are at least 13 years of age.
        </Text>
        
        <Text style={styles.subsectionTitle}>2.2 Users Under 18</Text>
        <Text style={styles.paragraph}>
          If you are between 13 and 17 years old (a "Minor"), you must have permission from your parent or legal guardian to use this Service. By using Draw It! as a Minor, you represent that:
        </Text>
        <Text style={styles.bulletPoint}>• Your parent or legal guardian has reviewed and agreed to these Terms</Text>
        <Text style={styles.bulletPoint}>• Your parent or legal guardian has reviewed our Privacy Policy</Text>
        <Text style={styles.bulletPoint}>• You have obtained parental or guardian permission to use the Service</Text>
        <Text style={styles.bulletPoint}>• You have parental consent to upload images and interact with AI features</Text>
        
        <Text style={styles.subsectionTitle}>2.3 Users 18 and Over</Text>
        <Text style={styles.paragraph}>
          If you are 18 years or older, you may use the Service independently without parental consent.
        </Text>
        
        <Text style={styles.subsectionTitle}>2.4 Parental Responsibility</Text>
        <Text style={styles.paragraph}>
          Parents and legal guardians are responsible for monitoring their children's use of the Service. We recommend that parents actively supervise minors' use of AI features and content uploads. Parents should review uploaded content and AI interactions to ensure appropriate use.
        </Text>
        
        <Text style={styles.subsectionTitle}>2.5 Termination for Age Misrepresentation</Text>
        <Text style={styles.paragraph}>
          If we discover that a user is under 13 years old, or that a Minor is using the Service without parental consent, we reserve the right to immediately terminate the account without notice.
        </Text>

        <Text style={styles.sectionTitle}>3. Description of Service</Text>
        <Text style={styles.paragraph}>
          Draw It! is an AI-powered drawing practice application that provides:
        </Text>
        <Text style={styles.bulletPoint}>• Daily drawing challenges with reference images</Text>
        <Text style={styles.bulletPoint}>• AI coaching and feedback using OpenAI's GPT-4o</Text>
        <Text style={styles.bulletPoint}>• Image generation using DALL-E 3</Text>
        <Text style={styles.bulletPoint}>• Progress tracking, streaks, and achievements</Text>
        <Text style={styles.bulletPoint}>• Drawing storage and chat history</Text>

        <Text style={styles.sectionTitle}>4. User Accounts</Text>
        
        <Text style={styles.subsectionTitle}>4.1 Registration</Text>
        <Text style={styles.paragraph}>
          You may create an account with an email and password, or use guest access. You are responsible for maintaining the confidentiality of your account credentials and for all activities under your account.
        </Text>

        <Text style={styles.subsectionTitle}>4.2 Account Security</Text>
        <Text style={styles.paragraph}>
          You must notify us immediately of any unauthorized access or security breach. We are not liable for any loss or damage arising from your failure to protect your account information.
        </Text>

        <Text style={styles.subsectionTitle}>4.3 Account Termination</Text>
        <Text style={styles.paragraph}>
          You may delete your account at any time through the Settings page. We reserve the right to suspend or terminate accounts that violate these Terms.
        </Text>

        <Text style={styles.sectionTitle}>5. Prohibited Content and User Responsibilities</Text>
        
        <Text style={styles.subsectionTitle}>5.1 Prohibited Content</Text>
        <Text style={styles.paragraph}>
          You agree NOT to upload, create, or request any content that is:
        </Text>
        <Text style={styles.bulletPoint}>• Offensive, abusive, hateful, or discriminatory</Text>
        <Text style={styles.bulletPoint}>• Illegal or promotes illegal activities</Text>
        <Text style={styles.bulletPoint}>• Harmful to minors in any way</Text>
        <Text style={styles.bulletPoint}>• Sexually explicit, pornographic, or obscene</Text>
        <Text style={styles.bulletPoint}>• Violent, threatening, or promotes violence</Text>
        <Text style={styles.bulletPoint}>• Harassing, bullying, or defamatory</Text>
        <Text style={styles.bulletPoint}>• Infringing on intellectual property rights</Text>
        <Text style={styles.bulletPoint}>• Contains malware, viruses, or harmful code</Text>
        <Text style={styles.bulletPoint}>• Spam or unsolicited promotional content</Text>
        <Text style={styles.bulletPoint}>• Impersonates others or misrepresents identity</Text>
        
        <Text style={styles.subsectionTitle}>5.2 User Responsibilities</Text>
        <Text style={styles.paragraph}>
          You are solely responsible for:
        </Text>
        <Text style={styles.bulletPoint}>• All content you upload, including images and text prompts</Text>
        <Text style={styles.bulletPoint}>• Ensuring your uploads comply with these Terms</Text>
        <Text style={styles.bulletPoint}>• Any consequences arising from your content or prompts</Text>
        <Text style={styles.bulletPoint}>• Providing accurate account information</Text>
        <Text style={styles.bulletPoint}>• Using the Service for lawful purposes only</Text>
        <Text style={styles.bulletPoint}>• Not attempting to hack, reverse engineer, or compromise the Service</Text>
        <Text style={styles.bulletPoint}>• Not abusing or overloading our systems</Text>
        <Text style={styles.bulletPoint}>• Respecting intellectual property rights</Text>
        
        <Text style={styles.subsectionTitle}>5.3 Enforcement</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>We reserve the right to:</Text>
        </Text>
        <Text style={styles.bulletPoint}>• Review any content uploaded or generated through the Service</Text>
        <Text style={styles.bulletPoint}>• Remove any content that violates these Terms without notice</Text>
        <Text style={styles.bulletPoint}>• Suspend or ban users who violate these Terms</Text>
        <Text style={styles.bulletPoint}>• Terminate accounts immediately for severe violations</Text>
        <Text style={styles.bulletPoint}>• Report illegal content to appropriate authorities</Text>
        <Text style={styles.bulletPoint}>• Take legal action against users who cause harm or violate laws</Text>
        <Text style={styles.paragraph}>
          Violations of these Terms may result in immediate account termination without refund or compensation.
        </Text>

        <Text style={styles.sectionTitle}>6. AI-Generated Content and Disclaimers</Text>
        
        <Text style={styles.subsectionTitle}>6.1 AI Usage and Limitations</Text>
        <Text style={styles.paragraph}>
          Draw It! uses OpenAI's GPT-4o and DALL-E 3 to provide coaching feedback and generate reference images. <Text style={styles.bold}>IMPORTANT DISCLAIMER:</Text>
        </Text>
        <Text style={styles.bulletPoint}>• AI-generated content may be INACCURATE, INCOMPLETE, or MISLEADING</Text>
        <Text style={styles.bulletPoint}>• AI responses may contain errors, biases, or inappropriate material</Text>
        <Text style={styles.bulletPoint}>• AI feedback should be used as guidance only, not absolute truth or professional advice</Text>
        <Text style={styles.bulletPoint}>• Generated images may not accurately represent the prompts given</Text>
        <Text style={styles.bulletPoint}>• AI systems can "hallucinate" or generate false information</Text>
        <Text style={styles.bulletPoint}>• We do NOT control, verify, or endorse AI-generated outputs</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>USE AT YOUR OWN RISK:</Text> You acknowledge that AI-generated content is provided "as is" and you use it at your own risk. We are not responsible for any decisions, actions, or consequences based on AI-generated content.
        </Text>

        <Text style={styles.subsectionTitle}>6.2 No Liability for AI Outputs</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>WE ARE NOT LIABLE FOR:</Text>
        </Text>
        <Text style={styles.bulletPoint}>• The accuracy, quality, or appropriateness of AI-generated content</Text>
        <Text style={styles.bulletPoint}>• Any harm, offense, or damage caused by AI outputs</Text>
        <Text style={styles.bulletPoint}>• Errors, mistakes, or inaccuracies in AI feedback or images</Text>
        <Text style={styles.bulletPoint}>• Inappropriate, offensive, or harmful AI-generated material</Text>
        <Text style={styles.bulletPoint}>• Any reliance you place on AI-generated content</Text>
        
        <Text style={styles.subsectionTitle}>6.3 Content Restrictions</Text>
        <Text style={styles.paragraph}>
          Our AI systems are configured to avoid generating copyrighted characters, brand logos, trademarks, or celebrity likenesses. Do not request such content. We reserve the right to remove content that violates intellectual property rights or these Terms.
        </Text>

        <Text style={styles.sectionTitle}>7. User Content and Intellectual Property</Text>
        
        <Text style={styles.subsectionTitle}>7.1 Your Content</Text>
        <Text style={styles.paragraph}>
          You retain ownership of drawings, images, and content you upload. By uploading content, you grant us a worldwide, non-exclusive license to store, process, and display your content solely for providing the Service.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>You represent and warrant that:</Text>
        </Text>
        <Text style={styles.bulletPoint}>• You own or have rights to all content you upload</Text>
        <Text style={styles.bulletPoint}>• Your content does not infringe on any third-party rights</Text>
        <Text style={styles.bulletPoint}>• Your content complies with all applicable laws and these Terms</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>WE ARE NOT LIABLE for user-generated content.</Text> You are solely responsible for your uploads and any legal issues arising from them.
        </Text>

        <Text style={styles.subsectionTitle}>7.2 Our Content</Text>
        <Text style={styles.paragraph}>
          The App, including its design, code, features, and branding, is owned by Draw It! and protected by intellectual property laws. You may not copy, modify, or distribute our content without permission.
        </Text>

        <Text style={styles.subsectionTitle}>7.3 AI-Generated Images</Text>
        <Text style={styles.paragraph}>
          Daily challenge images generated by DALL-E 3 are provided for reference and practice. Ownership and usage rights are subject to OpenAI's terms of service.
        </Text>

        <Text style={styles.sectionTitle}>8. Content Moderation</Text>
        <Text style={styles.paragraph}>
          To maintain a safe and lawful service, we implement content moderation:
        </Text>
        
        <Text style={styles.subsectionTitle}>8.1 Moderation Rights</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>We reserve the right to:</Text>
        </Text>
        <Text style={styles.bulletPoint}>• Monitor and review user-generated content and AI interactions</Text>
        <Text style={styles.bulletPoint}>• Use automated systems to detect prohibited content</Text>
        <Text style={styles.bulletPoint}>• Remove any content at our discretion without notice</Text>
        <Text style={styles.bulletPoint}>• Investigate potential violations of these Terms</Text>
        <Text style={styles.bulletPoint}>• Cooperate with law enforcement regarding illegal content</Text>
        
        <Text style={styles.subsectionTitle}>8.2 No Obligation to Monitor</Text>
        <Text style={styles.paragraph}>
          While we reserve the right to moderate content, we are NOT obligated to monitor all user content. We are not responsible for content that violates these Terms that we have not yet reviewed or removed.
        </Text>

        <Text style={styles.sectionTitle}>9. Rate Limits and Usage</Text>
        <Text style={styles.paragraph}>
          To ensure fair usage and manage costs, we implement rate limits:
        </Text>
        <Text style={styles.bulletPoint}>• Daily message limits for AI chat interactions</Text>
        <Text style={styles.bulletPoint}>• Daily challenge refresh limits</Text>
        <Text style={styles.bulletPoint}>• Storage limits for images and drawings</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these limits at any time.
        </Text>

        <Text style={styles.sectionTitle}>10. Third-Party Services</Text>
        <Text style={styles.paragraph}>
          Draw It! integrates with third-party services including OpenAI and Supabase. Your use of these services is also governed by their respective terms:
        </Text>
        <Text style={styles.bulletPoint}>• OpenAI Terms: https://openai.com/policies/terms-of-use</Text>
        <Text style={styles.bulletPoint}>• Supabase Terms: https://supabase.com/terms</Text>

        <Text style={styles.sectionTitle}>11. Disclaimer of Warranties</Text>
        <Text style={styles.paragraph}>
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND, EXPRESS OR IMPLIED. WE DO NOT WARRANT THAT:
        </Text>
        <Text style={styles.bulletPoint}>• The Service will be uninterrupted or error-free</Text>
        <Text style={styles.bulletPoint}>• Defects will be corrected</Text>
        <Text style={styles.bulletPoint}>• The Service is free of viruses or harmful components</Text>
        <Text style={styles.bulletPoint}>• AI-generated content will meet your expectations</Text>

        <Text style={styles.sectionTitle}>12. Limitation of Liability</Text>
        <Text style={styles.paragraph}>
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, WE SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, OR PUNITIVE DAMAGES, INCLUDING LOSS OF DATA, REVENUE, OR PROFITS, ARISING FROM YOUR USE OF THE SERVICE.
        </Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>WE ARE SPECIFICALLY NOT LIABLE FOR:</Text>
        </Text>
        <Text style={styles.bulletPoint}>• AI-generated content, outputs, or advice</Text>
        <Text style={styles.bulletPoint}>• User-generated content uploaded by you or others</Text>
        <Text style={styles.bulletPoint}>• Any inaccurate, inappropriate, or harmful content</Text>
        <Text style={styles.bulletPoint}>• Decisions or actions based on AI feedback</Text>
        <Text style={styles.bulletPoint}>• Third-party services (OpenAI, Supabase)</Text>
        <Text style={styles.bulletPoint}>• Service interruptions, errors, or data loss</Text>
        <Text style={styles.bulletPoint}>• Security breaches or unauthorized access</Text>
        <Text style={styles.paragraph}>
          <Text style={styles.bold}>This is a portfolio project created for educational purposes.</Text> We provide no guarantees regarding service availability, data persistence, or fitness for any particular purpose.
        </Text>

        <Text style={styles.sectionTitle}>13. Indemnification</Text>
        <Text style={styles.paragraph}>
          You agree to indemnify and hold harmless Draw It! from any claims, damages, or expenses arising from your use of the Service, your content, or your violation of these Terms.
        </Text>

        <Text style={styles.sectionTitle}>14. Reporting Violations and Contact</Text>
        <Text style={styles.paragraph}>
          If you encounter content or behavior that violates these Terms, or if you have concerns about the Service, please contact us:
        </Text>
        <Text style={styles.bulletPoint}>• Email: jacobptnguyen@gmail.com</Text>
        <Text style={styles.bulletPoint}>• Subject line: "Terms Violation Report" or "Content Report"</Text>
        <Text style={styles.bulletPoint}>• Include: Description of violation, user/content involved, and screenshots if applicable</Text>
        <Text style={styles.paragraph}>
          We will investigate all reports and take appropriate action. For urgent legal matters, appropriate authorities may be contacted.
        </Text>

        <Text style={styles.sectionTitle}>15. Changes to Terms</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify these Terms at any time. Changes will be effective upon posting with an updated "Effective Date." Your continued use of the Service after changes constitutes acceptance of the modified Terms.
        </Text>

        <Text style={styles.sectionTitle}>16. Changes to Service</Text>
        <Text style={styles.paragraph}>
          We reserve the right to modify, suspend, or discontinue the Service (or any part thereof) at any time, with or without notice, without liability to you.
        </Text>

        <Text style={styles.sectionTitle}>17. Governing Law</Text>
        <Text style={styles.paragraph}>
          These Terms shall be governed by and construed in accordance with applicable laws, without regard to conflict of law provisions.
        </Text>

        <Text style={styles.sectionTitle}>18. Severability</Text>
        <Text style={styles.paragraph}>
          If any provision of these Terms is found to be unenforceable, the remaining provisions will continue in full force and effect.
        </Text>

        <Text style={styles.sectionTitle}>19. Entire Agreement</Text>
        <Text style={styles.paragraph}>
          These Terms, together with our Privacy Policy, constitute the entire agreement between you and Draw It! regarding the Service.
        </Text>

        <Text style={styles.sectionTitle}>20. Contact Information</Text>
        <Text style={styles.paragraph}>
          For questions, concerns, or support regarding these Terms:
        </Text>
        <Text style={styles.bulletPoint}>• Email: jacobptnguyen@gmail.com</Text>
        <Text style={styles.paragraph}>
          We will respond to inquiries within 5-7 business days.
        </Text>

        <Text style={styles.paragraph}>
          <Text style={styles.bold}>By using Draw It!, you acknowledge that you have read, understood, and agree to be bound by these Terms of Service and our Privacy Policy.</Text>
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function createStyles(isDark: boolean) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: isDark ? '#121212' : '#F9FAFB',
      paddingHorizontal: Platform.OS === 'web' ? 40 : 0,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: 20,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderBottomColor: isDark ? '#2C2C2E' : '#E5E7EB',
    },
    backButton: {
      padding: 8,
    },
    headerTitle: {
      fontSize: 18,
      fontWeight: '600',
      color: isDark ? '#E5E7EB' : '#111827',
    },
    headerRight: {
      width: 40,
    },
    scrollView: {
      flex: 1,
    },
    content: {
      paddingHorizontal: 20,
      paddingVertical: 24,
      paddingBottom: 40,
    },
    effectiveDate: {
      fontSize: 14,
      color: isDark ? '#A1A1AA' : '#6B7280',
      fontStyle: 'italic',
      marginBottom: 20,
    },
    sectionTitle: {
      fontSize: 20,
      fontWeight: '700',
      color: isDark ? '#E5E7EB' : '#111827',
      marginTop: 28,
      marginBottom: 12,
    },
    subsectionTitle: {
      fontSize: 16,
      fontWeight: '600',
      color: isDark ? '#E5E7EB' : '#111827',
      marginTop: 16,
      marginBottom: 8,
    },
    paragraph: {
      fontSize: 15,
      lineHeight: 24,
      color: isDark ? '#D1D5DB' : '#374151',
      marginBottom: 16,
    },
    bulletPoint: {
      fontSize: 15,
      lineHeight: 24,
      color: isDark ? '#D1D5DB' : '#374151',
      marginLeft: 12,
      marginBottom: 8,
    },
    bold: {
      fontWeight: '700',
    },
  });
}

