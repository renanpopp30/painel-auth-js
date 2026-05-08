const { createClient } = supabase
const client = createClient(
  'https://wgzifyzzgdfbgilfvxds.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndnemlmeXp6Z2RmYmdpbGZ2eGRzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgwMzMxNDgsImV4cCI6MjA5MzYwOTE0OH0.hfzSbT6IM1bbIhLMyKsQA9j9Uneep3MLpnyc7t79t1w'
)

const nome = document.getElementById('nome');
const cpf = document.getElementById('cpf');
const email = document.getElementById('email');
const senha = document.getElementById('senha');
const confirmSenha = document.getElementById('confirmar-senha');

// MÁSCARA DE CPF
cpf.addEventListener('input', (e) => {
    let valor = cpf.value;
    valor = valor.replace(/\D/g, '');

    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d)/, '$1.$2');
    valor = valor.replace(/(\d{3})(\d{1,2})$/, '$1-$2');

    cpf.value = valor
    //O fluxo é pega o valor -> limpa -> formata -> devolve
});

// FORÇA DA SENHA
senha.addEventListener('input', (e) => {
  const tamanho = senha.value.length
  const temNumero = /\d/.test(senha.value)
  const temLetra = /[a-zA-Z]/.test(senha.value)
  if (tamanho == 0) {
    document.getElementById('forca-bar').style.setProperty('--forca-w', '0%');
    document.getElementById('forca-label').textContent = '';
  }else if(tamanho < 6){
    document.getElementById('forca-bar').style.setProperty('--forca-w', '33%');
    document.getElementById('forca-bar').style.setProperty('--forca-color', '#ad0707');
    document.getElementById('forca-label').textContent = 'Fraca';
    document.getElementById('forca-label').style.setProperty('color', '#f50202')

  }else if (tamanho >= 8 && temNumero && temLetra) {
    document.getElementById('forca-bar').style.setProperty('--forca-w', '100%');
    document.getElementById('forca-bar').style.setProperty('--forca-color', '#0fb918');
    document.getElementById('forca-label').textContent = 'Forte';
    document.getElementById('forca-label').style.setProperty('color', '#0fb918')
  }else { 
    document.getElementById('forca-bar').style.setProperty('--forca-w', '66%');
    document.getElementById('forca-bar').style.setProperty('--forca-color', '#fbbf24');
    document.getElementById('forca-label').textContent = 'Média';
    document.getElementById('forca-label').style.setProperty('color', '#fbbf24')
 
  }

});

// Mostrar DA SENHA
document.querySelectorAll('.toggle-senha').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = document.getElementById(btn.dataset.target)
    input.type = input.type === 'password' ? 'text' : 'password'
  })
});



// Gerar a senha em Hash(codifica a senha)
async function gerarHash(senhaUser) {
  const encoder = new TextEncoder()
  const data = encoder.encode(senhaUser)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  return hashHex
}

// Funcão cadastrar (Quando a pessoa clicar no botão)
async function cadastrar() {
  const loader = document.getElementById('loader');
  let nomeUser = nome.value;
  let cpfUser = cpf.value;
  let emailUser = email.value;
  let senhaUser = senha.value;
  let confirmSenhaUser = confirmSenha.value;

  if (nomeUser !== "" && cpfUser !== "" && emailUser !== "" && senhaUser !== "" && confirmSenhaUser !== "") {
    cpfUser = cpfUser.replace(/\D/g, '');
    if (cpfUser.length == 11) {
      if (senhaUser === confirmSenhaUser) {
        const hash = await gerarHash(senhaUser);
        const dadosCadastro = {
          nome: nomeUser,
          created_at: new Date().toISOString(),
          cpf: cpfUser, 
          email: emailUser, 
          senha_hash: hash
        }
        const { data, error } = await client.from('usuarios').insert(dadosCadastro);
        if (error) {
          // '23505' é o código padrão do PostgreSQL pra violação de unique
          // e email e cpf estão como unique na tabela para não haver repetição
          if(error.code === '23505') {
            alert('Email ou CPF já cadastrados. Tente novamente com outro');
          }else {
            alert('Erro ao agendar. Tente novamente.');
          }
          return;
          
        }else
        alert('Cadastrado com sucesso');
        window.location.href = "../index.html";

      }else {
        alert('As SENHAS não coincidem');
        return;
      }


    }else {
      alert('Coloque um CPF válido');
      return;
    }

  } else {
    alert('Preencha todos os campos');
    return;
  }

  loader.classList.remove('spinning');
  console.log('cadastrar() chamada — implemente aqui!');
}