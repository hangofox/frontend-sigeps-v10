import { EmailsI } from "../correos-electronicos/emails.interface";

export interface ResponseEmailDTO{
    emailDTO: EmailsI;
    mensaje: string;
}