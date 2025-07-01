// emails/InvitationEmail.tsx
import {
  Html,
  Head,
  Preview,
  Heading,
  Text,
  Button,
  Section,
  Container,
} from '@react-email/components';

type Props = {
  firstName: string;
  lastName: string;
  email: string;
  universityRole: string;
  departmentName?: string;
  courseName?: string;
  universityId: string;
  inviteLink: string;
  invitedBy: string;
};

export default function InvitationEmail({
  firstName,
  lastName,
  email,
  universityRole,
  departmentName,
  courseName,
  universityId,
  inviteLink,
  invitedBy,
}: Props) {
  return (
    <Html>
      <Head />
      <Preview>You&apos;re invited to Exam Portal as a {universityRole}</Preview>

      <Section style={{ backgroundColor: '#f9fafb', padding: '30px 0' }}>
        <Container style={{ backgroundColor: '#ffffff', padding: '40px', borderRadius: '8px', maxWidth: '600px' }}>
          <Heading style={{ color: '#1e293b', fontSize: '24px' }}>
            Hello {firstName} {lastName},
          </Heading>

          <Text style={{ fontSize: '16px', color: '#475569' }}>
            You’ve been invited by <strong>{invitedBy}</strong> to join the <strong>Exam Portal</strong> as a <strong>{universityRole}</strong>.
          </Text>

          <Text style={{ fontSize: '16px', color: '#475569' }}>
            <strong>Email:</strong> {email} <br />
            <strong>University ID:</strong> {universityId} <br />
            {departmentName && <><strong>Department:</strong> {departmentName} <br /></>}
            {courseName && <><strong>Course:</strong> {courseName} <br /></>}
          </Text>

          <Button
            href={inviteLink}
            style={{
              backgroundColor: '#2563eb',
              color: '#fff',
              padding: '12px 20px',
              borderRadius: '6px',
              fontWeight: 600,
              marginTop: '24px',
              display: 'inline-block',
            }}
          >
            Accept Invitation
          </Button>

          <Text style={{ fontSize: '14px', color: '#64748b', marginTop: '20px' }}>
            If the button above doesn&apos;t work, copy and paste this link into your browser:
            <br />
            <a href={inviteLink} style={{ color: '#2563eb' }}>{inviteLink}</a>
          </Text>

          <Text style={{ fontSize: '12px', color: '#94a3b8', marginTop: '32px' }}>
            This invitation is only valid for the intended recipient. If you received this email by mistake, please ignore it.
          </Text>
        </Container>
      </Section>
    </Html>
  );
}
