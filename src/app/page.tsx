
import { redirect } from 'next/navigation';

export default function Home() {
  // O sistema agora inicia na tela de login para garantir o redirecionamento correto por perfil
  redirect('/login');
}
