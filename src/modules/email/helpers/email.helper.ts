export class EmailHelper {
  /**
   * Genera el contenido HTML para el correo de verificación de usuario.
   * @remarks
   * Este método crea una plantilla HTML simple para el correo electrónico de verificación de usuario.
   * @param firstName
   * @param passwordCreationLink
   * @returns
   */
  public static createUserVerificationTemplate(
    firstName: string,
    link: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style type="text/css">
              @font-face {
                  font-family: 'Gilroy';
                  src: url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Extrabold.eot');
                  src: local('Gilroy Extrabold'), local('Gilroy-Extrabold'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Extrabold.eot?#iefix') format('embedded-opentype'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Extrabold.woff') format('woff'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Extrabold.ttf') format('truetype');
                  font-weight: 600;
                  font-style: normal;
              }
      
              @font-face {
                  font-family: 'Gilroy';
                  src: url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Light.eot');
                  src: local('Gilroy Light'), local('Gilroy-Light'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Light.eot?#iefix') format('embedded-opentype'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Light.woff') format('woff'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Light.ttf') format('truetype');
                  font-weight: 400;
                  font-style: normal;
              }
      
              body {
                  font-family: 'Gilroy', sans-serif;
              }
          </style>
      </head>
      
      <body style="margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: none; -webkit-font-smoothing: antialiased;">
          <table width="100%" bgcolor="#FFFFFF" border="0" cellspacing="0" cellpadding="0" id="background" style="height: 100% !important; margin: 0; padding: 0; width: 100% !important; max-width: 700px;">
              <tr>
                  <td align="center" valign="top">
                      <table width="100%" border="0" bgcolor="#8056B0" cellspacing="0" cellpadding="20" id="preheader">
                          <tr>
                              <td valign="top">
                                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tr>
                                          <td valign="top" width="600">
                                              <div>
                                                  <a style="width: 30%; padding: 0;">
                                                      <img width="160" src="https://eqwedi-api-auth-bucket.s3.us-east-2.amazonaws.com/auth/correo/img/dinelco.png" alt="Logo de Dinelco">
                                                  </a>
                                              </div>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                      <table width="600" border="0" cellspacing="0" cellpadding="20" id="body_container">
                          <tr>
                              <td align="center" valign="top" class="body_content">
                                  <table width="100%" border="0" cellspacing="0" cellpadding="20">
                                      <tr>
                                          <td valign="top">
                                              <h2 style="color: #5F5D5D; font-size: 22px; text-align: left;">¡Hola, ${firstName}!</h2>
                                              <h3 style="color: #5F5D5D; font-size: 18px; text-align: left;">Te invitamos a activar tu cuenta.</h3>
                                              <p style="color: #5F5D5D; font-size: 14px; line-height: 22px; text-align: left;">
                                                  <strong>Haz clic en el botón a continuación para verificar tu correo.</strong> De esta manera, el proceso de registro se completará y podrás acceder al sistema. Por motivos de seguridad, este enlace tendrá una vigencia de 24hs.
                                              </p>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td align="center">
                                              <table>
                                                  <tr>
                                                      <td align="center" style="border-radius: 25px; background-color: #9B0042;">
                                                          <a href="${link}" style="background-color:#9B0042;border-radius:25px;color:#FFFFFF;display:inline-block;font-family:'Gilroy Black';font-size:18px;height:45px;line-height:45px;text-align:center;text-decoration:none;width:200px;-webkit-text-size-adjust:none;">
                                                              Verificar correo
                                                          </a>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                      <table width="100%" border="0" bgcolor="#F4F3F3" cellspacing="0" cellpadding="20" id="body_info_container">
                          <tr>
                              <td align="center" valign="top" class="body_info_content">
                                  <table width="100%" border="0" cellspacing="0" cellpadding="10">
                                      <tr>
                                          <td valign="top">
                                              <p style="color: #5F5D5D; font-size: 12px; line-height: 22px;">Este mensaje ha sido generado de forma automática; favor no respondas el mismo, ya que esta dirección no acepta correos electrónicos, por lo que no recibirás una respuesta. <strong>Si requerís asistencia, comunicate al CAC (Centro de Atención al Cliente) 021 620 6000.</strong></p>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      
      </html>
    `;
  }

  /**
   * Genera el contenido HTML para el correo de olvide mi contraseña.
   * @remarks
   * Este método crea una plantilla HTML simple para el correo electrónico de olvide mi contraseña.
   * @param firstName
   * @param passwordCreationLink
   * @returns
   */
  public static createUserForgotPasswordTemplate(
    firstName: string,
    link: string,
  ): string {
    return `
      <!DOCTYPE html>
      <html>
      
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style type="text/css">
              @font-face {
                  font-family: 'Gilroy';
                  src: url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Extrabold.eot');
                  src: local('Gilroy Extrabold'), local('Gilroy-Extrabold'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Extrabold.eot?#iefix') format('embedded-opentype'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Extrabold.woff') format('woff'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Extrabold.ttf') format('truetype');
                  font-weight: 600;
                  font-style: normal;
              }
      
              @font-face {
                  font-family: 'Gilroy';
                  src: url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Light.eot');
                  src: local('Gilroy Light'), local('Gilroy-Light'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Light.eot?#iefix') format('embedded-opentype'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Light.woff') format('woff'),
                  url('https://cdn.jsdelivr.net/gh/repalash/gilroy-free-webfont@fonts/Gilroy-Light.ttf') format('truetype');
                  font-weight: 400;
                  font-style: normal;
              }
      
              body {
                  font-family: 'Gilroy', sans-serif;
              }
          </style>
      </head>
      
      <body style="margin: 0; padding: 0; width: 100%; -webkit-text-size-adjust: none; -webkit-font-smoothing: antialiased;">
          <table width="100%" bgcolor="#FFFFFF" border="0" cellspacing="0" cellpadding="0" id="background" style="height: 100% !important; margin: 0; padding: 0; width: 100% !important; max-width: 700px;">
              <tr>
                  <td align="center" valign="top">
                      <!-- HEADER/PREHEADER -->
                      <table width="100%" border="0" bgcolor="#8056B0" cellspacing="0" cellpadding="20" id="preheader">
                          <tr>
                              <td valign="top">
                                  <table width="100%" border="0" cellspacing="0" cellpadding="0">
                                      <tr>
                                          <td valign="top" width="600">
                                              <div>
                                                  <a style="width: 30%; padding: 0;">
                                                      <!-- LOGO - Mantengo tu URL de S3, reemplázala si es necesario -->
                                                      <img width="160" src="https://eqwedi-api-auth-bucket.s3.us-east-2.amazonaws.com/auth/correo/img/dinelco.png" alt="Logo de Dinelco">
                                                  </a>
                                              </div>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                      
                      <!-- CUERPO DEL CORREO -->
                      <table width="600" border="0" cellspacing="0" cellpadding="20" id="body_container">
                          <tr>
                              <td align="center" valign="top" class="body_content">
                                  <table width="100%" border="0" cellspacing="0" cellpadding="20">
                                      <tr>
                                          <td valign="top">
                                              <h2 style="color: #5F5D5D; font-size: 22px; text-align: left;">¡Hola, ${firstName}!</h2>
                                              <h3 style="color: #5F5D5D; font-size: 18px; text-align: left;">Solicitaste restablecer tu contraseña.</h3>
                                              <p style="color: #5F5D5D; font-size: 14px; line-height: 22px; text-align: left;">
                                                  Recibimos una solicitud para <strong>restablecer la contraseña</strong> de tu cuenta. Si no hiciste esta solicitud, puedes ignorar este correo.
                                                  <br><br>
                                                  Para crear una nueva contraseña, <strong>haz clic en el botón a continuación.</strong> Por motivos de seguridad, este enlace es temporal y tendrá una vigencia de 24 horas.
                                              </p>
                                          </td>
                                      </tr>
                                      <tr>
                                          <td align="center">
                                              <table>
                                                  <tr>
                                                      <td align="center" style="border-radius: 25px; background-color: #9B0042;">
                                                          <a href="${link}" style="background-color:#9B0042;border-radius:25px;color:#FFFFFF;display:inline-block;font-family:'Gilroy Black';font-size:18px;height:45px;line-height:45px;text-align:center;text-decoration:none;width:250px;-webkit-text-size-adjust:none;">
                                                              Restablecer Contraseña
                                                          </a>
                                                      </td>
                                                  </tr>
                                              </table>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>

                      <!-- FOOTER / INFORMACIÓN LEGAL -->
                      <table width="100%" border="0" bgcolor="#F4F3F3" cellspacing="0" cellpadding="20" id="body_info_container">
                          <tr>
                              <td align="center" valign="top" class="body_info_content">
                                  <table width="100%" border="0" cellspacing="0" cellpadding="10">
                                      <tr>
                                          <td valign="top">
                                              <p style="color: #5F5D5D; font-size: 12px; line-height: 22px;">Este mensaje ha sido generado de forma automática; favor no respondas el mismo, ya que esta dirección no acepta correos electrónicos, por lo que no recibirás una respuesta. <strong>Si requerís asistencia, comunicate al CAC (Centro de Atención al Cliente) 021 620 6000.</strong></p>
                                          </td>
                                      </tr>
                                  </table>
                              </td>
                          </tr>
                      </table>
                  </td>
              </tr>
          </table>
      </body>
      
      </html>
    `;
  }
}
