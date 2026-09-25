package com.familytree.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.frontend-url}")
    private String frontendUrl;

    @Value("${spring.mail.username}")
    private String senderEmail;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /*
     * ============================================================
     * PASSWORD RESET EMAIL
     * ============================================================
     */

    public void sendPasswordResetEmail(
            String recipientEmail,
            String token) {

        String resetLink =
                frontendUrl
                        + "/reset-password?token="
                        + token;

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(senderEmail);

        message.setTo(recipientEmail);

        message.setSubject(
                "Family Tree Link - Reset Your Password"
        );

        message.setText(
                "Hello,\n\n"
                + "We received a request to reset your "
                + "Family Tree Link password.\n\n"
                + "Click the link below to create a new password:\n\n"
                + resetLink
                + "\n\n"
                + "This link will expire in 15 minutes.\n\n"
                + "If you did not request a password reset, "
                + "you can safely ignore this email.\n\n"
                + "Regards,\n"
                + "Family Tree Link"
        );

        mailSender.send(message);
    }

    /*
     * ============================================================
     * FAMILY INVITATION EMAIL
     * ============================================================
     */

    public void sendFamilyInvitationEmail(
            String recipientEmail,
            String familyName,
            String inviterName,
            String token) {

        String invitationLink =
                frontendUrl
                        + "/family-invitation?token="
                        + token;

        SimpleMailMessage message =
                new SimpleMailMessage();

        message.setFrom(senderEmail);

        message.setTo(recipientEmail);

        message.setSubject(
                "Family Tree Link - You Have Been Invited!"
        );

        message.setText(
                "Hello,\n\n"

                + inviterName
                + " has invited you to join the family:\n\n"

                + familyName
                + "\n\n"

                + "You can join the family and become "
                + "part of their family tree using the "
                + "link below:\n\n"

                + invitationLink
                + "\n\n"

                + "This invitation will expire in 7 days.\n\n"

                + "If you were not expecting this invitation, "
                + "you can safely ignore this email.\n\n"

                + "Regards,\n"
                + "Family Tree Link"
        );

        mailSender.send(message);
    }
}