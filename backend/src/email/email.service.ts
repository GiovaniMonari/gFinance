import { Injectable } from '@nestjs/common';
import { Resend } from 'resend';

@Injectable()
export class EmailService {
  private readonly resend: Resend;

  constructor() {
    this.resend = new Resend(process.env.RESEND_API_KEY);
  }

  async sendRecurringExpenseReminder(data: {
    to: string;
    description: string;
    amount: number;
    dueDate: Date;
  }) {
    const formattedDate = data.dueDate.toLocaleDateString('pt-BR');
    const formattedAmount = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(data.amount);

    await this.resend.emails.send({
      from: 'gFinance <onboarding@resend.dev>',
      to: data.to,
      subject: '⚠️ Conta próxima do vencimento - gFinance',
      html: `
        <!DOCTYPE html>
        <html lang="pt-BR">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Lembrete de Vencimento</title>
        </head>
        <body style="margin: 0; padding: 0; background-color: #0F172A; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; color: #F8FAFC;">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0F172A; padding: 40px 10px;">
            <tr>
              <td align="center">
                <!-- Container principal -->
                <table role="presentation" width="100%" style="max-width: 520px; background-color: #1E293B; border-radius: 16px; border: 1px solid #334155; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.5);">
                  
                  <!-- Header com Logo -->
                  <tr>
                    <td style="padding: 32px 32px 16px 32px; border-bottom: 1px solid #334155;">
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td>
                            <span style="font-size: 22px; font-weight: 800; color: #10B981; letter-spacing: -0.5px;">gFinance</span>
                            <span style="font-size: 13px; color: #94A3B8; margin-left: 8px;">| Lembrete Financeiro</span>
                          </td>
                        </tr>
                      </table>
                    </td>
                  </tr>

                  <!-- Conteúdo -->
                  <tr>
                    <td style="padding: 32px;">
                      
                      <!-- Badge Alerta -->
                      <table role="presentation" cellspacing="0" cellpadding="0" style="margin-bottom: 20px;">
                        <tr>
                          <td style="background-color: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 20px; padding: 6px 14px;">
                            <span style="color: #F87171; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.5px;">⏰ Vence em 2 dias</span>
                          </td>
                        </tr>
                      </table>

                      <h1 style="margin: 0 0 12px 0; color: #F8FAFC; font-size: 20px; font-weight: 700;">Conta próxima do vencimento</h1>
                      <p style="margin: 0 0 24px 0; color: #94A3B8; font-size: 14px; line-height: 1.6;">
                        Identificamos que uma despesa recorrente da sua conta cadastrada precisa de atenção nos próximos dias.
                      </p>

                      <!-- Card da Despesa -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color: #0F172A; border-radius: 12px; border: 1px solid #334155; margin-bottom: 28px;">
                        <tr>
                          <td style="padding: 20px;">
                            <p style="margin: 0 0 4px 0; color: #94A3B8; font-size: 12px; font-weight: 500; text-transform: uppercase;">Descrição</p>
                            <p style="margin: 0 0 16px 0; color: #F8FAFC; font-size: 16px; font-weight: 600;">${data.description}</p>
                            
                            <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                              <tr>
                                <td width="50%" style="vertical-align: top;">
                                  <p style="margin: 0 0 4px 0; color: #94A3B8; font-size: 12px; font-weight: 500; text-transform: uppercase;">Vencimento</p>
                                  <p style="margin: 0; color: #CBD5E1; font-size: 14px; font-weight: 600;">${formattedDate}</p>
                                </td>
                                <td width="50%" style="vertical-align: top;">
                                  <p style="margin: 0 0 4px 0; color: #94A3B8; font-size: 12px; font-weight: 500; text-transform: uppercase;">Valor</p>
                                  <p style="margin: 0; color: #10B981; font-size: 18px; font-weight: 700;">${formattedAmount}</p>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Botão CTA -->
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                        <tr>
                          <td align="center">
                            <a href="https://g-finance-ebon.vercel.app" target="_blank" style="display: inline-block; width: 100%; box-sizing: border-box; background-color: #10B981; color: #0F172A; text-decoration: none; text-align: center; font-weight: 700; font-size: 14px; padding: 14px 24px; border-radius: 8px; transition: background-color 0.2s;">
                              Acessar gFinance e Pagar
                            </a>
                          </td>
                        </tr>
                      </table>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="padding: 20px 32px 32px 32px; background-color: #182234; border-top: 1px solid #334155; text-align: center;">
                      <p style="margin: 0 0 8px 0; color: #64748B; font-size: 12px;">
                        Este é um e-mail automático enviado por <strong>gFinance</strong>.
                      </p>
                      <p style="margin: 0; color: #475569; font-size: 11px;">
                        © ${new Date().getFullYear()} gFinance Finance. Todos os direitos reservados.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });
  }
}