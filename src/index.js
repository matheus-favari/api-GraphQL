const {ApolloServer, gql} = require('apollo-server')
const cpfCnpj = require('cpf-cnpj-validator')
const cpfValidator = cpfCnpj.cpf;

const alunos = [
    {
        nome: 'José Fernando',
        curso: 'Direito',
        semestre: 3,
        cpf: 12256572021,
        ra: 586235,
        cidade: 'Pompeia'
    },
    {
        nome: 'Camila Souza',
        curso: 'Sistemas da Informação',
        semestre: 6,
        cpf: 52956293095,
        ra: 586276,
        cidade: 'Marília'
    },
    {
        nome: 'Daniel Ferreira',
        curso: 'Ciência da Computação',
        semestre: 2,
        cpf: 29334146001,
        ra: 586277,
        cidade: 'Marília'
    },
    {
        nome: 'Reinaldo Porte Peres',
        curso: 'Ciência da Computação',
        semestre: 8,
        cpf: 11968158014,
        ra: 555555,
        cidade: 'Marília'
    },
    {
        nome: 'João Pedro Santos',
        curso: 'Ciência da Computação',
        semestre: 8,
        cpf: 39813594020,
        ra: 555577,
        cidade: 'Marília'
    }
]

let response = {
    status: 200,
    message: "Sucesso",
    data: []
}

const setResponse = (status, message, data = []) => {
    response.data = [];
    response = {status, message, data}
}

const typeDefs = gql`
    type Aluno {
        nome: String,
        curso: String,
        cidade: String,
        ra: Int,
        cpf: Float,
        semestre: Int
    }

    input AlunoInput {
        nome: String,
        curso: String,
        cidade: String,
        ra: Int,
        cpf: Float,
        semestre: Int
    }

    input AlunoEdicao {
        nome: String,
        curso: String,
        cidade: String,
        cpf: Float,
        semestre: Int
    }

    type Response {
        status: Int,
        message: String,
        data: [Aluno],
        
    }

    type Query {
        listarAlunos: Response
        buscarAluno(ra: Int): Response
    }

    type Mutation {
        registrarAluno(
            data: AlunoInput
        ): Response
        editarAluno(
            ra: Int,
            data: AlunoEdicao
        ): Response
        excluirAluno(ra: Int): Response
    }
`


const resolvers = {
    Query : {
        listarAlunos: () => {
            setResponse(200, "Alunos listados com sucesso", alunos)

            return response
        },
        buscarAluno: (_, data) => {

            const alunoBuscado = alunos.find(aluno => aluno.ra === data.ra);
            
            if (!alunoBuscado){
                setResponse(404, "Aluno não cadastrado")
                return response
            }
            
            setResponse(200, "Busca realizada com sucesso", [alunoBuscado])
            return response
        } 
    },
    Mutation: {
        excluirAluno: (_, args) => {
            const {status, message, data} = resolvers.Query.buscarAluno({}, { ra: args.ra })

            if(status !== 200){
                return {status, message}
            }

            let novaListaAlunos = alunos.filter(aluno => aluno.ra !== Number.parseInt(args.ra))
            alunos.length = 0

            novaListaAlunos.forEach(aluno => {
                alunos.push(aluno)
            })

            setResponse(200, "Deleção realizada")
            return response
        },        
        registrarAluno: (_, args) => {

            const novoAluno = args.data;

            const camposFaltantes = []

            if(!novoAluno.nome){
                camposFaltantes.push(' nome')
            } 
            if(!novoAluno.curso){
                camposFaltantes.push(' curso')
            }
            if(!novoAluno.semestre){
                camposFaltantes.push(' semestre')
            }
            if(!novoAluno.cpf){
                camposFaltantes.push(' cpf')
            }
            if(!novoAluno.ra){
                camposFaltantes.push(' ra')
            }
            if(!novoAluno.cidade){
                camposFaltantes.push(' cidade')
            }

            if(camposFaltantes.length > 0){
                setResponse(400, `Preencher os campos:${camposFaltantes.toString()}`)
                return response
            }

            if(typeof novoAluno.cpf !== 'number'){
                return {status: 400, message: 'CPF inválido'}
            } else if(!cpfValidator.isValid(novoAluno.cpf.toString())){
                return {status: 400, message: 'CPF inválido'}
            } else if(alunos.find(aluno => aluno.cpf === novoAluno.cpf)) {
                return {status: 400, message: 'CPF já cadastrado'}
            }

            if(typeof novoAluno.ra !== 'number'){
                return {status: 400, message: 'RA inválido'}
            } else if(alunos.find(aluno => aluno.ra === novoAluno.ra)) {
                return {status: 400, message: 'RA já cadastrado'}
            }

            if(typeof novoAluno.semestre !== 'number'){
                return {status: 400, message: 'Semestre inválido'}
            }
            if(typeof novoAluno.nome !== 'string'){
                return {status: 400, message: 'Nome inválido'}
            }
            if(typeof novoAluno.curso !== 'string'){
                return {status: 400, message: 'Curso inválido'}
            }
            if(typeof novoAluno.cidade !== 'string'){
                return {status: 400, message: 'Cidade inválida'}
            }

            alunos.push(novoAluno)
            setResponse(201, "Aluno cadastrado")
            
            return response
        },

        editarAluno: (_, args) => {
            const novosDados = args.data
            const raAlunoEdicao = args.ra
            
            const {status, message, data} = resolvers.Query.buscarAluno({}, { ra: raAlunoEdicao })
            
            if(status !== 200){
                return {status, message}
            }
            
            let alunoEmEdicao = data[0];

            const camposFaltantes = []

            if(!novosDados.nome){
                camposFaltantes.push(' nome')
            } 
            if(!novosDados.curso){
                camposFaltantes.push(' curso')
            }
            if(!novosDados.semestre){
                camposFaltantes.push(' semestre')
            }
            if(!novosDados.cpf){
                camposFaltantes.push(' cpf')
            }
            if(!novosDados.cidade){
                camposFaltantes.push(' cidade')
            }

            if(camposFaltantes.length > 0){
                setResponse(400, `Preencher os campos:${camposFaltantes.toString()}`)
                return response
            }

            if(typeof novosDados.cpf !== 'number'){
                return {status: 400, message: 'CPF inválido'}
            } else if(!cpfValidator.isValid(novosDados.cpf.toString())){
                return {status: 400, message: 'CPF inválido'}
            } else if(alunos.find(aluno => aluno.cpf === novosDados.cpf && aluno.cpf !== data[0].cpf)) {
                return {status: 400, message: 'CPF já cadastrado'}
            }

            if(typeof novosDados.semestre !== 'number'){
                return {status: 400, message: 'Semestre inválido'}
            }
            if(typeof novosDados.nome !== 'string'){
                return {status: 400, message: 'Nome inválido'}
            }
            if(typeof novosDados.curso !== 'string'){
                return {status: 400, message: 'Curso inválido'}
            }
            if(typeof novosDados.cidade !== 'string'){
                return {status: 400, message: 'Cidade inválida'}
            }

            alunoEmEdicao.nome = novosDados.nome
            alunoEmEdicao.cpf = novosDados.cpf
            alunoEmEdicao.semestre = novosDados.semestre
            alunoEmEdicao.cidade = novosDados.cidade
            alunoEmEdicao.curso = novosDados.curso

            const alunosAtualizados = alunos.filter(aluno => aluno.ra !== alunoEmEdicao.ra)
            alunos.length = 0;

            alunosAtualizados.forEach(novoDado => {
                alunos.push(novoDado);
            })

            alunos.push(alunoEmEdicao)
            setResponse(201, "Dados atualizados")
            
            return response
        }
    }
}

const server = new ApolloServer({ typeDefs, resolvers })
server.listen().then(({ url }) => console.log(`🔥 Server started at ${url}`))