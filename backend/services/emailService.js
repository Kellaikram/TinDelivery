const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendTrackingEmail = async (to, codeSuivi) => {
  try {
    const info = await transporter.sendMail({
      from: `"TinDelivery" <${process.env.EMAIL_USER}>`,
      to,
      subject: "Suivi de votre colis",
    html: `
<div style="margin:0; padding:0; background:#F6FAFF; font-family:Arial, sans-serif;">

  <table width="100%" cellpadding="0" cellspacing="0" style="background:#F6FAFF; padding:20px 0;">
    <tr>
      <td align="center">

        <!-- CONTAINER -->
        <table width="600" cellpadding="0" cellspacing="0" style="background:#FFFFFF; border-radius:10px; overflow:hidden;">

          <!-- HEADER -->
          <tr>
            <td style="background:#004D6B; padding:25px; text-align:center;">
              <h2 style="color:#FFFFFF; margin:0;">📦 TinDelivery</h2>
              <p style="color:#EBF2FA; margin:5px 0;">Suivi de votre colis</p>
            </td>
          </tr>

          <!-- BODY -->
          <tr>
            <td style="padding:30px; color:#333;">

              <h3 style="margin-top:0;">Bienvenue !</h3>

              <p>
                Votre colis a été créé avec succès.<br>
                Nous sommes ravis de vous accompagner dans votre livraison.
              </p>

              <p>
                Voici votre <strong>code de suivi</strong> :
              </p>

              <!-- CODE -->
              <div style="background:#EBF2FA; padding:20px; border-radius:8px; text-align:center; margin:20px 0;">
                <span style="font-size:20px; font-weight:bold; color:#06668C; letter-spacing:2px;">
                  ${codeSuivi}
                </span>
              </div>

              <p>
                Utilisez ce code pour suivre votre colis à tout moment.
              </p>

              <!-- BUTTON -->
              <div style="text-align:center; margin:30px 0;">
                <a href="#" style="
                  background:#06668C;
                  color:#FFFFFF;
                  padding:12px 25px;
                  text-decoration:none;
                  border-radius:5px;
                  font-size:14px;
                ">
                  Suivre mon colis
                </a>
              </div>

              <p>
                Merci pour votre confiance.
              </p>

            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td style="background:#F6FAFF; padding:15px; text-align:center; font-size:12px; color:#777;">
              © 2026 TinDelivery - Tous droits réservés
            </td>
          </tr>

        </table>

      </td>
    </tr>
  </table>

</div>
`,
    });

    return { success: true};

  } catch (error) {
    return { success: false, error: error.message };
  }
};

module.exports = { sendTrackingEmail };