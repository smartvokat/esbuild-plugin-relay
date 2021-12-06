const { ApolloServer, gql } = require("apollo-server");
const data = require("./data");

const typeDefs = gql`
  type Book {
    id: String!
    title: String
  }

  type Query {
    books(first: Int): [Book]
  }
`;

function toGlobalId(type, id) {
  return Buffer.from(`${type}:${id}`).toString("base64");
}

const resolvers = {
  Query: {
    books: () =>
      data.map((book) => ({ ...book, id: toGlobalId("book", book.id) })),
  },
};

const port = process.env.PORT || "4001";
const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port }).then(({ url }) => {
  console.log(`Mock server running at ${url}`);
});
