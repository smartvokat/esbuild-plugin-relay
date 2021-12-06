import * as React from "react";
import { graphql, useLazyLoadQuery } from "react-relay/hooks";
import { BookListItem } from "./BookListItem";

export function BookList() {
  const data = useLazyLoadQuery(
    graphql`
      query BookListQuery {
        books(first: 100) {
          id
          ...BookListItem_book
        }
      }
    `
  );

  return (
    <ul className="books">
      {(data.books || []).map((book) => (
        <BookListItem book={book} key={book.id} />
      ))}
    </ul>
  );
}
