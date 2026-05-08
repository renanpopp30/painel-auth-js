// =============================================
// CONFIGURAÇÃO SUPABASE
// =============================================
const { createClient } = supabase
const client = createClient(
  'https://wgzifyzzgdfbgilfvxds.supabase.co',  // Project URL
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnemlmeXp6Z2RmYmdpbGZ2eGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzMxNDgsImV4cCI6MjA5MzYwOTE0OH0.hfzSbT6IM1bbIhLMyKsQA9j9Uneep3MLpnyc7t79t1w'
)

// VARIÁVEL GLOBAL — para guarda o email entre etapas
let emailRecuperacao = ''

// TOGGLE MOSTRAR/OCULTAR SENHA
document.querySelectorAll('.toggle-senha').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target)
    input.type = input.type === 'password' ? 'text' : 'password'
  })
})

// NAVEGAR ENTRE ETAPAS
function irParaEtapa(numero) {
  document.querySelectorAll('.form-panel').forEach(p => p.classList.add('hidden'))
  document.getElementById(`etapa-${numero}`).classList.remove('hidden')

  for (let i = 1; i <= 3; i++) {
    const indicator = document.getElementById(`step-indicator-${i}`)
    indicator.classList.remove('inactive', 'done')

    if (i < numero) {
      indicator.classList.add('done')        
    } else if (i > numero) {
      indicator.classList.add('inactive')    
    }
    
  }
}

// GERAR HASH (mesma do cadastro e login)
async function gerarHash(texto) {
  const encoder = new TextEncoder()
  const data = encoder.encode(texto)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

// GERAR TOKEN ALEATÓRIO
// Gera um código de 6 dígitos numéricos.
// Math.random() → número entre 0 e 1
// * 900000 + 100000 → garante 6 dígitos (100000 a 999999)
// Math.floor() → remove as casas decimais
function gerarToken() {
  return Math.floor(Math.random() * 900000 + 100000).toString()
}

// ETAPA 1 — verificarEmail()
async function verificarEmail() {
  const email = document.getElementById('email').value.trim();
  
  const status = document.getElementById('erro-email');
  if (email === "") {
    status.className = 'status-global error';
    status.textContent = 'Campo vazio. Coloque seu email !!';
    return;
  }

  const { data, error } = await client.from('usuarios').select('*').eq('email', email).single();

  if (data === null) {
    status.className = 'status-global error'
    status.textContent = 'E-mail não cadastrado.';
    return;
  }

  if (data) {
    emailRecuperacao = email;
    const token = gerarToken();
    const expira = new Date(Date.now() + 30 * 60 * 1000).toISOString();

    await client.from('tokens_recuperacao').insert([{
      email: emailRecuperacao,
      token: token,
      expira_em: expira,
      usado: false
    }])
    document.getElementById('token-box').classList.remove('hidden');
    document.getElementById('token-valor').textContent = token;
    setTimeout(() => irParaEtapa(2), 5000);
    
  }


}

// ETAPA 2 — validarToken()
async function validarToken() {
  const tokenDigitado = document.getElementById('token').value.trim();
  const status = document.getElementById('status-token');

  if (!tokenDigitado) {
    status.className = 'status-global error';
    status.textContent = 'Preencha o campo. Coloque o token aqui';
    return;
    
  }

  const { data, error } = await client
    .from('tokens_recuperacao')
    .select('*')
    .eq('email', emailRecuperacao)
    .eq('token', tokenDigitado)
    .eq('usado', false)
    .single();

  if (data) {
    const agora = new Date();
    const expira = new Date(data.expira_em);
    if (agora > expira) {
      status.className = 'status-global error'
      status.textContent = 'Token expirado. Gere um novo.'
    } else {
      alert("Pronto agora troque sua senha.")
      setTimeout(() => irParaEtapa(3), 1000);
    }
  } else {
    status.className = 'status-global error'
    status.textContent = 'Token inválido ou já utilizado.'
    return;
  }

}


// ETAPA 3 — atualizarSenha()
async function atualizarSenha() {
  let senhaNova = document.getElementById('nova-senha').value;
  const confirSenhaNova = document.getElementById('confirmar-senha').value;
  const status = document.getElementById('status-senha')

  if (senhaNova !== "" && confirSenhaNova !== "") {
    if (senhaNova.length >= 6 && senhaNova === confirSenhaNova) {
      const hash = await gerarHash(senhaNova);
      await client.from('usuarios').update({senha_hash: hash}).eq('email', emailRecuperacao);
      await client.from('tokens_recuperacao').update({usado: true}).eq('email', emailRecuperacao);
      alert('Senha alterada com sucesso, você será redirecionado para o login');
      setTimeout(() => window.location.href = '../index.html', 1000)
    }else {
      status.className = 'status-global error'
      status.textContent = 'Preencha os dois campos iguais e com no minimo 6 caracteres'
    }


  }else {
    status.className = 'status-global error'
    status.textContent = 'Preencha os dois campos'
  }
  

}
