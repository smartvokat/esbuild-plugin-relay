import * as React from "react";
import { graphql, useFragment } from "react-relay/hooks";

export function BookListItem({ book }) {
  const data = useFragment(BookListItem_book, book);
  return <li>{data.title}</li>;
}

const BookListItem_book = graphql`
  fragment BookListItem_book on Book {
    id
    title
  }
`;
