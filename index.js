
let transactions = []

// Cria uma uma div que é um container com todas as informações que serão inseridas na tela
// atribui uma classe chama transaction
// e um id transaction com o valor passado


function createTransactionContainer(id) {
    container = document.createElement('div')
    container.classList.add('transaction')
    container.id = `transaction-${id}`
    return container
}

 // Cria uma um titulo que com elemento span
 // adiciona uma classe transaction-title 
 // atribui um nome com o valor passado

function createTransactionTitle(name) {
    const title = document.createElement('span')
    title.classList.add('transaction-title')
    title.textContent = name
    return title
}

// Cria um span com o valor 
// cria uma variável que receber uma função interna Intl.NumberFormat
// dependendo do valor total atribui o valor e uma classe que será usada no css para credito ou débito

function createTransactionAmount(amount) {
    const span = document.createElement('span')

    const formater = Intl.NumberFormat('pt-BR',{
        compactDisplay: 'long',
        currency: 'BRL',
        style:'currency'

    })
    const formaterdAmount = formater.format(amount)

    if (amount > 0) {
        span.textContent = `${formaterdAmount} C`
        span.classList.add('transaction-amount','credit')
    } else {
        span.textContent = `${formaterdAmount} D`
        span.classList.add('transaction-amount','debit') 
    }

    return span
}

// renderiza as informações na tela
// variavel container recebe o retorno da função createTransactionContainer
// faz o append do titulo e amount no container

function createEditTransactionBtn(transaction) {
    const editBtn = document.createElement('button') // cria um elemento do tipo botão
    editBtn.classList.add('edit-btn') // adiciona uma classe para posteriormente ser utilizada no css
    editBtn.textContent = 'Editar' // Coloca um nome no botão
    editBtn.addEventListener('click', () => { // adiciona um evento de click que atribui ao valor do formulario o id, o name e o amount
       document.querySelector('#id').value = transaction.id 
       document.querySelector('#name').value = transaction.name
       document.querySelector('#amount').value = transaction.amount
    })

    return editBtn
}

function createDeleteTransactionButton(id) {
    const deleteBtn = document.createElement('button')
    deleteBtn.classList.add('delete-btn')
    deleteBtn.textContent = 'Excluir'
    deleteBtn.addEventListener('click', async () => {
      await fetch(`http://localhost:3000/transactions/${id}`, { method: 'DELETE' })
      deleteBtn.parentElement.remove()
      const indexToRemove = transactions.findIndex((t) => t.id === id)
      transactions.splice(indexToRemove, 1)
      updateBalance()
    })
    return deleteBtn
  }

function renderTransaction(transaction) {
    const container = createTransactionContainer(transaction.id)
    const title = createTransactionTitle(transaction.name)
    const amount = createTransactionAmount(transaction.amount)
    const editBtn = createEditTransactionBtn(transaction)
    const deleteBtn = createDeleteTransactionButton(transaction.id)

    container.append(title, amount, editBtn, deleteBtn)
    document.querySelector('#transactions').append(container)
}


async function saveTransaction(ev) {
    ev.preventDefault() // evita que o formulário envie os dados pela URL 

    const id = document.querySelector('#id').value
    const name = document.querySelector('#name').value // Pega os valores que foram inseridos no campo name
    const amount = parseFloat(document.querySelector('#amount').value) // Pega os valores que foram inseridos no campo amount

    if (id) {
        // editar a transacao com esse id 
        const response = await fetch(`http://localhost:3000/transactions/${id}`, {
            method: 'PUT',
            body: JSON.stringify({name, amount}),
            headers: {
                'Content-Type': 'application/json'
            }

        }) 

        const transaction = await response.json()
        const indexToRemove = transactions.findIndex((t) => t.id === id)
        transactions.splice(indexToRemove, 1, transaction)
        document.querySelector(`#transaction-${id}`).remove()
        
        renderTransaction(transaction)

    } else {
        // criar nova transação 
        const response = await fetch('http://localhost:3000/transactions', {
        method: 'POST',
        body: JSON.stringify({name, amount}),
        headers: {
            'Content-Type': 'application/json'
        }
    }) // Envia com o Metodo Post um json com name e amount

    const transaction = await response.json() // cria uma variável transaction que recebe o retorno da função response já com id criado no arquivo json
    transactions.push(transaction) // faz um push no array
    renderTransaction(transaction) // Atualiza as informações na tela
        
    }

    

    ev.target.reset() // reseta os campos 
    updateBalance() // atualiza o valor total 
}

async function fetchTransactions() {
    return await fetch('http://localhost:3000/transactions').then( res => res.json())
}

function updateBalance() {
    const balanceSpan = document.querySelector('#balance') 
    const balance = transactions.reduce((sum, transaction) => sum + transaction.amount, 0)
    const formater = Intl.NumberFormat('pt-BR',{
        compactDisplay: 'long',
        currency: 'BRL',
        style:'currency'

})

balanceSpan.textContent = formater.format(balance)

}

async function setup() {
    const results = await fetchTransactions()
    transactions.push(...results)
    transactions.forEach(renderTransaction)
    updateBalance()
}

document.addEventListener('DOMContentLoaded', setup)
document.querySelector('form').addEventListener('submit',saveTransaction)