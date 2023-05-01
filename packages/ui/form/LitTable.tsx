import { useState } from "react";
import { createStyles, Table, ScrollArea, rem } from "@mantine/core";
import React from "react";

const useStyles = createStyles((theme) => ({
  header: {
    position: "sticky",
    top: 0,
    backgroundColor:
      theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
    transition: "box-shadow 150ms ease",

    "&::after": {
      content: '""',
      position: "absolute",
      left: 0,
      right: 0,
      bottom: 0,
      borderBottom: `${rem(1)} solid ${
        theme.colorScheme === "dark"
          ? theme.colors.dark[3]
          : theme.colors.gray[2]
      }`,
    },
  },

  scrolled: {
    boxShadow: theme.shadows.sm,
  },
}));

interface LitTableProps<T> {
  data: T[];
  renderRow: (row: T, index: number) => React.ReactNode;
  headers: string[];
}

export function LitTable<T>({ data, renderRow, headers }: LitTableProps<T>) {
  const { classes, cx } = useStyles();
  const [scrolled, setScrolled] = useState(false);

  const rows = data.map((row, index) => (
    <React.Fragment key={index}>{renderRow(row, index)}</React.Fragment>
  ));

  const headerCells = headers.map((header, index) => (
    <th key={index}>{header}</th>
  ));

  return (
    <ScrollArea 
    onScrollPositionChange={({ y }) => setScrolled(y !== 0)}>
      <Table miw={700}>
        <thead className={cx(classes.header, { [classes.scrolled]: scrolled })}>
          <tr>{headerCells}</tr>
        </thead>
        <tbody>{rows}</tbody>
      </Table>
    </ScrollArea>
  );
}
