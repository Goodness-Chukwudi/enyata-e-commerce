import sgMail from "@sendgrid/mail";
import { ENVIRONMENTS } from "../constants/app_constants";
import Env from "../configs/environment_config";

class EmailService {

  constructor() {
    sgMail.setApiKey(Env.SENDGRID_API_KEY);
  }
    
  sendCode(recipient: string, subject: string, htmlTemplate: string) {

        const emailDetails = {
          to: recipient,
          from: Env.SENDGRID_SENDER_EMAIL,
          subject: subject,
          html: htmlTemplate
        }

        return new Promise((resolve, reject) => {
          if (Env.ENVIRONMENT == ENVIRONMENTS.DEV) {
            resolve(true)
          } else {

            sgMail.send(emailDetails)
            .then((response) => {
              if (response[0].statusCode = 202) {
                resolve(response)
              }
            })
            .catch((e) => {
              const error = new Error(e.response.body.errors[0].message)
              reject(error);
            })
          }
      });
  }

}

export interface MultipleCodesEmailData {
  recipient: string,
  subject: string,
  htmlTemplate: string
}


export default EmailService;