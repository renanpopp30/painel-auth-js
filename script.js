// CONFIGURAÇÃO SUPABASE
const { createClient } = supabase
const client = createClient(
  'https://wgzifyzzgdfbgilfvxds.supabase.co',  // Project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnemlmeXp6Z2RmYmdpbGZ2eGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzMxNDgsImV4cCI6MjA5MzYwOTE0OH0.hfzSbT6IM1bbIhLMyKsQA9j9Uneep3MLpnyc7t79t1w'
)


// TOGGLE MOSTRAR/OCULTAR SENHA
document.querySelectorAll('.toggle-senha').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target)
    input.type = input.type === 'password' ? 'text' : 'password'
  })
})


// GERAR HASH (mesma função do cadastro)
async function gerarHash(senhaUser) {
  const encoder = new TextEncoder()
  const data = encoder.encode(senhaUser)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// FUNÇÃO LOGIN
async function login() {
  const email = document.getElementById('email').value;
  const senha = document.getElementById('senha').value;
  
  const status = document.getElementById('status-global')
  
  if(email !== "" && senha !== "") {
    const hash = await gerarHash(senha);
    const { data, error } = await client.from('usuarios').select('*').eq('email', email.trim()).single();
    if (error) {
      status.className = 'status-global error';
      // código do supabase 'PGRST116' quando retorna zero linhas ou múltiplas linhas
      if (error.code === 'PGRST116') {
        status.textContent = 'Email não encontrado';
      }else {
        status.textContent = 'Erro ao entrar. Tente novamente.';
      }
      
      return;
    }
    if (hash === data.senha_hash) {
      alert(`Seja bem vindo ${data.nome}`);
      window.location.href = 'https://renan-popp.vercel.app/';
    }else {
      alert('Senha incorreta tente novamente')
      status.className = 'status-global error';
      status.textContent = 'Senha incorreta tente novamente.';
    }
    
  }


}
