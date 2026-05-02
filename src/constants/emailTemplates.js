export const EMAIL_NOTIFY_MOTHER = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>New Message from LavenderCare</title>
    <style>
        body { font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #333; line-height: 1.6; margin: 0; padding: 0; background-color: #f9f9f9; }
        .container { max-width: 600px; margin: 40px auto; padding: 40px; background-color: #ffffff; border-radius: 16px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); }
        .header { text-align: center; margin-bottom: 32px; }
        .logo { max-width: 150px; height: auto; }
        .content { margin-bottom: 32px; text-align: center; }
        .title { color: #6F3DCB; font-size: 24px; font-weight: 700; margin-bottom: 16px; }
        .message { font-size: 16px; color: #555; margin-bottom: 32px; }
        .button { display: inline-block; padding: 14px 28px; background-color: #6F3DCB; color: #ffffff !important; text-decoration: none; border-radius: 12px; font-weight: 600; font-size: 16px; transition: background-color 0.2s; }
        .footer { font-size: 13px; color: #999; text-align: center; margin-top: 48px; border-top: 1px solid #eee; padding-top: 24px; }
        .accent { color: #6F3DCB; font-weight: 600; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <img src="{{logoUrl}}" alt="LavenderCare" class="logo">
        </div>
        <div class="content">
            <h1 class="title">Chat Invitation</h1>
            <p class="message">
                Hello <span class="accent">{{name}}</span>,<br><br>
                A care-coordinator from <span class="accent">LavenderCare</span> wants to chat with you regarding your healthcare journey.
            </p>
            <div style="text-align: center; margin-top: 32px;">
                <a href="https://lavendercare.co/app" class="button">Open LavenderCare App</a>
            </div>
        </div>
        <div class="footer">
            &copy; 2026 LavenderCare Healthcare. All rights reserved.<br>
            If you have any questions, feel free to contact our support team.<br><br>
            <span style="font-style: italic;">Empowering every mother's journey.</span>
        </div>
    </div>
</body>
</html>
`
