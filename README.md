Comandos Essenciais do Dia a Dia

# Ver status atual
git status

# Ver histórico
git log --oneline

# Mudar de branch
git checkout nome-da-branch

# Criar e mudar para nova branch
git checkout -b nova-branch

# Atualizar branch atual
git pull origin nome-da-branch

# Excluir uma branch após aprovação
git push origin --delete nome-da-branch
git branch -d nome-da-branch

# Verificar atual
git pull origin nome-da-branch

# Ver diferenças
git diff

# Adicionar arquivos específicos
git add src/index.js src/routes/

# Adicionar todos os arquivos
git add .

# Commit com mensagem
git commit -m "feat(api): adiciona rota de usuarios"

# Subir para GitHub
git push origin nome-da-branch

Comandos do projeto
# Mesmo processo
git checkout develop
git pull origin develop
git checkout -b feature/sua-feature
# ... desenvolver
git push origin feature/sua-feature
# Criar PR no GitHub