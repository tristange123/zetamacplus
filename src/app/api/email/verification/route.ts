// import { EmailTemplate } from '@/components/verificationEmail';
// import { Resend } from 'resend';


// export async function POST(req: Request) {
//     const { email } = await req.json();

//     await sendEmail();

//     return Response.json({ success: true });
// }

// \

// const resend = new Resend(process.env.RESEND_API_KEY);

// async function sendEmail() {
//   try {
//     const { data, error } = await resend.emails.send({
//       from: 'Acme <onboarding@resend.dev>',
//       to: ['delivered@resend.dev'],
//       subject: 'Hello world',
//       react: EmailTemplate({ firstName: 'John' }),
//     });

//     if (error) {
//       return Response.json({ error }, { status: 500 });
//     }

//     return Response.json(data);
//   } catch (error) {
//     return Response.json({ error }, { status: 500 });
//   }
// }